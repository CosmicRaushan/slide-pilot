import {
    run,
    InputGuardrailTripwireTriggered,
    OutputGuardrailTripwireTriggered
} from "@openai/agents";

import { pitchDeckAgent } from "./pitch-deck-agent";

import { pitchDeckSchema, type pitchDeck } from "../schemas/pitch-deck";

export class pitchDeckGenerationError extends Error {
    readonly reason?: string
    constructor(message: string, reason?: string) {
        super(message)
        this.name = "PitchDeckGenerationError",
        this.reason = reason
    }
};

function isGuradrailError(error: unknown): boolean {
    return (
        error instanceof InputGuardrailTripwireTriggered ||
        error instanceof OutputGuardrailTripwireTriggered
    );
};

function getGuardrailReson(error: unknown): string{
    if (
        error instanceof InputGuardrailTripwireTriggered ||
        error instanceof OutputGuardrailTripwireTriggered
    ) {
        const info = error.result.output.outputInfo as { reason?: string } | undefined;
        return info?.reason ?? "Pitch deck generation was blocked by guardrail"
    } 
    return "Pitch deck generation was blocked by guardrail"
};


function parseAgentOutput(rawOutput: unknown): pitchDeck{
    return pitchDeckSchema.parse(rawOutput);
};

export async function generatePitchDeckIdea(idea: string): Promise<pitchDeck>{
    const trimmedIdea = idea.trim();

    try {
        const agentResult = await run(pitchDeckAgent, trimmedIdea);

        return parseAgentOutput(agentResult.finalOutput);
    } catch (error) {
        if (isGuradrailError(error)) {
            const reason = getGuardrailReson(error);
            throw new pitchDeckGenerationError(reason, reason)
        }
        throw error;
    }
}