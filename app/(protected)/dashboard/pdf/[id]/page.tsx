import { notFound } from "next/navigation";

import { PdfPreview } from "@/components/dashboard/pdf-preview";
import prisma from "@/src/lib/db";
import { requireAuth } from "@/src/auth/actions";
import type { DeckDetail } from "@/src/types/deck";

type PdfPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DeckPdfPage({ params }: PdfPageProps) {
  const { id } = await params;
  const session = await requireAuth();

  const deck = await prisma.deck.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      slides: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!deck) {
    notFound();
  }

  const payload: DeckDetail = {
    id: deck.id,
    userId: deck.userId,
    idea: deck.idea,
    title: deck.title,
    status: deck.status,
    errorMessage: deck.errorMessage,
    slides: deck.slides.map((slide) => ({
      id: slide.id,
      order: slide.order,
      title: slide.title,
      content: slide.content,
      imagePrompt: slide.imagePrompt,
      imageUrl: slide.imageUrl,
    })),
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };

  return <PdfPreview deck={payload} />;
}
