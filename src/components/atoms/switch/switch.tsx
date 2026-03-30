import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./switch.module.css";

type SwitchSize = "small" | "default";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  size?: SwitchSize;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, size = "default", role = "switch", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      role={role}
      className={joinClassNames(styles.switch, styles[size], className)}
      {...props}
    />
  );
});

Switch.displayName = "Switch";
