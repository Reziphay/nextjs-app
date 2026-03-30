import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./checkbox.module.css";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={joinClassNames(styles.checkbox, className)}
        {...props}
      />
    );
  },
);

Checkbox.displayName = "Checkbox";
