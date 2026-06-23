import { GoogleGenAI } from "@google/genai";
import { Conversation } from "../models/conversation.js"
import { ApiError } from "../util/ApiError.js"
import { asyncWrapper } from "../middleware/asyncWrapper.js"
import { User } from "../models/user.js";
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

export const geminiAi = asyncWrapper(async (req, res, next) => {
    const { conversationId, prompt } = req.body;
    const userId = req.user._id;
    let conversation = null;
    if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, owner: userId });
        if (!conversation) {
            return next(new ApiError(404, "Conversation not found"));
        }

    } else {
        const title = await geminiAiTitle(prompt);
        conversation = new Conversation({
            title: title,
            chats: [] ,
            owner: req.user._id
        });
    }

    const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite",
        history:
            conversation.chats.map((chat) => {
                return {
                    role: chat.sender === "ai" ? "model" : "user",
                    parts: [{ text: chat.message }]
                }
            }),
    });
    const stream1 = await chat.sendMessageStream({
        message: prompt,
    });
    let pretext = "";
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    for await (const chunk of stream1) {
        pretext += chunk.text;
        const message = chunk.text;
        res.write(`data:${JSON.stringify({ message })}\n\n`);
    }
    conversation.chats.push({ message: prompt, sender: "user" });
    conversation.chats.push({ message: pretext, sender: "ai" });
    await conversation.save();

    if (!conversationId) {
        const user = await User.findByIdAndUpdate(req.user._id, { $push: { conversation: conversation._id } });
        res.write(`data: ${JSON.stringify({ conversationId: conversation._id, title: conversation.title })}\n\n`);
    }

    res.end();
});

export const geminiAiTitle = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Give title for this conversation just title say nothing else and try to keep it small"${prompt}"`,
    });
    return response.text;
}