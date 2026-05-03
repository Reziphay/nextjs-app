"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icon";
import { searchMarketplace, type MarketplaceSearchItem } from "@/lib/search-api";
import { proxyMediaUrl } from "@/lib/media";
import styles from "./marketplace-search-box.module.css";

type MarketplaceSearchBoxProps = {
  accessToken?: string;
  placeholder: string;
  className?: string;
  variant?: "header" | "page";
};

function itemTypeLabel(type: MarketplaceSearchItem["type"]) {
  const labels: Record<MarketplaceSearchItem["type"], string> = {
    brand: "Brend",
    branch: "Filial",
    service: "Servis",
    uso: "USO",
    address: "Ünvan",
  };
  return labels[type];
}

export function MarketplaceSearchBox({
  accessToken,
  placeholder,
  className,
  variant = "header",
}: MarketplaceSearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const queryFromUrl = searchParams.get("query") ?? searchParams.get("queary") ?? "";
  const [value, setValue] = useState(queryFromUrl);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<MarketplaceSearchItem[]>([]);

  useEffect(() => {
    setValue(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    if (!focused || value.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setLoading(true);
      void searchMarketplace(value, accessToken, { limit: 7 })
        .then((result) => {
          setSuggestions(result.suggestions);
          setActiveIndex(-1);
        })
        .finally(() => setLoading(false));
    }, 180);

    return () => window.clearTimeout(timer);
  }, [accessToken, focused, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setFocused(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function goSearch() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFocused(false);
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
  }

  function openSuggestion(item: MarketplaceSearchItem) {
    setFocused(false);
    router.push(item.href);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocused(true);
      setActiveIndex((index) => Math.min(suggestions.length - 1, index + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(-1, index - 1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        openSuggestion(suggestions[activeIndex]);
      } else {
        goSearch();
      }
    }
    if (event.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
    }
  }

  const showDropdown = focused && value.trim().length >= 2;

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, styles[variant], className].filter(Boolean).join(" ")}
    >
      <div className={styles.inputShell}>
        <Icon icon="search" size={variant === "page" ? 20 : 15} color="current" />
        <input
          value={value}
          onFocus={() => setFocused(true)}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-controls={showDropdown ? listId : undefined}
          aria-expanded={showDropdown}
          role="combobox"
        />
      </div>

      {showDropdown ? (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Did you mean</span>
            {loading ? <Icon icon="progress_activity" size={14} color="current" /> : null}
          </div>
          {suggestions.length > 0 ? (
            <div id={listId} role="listbox" className={styles.suggestionList}>
              {suggestions.map((item, index) => {
                const img = proxyMediaUrl(item.image_url);
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    data-active={activeIndex === index}
                    className={styles.suggestionItem}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openSuggestion(item)}
                  >
                    <span className={styles.suggestionMedia}>
                      {item.type === "address" ? (
                        <Icon icon="location_on" size={17} color="current" />
                      ) : img ? (
                        <Image src={img} alt="" fill sizes="36px" className={styles.suggestionImage} />
                      ) : (
                        <Icon icon={item.type === "service" ? "room_service" : item.type === "brand" ? "store" : "person"} size={16} color="current" />
                      )}
                    </span>
                    <span className={styles.suggestionText}>
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <span className={styles.suggestionType}>{itemTypeLabel(item.type)}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <button type="button" className={styles.searchSubmit} onClick={goSearch}>
              <Icon icon="search" size={15} color="current" />
              <span>{value}</span>
            </button>
          )}
        </div>
      ) : null}
      {pathname === "/search" ? null : null}
    </div>
  );
}
