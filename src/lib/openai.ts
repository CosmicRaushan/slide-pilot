import { OpenAI } from "openai"

const IMAGE_MODEL = "gpt-image-1-mini";
const IMAGE_SIZE = "1024x1024";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI{
    const apikey = process.env.OPENAI_API_KEY;

    if (!apikey) {
        throw new Error("OpenAI api key is missing. So go and create first")
    };

    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: apikey })
    };

    return openaiClient;
};

async function fetchPlaceholderImage(): Promise<Buffer> {
    const response = await fetch("https://picsum.photos/1024/1024");

    if (!response.ok) {
        throw new Error("could not placeholder image");
    }

    const bytes = await response.arrayBuffer();
    return Buffer.from(bytes)
};

async function createImageWithOpenAI(prompt: string): Promise<Buffer>{
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt,
        n: 1,
        size: IMAGE_SIZE
    });

    const base64Image = response.data?.[0]?.b64_json;

    if(!base64Image){
        throw new Error("Opena ai return no imgae and check your api credits")
    };

    return Buffer.from(base64Image, "base64");
};

export async function generateSlideImages(prompt: string): Promise<Buffer>{
    if (process.env.USE_PLACEHOLDER_IMAGES === "true") {
        return fetchPlaceholderImage();
    };
    return createImageWithOpenAI(prompt);
}