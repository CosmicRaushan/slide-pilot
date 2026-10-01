import { NextResponse } from "next/server";
import { getServerSession } from "@/src/auth/actions";
import prisma from "@/src/lib/db";
import { inngest } from "@/src/lib/inngest/client";
import { DeckStatus } from "@/app/generated/prisma/enums";
import { consumeCredits, refundCredits } from "@/src/services/credit.service";

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const idea =
        typeof body === "object" && body !== null && "idea" in body
            ? body.idea
            : undefined;
    const trimmed = typeof idea === "string" ? idea.trim() : "";
    if (trimmed.length < 20) {
        return NextResponse.json(
            { error: "Idea must be at least 20 characters" },
            { status: 400 },
        );
    }

    let deckId: string | undefined;
    let creditsConsumed = false;

    try {
        const deck = await prisma.deck.create({
            data: {
                idea: trimmed,
                userId: session.user.id,
            },
        });
        deckId = deck.id;
    
        await consumeCredits({
            userId: session.user.id,
            deckId: deck.id,
            amount: 1,
        });
        creditsConsumed = true;
    
        await inngest.send({
            name: "deck/generate",
            data: { deckId: deck.id },
        });
    
        return NextResponse.json({ id: deck.id }, { status: 201 });
    } catch (error) {
        console.error("Error creating deck:", error);

        if (deckId) {
            const errorMessage = error instanceof Error ? error.message : "Failed to queue deck generation";

            try {
                await prisma.deck.update({
                    where: { id: deckId },
                    data: {
                        status: DeckStatus.FAILED,
                        errorMessage,
                    },
                });

            } catch (cleanupError) {
                console.error("Error marking deck creation failed:", cleanupError);
            }

            if (creditsConsumed) {
                try {
                    await refundCredits({
                        userId: session.user.id,
                        deckId,
                        amount: 1,
                    });
                } catch (cleanupError) {
                    console.error("Error refunding failed deck creation:", cleanupError);
                }
            }
        }

        return NextResponse.json(
            { error: "Failed to create deck" },
            { status: 500 },
        );
    }
}

export async function GET() {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decks = await prisma.deck.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { slides: true } } },
    });

    return NextResponse.json(
        decks.map((deck) => ({
            id: deck.id,
            idea: deck.idea,
            title: deck.title,
            status: deck.status,
            errorMessage: deck.errorMessage,
            slideCount: deck._count.slides,
            createdAt: deck.createdAt.toISOString(),
            updatedAt: deck.updatedAt.toISOString(),
        })),
    );
}