import type { ReactNode } from "react";
import { DashboardShell } from "./dashboard-shell";

type DashboardLayoutTemplateProps = {
  children: ReactNode;
};

export function DashboardLayoutTemplate({ children }: DashboardLayoutTemplateProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
