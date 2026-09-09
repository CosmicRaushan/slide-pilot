import { GoogleGenAI } from "@google/genai"

const IMAGE_MODEL = "gemini-3.1-flash-image";
const IMAGE_SIZE = "1024x1024";


let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
    const apikey = process.env.GEMINI_API_KEY;

    if (!apikey) {
        throw new Error("Missing GEMINI_API_KEY in .env")
    };

    if (!geminiClient) {
        geminiClient = new GoogleGenAI({ apiKey: apikey })
    };

    return geminiClient;
};

async function fetchPlaceholderImage(): Promise<Buffer> {
    const response = await fetch("https://picsum.photos/1024/1024");

    if (!response.ok) {
        throw new Error("could not placeholder image")
    }

    const bytes = await response.arrayBuffer();
    return Buffer.from(bytes)
};

export async function createImagesWithGemini(prompt: string): Promise<Buffer> {
    const ai = getGeminiClient();

    const response = await ai.interactions.create({
        model: IMAGE_MODEL,
        input: prompt,
    });

    const generatedImage = response.output_image;

    if (!generatedImage?.data) {
        throw new Error("Gemini returned no image")
    }

    return Buffer.from(generatedImage.data, "base64")
};

export async function generateSlideImages(prompt: string): Promise<Buffer> {
    if (process.env.USE_PLACEHOLDER_IMAGES === "true") {
        return fetchPlaceholderImage()
    };
    return createImagesWithGemini(prompt);
}