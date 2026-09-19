import { NextResponse } from "next/server";

import prisma from "@/src/lib/db";
import { getServerSession } from "@/src/auth/actions";

type RouteParams = {
    params: Promise<{id: string}>
}

export async function GET(_request: Request, { params }: RouteParams) {
    const { id } = await params;
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            {status: 401}
        )
    }

    const deck = await prisma.deck.findFirst({
        where: {
            id,
            userId: session?.user.id
        },
        include: {
            slides: {
                orderBy: {
                    order: "asc"
                }
            }
        }
    })

    if (!deck) {
        return NextResponse.json(
            { error: "Not found" },
            {status: 404}
        )
    }
    return NextResponse.json(deck)
}