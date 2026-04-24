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

export type DashboardBreadcrumb = {
  label: string;
  href?: string;
  icon?: string;
  current?: boolean;
};

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

const protectedPathIcons: Record<ProtectedAppPath, string> = {
  "/home": "home",
  "/search": "search",
  "/dashboard": "dashboard",
  "/services": "room_service",
  "/brands": "sell",
  "/settings": "settings",
  "/account": "account_circle",
  "/notification": "notifications",
  "/rezervations": "event_available",
  "/favorites": "favorite",
  "/moderation": "gavel",
};

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
}: RouteAccessInput) {
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

export function getProtectedRouteIcon(pathname: ProtectedAppPath) {
  return protectedPathIcons[pathname];
}

type GetDashboardBreadcrumbsInput = {
  messages: Messages;
  pathname: ProtectedAppPath;
  searchParams?: URLSearchParams | null;
  currentUserId?: string | null;
};

export function getDashboardBreadcrumbs({
  messages,
  pathname,
  searchParams,
  currentUserId,
}: GetDashboardBreadcrumbsInput): DashboardBreadcrumb[] {
  const progress = searchParams?.get("progress")?.trim();
  const entityId = searchParams?.get("id")?.trim();
  const accountId = searchParams?.get("account")?.trim();
  const crumbs: DashboardBreadcrumb[] = [];

  const pushRoute = (
    href: ProtectedAppPath,
    options?: {
      current?: boolean;
      hrefOverride?: string;
      labelOverride?: string;
      iconOverride?: string;
    },
  ) => {
    crumbs.push({
      label: options?.labelOverride ?? getProtectedRouteLabel(messages, href),
      href: options?.current ? undefined : (options?.hrefOverride ?? href),
      icon: options?.iconOverride ?? getProtectedRouteIcon(href),
      current: options?.current ?? false,
    });
  };

  switch (pathname) {
    case "/brands": {
      if (accountId && accountId !== currentUserId && !progress && !entityId) {
        pushRoute("/account", {
          hrefOverride: `/account?id=${accountId}`,
          labelOverride: messages.dashboard.profile,
        });
        crumbs.push({
          label: messages.profile.brandsSectionTitle,
          icon: getProtectedRouteIcon("/brands"),
          current: true,
        });
        return crumbs;
      }

      if (progress === "create") {
        pushRoute("/brands");
        crumbs.push({
          label: messages.brands.createBrand,
          icon: "add",
          current: true,
        });
        return crumbs;
      }

      if (progress === "edit" && entityId) {
        pushRoute("/brands");
        crumbs.push({
          label: messages.brands.editBrand,
          icon: "edit_square",
          current: true,
        });
        return crumbs;
      }

      if (progress === "team" && entityId) {
        pushRoute("/brands");
        crumbs.push({
          label: messages.brands.teamWorkspace,
          icon: "groups",
          current: true,
        });
        return crumbs;
      }

      if (entityId) {
        pushRoute("/brands");
        crumbs.push({
          label: messages.brands.detailTitle,
          icon: "sell",
          current: true,
        });
        return crumbs;
      }

      pushRoute("/brands", { current: true });
      return crumbs;
    }

    case "/account": {
      if (entityId && entityId !== currentUserId) {
        crumbs.push({
          label: messages.dashboard.profile,
          icon: getProtectedRouteIcon("/account"),
          current: true,
        });
        return crumbs;
      }

      pushRoute("/account", { current: true });
      return crumbs;
    }

    default: {
      pushRoute(pathname, { current: true });
      return crumbs;
    }
  }
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
