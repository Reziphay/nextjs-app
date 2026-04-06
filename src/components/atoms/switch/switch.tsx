import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./switch.module.css";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <div className={`${styles.wrapper}${className ? ` ${className}` : ""}`}>
      <input ref={ref} type="checkbox" className={styles.checkbox} {...props} />
    </div>
  );
});

Switch.displayName = "Switch";
