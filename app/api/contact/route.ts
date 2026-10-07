import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const LIMITS = { name: 80, email: 120, message: 2000 } as const;
const MIN_MESSAGE = 5;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_PER_DAY = 40;
const MAX_LINKS = 2;
const MIN_FILL_MS = 2000; // a person cannot open, fill and send the form faster
const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000;

// Best effort only: per-instance memory, so a serverless host resets it.
const hits = new Map<string, number[]>();
const sentToday: number[] = [];
const seen = new Map<string, number>();

const secret = () => process.env.CONTACT_SECRET ?? process.env.RESEND_API_KEY;

const sign = (stamp: string, key: string) =>
  createHmac("sha256", key).update(stamp).digest("hex");

/** Server-issued "form opened at" proof: the timing check cannot be faked by a bot. */
function checkToken(token: unknown): "ok" | "fast" | "expired" | "bad" {
  const key = secret();
  if (typeof token !== "string" || !key) return "bad";
  const [stamp, signature = ""] = token.split(".");
  const expected = sign(stamp, key);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return "bad";
  }
  const age = Date.now() - Number(stamp);
  if (!Number.isFinite(age)) return "bad";
  if (age < MIN_FILL_MS) return "fast";
  return age > MAX_TOKEN_AGE_MS ? "expired" : "ok";
}

/** Cloudflare Turnstile: a token is single use and valid for 5 minutes (checked by siteverify). */
async function passesTurnstile(token: unknown, secretKey: string, ip: string) {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const form = new URLSearchParams({ secret: secretKey, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);
  try {
    const response = await fetch(
      process.env.TURNSTILE_VERIFY_URL ?? "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const result: { success?: boolean } = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("[contact] Could not reach Turnstile; refusing the message:", error);
    return false; // fail closed: an outage must not open the door to spam
  }
}

const countLinks = (value: string) => (value.match(/https?:\/\/|www\./gi) ?? []).length;

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ");

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const reply = (status: number, body: { ok: true } | { error: string } | { token: string }) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const key = secret();
  if (!key) return reply(503, { error: "unavailable" });
  const stamp = String(Date.now());
  return reply(200, { token: `${stamp}.${sign(stamp, key)}` });
}

export async function POST(request: Request) {
  // Browsers always send Origin on a cross-site POST; refuse one from elsewhere.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return reply(403, { error: "forbidden" });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return reply(400, { error: "invalid" });
  }

  // Hidden field a person never fills in: pretend it worked, send nothing.
  if (text(body.company, 200)) return reply(200, { ok: true });

  const tokenState = checkToken(body.token);
  if (tokenState !== "ok") return reply(400, { error: tokenState });

  const name = text(body.name, LIMITS.name);
  const email = text(body.email, LIMITS.email);
  const message = text(body.message, LIMITS.message);
  if (!name || !looksLikeEmail(email) || message.length < MIN_MESSAGE) {
    return reply(400, { error: "invalid" });
  }

  if (countLinks(message) > MAX_LINKS) return reply(400, { error: "links" });

  // The same message again: say thanks, send nothing (a double click or a bot loop).
  const fingerprint = createHmac("sha256", "dedupe").update(`${email}\n${message}`).digest("hex");
  const now = Date.now();
  if (now - (seen.get(fingerprint) ?? 0) < WINDOW_MS) return reply(200, { ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // When a Turnstile secret is configured the check is mandatory.
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && !(await passesTurnstile(body.turnstile, turnstileSecret, ip))) {
    return reply(400, { error: "captcha" });
  }

  while (sentToday.length && now - sentToday[0] > 24 * WINDOW_MS) sentToday.shift();
  if (sentToday.length >= MAX_PER_DAY || tooMany(ip)) return reply(429, { error: "rate" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set: message was not sent.");
    return reply(503, { error: "unavailable" });
  }

  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;
  const host = new URL(site.url).host;

  try {
    const response = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${host} <${from}>`,
        to: [to],
        reply_to: email,
        subject: oneLine(`Message from ${name} via ${host}`),
        text: `This message was sent from the contact form on ${host}.\n\n${message}\n\n-- \n${oneLine(name)} <${email}>`,
      }),
    });
    if (!response.ok) {
      console.error("[contact] Resend rejected the message:", response.status);
      return reply(502, { error: "failed" });
    }
  } catch (error) {
    console.error("[contact] Could not reach Resend:", error);
    return reply(502, { error: "failed" });
  }

  seen.set(fingerprint, now);
  sentToday.push(now);
  return reply(200, { ok: true });
}
