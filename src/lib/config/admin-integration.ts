import type { AdminSession } from "@/lib/auth/admin-auth";
import { adminEndpointTemplates } from "@/lib/config/admin-endpoints";
import { publicEnv, serverEnv } from "@/lib/config/env";

export type AdminIntegrationEndpoint = {
  label: string;
  path: string;
};

export type AdminIntegrationEndpointGroup = {
  title: string;
  description: string;
  endpoints: AdminIntegrationEndpoint[];
};

export type AdminIntegrationWarning = {
  title: string;
  description: string;
  tone: "neutral" | "warning" | "danger";
};

export type AdminIntegrationSnapshot = {
  adminRoute: string;
  apiBaseUrl: string;
  authMode: "mock" | "remote";
  dataMode: "mock" | "remote";
  session: {
    authenticated: boolean;
    mode?: "mock" | "remote";
    email?: string;
    hasAccessToken: boolean;
    expiresAt?: string;
  };
  groups: AdminIntegrationEndpointGroup[];
  warnings: AdminIntegrationWarning[];
};

function buildEndpointGroups(): AdminIntegrationEndpointGroup[] {
  return [
    {
      title: "Auth contract",
      description: "Backend login and logout routes used by the hidden admin.",
      endpoints: [
        { label: "Admin login", path: serverEnv.ADMIN_AUTH_LOGIN_PATH },
        { label: "Admin logout", path: serverEnv.ADMIN_AUTH_LOGOUT_PATH },
      ],
    },
    {
      title: "Query contract",
      description: "List and overview routes used by the operational surfaces.",
      endpoints: [
        { label: "Overview", path: adminEndpointTemplates.overview },
        { label: "Reports", path: adminEndpointTemplates.reports },
        { label: "Users", path: adminEndpointTemplates.users },
        { label: "Brands", path: adminEndpointTemplates.brands },
        { label: "Services", path: adminEndpointTemplates.services },
        { label: "Analytics", path: adminEndpointTemplates.analyticsOverview },
        { label: "Visibility labels", path: adminEndpointTemplates.visibilityLabels },
        {
          label: "Sponsored visibility",
          path: adminEndpointTemplates.sponsoredVisibility,
        },
        { label: "Activity feed", path: adminEndpointTemplates.activity },
      ],
    },
    {
      title: "Detail contract",
      description: "Entity-specific routes used for moderation detail screens.",
      endpoints: [
        { label: "Report detail", path: adminEndpointTemplates.reportDetail },
        { label: "User detail", path: adminEndpointTemplates.userDetail },
        {
          label: "User admin detail",
          path: adminEndpointTemplates.userAdminDetail,
        },
        { label: "Brand detail", path: adminEndpointTemplates.brandDetail },
        {
          label: "Brand admin detail",
          path: adminEndpointTemplates.brandAdminDetail,
        },
        { label: "Service detail", path: adminEndpointTemplates.serviceDetail },
        {
          label: "Service admin detail",
          path: adminEndpointTemplates.serviceAdminDetail,
        },
      ],
    },
    {
      title: "Mutation contract",
      description: "Write endpoints triggered by operational forms and moderation actions.",
      endpoints: [
        { label: "Report action", path: adminEndpointTemplates.reportAction },
        { label: "User action", path: adminEndpointTemplates.userAction },
        { label: "Visibility assignment", path: adminEndpointTemplates.visibilityLabels },
        {
          label: "Sponsored campaign",
          path: adminEndpointTemplates.sponsoredVisibility,
        },
      ],
    },
  ];
}

function buildWarnings(session: AdminSession | null): AdminIntegrationWarning[] {
  const dataMode = publicEnv.NEXT_PUBLIC_USE_MOCK_DATA ? "mock" : "remote";
  const warnings: AdminIntegrationWarning[] = [];

  if (dataMode === "remote" && serverEnv.ADMIN_AUTH_MODE === "mock") {
    warnings.push({
      title: "Hybrid mode: remote data with mock auth",
      description:
        "Remote admin queries are enabled while login still uses local mock credentials. Protected backend reads or mutations will usually require switching auth to remote as well.",
      tone: "warning",
    });
  }

  if (dataMode === "mock" && serverEnv.ADMIN_AUTH_MODE === "remote") {
    warnings.push({
      title: "Hybrid mode: remote auth with mock data",
      description:
        "The backend is already responsible for login, but operational data still comes from local mock records. Disable mock data once backend admin endpoints are ready.",
      tone: "neutral",
    });
  }

  if (
    serverEnv.ADMIN_AUTH_MODE === "remote" &&
    (!session || session.mode !== "remote")
  ) {
    warnings.push({
      title: "Current session is not backend-issued",
      description:
        "Re-authenticate after switching to remote auth so the admin cookie stores a backend access token for protected reads and mutations.",
      tone: "warning",
    });
  }

  if (
    dataMode === "remote" &&
    serverEnv.ADMIN_AUTH_MODE === "remote" &&
    !session?.accessToken
  ) {
    warnings.push({
      title: "Remote access token is missing",
      description:
        "Server-side admin fetches can only reach open backend routes without an access token. Protected reads and write operations will fail until a remote token is present.",
      tone: "danger",
    });
  }

  if (dataMode === "mock" && serverEnv.ADMIN_AUTH_MODE === "mock") {
    warnings.push({
      title: "Local mock mode is active",
      description:
        "The admin panel currently runs on typed local mock data and mock credentials. This is safe for UI work but does not validate backend behavior.",
      tone: "neutral",
    });
  }

  return warnings;
}

export function getAdminIntegrationSnapshot(
  session: AdminSession | null,
): AdminIntegrationSnapshot {
  return {
    adminRoute: serverEnv.ADMIN_ROUTE_SEGMENT,
    apiBaseUrl: publicEnv.NEXT_PUBLIC_API_BASE_URL,
    authMode: serverEnv.ADMIN_AUTH_MODE,
    dataMode: publicEnv.NEXT_PUBLIC_USE_MOCK_DATA ? "mock" : "remote",
    session: {
      authenticated: Boolean(session),
      mode: session?.mode,
      email: session?.email,
      hasAccessToken: Boolean(session?.accessToken),
      expiresAt: session?.expiresAt,
    },
    groups: buildEndpointGroups(),
    warnings: buildWarnings(session),
  };
}
