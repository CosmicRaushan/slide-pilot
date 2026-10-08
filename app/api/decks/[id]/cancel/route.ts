import { NextResponse } from "next/server";

import {
  CreditTransactionStatus,
  CreditTransactionType,
  DeckStatus,
} from "@/app/generated/prisma/enums";
import { getServerSession } from "@/src/auth/actions";
import prisma from "@/src/lib/db";
import { inngest } from "@/src/lib/inngest/client";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: deckId } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const deck = await tx.deck.findFirst({
        where: { id: deckId, userId: session.user.id },
        select: { id: true, status: true },
      });

      if (!deck) {
        return { outcome: "not-found" as const };
      }

      const updated = await tx.deck.updateMany({
        where: {
          id: deckId,
          userId: session.user.id,
          status: {
            in: [DeckStatus.PENDING, DeckStatus.GENERATING],
          },
        },
        data: {
          status: DeckStatus.FAILED,
          errorMessage: "Generation stopped by user.",
        },
      });

      if (updated.count === 0) {
        return { outcome: "not-generating" as const };
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: 1 } },
      });

      await tx.creditTransaction.create({
        data: {
          userId: session.user.id,
          deckId,
          amount: 1,
          type: CreditTransactionType.REFUND,
          status: CreditTransactionStatus.SUCCESS,
        },
      });

      return { outcome: "cancelled" as const };
    });

    if (result.outcome === "not-found") {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }
    if (result.outcome === "not-generating") {
      return NextResponse.json(
        { error: "This deck is no longer generating." },
        { status: 409 },
      );
    }

    await inngest.send({
      name: "deck/cancel",
      data: { deckId },
    });

    return NextResponse.json({
      status: DeckStatus.FAILED,
      errorMessage: "Generation stopped by user.",
    });
  } catch (error) {
    console.error("Error stopping deck generation:", error);
    return NextResponse.json(
      { error: "Could not stop deck generation." },
      { status: 500 },
    );
  }
}
