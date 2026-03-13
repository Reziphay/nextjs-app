import { publicEnv } from "@/lib/config/env";
import type { AdminSession } from "@/lib/auth/admin-auth";
import { fetchJson, ApiError } from "@/lib/api/http";
import {
  adminEndpointTemplates,
  compileAdminEndpoint,
} from "@/lib/config/admin-endpoints";
import type {
  ReportActionRequestInput,
  UserActionRequestInput,
} from "@/lib/validation/admin-actions";
import type { SponsorshipInput } from "@/lib/validation/sponsorship";
import type { VisibilityLabelInput } from "@/lib/validation/visibility";

type MutationResult =
  | { ok: true; message: string }
  | { ok: false; status: number; error: string };

type RemoteVisibilityLabelPayload = {
  id?: string;
  name?: string;
  slug?: string;
  visibilityLabel?: {
    id?: string;
    name?: string;
    slug?: string;
  };
};

function shouldUseMockData() {
  return publicEnv.NEXT_PUBLIC_USE_MOCK_DATA;
}

function buildAdminHeaders(session: AdminSession | null) {
  const headers: Record<string, string> = {};

  if (!session?.accessToken) {
    return headers;
  }

  headers.Authorization = `Bearer ${session.accessToken}`;

  return headers;
}

function slugifyLabel(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeVisibilityTargetType(
  targetType?: VisibilityLabelInput["targetType"],
) {
  return (targetType ?? "brand").toUpperCase();
}

function readLabelId(payload?: RemoteVisibilityLabelPayload | null) {
  return payload?.visibilityLabel?.id ?? payload?.id ?? null;
}

function readCollectionItems(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  for (const key of ["items", ...keys]) {
    const value = (payload as Record<string, unknown>)[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

async function runRemoteMutation(
  path: string,
  body: unknown,
  session: AdminSession | null,
  successMessage: string,
  unsupportedMessage: string,
): Promise<MutationResult> {
  if (!session?.accessToken) {
    return {
      ok: false,
      status: 401,
      error: "Remote admin mutation requires an authenticated access token.",
    };
  }

  try {
    await fetchJson<unknown>(`${publicEnv.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAdminHeaders(session),
      },
      body: JSON.stringify(body),
    });

    return {
      ok: true,
      message: successMessage,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        status: error.status,
        error:
          error.status === 401
            ? "The admin session is no longer authorized for this action."
            : [404, 405, 501].includes(error.status)
              ? unsupportedMessage
            : "The admin mutation request failed.",
      };
    }

    return {
      ok: false,
      status: 500,
      error: "The admin mutation request failed.",
    };
  }
}

export async function submitReportAction(
  input: ReportActionRequestInput,
  session: AdminSession | null,
): Promise<MutationResult> {
  if (shouldUseMockData()) {
    return {
      ok: true,
      message: `Report ${input.reportId} marked for ${input.action}.`,
    };
  }

  return runRemoteMutation(
    compileAdminEndpoint(adminEndpointTemplates.reportAction, {
      id: input.reportId,
      action: input.action,
    }),
    {
      status: input.action === "dismiss" ? "DISMISSED" : "RESOLVED",
      note: input.reason,
    },
    session,
    `Report ${input.reportId} marked for ${input.action}.`,
    "The current backend does not expose report moderation at the configured route.",
  );
}

export async function submitUserAction(
  input: UserActionRequestInput,
  session: AdminSession | null,
): Promise<MutationResult> {
  if (shouldUseMockData()) {
    return {
      ok: true,
      message: `User ${input.userId} action ${input.action} accepted.`,
    };
  }

  return runRemoteMutation(
    compileAdminEndpoint(adminEndpointTemplates.userAction, {
      id: input.userId,
      action: input.action,
    }),
    input.action === "suspend"
      ? { reason: input.reason, durationDays: input.durationDays }
      : { reason: input.reason },
    session,
    `User ${input.userId} action ${input.action} accepted.`,
    "The current backend does not expose user moderation at the configured route.",
  );
}

export async function createVisibilityAssignment(
  input: VisibilityLabelInput,
  session: AdminSession | null,
): Promise<MutationResult> {
  if (shouldUseMockData()) {
    return {
      ok: true,
      message: `Visibility label ${input.label} scheduled for ${input.targetId}.`,
    };
  }

  if (!session?.accessToken) {
    return {
      ok: false,
      status: 401,
      error: "Remote admin mutation requires an authenticated access token.",
    };
  }

  const targetType = normalizeVisibilityTargetType(input.targetType);
  const normalizedLabelName = input.label.trim().toLowerCase();
  const normalizedSlug = slugifyLabel(input.label);

  try {
    const existingLabels = await fetchJson<unknown>(
      `${publicEnv.NEXT_PUBLIC_API_BASE_URL}${adminEndpointTemplates.visibilityLabels}?targetType=${targetType}`,
      {
        cache: "no-store",
        headers: buildAdminHeaders(session),
      },
    );
    const matchedLabel = readCollectionItems(existingLabels, [
      "labels",
      "visibilityLabels",
    ]).find((item) => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const source = item as Record<string, unknown>;
      const name =
        typeof source.name === "string" ? source.name.toLowerCase() : null;
      const slug =
        typeof source.slug === "string" ? source.slug.toLowerCase() : null;

      return name === normalizedLabelName || slug === normalizedSlug;
    }) as RemoteVisibilityLabelPayload | undefined;

    const labelId =
      readLabelId(matchedLabel ?? {}) ??
      readLabelId(
        await fetchJson<RemoteVisibilityLabelPayload>(
          `${publicEnv.NEXT_PUBLIC_API_BASE_URL}${adminEndpointTemplates.visibilityLabels}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...buildAdminHeaders(session),
            },
            body: JSON.stringify({
              name: input.label,
              slug: normalizedSlug,
              targetType,
              description: input.note,
              isActive: true,
            }),
          },
        ),
      );

    if (!labelId) {
      return {
        ok: false,
        status: 502,
        error: "The visibility label response did not include a label ID.",
      };
    }

    return runRemoteMutation(
      compileAdminEndpoint(adminEndpointTemplates.visibilityLabelAssign, {
        id: labelId,
      }),
      {
        targetId: input.targetId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      },
      session,
      `Visibility label ${input.label} scheduled for ${input.targetId}.`,
      "The current backend does not expose visibility-label assignment at the configured route.",
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        status: error.status,
        error:
          error.status === 401
            ? "The admin session is no longer authorized for this action."
            : [404, 405, 501].includes(error.status)
              ? "The current backend does not expose visibility-label management at the configured route."
              : "The visibility label request failed.",
      };
    }

    return {
      ok: false,
      status: 500,
      error: "The visibility label request failed.",
    };
  }
}

export async function createSponsorshipCampaign(
  input: SponsorshipInput,
  session: AdminSession | null,
): Promise<MutationResult> {
  if (shouldUseMockData()) {
    return {
      ok: true,
      message: `Sponsored campaign ${input.campaignName} created.`,
    };
  }

  return runRemoteMutation(
    adminEndpointTemplates.sponsoredVisibility,
    input,
    session,
    `Sponsored campaign ${input.campaignName} created.`,
    "The current backend does not expose sponsored visibility at the configured route.",
  );
}
