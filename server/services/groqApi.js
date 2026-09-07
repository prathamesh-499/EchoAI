import Groq from "groq-sdk";
import { Conversation } from "../models/conversation.js";
import { ApiError } from "../util/ApiError.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../models/user.js";
import { geminiAiTitle } from "./geminiApiGetTitle.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = "openai/gpt-oss-120b";

export const groqApi = asyncWrapper(async (req, res, next) => {
    let clientDisconnected = false, isNewChat = false, titleTotalTokenCount = 0;
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
        isNewChat = true;
        const [title, tokenCount] = await geminiAiTitle(prompt);
        titleTotalTokenCount = tokenCount;
        conversation = new Conversation({
            title: title,
            chats: [],
            owner: req.user._id
        });
    }

    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        ...conversation.chats.map((chat) => ({
            role: chat.sender === "ai" ? "assistant" : "user",
            content: chat.message
        })),
        { role: "user", content: prompt }
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: 0.5,
        max_completion_tokens: 8192,
        stream: true,
        stream_options: { include_usage: true },
    }, { signal: abortController.signal });

    let pretext = "", tokenSpend = 0;
    try {
        for await (const chunk of stream) {
            if (clientDisconnected) break;
            if (chunk?.usage?.total_tokens) {
                tokenSpend = chunk.usage.total_tokens;
            }
            const message = chunk.choices[0]?.delta?.content || "";
            if (!message) continue;
            pretext += message;
            res.write(`data:${JSON.stringify({ message })}\n\n`);
        }
    } catch (error) {
        if (error.name !== "AbortError" && error.name !== "APIUserAbortError") throw error;
    }
    if (pretext !== "") {
        conversation.chats.push({ message: prompt, sender: "user" });
        conversation.chats.push({ message: pretext, sender: "ai" });
        await conversation.save();
        if (!conversationId) {
            await User.findByIdAndUpdate(req.user._id, { $push: { conversation: conversation._id } });
            if (!clientDisconnected) res.write(`data:${JSON.stringify({ conversationId: conversation._id, title: conversation.title })}\n\n`);
        }
    }
    if (tokenSpend === undefined) tokenSpend = 0;
    req.tokenSpend = tokenSpend;
    req.titleTokenSpend = titleTotalTokenCount || 0;
    console.log("Groq Token cost:", req.tokenSpend, "| Gemini 3.1 Title Token cost:", req.titleTokenSpend);
    req.isNewChat = isNewChat;
    res.end();
    next();
});
