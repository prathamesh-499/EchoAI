import { GoogleGenAI } from "@google/genai";
import { Conversation } from "../models/conversation.js"
import { ApiError } from "../util/ApiError.js"
import { asyncWrapper } from "../middleware/asyncWrapper.js"
import { User } from "../models/user.js";
import { geminiAiTitle } from "./geminiApiGetTitle.js";
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

export const geminiAi = asyncWrapper(async (req, res, next) => {

    let clientDisconnected = false,isNewChat=false,titleTotalTokenCount=0;
    const abortController = new AbortController();
    res.on("close", () => {
        abortController.abort();
        clientDisconnected = true;
    });
    const { conversationId, prompt } = req.body;
    const userId = req.user._id;
    let conversation = null;
    if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, owner: userId });
        if (!conversation) {
            return next(new ApiError(404, "Conversation not found"));
        }

    } else {
        if (clientDisconnected) return;
        isNewChat=true;
        const [title,tokenCount] = await geminiAiTitle(prompt);
        titleTotalTokenCount=tokenCount;
        conversation = new Conversation({
            title: title,
            chats: [],
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
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const stream1 = await chat.sendMessageStream({
        message: prompt,
        config: {
            abortSignal: abortController.signal,
            maxOutputTokens: 40_000
        }
    });
    let pretext = "",tokenSpend=0;
    try {
        for await (const chunk of stream1) {
            if (clientDisconnected) break;
            tokenSpend=chunk?.usageMetadata?.totalTokenCount;
            pretext += chunk.text;
            const message = chunk.text;
            res.write(`data:${JSON.stringify({ message })}\n\n`);
        }
    } catch (error) {
        if (error.name !== "AbortError") throw error;
    }
    if (pretext !== "") {
        conversation.chats.push({ message: prompt, sender: "user" });
        conversation.chats.push({ message: pretext, sender: "ai" });
        await conversation.save();
        if (!conversationId) {
            const user = await User.findByIdAndUpdate(req.user._id, { $push: { conversation: conversation._id } });
            if (!clientDisconnected) res.write(`data:${JSON.stringify({ conversationId: conversation._id, title: conversation.title })}\n\n`);
        }
    }
    if(tokenSpend===undefined)tokenSpend=0;
    req.tokenSpend=tokenSpend+titleTotalTokenCount;
    console.log("Token cost",req.tokenSpend);
    req.isNewChat=isNewChat;
    res.end();
    next();

});

