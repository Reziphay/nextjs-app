import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./switch.module.css";

type SwitchSize = "small" | "default";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  size?: SwitchSize;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, size = "default", ...props },
  ref,
) {
  return (
    <div
      className={`${styles.toggleWrapper}${className ? ` ${className}` : ""}`}
      data-size={size}
    >
      <input ref={ref} type="checkbox" className={styles.toggleCheckbox} {...props} />
      <div className={styles.toggleContainer}>
        <div className={styles.toggleButton}>
          <div className={styles.toggleButtonCirclesContainer}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.toggleButtonCircle} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

Switch.displayName = "Switch";
