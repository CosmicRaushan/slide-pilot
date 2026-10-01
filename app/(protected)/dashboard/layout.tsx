import { DashboardSidebarStateProvider } from "@/components/dashboard/dashboard-sidebar-state";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSidebarStateProvider>{children}</DashboardSidebarStateProvider>
  );
}
