import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";
dotenv.config();
export const askAI = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "GEMINI_API_KEY is not configured on the server." });
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemInstruction = `You are Ask HRMS AI, a helpful AI Assistant integrated into an HRMS and Payroll Dashboard. You are assisting a user with the role of ${req.user.role}. Answer their questions concisely, professionally, and helpfully. Keep your responses short as they will be displayed in a small chat window. Do not use complex markdown that requires a full markdown renderer, but basic line breaks and simple lists are fine.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.7,
            }
        });
        res.status(200).json({ success: true, response: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: "AI Assistant failed to respond", error: error.message });
    }
};