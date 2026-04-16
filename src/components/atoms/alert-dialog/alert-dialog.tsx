"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "../button";
import styles from "./alert-dialog.module.css";

type AlertDialogContextValue = {
  descriptionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
};

type AlertDialogProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

type AlertDialogTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
};

type AlertDialogContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: "default" | "sm";
};

type AlertDialogHeaderProps = HTMLAttributes<HTMLDivElement>;
type AlertDialogFooterProps = HTMLAttributes<HTMLDivElement>;
type AlertDialogTitleProps = HTMLAttributes<HTMLHeadingElement>;
type AlertDialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
type AlertDialogMediaProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "destructive";
};
type AlertDialogActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  destructive?: boolean;
};
type AlertDialogCancelProps = ButtonHTMLAttributes<HTMLButtonElement>;

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: ((event: E) => void) | undefined,
) {
  return (event: E) => {
    theirHandler?.(event);

    if (!event.defaultPrevented) {
      ourHandler?.(event);
    }
  };
}

function useAlertDialogContext(componentName: string) {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error(`${componentName} must be used within AlertDialog.`);
  }

  return context;
}

export function AlertDialog({
  children,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const dialogId = useId();
  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChangeRef = useRef(onOpenChange);
  const isControlled = controlledOpen !== undefined;

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChangeRef.current?.(nextOpen);
    },
    [isControlled],
  );

  const contextValue = useMemo<AlertDialogContextValue>(
    () => ({
      descriptionId: `${dialogId}-description`,
      open,
      setOpen,
      titleId: `${dialogId}-title`,
    }),
    [dialogId, open, setOpen],
  );

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({
  asChild = false,
  children,
  onClick,
  ...props
}: AlertDialogTriggerProps) {
  const { open, setOpen } = useAlertDialogContext("AlertDialogTrigger");

  const handleOpen = () => {
    setOpen(true);
  };

  if (asChild) {
    const child = Children.only(children) as ReactElement<{
      "aria-expanded"?: boolean;
      "aria-haspopup"?: "dialog";
      "data-state"?: "closed" | "open";
      onClick?: MouseEventHandler<HTMLElement>;
    }>;

    if (!isValidElement(child)) {
      return null;
    }

    return cloneElement(child, {
      "aria-expanded": open,
      "aria-haspopup": "dialog",
      "data-state": open ? "open" : "closed",
      onClick: composeEventHandlers(
        child.props.onClick as MouseEventHandler<HTMLElement> | undefined,
        () => handleOpen(),
      ),
    });
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      data-state={open ? "open" : "closed"}
      onClick={composeEventHandlers(onClick, () => handleOpen())}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlertDialogContent({
  children,
  className,
  size = "default",
  ...props
}: AlertDialogContentProps) {
  const { descriptionId, open, setOpen, titleId } = useAlertDialogContext(
    "AlertDialogContent",
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const portalNode = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const focusTarget =
        contentRef.current?.querySelector<HTMLElement>(
          "[data-alert-dialog-autofocus], button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ) ?? contentRef.current;

      focusTarget?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus?.();
    };
  }, [open, setOpen]);

  if (!open || !portalNode) {
    return null;
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div
        ref={contentRef}
        role="alertdialog"
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        tabIndex={-1}
        className={joinClassNames(
          styles.content,
          size === "sm" ? styles.contentSm : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    portalNode,
  );
}

export function AlertDialogMedia({
  children,
  className,
  tone = "default",
  ...props
}: AlertDialogMediaProps) {
  return (
    <div
      className={joinClassNames(
        styles.media,
        tone === "destructive" ? styles.mediaDestructive : undefined,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDialogHeader({
  className,
  ...props
}: AlertDialogHeaderProps) {
  return <div className={joinClassNames(styles.header, className)} {...props} />;
}

export function AlertDialogTitle({
  className,
  id,
  ...props
}: AlertDialogTitleProps) {
  const { titleId } = useAlertDialogContext("AlertDialogTitle");

  return (
    <h2
      id={id ?? titleId}
      className={joinClassNames(styles.title, className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  id,
  ...props
}: AlertDialogDescriptionProps) {
  const { descriptionId } = useAlertDialogContext("AlertDialogDescription");

  return (
    <p
      id={id ?? descriptionId}
      className={joinClassNames(styles.description, className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: AlertDialogFooterProps) {
  return <div className={joinClassNames(styles.footer, className)} {...props} />;
}

export function AlertDialogCancel({
  children,
  onClick,
  type = "button",
  ...props
}: AlertDialogCancelProps) {
  const { setOpen } = useAlertDialogContext("AlertDialogCancel");

  return (
    <Button
      variant="outline"
      type={type}
      onClick={composeEventHandlers<MouseEvent<HTMLButtonElement>>(onClick, () =>
        setOpen(false),
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AlertDialogAction({
  children,
  destructive = false,
  onClick,
  type = "button",
  ...props
}: AlertDialogActionProps) {
  const { setOpen } = useAlertDialogContext("AlertDialogAction");

  return (
    <Button
      variant={destructive ? "destructive" : "default"}
      type={type}
      onClick={composeEventHandlers<MouseEvent<HTMLButtonElement>>(onClick, () =>
        setOpen(false),
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
