import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UserDetailState } from "@/features/admin-users/user-detail";
import { getUserAdminDetail } from "@/lib/api/admin";

type UserDetailPageProps = {
  params: Promise<{
    adminRoute: string;
    id: string;
  }>;
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { adminRoute, id } = await params;
  const detail = await getUserAdminDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="User detail"
        description="Review role state, penalties, and linked business context before acting."
      />
      <UserDetailState state="ready" adminRoute={adminRoute} detail={detail} />
    </>
  );
}
