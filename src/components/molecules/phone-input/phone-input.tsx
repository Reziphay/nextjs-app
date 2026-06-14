"use client";

import { useMemo } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { countryDirectory, findCountryByValue } from "@/lib/countries";
import styles from "./phone-input.module.css";

type PhoneInputProps = {
  /** Full phone string, e.g. "+994701234567". */
  value: string;
  onChange: (value: string) => void;
  /** Country value (e.g. "Azerbaijan") used to pick the default prefix. */
  defaultCountry?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
};

// Unique prefixes, longest-first so "+994" matches before "+9".
const PREFIXES = Array.from(new Set(countryDirectory.map((c) => c.prefix))).sort(
  (a, b) => b.length - a.length,
);

function splitPhone(value: string, fallbackPrefix: string): { prefix: string; rest: string } {
  const match = PREFIXES.find((p) => value.startsWith(p));
  if (match) return { prefix: match, rest: value.slice(match.length).replace(/\D/g, "") };
  return { prefix: fallbackPrefix, rest: value.replace(/\D/g, "") };
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry,
  placeholder,
  disabled,
  invalid,
}: PhoneInputProps) {
  const { locale } = useLocale();

  const defaultPrefix = useMemo(() => {
    const country = defaultCountry ? findCountryByValue(defaultCountry) : null;
    return country?.prefix ?? PREFIXES[0] ?? "+994";
  }, [defaultCountry]);

  const { prefix, rest } = splitPhone(value, defaultPrefix);

  // Unique prefixes, keeping the first country's label for each.
  const prefixOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ prefix: string; label: string }> = [];
    for (const c of countryDirectory) {
      if (seen.has(c.prefix)) continue;
      seen.add(c.prefix);
      const name = c.labels[locale as "az" | "en" | "ru"] ?? c.labels.en;
      out.push({ prefix: c.prefix, label: `${name} ${c.prefix}` });
    }
    return out;
  }, [locale]);

  function emit(nextPrefix: string, nextRest: string) {
    const digits = nextRest.replace(/\D/g, "").slice(0, 15);
    onChange(digits ? `${nextPrefix}${digits}` : "");
  }

  return (
    <div className={[styles.wrap, invalid ? styles.invalid : ""].filter(Boolean).join(" ")}>
      <select
        className={styles.prefix}
        value={prefix}
        disabled={disabled}
        onChange={(e) => emit(e.target.value, rest)}
        aria-label="prefix"
      >
        {prefixOptions.map((opt) => (
          <option key={opt.prefix} value={opt.prefix}>
            {opt.prefix}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        className={styles.number}
        value={rest}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={invalid}
        onChange={(e) => emit(prefix, e.target.value)}
      />
    </div>
  );
}
