import type { AdminSession } from "@/lib/auth/admin-auth";
import { adminEndpointTemplates } from "@/lib/config/admin-endpoints";
import { publicEnv } from "@/lib/config/env";

const DEFAULT_PROBE_TIMEOUT_MS = 2500;

export type AdminBackendProbeStatus =
  | "ready"
  | "unauthorized"
  | "missing"
  | "failing"
  | "skipped";

export type AdminBackendProbe = {
  label: string;
  path: string;
  status: AdminBackendProbeStatus;
  detail: string;
};

export type AdminBackendReadiness = {
  checkedAt: string;
  probes: AdminBackendProbe[];
  counts: Record<AdminBackendProbeStatus, number>;
};

type ProbeDefinition = {
  label: string;
  path: string;
};

const probeDefinitions: ProbeDefinition[] = [
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
];

function createCounts() {
  return {
    ready: 0,
    unauthorized: 0,
    missing: 0,
    failing: 0,
    skipped: 0,
  } satisfies Record<AdminBackendProbeStatus, number>;
}

function buildHeaders(session: AdminSession | null) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
}

async function probeEndpoint(
  definition: ProbeDefinition,
  session: AdminSession | null,
): Promise<AdminBackendProbe> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_API_BASE_URL}${definition.path}`,
      {
        method: "GET",
        cache: "no-store",
        headers: buildHeaders(session),
        signal: controller.signal,
      },
    );

    if (response.ok) {
      return {
        label: definition.label,
        path: definition.path,
        status: "ready",
        detail: `Responded with ${response.status}.`,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        label: definition.label,
        path: definition.path,
        status: "unauthorized",
        detail: `Responded with ${response.status}. The route exists, but the current session cannot access it.`,
      };
    }

    if ([404, 405, 501].includes(response.status)) {
      return {
        label: definition.label,
        path: definition.path,
        status: "missing",
        detail: `Responded with ${response.status}. The configured backend route is not available.`,
      };
    }

    return {
      label: definition.label,
      path: definition.path,
      status: "failing",
      detail: `Responded with ${response.status}. The backend route is reachable but not healthy.`,
    };
  } catch (error) {
    const detail =
      error instanceof DOMException && error.name === "AbortError"
        ? `Timed out after ${DEFAULT_PROBE_TIMEOUT_MS}ms.`
        : "The backend route could not be reached from the web app.";

    return {
      label: definition.label,
      path: definition.path,
      status: "failing",
      detail,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getAdminBackendReadiness(
  session: AdminSession | null,
): Promise<AdminBackendReadiness> {
  if (publicEnv.NEXT_PUBLIC_USE_MOCK_DATA) {
    const probes = probeDefinitions.map((definition) => ({
      label: definition.label,
      path: definition.path,
      status: "skipped" as const,
      detail: "Remote endpoint probes are skipped while local mock data is active.",
    }));
    const counts = createCounts();
    counts.skipped = probes.length;

    return {
      checkedAt: new Date().toISOString(),
      probes,
      counts,
    };
  }

  const probes = await Promise.all(
    probeDefinitions.map((definition) => probeEndpoint(definition, session)),
  );
  const counts = createCounts();

  probes.forEach((probe) => {
    counts[probe.status] += 1;
  });

  return {
    checkedAt: new Date().toISOString(),
    probes,
    counts,
  };
}
