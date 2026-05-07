export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "whatsapp"
  | "linkedin"
  | "x"
  | "website";

export type SocialLinkFields = {
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  whatsapp_url: string;
  linkedin_url: string;
  x_url: string;
  website_url: string;
};

type PlatformRule = { platform: Exclude<SocialPlatform, "website">; hosts: string[] };

const PLATFORM_RULES: PlatformRule[] = [
  { platform: "instagram", hosts: ["instagram.com"] },
  { platform: "facebook", hosts: ["facebook.com", "fb.com", "fb.me"] },
  { platform: "youtube", hosts: ["youtube.com", "youtu.be"] },
  { platform: "whatsapp", hosts: ["whatsapp.com", "wa.me"] },
  { platform: "linkedin", hosts: ["linkedin.com"] },
  { platform: "x", hosts: ["x.com", "twitter.com"] },
];

export function detectSocialPlatform(url: string): SocialPlatform {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    for (const { platform, hosts } of PLATFORM_RULES) {
      if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
        return platform;
      }
    }
  } catch {
    // fall through
  }
  return "website";
}

export const PLATFORM_TO_FIELD: Record<SocialPlatform, keyof SocialLinkFields> = {
  instagram: "instagram_url",
  facebook: "facebook_url",
  youtube: "youtube_url",
  whatsapp: "whatsapp_url",
  linkedin: "linkedin_url",
  x: "x_url",
  website: "website_url",
};

export function socialFieldsToUrls(
  fields: Partial<Record<keyof SocialLinkFields, string | null | undefined>>,
): string[] {
  const order: Array<keyof SocialLinkFields> = [
    "instagram_url",
    "facebook_url",
    "youtube_url",
    "whatsapp_url",
    "linkedin_url",
    "x_url",
    "website_url",
  ];
  return order.map((k) => fields[k] ?? "").filter(Boolean) as string[];
}

export function socialUrlsToFields(urls: string[]): SocialLinkFields {
  const result: SocialLinkFields = {
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
    whatsapp_url: "",
    linkedin_url: "",
    x_url: "",
    website_url: "",
  };
  for (const url of urls) {
    if (!url) continue;
    result[PLATFORM_TO_FIELD[detectSocialPlatform(url)]] = url;
  }
  return result;
}

export type SocialUrlErrorKey =
  | "invalid_format"
  | "invalid_protocol"
  | "too_long"
  | "invalid_chars";

/**
 * Returns an error key or null if valid.
 * Security: blocks non-http(s) protocols (javascript:, data:, file:, etc.)
 * and control/injection characters.
 */
export function validateSocialUrl(url: string): SocialUrlErrorKey | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.length > 500) return "too_long";

  // Block control chars and characters that enable injection/XSS in attributes
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return "invalid_chars";

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "invalid_format";
  }

  // Only http and https — blocks javascript:, data:, file:, vbscript:, etc.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "invalid_protocol";
  }

  if (!parsed.hostname || parsed.hostname.length < 2) return "invalid_format";

  return null;
}
