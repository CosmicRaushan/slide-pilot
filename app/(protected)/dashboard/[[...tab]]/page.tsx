import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { requireAuth } from "@/src/auth/actions";

export default async function DashboardPage() {
  const session = await requireAuth();

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

      <div className="pt-16 md:pt-[5.75rem]">
        <DashboardWorkspace userName={session.user.name ?? "there"} />
      </div>
    </div>
  );
}
