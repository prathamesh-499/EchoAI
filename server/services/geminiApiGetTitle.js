import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
export const geminiAiTitle = async (prompt,req) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Give title for this conversation just title say nothing else and try to keep it small"${prompt}"`,
    });
    return [response.text,response?.usageMetadata?.totalTokenCount];
}