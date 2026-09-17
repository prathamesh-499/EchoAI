import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { ApiError } from "../util/ApiError.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { redisClient } from "../services/redis.js";
import { signup } from "./signup.controllers.js";

const OTP_TTL_SECONDS = 5 * 60;
const verificationKey = (email) => `email-verification:${email.toLowerCase()}`;

function generateOTP() {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
});

async function sendEmail(to, otp) {
    await transporter.sendMail({
        from: `EchoAI <${process.env.EMAIL}>`,
        to,
        subject: "Email verification code",
        text: `Your EchoAI verification code is: ${otp}. It expires in 5 minutes.`,
        html: `<p>Your EchoAI verification code is: <strong>${otp}</strong></p><p>It expires in 5 minutes.</p>`,
    });
}

export const EmailVerificationController = asyncWrapper(async (req, res, next) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const username = String(req.body.username || "").trim();
    const { password } = req.body;
    if (!email || !username || !password) return next(new ApiError(400, "Email, username, and password are required"));

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return next(new ApiError(409, existingUser.username === username ? "Username already exists" : "Email already exists"));

    const otp = generateOTP();
    const passwordHash = await bcrypt.hash(password, 10);
    await sendEmail(email, otp);
    await redisClient.set(verificationKey(email), JSON.stringify({ email, username, passwordHash, otp }), { EX: OTP_TTL_SECONDS });
    res.status(200).json({ success: true, message: "Verification email sent successfully." });
});

export const confirmEmailVerification = asyncWrapper(async (req, res, next) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    if (!email || !/^\d{6}$/.test(otp)) return next(new ApiError(400, "A valid email and 6-digit verification code are required"));

    const key = verificationKey(email);
    const pendingSignup = await redisClient.get(key);
    if (!pendingSignup) return next(new ApiError(410, "Verification code expired. Please sign up again."));

    const registration = JSON.parse(pendingSignup);
    if (!crypto.timingSafeEqual(Buffer.from(registration.otp), Buffer.from(otp))) return next(new ApiError(400, "Incorrect verification code"));

    const existingUser = await User.findOne({ $or: [{ username: registration.username }, { email: registration.email }] });
    if (existingUser) return next(new ApiError(409, "An account with those details already exists"));

    req.body = { ...registration, password: registration.passwordHash, passwordIsHashed: true };
    await signup(req, res, next);
    if (res.headersSent && res.statusCode < 400) await redisClient.del(key);
});
