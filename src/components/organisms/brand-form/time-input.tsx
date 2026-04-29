"use client";

import {
  Input,
  type InputProps,
} from "@/components/atoms/input";

type TimeInputProps = Omit<
  InputProps,
  "type" | "inputMode" | "maxLength" | "pattern" | "placeholder" | "onChange"
> & {
  onChange: (value: string) => void;
  placeholder?: string;
};

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function normalizeTimeInput(value: string) {
  const match = /^(\d{1,2}):?(\d{1,2})?$/.exec(value.trim());

  if (!match) {
    return value;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");

  if (hour > 23 || minute > 59) {
    return value;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function isValidTime24(value: string | null | undefined) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? "");
}

export function TimeInput({
  onChange,
  onBlur,
  placeholder = "HH:mm",
  ...props
}: TimeInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      maxLength={5}
      pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
      placeholder={placeholder}
      onChange={(event) => {
        onChange(formatTimeInput(event.target.value));
      }}
      onBlur={(event) => {
        const normalizedValue = normalizeTimeInput(event.target.value);
        if (normalizedValue !== event.target.value) {
          onChange(normalizedValue);
        }
        onBlur?.(event);
      }}
    />
  );
}
