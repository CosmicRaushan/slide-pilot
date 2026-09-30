import { NextResponse } from "next/server";
import { getServerSession } from "@/src/auth/actions";
import prisma from "@/src/lib/db";

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

    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        deckId: true,
        deck: {
          select: {
            title: true,
            idea: true,
          }
        },
        type: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      credits: user?.credits ?? 0,
      transactions: transactions.map((t) => ({
        id: t.id,
        deckId: t.deckId,
        deck: t.deck?.title,
        date: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(t.createdAt)),
        createdAt: t.createdAt.toISOString(),
        type: t.type,
        amount: t.amount,
        status: t.status,
      })),
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}
