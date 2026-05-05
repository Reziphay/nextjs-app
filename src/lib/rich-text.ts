import sanitizeHtml from "sanitize-html";

const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: " ",
};

// Allowlist tuned for the Tiptap editor output (see rich-text-editor).
// Keep this in sync with extensions enabled in the editor.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "code", "pre",
    "ol", "ul", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "hr",
    "a", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["style"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
  // Drop any tag we don't allow rather than escaping it.
  disallowedTagsMode: "discard",
  // Restrict inline styles to a small, safe set (color from Tiptap color extension).
  allowedStyles: {
    span: {
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
    },
  },
  // Force external links to open safely.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function isRichHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (entity, code: string) => {
    const normalizedCode = code.toLowerCase();
    if (normalizedCode.startsWith("#x")) {
      const parsed = Number.parseInt(normalizedCode.slice(2), 16);
      return Number.isNaN(parsed) ? entity : String.fromCharCode(parsed);
    }
    if (normalizedCode.startsWith("#")) {
      const parsed = Number.parseInt(normalizedCode.slice(1), 10);
      return Number.isNaN(parsed) ? entity : String.fromCharCode(parsed);
    }
    return HTML_ENTITY_MAP[normalizedCode] ?? entity;
  });
}

export function toPlainTextPreview(value?: string | null): string {
  if (!value) return "";

  return decodeHtmlEntities(
    sanitizeRichHtml(value)
      .replace(/<\/(p|div|li|br|h[1-6])>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}
