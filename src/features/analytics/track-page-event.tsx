"use client";

import { useEffect } from "react";

import {
  type AnalyticsEventDescriptor,
  type AnalyticsEventName,
} from "@/features/analytics/events";
import { trackDescriptor } from "@/features/analytics/track";

interface TrackPageEventProps<K extends AnalyticsEventName> {
  event: Extract<AnalyticsEventDescriptor, { name: K }>;
}

export function TrackPageEvent<K extends AnalyticsEventName>({
  event,
}: TrackPageEventProps<K>) {
  useEffect(() => {
    trackDescriptor(event);
  }, [event]);

  return null;
}
