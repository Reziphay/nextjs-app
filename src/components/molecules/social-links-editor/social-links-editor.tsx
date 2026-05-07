"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/atoms/button";
import { SocialIcon, SOCIAL_COLORS } from "@/components/atoms/social-icon/social-icon";
import {
  detectSocialPlatform,
  validateSocialUrl,
  type SocialUrlErrorKey,
} from "@/lib/social-url";
import styles from "./social-links-editor.module.css";

export type SocialLinksEditorMessages = {
  addPlaceholder: string;
  addButton: string;
  removeLabel: string;
  errorInvalidFormat: string;
  errorInvalidProtocol: string;
  errorTooLong: string;
  errorInvalidChars: string;
};

export type SocialLinksEditorRef = {
  /** Commit any pending typed URL before form submit. Safe to call when input is empty. */
  flush: () => void;
};

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  messages: SocialLinksEditorMessages;
};

export const SocialLinksEditor = forwardRef<SocialLinksEditorRef, Props>(
  function SocialLinksEditor({ value, onChange, messages }, ref) {
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const ERROR_LABELS: Record<SocialUrlErrorKey, string> = {
      invalid_format: messages.errorInvalidFormat,
      invalid_protocol: messages.errorInvalidProtocol,
      too_long: messages.errorTooLong,
      invalid_chars: messages.errorInvalidChars,
    };

    function commit() {
      const url = input.trim();
      if (!url) return;

      const errorKey = validateSocialUrl(url);
      if (errorKey) {
        setError(ERROR_LABELS[errorKey]);
        return;
      }

      const platform = detectSocialPlatform(url);
      const filtered = value.filter((u) => detectSocialPlatform(u) !== platform);
      onChange([...filtered, url]);
      setInput("");
      setError(null);
      // Don't re-focus after commit — lets the browser move focus normally
      // (e.g. to the submit button the user just clicked)
    }

    useImperativeHandle(ref, () => ({
      flush: commit,
    }));

    function remove(index: number) {
      onChange(value.filter((_, i) => i !== index));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      }
      if (e.key === "Escape") {
        setInput("");
        setError(null);
      }
    }

    return (
      <div className={styles.editor}>
        {value.length > 0 && (
          <ul className={styles.list}>
            {value.map((url, i) => {
              const platform = detectSocialPlatform(url);
              return (
                <li key={`${platform}-${i}`} className={styles.item}>
                  <span
                    className={styles.itemIcon}
                    style={{ color: SOCIAL_COLORS[platform] }}
                  >
                    <SocialIcon platform={platform} size={16} />
                  </span>
                  <span className={styles.itemUrl}>{url}</span>
                  <Button
                    variant="unstyled"
                    type="button"
                    className={styles.removeBtn}
                    aria-label={messages.removeLabel}
                    onClick={() => remove(i)}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <div className={`${styles.addRow} ${error ? styles.addRowError : ""}`}>
          <input
            ref={inputRef}
            className={styles.addInput}
            type="url"
            value={input}
            placeholder={messages.addPlaceholder}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <Button
            variant="unstyled"
            type="button"
            className={styles.addBtn}
            onClick={commit}
            tabIndex={-1}
          >
            {messages.addButton}
          </Button>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>
    );
  },
);
