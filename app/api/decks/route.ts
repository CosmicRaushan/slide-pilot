import { NextResponse } from "next/server";
import { getServerSession } from "@/src/auth/actions";
import prisma from "@/src/lib/db";
import { inngest } from "@/src/lib/inngest/client";

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

    const deck = await prisma.deck.create({
        data: {
            idea: trimmed,
            userId: session.user.id, 
            updatedAt: new Date(),
        },
    });

    await inngest.send({
        name: "deck/generate",
        data: { deckId: deck.id },
    });

    return NextResponse.json({ id: deck.id }, { status: 201 });
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