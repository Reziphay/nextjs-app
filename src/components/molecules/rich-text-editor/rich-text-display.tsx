import { isRichHtml, sanitizeRichHtml } from "@/lib/rich-text";
import styles from "./rich-text-display.module.css";

type RichTextDisplayProps = {
  html: string;
  className?: string;
  emptyFallback?: string;
};

export function RichTextDisplay({ html, className, emptyFallback }: RichTextDisplayProps) {
  if (!html || html === "<p></p>") {
    if (!emptyFallback) return null;
    return <em className={styles.empty}>{emptyFallback}</em>;
  }

  // Plain text stored before rich text was introduced — render with whitespace preserved
  if (!isRichHtml(html)) {
    return (
      <p className={`${styles.plain}${className ? ` ${className}` : ""}`}>{html}</p>
    );
  }

  return (
    <div
      className={`${styles.richText}${className ? ` ${className}` : ""}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
}
