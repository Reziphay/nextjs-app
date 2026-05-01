"use client";

import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
} from "react";
import { Button } from "@/components/atoms/button";
import { Eye, EyeOff } from "lucide-react";
import styles from "./input.module.css";

type FieldProps = HTMLAttributes<HTMLDivElement>;

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

type FieldContentProps = HTMLAttributes<HTMLDivElement>;

export type InputProps = InputHTMLAttributes<HTMLInputElement>;
type PasswordInputProps = Omit<InputProps, "type"> & {
  showPasswordLabel: string;
  hidePasswordLabel: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function Field({ className, ...props }: FieldProps) {
  return <div className={joinClassNames(styles.field, className)} {...props} />;
}

export function FieldLabel({
  children,
  className,
  required = false,
  ...props
}: FieldLabelProps) {
  return (
    <label className={joinClassNames(styles.fieldLabel, className)} {...props}>
      <span>{children}</span>
      {required ? <span className={styles.requiredMark}>*</span> : null}
    </label>
  );
}

export function FieldDescription({
  className,
  ...props
}: FieldDescriptionProps) {
  return (
    <p className={joinClassNames(styles.fieldDescription, className)} {...props} />
  );
}

export function FieldContent({ className, ...props }: FieldContentProps) {
  return (
    <div className={joinClassNames(styles.fieldContent, className)} {...props} />
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={joinClassNames(styles.input, className)}
      autoComplete="off"
      {...props}
    />
  );
});

Input.displayName = "Input";

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      className,
      showPasswordLabel,
      hidePasswordLabel,
      disabled,
      ...props
    },
    ref,
  ) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className={styles.passwordInputWrapper}>
        <input
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={joinClassNames(
            styles.input,
            styles.passwordInput,
            className,
          )}
          autoComplete="off"
          disabled={disabled}
          {...props}
        />
        <Button
          variant="unstyled"
          type="button"
          className={styles.passwordToggle}
          aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
          aria-pressed={isVisible}
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            setIsVisible((current) => !current);
          }}
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" size={18} />
          ) : (
            <Eye aria-hidden="true" size={18} />
          )}
        </Button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
