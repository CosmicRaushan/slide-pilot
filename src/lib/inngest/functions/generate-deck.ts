import { NonRetriableError } from "inngest";

import {
    generatePitchDeckIdea,
    pitchDeckGenerationError,
} from "../../agents/generate-pitch-deck-agent";
import prisma from "../../db";
import { DeckStatus } from "@/app/generated/prisma/enums";
import { uploadSlideImage } from "../../imagekit";
import { inngest } from "../client";
import { generateSlideImages } from "../../gemini";
import { refundCredits } from "@/src/services/credit.service";


export const generateDeck = inngest.createFunction(
    {
        id: "generate-deck",
        triggers: [{ event: "deck/generate" }],
        cancelOn: [
            {
                event: "deck/cancel",
                if: "async.data.deckId == event.data.deckId",
            },
        ],
    },
    async ({ event, step }) => {
        const { deckId } = event.data;

        const deck = await step.run("load-deck", async () => {
            const record = await prisma.deck.findUnique({ where: { id: deckId } });

            if (!record) {
                throw new NonRetriableError(`Deck not found: ${deckId}`);
            }

            return record;
        });

        try {
            await step.run("mark-generating", async () => {
                const result = await prisma.deck.updateMany({
                    where: { id: deckId, status: DeckStatus.PENDING },
                    data: { status: DeckStatus.GENERATING },
                });
                if (result.count === 0) {
                    throw new NonRetriableError(
                        `Deck generation is no longer pending: ${deckId}`,
                    );
                }
            });

            const pitchDeck = await step.run("run-agent", async () => {
                return generatePitchDeckIdea(deck.idea);
            });

            await step.run("save-title", async () => {
                await prisma.deck.update({
                    where: { id: deckId },
                    data: { title: pitchDeck.deckTitle },
                });
            });

            for (let index = 0; index < pitchDeck.slides.length; index++) {
                const slide = pitchDeck.slides[index];
                const order = index + 1;

                const imageUrl = await step.run(`image-${order}`, async () => {
                    const deckState = await prisma.deck.findUnique({
                        where: { id: deckId },
                        select: { status: true },
                    });
                    if (deckState?.status !== DeckStatus.GENERATING) {
                        throw new NonRetriableError(
                            `Deck generation was stopped: ${deckId}`,
                        );
                    }

                    const imageBuffer = await generateSlideImages(slide.imagePrompt);
                    const currentDeck = await prisma.deck.findUnique({
                        where: { id: deckId },
                        select: { status: true },
                    });
                    if (currentDeck?.status !== DeckStatus.GENERATING) {
                        throw new NonRetriableError(
                            `Deck generation was stopped: ${deckId}`,
                        );
                    }
                    const fileName = `deck-${deckId}-slide-${order}.png`;
                    return uploadSlideImage(imageBuffer, fileName);
                });

                await step.run(`save-slide-${order}`, async () => {
                    await prisma.$transaction(async (tx) => {
                        const deckState = await tx.deck.findUnique({
                            where: { id: deckId },
                            select: { status: true },
                        });
                        if (deckState?.status !== DeckStatus.GENERATING) {
                            throw new NonRetriableError(
                                `Deck generation was stopped: ${deckId}`,
                            );
                        }
                        await tx.slides.create({
                            data: {
                                order,
                                title: slide.title,
                                content: slide.content,
                                imagePrompt: slide.imagePrompt,
                                imageUrl,
                                createdAt: new Date(),
                                deck: {
                                    connect: { id: deckId },
                                },
                            },
                        });
                    });
                });
            }

            await step.run("mark-complete", async () => {
                const result = await prisma.deck.updateMany({
                    where: { id: deckId, status: DeckStatus.GENERATING },
                    data: { status: DeckStatus.COMPLETE },
                });
                if (result.count === 0) {
                    throw new NonRetriableError(
                        `Deck generation was stopped: ${deckId}`,
                    );
                }
            });

            return { deckId, slideCount: pitchDeck.slides.length };
        } catch (error) {
            const message =
                error instanceof pitchDeckGenerationError
                    ? error.message
                    : error instanceof Error
                        ? error.message
                        : "Unknown error during deck generation";
            const markedFailed = await step.run("mark-failed", async () => {
                const result = await prisma.deck.updateMany({
                    where: {
                        id: deckId,
                        status: {
                            in: [DeckStatus.PENDING, DeckStatus.GENERATING],
                        },
                    },
                    data: {
                        status: DeckStatus.FAILED,
                        errorMessage: message,
                    },
                });
                return result.count > 0;
            });

            // if deck generation is failed then return credit
            if (markedFailed) {
                await step.run("credit-return", async () => {
                    await refundCredits({
                        userId: deck.userId,
                        deckId: deck.id,
                        amount: 1,
                    });
                });
            }

            // Don't retry guardrail failures or missing decks — they won't succeed on retry
            if (
                error instanceof pitchDeckGenerationError ||
                error instanceof NonRetriableError
            ) {
                throw new NonRetriableError(message);
            }

            throw error;
        }
    },
);