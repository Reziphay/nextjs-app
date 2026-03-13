import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ServiceDetail } from "@/features/admin-services/service-detail";
import { getServiceAdminDetail } from "@/lib/api/admin";

type ServiceDetailPageProps = {
  params: Promise<{
    adminRoute: string;
    id: string;
  }>;
};

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { adminRoute, id } = await params;
  const detail = await getServiceAdminDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="Service detail"
        description="Review provider context, labels, and request health before intervening."
      />
      <ServiceDetail adminRoute={adminRoute} detail={detail} />
    </>
  );
}
