import type { ReactNode } from "react";
import type { ContentVariant } from "./dashboard-shell";
import { DashboardShell } from "./dashboard-shell";

type DashboardLayoutTemplateProps = {
  children: ReactNode;
  contentVariant?: ContentVariant;
};

export function DashboardLayoutTemplate({ children, contentVariant }: DashboardLayoutTemplateProps) {
  return <DashboardShell contentVariant={contentVariant}>{children}</DashboardShell>;
}
