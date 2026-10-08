import { GoogleGenAI } from "@google/genai";

const IMAGE_MODEL = "gemini-3.1-flash-image";
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

async function fetchPlaceholderImage(): Promise<Buffer> {
  const response = await fetch("https://picsum.photos/1600/900");

  if (!response.ok) {
    throw new Error(`Placeholder image request failed: ${response.status}`);
  }

  const bytes = await response.arrayBuffer();
  return Buffer.from(bytes);
}

export async function createImagesWithGemini(prompt: string): Promise<Buffer> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Cannot generate a slide image without an image prompt");
  }

  const ai = getGeminiClient();
  const response = await ai.interactions.create({
    model: IMAGE_MODEL,
    input: trimmedPrompt,
    generation_config: {
      image_config: {
        aspect_ratio: "16:9",
        image_size: "4K",
      },
    },
  });

  const generatedImage = response.output_image;

  if (!generatedImage?.data) {
    throw new Error("Gemini did not return an image for the slide prompt");
  }

  return Buffer.from(generatedImage.data, "base64");
}

export async function generateSlideImages(prompt: string): Promise<Buffer> {
  if (process.env.USE_PLACEHOLDER_IMAGES === "true") {
    return fetchPlaceholderImage();
  }
  return createImagesWithGemini(prompt);
}