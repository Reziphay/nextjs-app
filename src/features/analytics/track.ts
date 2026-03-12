"use client";

import type {
  AnalyticsEventDescriptor,
  AnalyticsEventMap,
  AnalyticsEventName,
} from "@/features/analytics/events";

export type EventProperties = Record<string, boolean | null | number | string>;

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

export function buildTrackingPayload<K extends AnalyticsEventName>(
  name: K,
  properties: AnalyticsEventMap[K],
  pathname: string,
) {
  return {
    name,
    path: pathname,
    properties: sanitize(properties as EventProperties),
  };
}

export function trackEvent<K extends AnalyticsEventName>(
  name: K,
  properties: AnalyticsEventMap[K],
) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = buildTrackingPayload(name, properties, window.location.pathname);

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

export function trackDescriptor(event: AnalyticsEventDescriptor) {
  trackEvent(
    event.name as AnalyticsEventName,
    event.properties as AnalyticsEventMap[AnalyticsEventName],
  );
}
