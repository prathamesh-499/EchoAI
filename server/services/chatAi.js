import { ApiError } from "../util/ApiError.js";
import { geminiAi } from "./geminiApi.js";
import { groqApi } from "./groqApi.js";

const PROVIDERS = {
    gemini: geminiAi,
    groq: groqApi,
};

export function chatAi(req, res, next) {
    const provider = String(req.body?.model || "gemini").toLowerCase();
    const handler = PROVIDERS[provider];
    if (!handler) {
        return next(new ApiError(400, "Unsupported model. Use gemini or groq."));
    }
    return handler(req, res, next);
}
