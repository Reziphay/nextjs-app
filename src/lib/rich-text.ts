const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: " ",
};

export function sanitizeRichHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
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
