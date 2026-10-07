"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "dark";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptReady: Promise<TurnstileApi> | null = null;

function loadTurnstile() {
  scriptReady ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing"));
    script.onerror = () => {
      scriptReady = null; // allow a retry the next time the dialog opens
      reject(new Error("turnstile blocked"));
    };
    document.head.appendChild(script);
  });
  return scriptReady;
}

type Props = {
  siteKey: string;
  /** Called with a fresh token, or "" when it expired or the check failed. */
  onToken: (token: string) => void;
  onUnavailable: () => void;
  /** Change this to throw the current widget away and show a new challenge. */
  nonce: number;
};

/** Cloudflare Turnstile. A token is single use, so a retry needs a new widget (new nonce). */
export function Turnstile({ siteKey, onToken, onUnavailable, nonce }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onToken, onUnavailable });

  // Keep the widget's callbacks pointing at the latest props without re-rendering it.
  useEffect(() => {
    callbacks.current = { onToken, onUnavailable };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let widgetId: string | undefined;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return;
        widgetId = turnstile.render(container, {
          sitekey: siteKey,
          theme: "dark",
          size: "flexible",
          callback: (token) => callbacks.current.onToken(token),
          "expired-callback": () => callbacks.current.onToken(""),
          "error-callback": () => callbacks.current.onToken(""),
        });
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onUnavailable();
      });

    return () => {
      cancelled = true;
      if (widgetId !== undefined) window.turnstile?.remove(widgetId);
    };
  }, [siteKey, nonce]);

  return <div ref={containerRef} className="min-h-[65px]" />;
}
