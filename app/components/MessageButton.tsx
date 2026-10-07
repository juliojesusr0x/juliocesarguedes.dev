"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Turnstile } from "@/app/components/Turnstile";
import { site } from "@/lib/site";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

const ERRORS: Record<string, string> = {
  invalid: "Please check your name, email and message (at least 5 characters).",
  rate: "You've sent a few messages already. Please try again later.",
  links: "Please keep it to two links at most. It helps me tell you apart from spam.",
  fast: "That was quick! Please press Send once more.",
  expired: "This form was open for a long time. Please press Send once more.",
  captcha: "Please complete the check above, then press Send again.",
};
const CHECK_UNAVAILABLE =
  "The spam check couldn't load (an ad blocker can cause this). Please use the email link below.";

/** A signed "opened at" stamp from the server, sent back with the message (anti-spam). */
async function loadToken() {
  try {
    const response = await fetch("/api/contact", { cache: "no-store" });
    const data: { token?: string } = await response.json();
    return data.token ?? "";
  } catch {
    return "";
  }
}
const FALLBACK_ERROR = "Couldn't send that right now. Please try again, or use one of the links below.";

const fieldClass =
  "w-full rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

type Status = "idle" | "sending" | "sent";

function MessageDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [token, setToken] = useState("");

  const [challenge, setChallenge] = useState("");
  const [challengeNonce, setChallengeNonce] = useState(0);
  const [checkBroken, setCheckBroken] = useState(false);

  useEffect(() => {
    void loadToken().then(setToken);
  }, []);

  // Every token is single use: after any failed attempt, get fresh ones.
  const renewTokens = () => {
    void loadToken().then(setToken);
    setChallenge("");
    setChallengeNonce((n) => n + 1);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    // Click on the backdrop (the dialog element itself) closes it; Escape is the keyboard way.
    const closeOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", closeOnBackdrop);
    return () => dialog.removeEventListener("click", closeOnBackdrop);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, token, turnstile: challenge }),
      });
      const data: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(ERRORS[data.error ?? ""] ?? FALLBACK_ERROR);
        setStatus("idle");
        renewTokens();
        return;
      }
      setSentTo(String(payload.email));
      setStatus("sent");
    } catch {
      setError(FALLBACK_ERROR);
      setStatus("idle");
      renewTokens();
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-white/15 bg-neutral-950 p-5 text-left text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:p-7"
    >
      <h2 id={titleId} className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
        Send me a{" "}
        <em className="font-serif text-[1.2em] font-normal normal-case italic text-secondary">
          message
        </em>
      </h2>

      {status === "sent" ? (
        <div role="status" className="mt-5 flex flex-col gap-4">
          <p className="text-lg">
            Sent! I&apos;ll reply to <strong className="break-all">{sentTo}</strong>.
          </p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="self-start rounded-full bg-secondary px-6 py-3 font-extrabold uppercase tracking-tight text-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
          <p className="text-on-surface-variant">It goes straight to my inbox.</p>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Your name
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={80}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Your email, so I can reply
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={120}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Message
            <textarea
              name="message"
              required
              minLength={5}
              maxLength={2000}
              rows={5}
              className={`${fieldClass} resize-y font-normal`}
            />
          </label>
          {/* Honeypot: invisible to people, tempting to bots. */}
          <label aria-hidden className="absolute left-[-9999px]">
            Company
            <input name="company" type="text" tabIndex={-1} autoComplete="off" />
          </label>

          {TURNSTILE_SITE_KEY ? (
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              nonce={challengeNonce}
              onToken={setChallenge}
              onUnavailable={() => setCheckBroken(true)}
            />
          ) : null}
          {checkBroken ? (
            <p role="alert" className="rounded-2xl border border-secondary/60 px-4 py-3 text-sm">
              {CHECK_UNAVAILABLE}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-2xl border border-secondary/60 px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={status === "sending" || !token || (TURNSTILE_SITE_KEY !== "" && !challenge)}
              className="rounded-full bg-secondary px-6 py-3 font-extrabold uppercase tracking-tight text-black transition-colors hover:bg-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full border border-white/15 px-6 py-3 font-semibold transition-colors hover:border-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              Cancel
            </button>
          </div>

          <p className="text-sm text-on-surface-variant">
            Or reach me directly:{" "}
            <a
              href={site.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-secondary underline-offset-4 hover:text-secondary"
            >
              LinkedIn
            </a>
            {" · "}
            <a
              href={`mailto:${site.email}`}
              className="text-white underline decoration-secondary underline-offset-4 hover:text-secondary"
            >
              {site.email}
            </a>
          </p>
        </form>
      )}
    </dialog>,
    document.body,
  );
}

/** Round icon button (styled by the caller to match its siblings) that opens the message form. */
export function MessageButton({ className }: { className: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Send me a message"
        aria-haspopup="dialog"
        title="Send me a message"
        className={className}
        onClick={() => setOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          <path d="M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      </button>
      {open ? <MessageDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
