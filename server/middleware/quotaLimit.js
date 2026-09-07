const GEMINI_31_LIMITS = {
    rpm: 10,
    rpd: 490,
    tpm: 170_000,   // 170k TPM (170,000 tokens/min)
};

const GEMINI_38_LIMITS = {
    rpm: 4,
    rpd: 17,
    tpm: 200_000,
};

const GROQ_LIMITS = {
    rpm: 25,
    rpd: 800,       // 0.8k RPD
    tpm: 7_000,     // 7k TPM (7,000 tokens/min)
    tpd: 150_000,   // 150k TPD (150,000 tokens/day)
};

// Aliases for backward compatibility
const SAFE_LIMITS = GEMINI_38_LIMITS;
const GEMINI_SAFE_LIMITS = GEMINI_38_LIMITS;

const gemini31Time = {
    minute: { now: null, count: 0, tokens: 0 },
    day: { now: null, count: 0 },
};

const gemini38Time = {
    minute: { now: null, count: 0, tokens: 0 },
    day: { now: null, count: 0 },
};

const groqTime = {
    minute: { now: null, count: 0, tokens: 0 },
    day: { now: null, count: 0, tokens: 0 },
};

// Alias for backward compatibility
const currentTime = gemini38Time;

function getKeys() {
    return {
        minute: Math.floor(Date.now() / 60000),
        day: new Date().toISOString().slice(0, 10),
    };
}

function resetUsageIfTimesUp(tracker) {
    const { minute, day } = getKeys();
    if (tracker.minute.now !== minute) {
        tracker.minute.now = minute;
        tracker.minute.count = 0;
        tracker.minute.tokens = 0;
    }
    if (tracker.day.now !== day) {
        tracker.day.now = day;
        tracker.day.count = 0;
        if (tracker.day.tokens !== undefined) {
            tracker.day.tokens = 0;
        }
    }
}

function checkGemini31Quota(req, res) {
    resetUsageIfTimesUp(gemini31Time);
    if (gemini31Time.minute.count + 1 > GEMINI_31_LIMITS.rpm) {
        res.status(429).json({ error: 'Too many new chat requests this minute (Gemini 3.1 title limit). Wait a moment.' });
        return false;
    }
    if (gemini31Time.day.count + 1 > GEMINI_31_LIMITS.rpd) {
        res.status(429).json({ error: 'Daily new chat title limit reached (Gemini 3.1). Try again tomorrow.' });
        return false;
    }
    if (gemini31Time.minute.tokens > GEMINI_31_LIMITS.tpm) {
        res.status(429).json({ error: 'Gemini 3.1 title token limit hit for this minute. Wait a moment.' });
        return false;
    }
    gemini31Time.minute.count++;
    gemini31Time.day.count++;
    return true;
}

function checkGemini38Quota(req, res) {
    resetUsageIfTimesUp(gemini38Time);
    if (gemini38Time.minute.count + 1 > GEMINI_38_LIMITS.rpm) {
        res.status(429).json({ error: 'Too many Gemini requests this minute. Wait a moment.' });
        return false;
    }
    if (gemini38Time.day.count + 1 > GEMINI_38_LIMITS.rpd) {
        res.status(429).json({ error: 'Daily Gemini AI limit reached. Try again tomorrow.' });
        return false;
    }
    if (gemini38Time.minute.tokens > GEMINI_38_LIMITS.tpm) {
        res.status(429).json({ error: 'Gemini token limit hit for this minute. Wait a moment.' });
        return false;
    }
    gemini38Time.minute.count++;
    gemini38Time.day.count++;
    return true;
}

function checkGroqQuota(req, res) {
    resetUsageIfTimesUp(groqTime);
    if (groqTime.minute.count + 1 > GROQ_LIMITS.rpm) {
        res.status(429).json({ error: 'Too many Groq requests this minute. Wait a moment.' });
        return false;
    }
    if (groqTime.day.count + 1 > GROQ_LIMITS.rpd) {
        res.status(429).json({ error: 'Daily Groq AI limit reached. Try again tomorrow.' });
        return false;
    }
    if (groqTime.minute.tokens > GROQ_LIMITS.tpm) {
        res.status(429).json({ error: 'Groq token limit hit for this minute. Wait a moment.' });
        return false;
    }
    if (groqTime.day.tokens > GROQ_LIMITS.tpd) {
        res.status(429).json({ error: 'Daily Groq token limit reached. Try again tomorrow.' });
        return false;
    }
    groqTime.minute.count++;
    groqTime.day.count++;
    return true;
}

function checkQuota(req, res, next) {
    const isNewChat = !req.body?.conversationId;

    // 1. If starting a new conversation, title generator (Gemini 3.1) is invoked
    if (isNewChat) {
        const allowedTitle = checkGemini31Quota(req, res);
        if (!allowedTitle) return;
    }

    // 2. Check the chat model's quota (Groq or Gemini 3.8)
    const provider = String(req.body?.model || "gemini").toLowerCase();
    const allowedChat = provider === "groq"
        ? checkGroqQuota(req, res)
        : checkGemini38Quota(req, res);

    if (!allowedChat) return;

    if (next) next();
}

const checkGeminiQuota = (req, res, next) => {
    if (checkGemini38Quota(req, res)) {
        if (next) next();
    }
};

function recordTokens(req, res, next) {
    const provider = String(req.body?.model || "gemini").toLowerCase();

    // 1. Record tokens for the chat model ONLY
    const chatTokens = Number(req.tokenSpend) || 0;
    if (provider === "groq") {
        resetUsageIfTimesUp(groqTime);
        groqTime.minute.tokens += chatTokens;
        groqTime.day.tokens += chatTokens;
    } else {
        resetUsageIfTimesUp(gemini38Time);
        gemini38Time.minute.tokens += chatTokens;
    }

    // 2. Record title tokens to Gemini 3.1 Flash Lite ONLY
    if (req.titleTokenSpend) {
        resetUsageIfTimesUp(gemini31Time);
        gemini31Time.minute.tokens += Number(req.titleTokenSpend) || 0;
    }

    if (next) next();
}

export {
    checkQuota,
    checkGroqQuota,
    checkGeminiQuota,
    checkGemini38Quota,
    checkGemini31Quota,
    recordTokens,
    GROQ_LIMITS,
    GEMINI_38_LIMITS,
    GEMINI_31_LIMITS,
    GEMINI_SAFE_LIMITS,
    SAFE_LIMITS,
};