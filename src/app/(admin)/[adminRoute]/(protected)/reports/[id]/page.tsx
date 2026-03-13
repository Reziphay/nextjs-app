import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ReportDetail } from "@/features/admin-reports/report-detail";
import { getReportAdminDetail } from "@/lib/api/admin";

type ReportDetailPageProps = {
  params: Promise<{
    adminRoute: string;
    id: string;
  }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { adminRoute, id } = await params;
  const detail = await getReportAdminDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="Report detail"
        description="Inspect the target, evidence, and moderation context before taking action."
      />
      <ReportDetail adminRoute={adminRoute} detail={detail} />
    </>
  );
}
