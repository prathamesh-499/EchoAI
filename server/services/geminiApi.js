import { GoogleGenAI } from "@google/genai";
import { Conversation } from "../models/conversation.js"
import { ApiError } from "../util/ApiError.js"
import { asyncWrapper } from "../middleware/asyncWrapper.js"
import { User } from "../models/user.js";
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

export const geminiAi = asyncWrapper(async (req, res, next) => {
    const { conversationId, prompt } = req.body;
    let conversation = null;
    if (conversationId) {
        conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return next(new ApiError(404, "Conversation not found"));
        }
        conversation.chats.push({ message: prompt, sender: "user" });

    } else {
        const title = await geminiAiTitle(prompt);
        conversation = new Conversation({
            title: title,
            chats: [{
                message: prompt,
                sender: "user"
            }]
        });
    }

    const chat = ai.chats.create({
        model: "gemini-3.1-flash-lite",
        history: [
            {
                role: "user",
                parts: [{ text: "hi" }]
            }],
    });
    const stream1 = await chat.sendMessageStream({
        message: prompt,
    });
    let pretext = "";
    for await (const chunk of stream1) {
        pretext += chunk.text;
        const message=chunk.text;
        res.write(`data:${JSON.stringify({message})}\n\n`);
    }

    conversation.chats.push({ message: pretext, sender: "ai" });
    await conversation.save();

    if(!conversationId){
        const user =await User.findByIdAndUpdate(req.user._id,{$push:{conversation:conversation._id}});
        res.write(`data: ${JSON.stringify({ conversationId: conversation._id })}\n\n`);
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