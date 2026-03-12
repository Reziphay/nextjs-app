"use client";

export type EventProperties = Record<
  string,
  boolean | null | number | string | undefined
>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitize(properties: EventProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

export function trackEvent(name: string, properties: EventProperties = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    name,
    path: window.location.pathname,
    properties: sanitize(properties),
  };

  if (window.gtag) {
    window.gtag("event", name, payload.properties);
  }

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/track",
      new Blob([body], { type: "application/json" }),
    );
    return;
  }

  void fetch("/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}

