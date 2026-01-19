import { GoogleGenAI } from "@google/genai";

const fileToGenerativePart = async (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix
      resolve(base64String.split(',')[1]); 
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImage = async (input: string | Blob): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  let cleanBase64 = '';
  
  if (input instanceof Blob) {
    cleanBase64 = await fileToGenerativePart(input);
  } else {
    // Strip the data URL prefix if present (e.g., "data:image/png;base64,")
    cleanBase64 = input.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: 'Analyze this image in detail. Describe what is happening in this specific video frame.',
          },
        ],
      },
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image with Gemini AI.");
  }
};