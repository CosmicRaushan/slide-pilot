import { BillingPageContent } from "@/components/dashboard/billing/billing-page-content";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { requireAuth } from "@/src/auth/actions";

export default async function BillingPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-[#0f0b0b] text-zinc-100">
      <DashboardHeader
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <BillingPageContent />
    </div>
  );
}
