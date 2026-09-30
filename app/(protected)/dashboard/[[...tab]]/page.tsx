import type { NavId } from "@/src/types/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { getServerSession } from "@/src/auth/actions";

type PageProps = {
  params: Promise<{
    tab?: string[];
  }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const session = await getServerSession();
  const { tab } = await params;

  const currentTab = tab?.[0];

  const initialTab: NavId =
    currentTab === "wallet" || currentTab === "ideas" ? currentTab : "new-chat";

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0b0b] text-zinc-100">
      <DashboardHeader
        user={
          session?.user
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }
            : undefined
        }
      />

      <div className="pt-[5.75rem]">
        <DashboardWorkspace
          userName={session?.user?.name ?? "there"}
          initialTab={initialTab}
        />
      </div>
    </div>
  );
}
