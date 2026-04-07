import type { Messages } from "@/i18n/types";
import type { UserType } from "@/types";

export const protectedAppPaths = [
  "/home",
  "/search",
  "/dashboard",
  "/services",
  "/brands",
  "/settings",
  "/account",
  "/notification",
  "/rezervations",
  "/favorites",
  "/moderation",
] as const;

export type ProtectedAppPath = (typeof protectedAppPaths)[number];

type SidebarRouteLabelKey =
  | "home"
  | "search"
  | "dashboardPage"
  | "services"
  | "brands"
  | "settings"
  | "reservations"
  | "favorites"
  | "moderation";

type SidebarRouteItem = {
  href: ProtectedAppPath;
  icon: string;
  labelKey: SidebarRouteLabelKey;
};

type RouteAccessInput = {
  pathname: ProtectedAppPath;
  userType: UserType;
  searchParams?: URLSearchParams;
};

const commonSidebarItems: readonly SidebarRouteItem[] = [
  { href: "/search", icon: "search", labelKey: "search" },
  { href: "/settings", icon: "settings", labelKey: "settings" },
] as const;

const roleSidebarItems: Record<UserType, readonly SidebarRouteItem[]> = {
  uso: [
    { href: "/home", icon: "home", labelKey: "home" },
    { href: "/services", icon: "room_service", labelKey: "services" },
    { href: "/brands", icon: "sell", labelKey: "brands" },
    { href: "/dashboard", icon: "dashboard", labelKey: "dashboardPage" },
  ],
  ucr: [
    { href: "/home", icon: "home", labelKey: "home" },
    { href: "/rezervations", icon: "event_available", labelKey: "reservations" },
    { href: "/favorites", icon: "favorite", labelKey: "favorites" },
  ],
  admin: [
    { href: "/dashboard", icon: "dashboard", labelKey: "dashboardPage" },
    { href: "/moderation", icon: "gavel", labelKey: "moderation" },
  ],
};

export function isProtectedAppPath(value: string): value is ProtectedAppPath {
  return protectedAppPaths.includes(value as ProtectedAppPath);
}

export function getDefaultAppRouteForUserType(
  userType: UserType | null | undefined,
): ProtectedAppPath {
  return userType === "admin" ? "/dashboard" : "/home";
}

export function canAccessProtectedRoute({
  pathname,
  userType,
  searchParams,
}: RouteAccessInput) {
  const hasEntityId = Boolean(searchParams?.get("id")?.trim());

  switch (pathname) {
    case "/search":
    case "/settings":
    case "/account":
    case "/notification":
      return true;
    case "/services":
      return userType === "uso";
    case "/brands":
      // UCR can view the gallery and individual brand pages; USO manages their own brands
      return userType === "uso" || userType === "ucr";
    case "/home":
      return userType === "uso" || userType === "ucr";
    case "/dashboard":
      return userType === "uso" || userType === "admin";
    case "/rezervations":
    case "/favorites":
      return userType === "ucr";
    case "/moderation":
      return userType === "admin";
    default:
      return false;
  }
}

export function getProtectedRouteLabel(
  messages: Messages,
  pathname: ProtectedAppPath,
) {
  const labels: Record<ProtectedAppPath, string> = {
    "/home": messages.dashboard.home,
    "/search": messages.dashboard.search,
    "/dashboard": messages.dashboard.dashboardPage,
    "/services": messages.dashboard.services,
    "/brands": messages.dashboard.brands,
    "/settings": messages.dashboard.settings,
    "/account": messages.dashboard.account,
    "/notification": messages.dashboard.notifications,
    "/rezervations": messages.dashboard.reservations,
    "/favorites": messages.dashboard.favorites,
    "/moderation": messages.dashboard.moderation,
  };

  return labels[pathname];
}

export function getSidebarRoutesForUserType(
  messages: Messages,
  userType: UserType,
) {
  const labels: Record<SidebarRouteLabelKey, string> = {
    home: messages.dashboard.home,
    search: messages.dashboard.search,
    dashboardPage: messages.dashboard.dashboardPage,
    services: messages.dashboard.services,
    brands: messages.dashboard.brands,
    settings: messages.dashboard.settings,
    reservations: messages.dashboard.reservations,
    favorites: messages.dashboard.favorites,
    moderation: messages.dashboard.moderation,
  };

  return [...roleSidebarItems[userType], ...commonSidebarItems].map((item) => ({
    ...item,
    label: labels[item.labelKey],
  }));
}
