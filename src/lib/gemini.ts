import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const generateModCode = async (prompt: string, modType: 'forge' | 'fabric') => {
  const result = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an expert Minecraft Java Mod Developer. 
    Task: Write a Java code snippet for a ${modType} mod.
    Requirement: ${prompt}
    
    Return ONLY the code snippet within a markdown block. Do not provide explanations.`,
  });

  return result.text;
};
