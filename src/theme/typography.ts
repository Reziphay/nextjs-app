import type { CSSProperties } from "react";

export const fontEmbedMarkup = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet">
`.trim();

export const iconEmbedMarkup = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
`.trim();

type LinkDefinition = {
  href: string;
  rel?: string;
  crossOrigin?: "" | "anonymous" | "use-credentials";
};

function dedupeLinks(links: LinkDefinition[]) {
  const uniqueLinks = new Map<string, LinkDefinition>();

  for (const link of links) {
    const key = `${link.rel ?? ""}|${link.href}|${link.crossOrigin ?? ""}`;

    if (!uniqueLinks.has(key)) {
      uniqueLinks.set(key, link);
    }
  }

  return [...uniqueLinks.values()];
}

function parseLinkTagAttributes(markup: string): LinkDefinition[] {
  const linkTagPattern = /<link\s+([^>]+)>/g;
  const attributePattern = /([a-zA-Z:-]+)(?:="([^"]*)")?/g;
  const links: LinkDefinition[] = [];

  for (const tagMatch of markup.matchAll(linkTagPattern)) {
    const attributesSource = tagMatch[1];
    const attributes: Record<string, string> = {};

    for (const attributeMatch of attributesSource.matchAll(attributePattern)) {
      const [, rawName, rawValue] = attributeMatch;
      attributes[rawName.toLowerCase()] = rawValue ?? "";
    }

    if (!attributes.href) {
      continue;
    }

    const linkDefinition: LinkDefinition = {
      href: attributes.href,
      rel: attributes.rel,
      crossOrigin:
        "crossorigin" in attributes
          ? attributes.crossorigin === "use-credentials"
            ? "use-credentials"
            : "anonymous"
          : undefined,
    };

    if (!links.some((link) => link.href === linkDefinition.href)) {
      links.push(linkDefinition);
    }
  }

  return links;
}

function extractFontFamilies(markup: string) {
  const familyPattern = /family=([^:&"]+)/g;
  const families: string[] = [];

  for (const familyMatch of markup.matchAll(familyPattern)) {
    const familyName = decodeURIComponent(familyMatch[1]).replaceAll("+", " ");

    if (!families.includes(familyName)) {
      families.push(familyName);
    }
  }

  return families;
}

function inferGenericFamily(families: string[]) {
  const serifIndicators = ["slab", "serif", "times", "garamond", "georgia"];
  const hasSansFamily = families.some(
    (family) =>
      !serifIndicators.some((indicator) =>
        family.toLowerCase().includes(indicator),
      ),
  );

  return hasSansFamily ? "sans-serif" : "serif";
}

function createFontFamily(markup: string) {
  const families = extractFontFamilies(markup);
  const genericFamily = inferGenericFamily(families);

  if (families.length === 0) {
    return genericFamily;
  }

  return [...families.map((family) => `"${family}"`), genericFamily].join(", ");
}

const fontSizeScale = {
  extraSmall: "clamp(0.75rem, 0.73rem + 0.14vw, 0.8125rem)",
  small: "clamp(0.875rem, 0.84rem + 0.18vw, 0.9375rem)",
  medium: "clamp(1rem, 0.97rem + 0.24vw, 1.125rem)",
  large: "clamp(1.25rem, 1.14rem + 0.55vw, 1.5rem)",
  extraLarge: "clamp(2.75rem, 2.15rem + 2.4vw, 5rem)",
} as const;

export const fontLinks = dedupeLinks([
  ...parseLinkTagAttributes(fontEmbedMarkup),
  ...parseLinkTagAttributes(iconEmbedMarkup),
]);

export const typographyTheme = {
  rootFontSizePx: 13,
  fontFamilyBase: createFontFamily(fontEmbedMarkup),
  fontSizes: fontSizeScale,
} as const;

export const typographyVariables = {
  "--font-size-root": `${typographyTheme.rootFontSizePx}px`,
  "--font-family-base": typographyTheme.fontFamilyBase,
  "--font-size-extra-small": typographyTheme.fontSizes.extraSmall,
  "--font-size-small": typographyTheme.fontSizes.small,
  "--font-size-medium": typographyTheme.fontSizes.medium,
  "--font-size-large": typographyTheme.fontSizes.large,
  "--font-size-extra-large": typographyTheme.fontSizes.extraLarge,
} satisfies Record<`--${string}`, string>;

export const typographyStyle = typographyVariables as CSSProperties;
