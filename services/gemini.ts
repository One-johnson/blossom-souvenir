
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { Souvenir } from "../types";

export const getGiftRecommendations = async (occasion: string, recipient: string, budget: number, souvenirs: Souvenir[], theme: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const souvenirData = souvenirs
    .filter(s => s.status !== 'OUT_OF_STOCK')
    .map(s => `ID: ${s._id} | Name: "${s.name}" | Price: GH₵${s.price} | Category: ${s.category} | Description: ${s.description}`)
    .join('\n');

  const systemInstruction = `You are an expert personal shopper for Blossom Souvenir, an elegant boutique. 
  Your goal is to suggest perfect gifts based on occasion, recipient, budget (in Ghana Cedis - GH₵), and style preferences.
  
  IMPORTANT: Only suggest items from the "Available Souvenirs" list provided below. 
  Use the EXACT "Name" of the souvenir in your JSON response so the application can find the matching product.`;

  const prompt = `
  Customer Request:
  - Occasion: ${occasion}
  - Recipient: ${recipient}
  - Max Budget: GH₵${budget}
  - Preferred Styles/Themes: ${theme || 'Any style'}

  Available Souvenirs:
  ${souvenirData}
  
  Based on these details, pick the top 2-3 most appropriate gifts. 
  Focus on matching the "${theme}" style specifically if mentioned.
  Explain why each item is a thoughtful choice for this ${occasion}.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                souvenirName: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["souvenirName", "reason"]
            }
          }
        },
        required: ["suggestions"]
      }
    },
  });

  const jsonStr = response.text || '{"suggestions": []}';
  try {
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { suggestions: [] };
  }
};

export const generateSouvenirImage = async (name: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A professional, high-quality product photography of a premium souvenir called "${name}". Description: ${description}. The aesthetic should be elegant, clean, and high-end.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: prompt }] }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error("No image was generated");
};

/**
 * Generates an audio narration of the product description using Gemini TTS.
 */
export const speakProductStory = async (name: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Narrate this artisan story elegantly for a boutique shop: "Meet the ${name}. ${description}"`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};
