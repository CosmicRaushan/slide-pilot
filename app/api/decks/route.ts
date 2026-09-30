import { NextResponse } from "next/server";
import { getServerSession } from "@/src/auth/actions";
import prisma from "@/src/lib/db";
import { inngest } from "@/src/lib/inngest/client";
import { consumeCredits } from "@/src/services/credit.service";

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { idea } = await request.json();
    const trimmed = typeof idea === "string" ? idea.trim() : "";
    if (trimmed.length < 20) {
        return NextResponse.json(
            { error: "Idea must be at least 20 characters" },
            { status: 400 },
        );
    }

    try {
        const deck = await prisma.deck.create({
            data: {
                idea: trimmed,
                userId: session.user.id,
            },
        });
    
        await consumeCredits({
            userId: session.user.id,
            deckId: deck.id,
            amount: 1,
        });
    
        await inngest.send({
            name: "deck/generate",
            data: { deckId: deck.id },
        });
    
        return NextResponse.json({ id: deck.id }, { status: 201 });
    } catch (error) {
        console.error("Error creating deck:", error);
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