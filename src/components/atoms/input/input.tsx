import {
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
} from "react";
import styles from "./input.module.css";

type FieldProps = HTMLAttributes<HTMLDivElement>;

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

type FieldContentProps = HTMLAttributes<HTMLDivElement>;

type InputProps = InputHTMLAttributes<HTMLInputElement>;

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
      {...props}
    />
  );
});

Input.displayName = "Input";
