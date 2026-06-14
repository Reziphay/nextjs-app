export const APP_TITLE = "Reziphay";

export function buildPageTitle(
  ...parts: Array<string | null | undefined>
): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" | ");
}
