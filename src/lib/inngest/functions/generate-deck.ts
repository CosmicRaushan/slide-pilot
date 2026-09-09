import { NonRetriableError } from "inngest";

import {
    generatePitchDeckIdea,
    pitchDeckGenerationError,
} from "../../agents/generate-pitch-deck-agent";
import prisma from "../../db";
import { DeckStatus } from "@/app/generated/prisma/enums";
import { uploadSlideImage } from "../../imagekit";
import { inngest } from "../client";
import { generateSlideImages } from "../../openai";


export const generateDeck = inngest.createFunction(
    {
        id: "generate-deck",
        triggers: [{ event: "deck/generate" }],
    },
    async ({ event, step }) => {
        const { deckId } = event.data;

        // Step 1 — load the deck from the database
        const deck = await step.run("load-deck", async () => {
            const record = await prisma.deck.findUnique({ where: { id: deckId } });

            if (!record) {
                throw new NonRetriableError(`Deck not found: ${deckId}`);
            }

            return record;
        });

        try {
            // Step 2 — tell the UI we are generating
            await step.run("mark-generating", async () => {
                await prisma.deck.update({
                    where: { id: deckId },
                    data: { status: DeckStatus.GENERATING },
                });
            });

            // Step 3 — run the AI agent (guardrails + structured output)
            const pitchDeck = await step.run("run-agent", async () => {
                return generatePitchDeckIdea(deck.idea);
            });

            // Step 4 — save the generated title
            await step.run("save-title", async () => {
                await prisma.deck.update({
                    where: { id: deckId },
                    data: { title: pitchDeck.deckTitle },
                });
            });

            // Step 5 — for each slide: generate image → upload to ImageKit → save to DB
            for (let index = 0; index < pitchDeck.slides.length; index++) {
                const slide = pitchDeck.slides[index];
                const order = index + 1;

                const imageUrl = await step.run(`image-${order}`, async () => {
                    const imageBuffer = await generateSlideImages(slide.imagePrompt);
                    const fileName = `deck-${deckId}-slide-${order}.png`;
                    return uploadSlideImage(imageBuffer, fileName);
                });

                await step.run(`save-slide-${order}`, async () => {
                    await prisma.slides.create({
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
            }

            // Step 6 — done!
            await step.run("mark-complete", async () => {
                await prisma.deck.update({
                    where: { id: deckId },
                    data: { status: DeckStatus.COMPLETE },
                });
            });

            return { deckId, slideCount: pitchDeck.slides.length };
        } catch (error) {
            const message =
                error instanceof pitchDeckGenerationError
                    ? error.message
                    : error instanceof Error
                        ? error.message
                        : "Unknown error during deck generation";

            await step.run("mark-failed", async () => {
                await prisma.deck.update({
                    where: { id: deckId },
                    data: {
                        status: DeckStatus.FAILED,
                        errorMessage: message,
                    },
                });
            });

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