import { Inngest } from "inngest";


export type InngestEvent = {
    "deck/generate": {
        data: {
            deckId: string
        };
    };
};

export const inngest = new Inngest({
    id: "ai-pitch-deck",
})