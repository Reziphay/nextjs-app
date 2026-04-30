import styles from "./rich-text-display.module.css";

type RichTextDisplayProps = {
  html: string;
  className?: string;
  emptyFallback?: string;
};

// Allowed tags and attributes for sanitization (no images, no scripts)
function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}

function isRichHtml(html: string): boolean {
  return /<[a-z][\s\S]*>/i.test(html);
}

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
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}
