import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { BrandDetail } from "@/features/admin-brands/brand-detail";
import { getBrandAdminDetail } from "@/lib/api/admin";

type BrandDetailPageProps = {
  params: Promise<{
    adminRoute: string;
    id: string;
  }>;
};

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { adminRoute, id } = await params;
  const detail = await getBrandAdminDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="Brand detail"
        description="Inspect ownership, services, reports, and visibility state."
      />
      <BrandDetail adminRoute={adminRoute} detail={detail} />
    </>
  );
}
