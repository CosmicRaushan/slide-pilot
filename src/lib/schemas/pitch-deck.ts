import { z } from "zod";

export const slideSchema = z.object({
    title: z.string().min(4).max(90),
    content: z.string().min(20).max(300),
    imagePrompt: z.string().min(10).max(300)
});

export const pitchDeckSchema = z.object({
    deckTitle: z.string().min(5).max(100),
    slides: z.array(slideSchema).min(5).max(8),
});

export type Slide = z.infer<typeof slideSchema>;
export type pitchDeck = z.infer<typeof pitchDeckSchema>;
