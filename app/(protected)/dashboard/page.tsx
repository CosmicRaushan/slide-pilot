import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { getServerSession } from "@/src/auth/actions";

export default async function DashboardPage() {
  const session = await getServerSession();

  return (
    <div
      className="
        flex min-h-screen flex-col
        bg-[#0f0b0b]
        text-zinc-100
        font-sans
        [background-image:
          linear-gradient(rgba(219, 161, 25, 0.98)_1px,transparent_1px),
          linear-gradient(90deg,rgba(255, 179, 0, 0.99)_1px,transparent_1px),
          radial-gradient(square_at_20%_20%,rgb(230, 24, 24),transparent_40%),
          radial-gradient(square_at_80%_70%,rgb(254, 201, 11),transparent_45%),
          linear-gradient(135deg,rgb(255, 80, 80),transparent_40%)
        ]
        [background-size:60px_60px,60px_60px,100%_100%,100%_100%,100%_100%]
      "
    >
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
        <DashboardWorkspace userName={session?.user?.name ?? "there"} />
      </div>
    </div>
  );
}
