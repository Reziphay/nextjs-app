"use client";

import {
  forwardRef,
  startTransition,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Icon } from "@/components/icon";
import styles from "./combobox.module.css";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  keywords?: readonly string[];
};

type ComboboxValue = string | string[];

type ComboboxRenderState = {
  active: boolean;
  selected: boolean;
};

type ComboboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "multiple" | "onChange" | "size" | "type" | "value"
> & {
  items: readonly ComboboxOption[];
  value?: ComboboxValue;
  defaultValue?: ComboboxValue;
  onValueChange?: (value: ComboboxValue) => void;
  emptyMessage?: string;
  multiple?: boolean;
  renderItem?: (
    item: ComboboxOption,
    state: ComboboxRenderState,
  ) => ReactNode;
};

type ComboboxChipsProps = HTMLAttributes<HTMLDivElement>;

type ComboboxItemProps = HTMLAttributes<HTMLDivElement> & {
  description?: ReactNode;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function normalizeValue(
  value: ComboboxValue | undefined,
  multiple: boolean,
): string[] {
  if (multiple) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value[0] ? [value[0]] : [];
  }

  return value ? [value] : [];
}

function getSearchText(item: ComboboxOption) {
  return [item.label, item.description, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ComboboxChips({ className, ...props }: ComboboxChipsProps) {
  return (
    <div className={joinClassNames(styles.chips, className)} {...props} />
  );
}

export function ComboboxItem({
  children,
  className,
  description,
  ...props
}: ComboboxItemProps) {
  return (
    <div className={joinClassNames(styles.customItem, className)} {...props}>
      <strong>{children}</strong>
      {description ? (
        <span className={styles.customItemDescription}>{description}</span>
      ) : null}
    </div>
  );
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox(
    {
      "aria-invalid": ariaInvalid,
      className,
      defaultValue,
      disabled = false,
      emptyMessage = "No results found.",
      items,
      multiple = false,
      onBlur,
      onFocus,
      onKeyDown,
      onValueChange,
      placeholder,
      renderItem,
      value,
      ...inputProps
    },
    ref,
  ) {
    const generatedId = useId();
    const listboxId = `${generatedId}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<ComboboxValue>(
      defaultValue ?? (multiple ? [] : ""),
    );
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

    const currentValue = isControlled ? value : internalValue;
    const selectedValues = normalizeValue(currentValue, multiple);
    const selectedItems = items.filter((item) =>
      selectedValues.includes(item.value),
    );
    const selectedItem = selectedItems[0];
    const deferredQuery = useDeferredValue(query.trim().toLowerCase());
    const filteredItems = items.filter((item) =>
      deferredQuery ? getSearchText(item).includes(deferredQuery) : true,
    );
    const isInvalid = ariaInvalid === true || ariaInvalid === "true";
    const selectedIndex = filteredItems.findIndex((item) =>
      selectedValues.includes(item.value),
    );
    const effectiveHighlightedIndex = filteredItems[highlightedIndex]
      ? highlightedIndex
      : selectedIndex >= 0
        ? selectedIndex
        : 0;
    const activeOption = filteredItems[effectiveHighlightedIndex];

    const inputValue = multiple
      ? query
      : isOpen
        ? query || selectedItem?.label || ""
        : selectedItem?.label || query;

    function commitValue(nextValue: ComboboxValue) {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    }

    function removeSelectedValue(targetValue: string) {
      const nextValues = selectedValues.filter((valueItem) => valueItem !== targetValue);
      commitValue(multiple ? nextValues : nextValues[0] ?? "");
    }

    function handleSelect(item: ComboboxOption) {
      if (multiple) {
        const exists = selectedValues.includes(item.value);
        const nextValues = exists
          ? selectedValues.filter((valueItem) => valueItem !== item.value)
          : [...selectedValues, item.value];

        commitValue(nextValues);
        startTransition(() => {
          setQuery("");
        });
        setIsOpen(true);
        return;
      }

      commitValue(item.value);
      startTransition(() => {
        setQuery("");
      });
      setIsOpen(false);
    }

    function openCombobox() {
      if (!disabled) {
        setIsOpen(true);
      }
    }

    useEffect(() => {
      function handlePointerDown(event: PointerEvent) {
        if (!rootRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }

      document.addEventListener("pointerdown", handlePointerDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
      };
    }, []);

    return (
      <div
        ref={rootRef}
        data-disabled={disabled ? "" : undefined}
        data-invalid={isInvalid ? "" : undefined}
        data-open={isOpen ? "" : undefined}
        className={joinClassNames(styles.root, className)}
        onMouseDown={(event) => {
          if (disabled) {
            return;
          }

          if (
            event.target instanceof Element &&
            event.target.closest("button")
          ) {
            return;
          }

          if (event.target !== inputRef.current) {
            event.preventDefault();
            inputRef.current?.focus();
          }

          openCombobox();
        }}
      >
        <div className={styles.control}>
          {multiple && selectedItems.length > 0 ? (
            <ComboboxChips>
              {selectedItems.map((item) => (
                <span key={item.value} className={styles.chip}>
                  <span>{item.label}</span>
                  {!disabled ? (
                    <button
                      type="button"
                      className={styles.chipRemove}
                      aria-label={`Remove ${item.label}`}
                      onClick={() => removeSelectedValue(item.value)}
                    >
                      <Icon icon="close" size={14} color="current" />
                    </button>
                  ) : null}
                </span>
              ))}
            </ComboboxChips>
          ) : null}

          <input
            {...inputProps}
            ref={inputRef}
            role="combobox"
            type="text"
            disabled={disabled}
            value={inputValue}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-invalid={ariaInvalid}
            aria-activedescendant={
              isOpen && activeOption ? `${listboxId}-${activeOption.value}` : undefined
            }
            className={styles.input}
            onFocus={(event) => {
              onFocus?.(event);
              openCombobox();

              if (!multiple && selectedItem && query === "") {
                requestAnimationFrame(() => {
                  inputRef.current?.select();
                });
              }
            }}
            onBlur={onBlur}
            onChange={(event) => {
              const nextQuery = event.target.value;

              startTransition(() => {
                setQuery(nextQuery);
              });
              openCombobox();
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);

              if (event.defaultPrevented || disabled) {
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                openCombobox();
                setHighlightedIndex(() =>
                  Math.min(
                    effectiveHighlightedIndex + 1,
                    Math.max(filteredItems.length - 1, 0),
                  ),
                );
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                openCombobox();
                setHighlightedIndex(() =>
                  Math.max(effectiveHighlightedIndex - 1, 0),
                );
                return;
              }

              if (event.key === "Enter" && isOpen && activeOption) {
                event.preventDefault();
                handleSelect(activeOption);
                return;
              }

              if (event.key === "Escape") {
                setIsOpen(false);
                return;
              }

              if (
                event.key === "Backspace" &&
                multiple &&
                query.length === 0 &&
                selectedValues.length > 0
              ) {
                removeSelectedValue(selectedValues[selectedValues.length - 1]);
              }
            }}
          />

          <span className={styles.chevron} aria-hidden="true">
            <Icon
              icon="expand_more"
              size={18}
              color="current"
              className={joinClassNames(
                styles.chevronIcon,
                isOpen ? styles.chevronIconOpen : undefined,
              )}
            />
          </span>
        </div>

        {isOpen ? (
          <div className={styles.listboxWrap}>
            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              className={styles.listbox}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const isSelected = selectedValues.includes(item.value);
                  const isActive = effectiveHighlightedIndex === index;

                  return (
                    <button
                      key={item.value}
                      id={`${listboxId}-${item.value}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-active={isActive ? "" : undefined}
                      data-selected={isSelected ? "" : undefined}
                      className={styles.option}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(index);
                      }}
                      onClick={() => {
                        handleSelect(item);
                      }}
                    >
                      <div className={styles.optionContent}>
                        {renderItem ? (
                          renderItem(item, {
                            active: isActive,
                            selected: isSelected,
                          })
                        ) : (
                          <ComboboxItem description={item.description}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </div>

                      {isSelected ? (
                        <Icon
                          icon="check"
                          size={16}
                          color="current"
                          className={styles.optionCheck}
                        />
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className={styles.empty}>{emptyMessage}</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

Combobox.displayName = "Combobox";
