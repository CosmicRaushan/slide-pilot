import { NextResponse } from "next/server";
import { getServerSession } from "@/src/auth/actions";
import { CREDIT_PACKAGES } from "@/src/config/credit-package";
import prisma from "@/src/lib/db";
import { getPurchaseHistory } from "@/src/services/purchase.service";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        credits: true,
      },
    });

    const purchases = await getPurchaseHistory(session.user.id);
    const packages = Object.values(CREDIT_PACKAGES);

    return NextResponse.json({
      credits: user?.credits ?? 0,
      purchases: purchases.map((purchase) => {
        const creditPackage =
          packages.find(
            (candidate) => candidate.id === purchase.packageId,
          ) ??
          packages.find(
            (candidate) => candidate.credits === purchase.credits,
          );

        return {
          id: purchase.id,
          plan: creditPackage?.name ?? `${purchase.credits} credits`,
          credits: purchase.credits,
          amountPaise: purchase.amount,
          paymentMethod: purchase.paymentMethod,
          status: purchase.status,
          createdAt: purchase.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}
