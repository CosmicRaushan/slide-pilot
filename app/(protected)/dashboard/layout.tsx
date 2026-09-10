import { requireAuth } from "@/src/auth/actions";


export default async function DashboardLayout(
    {children}: {children: React.ReactNode}
) {
    await requireAuth();
    return <>
        {children}
    </>
}