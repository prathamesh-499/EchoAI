const SAFE_LIMITS = {
    rpm: 10,
    rpd: 450,
    tpm: 200_000,
};
const currentTime = {
    minute: { now: null, count: 0, tokens: 0 },
    day: { now: null, count: 0 },
};
function getKeys() {
    return {
        minute: Math.floor(Date.now() / 60000),
        day: new Date().toISOString().slice(0, 10),
    };
}
function resetKeysIfTimesUp() {
    const { minute, day } = getKeys();
    if (currentTime.minute.now !== minute) {
        currentTime.minute.now = minute;
        currentTime.minute.count = 0;
        currentTime.minute.tokens = 0;
    }
    if (currentTime.day.now !== day) {
        currentTime.day.now = day;
        currentTime.day.count = 0;
    }
}
function checkGeminiQuota(req, res, next) {
    resetKeysIfTimesUp();
    currentTime.minute.count++;
    currentTime.day.count++;
    if (currentTime.minute.count > SAFE_LIMITS.rpm) {
        return res.status(429).json({ error: 'Too many requests this minute. Wait a moment.' });
    }
    if (currentTime.day.count > SAFE_LIMITS.rpd) {
        return res.status(429).json({ error: 'Daily AI limit reached. Try again tomorrow.' });
    }
    if (currentTime.minute.tokens > SAFE_LIMITS.tpm) {
        return res.status(429).json({ error: 'Token limit hit for this minute. Wait a moment.' });
    }
    next();
}
function recordTokens(req, res, next) {
    resetKeysIfTimesUp();
    currentTime.minute.tokens += req.tokenSpend;
    if (req.isNewChat) {
        currentTime.minute.count++;
        currentTime.day.count++;
    }
}
export { checkGeminiQuota, recordTokens };