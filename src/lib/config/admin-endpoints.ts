import { serverEnv } from "@/lib/config/env";

export const adminEndpointTemplates = {
  overview: serverEnv.ADMIN_OVERVIEW_PATH,
  reports: serverEnv.ADMIN_REPORTS_PATH,
  reportDetail: serverEnv.ADMIN_REPORT_DETAIL_PATH,
  reportAction: serverEnv.ADMIN_REPORT_ACTION_PATH,
  users: serverEnv.ADMIN_USERS_PATH,
  userDetail: serverEnv.ADMIN_USER_DETAIL_PATH,
  userAdminDetail: serverEnv.ADMIN_USER_ADMIN_DETAIL_PATH,
  userAction: serverEnv.ADMIN_USER_ACTION_PATH,
  brands: serverEnv.ADMIN_BRANDS_PATH,
  brandDetail: serverEnv.ADMIN_BRAND_DETAIL_PATH,
  brandAdminDetail: serverEnv.ADMIN_BRAND_ADMIN_DETAIL_PATH,
  services: serverEnv.ADMIN_SERVICES_PATH,
  serviceDetail: serverEnv.ADMIN_SERVICE_DETAIL_PATH,
  serviceAdminDetail: serverEnv.ADMIN_SERVICE_ADMIN_DETAIL_PATH,
  analyticsOverview: serverEnv.ADMIN_ANALYTICS_OVERVIEW_PATH,
  visibilityLabels: serverEnv.ADMIN_VISIBILITY_LABELS_PATH,
  sponsoredVisibility: serverEnv.ADMIN_SPONSORED_VISIBILITY_PATH,
  activity: serverEnv.ADMIN_ACTIVITY_PATH,
} as const;

type AdminEndpointParams = Record<string, string | number>;

const PARAM_PATTERN = /:([a-zA-Z][a-zA-Z0-9_]*)/g;

export function compileAdminEndpoint(
  template: string,
  params: AdminEndpointParams = {},
) {
  return template.replace(PARAM_PATTERN, (match, key: string) => {
    const value = params[key];

    if (value === undefined) {
      throw new Error(`Missing admin endpoint parameter "${key}" for "${template}".`);
    }

    return encodeURIComponent(String(value));
  });
}
