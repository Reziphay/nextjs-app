import { notFound } from "next/navigation";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UserDetailState } from "@/features/admin-users/user-detail";
import { getUserById } from "@/lib/api/admin";

type UserDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <>
      <AdminTopbar
        title="User detail"
        description="Review role state, penalties, and linked business context before acting."
      />
      <UserDetailState state="ready" user={user} />
    </>
  );
}
