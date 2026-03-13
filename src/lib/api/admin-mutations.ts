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

async function runRemoteMutation(
  path: string,
  body: unknown,
  session: AdminSession | null,
  successMessage: string,
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
    { reason: input.reason },
    session,
    `Report ${input.reportId} marked for ${input.action}.`,
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
    { reason: input.reason },
    session,
    `User ${input.userId} action ${input.action} accepted.`,
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

  return runRemoteMutation(
    adminEndpointTemplates.visibilityLabels,
    input,
    session,
    `Visibility label ${input.label} scheduled for ${input.targetId}.`,
  );
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
  );
}
