import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { Conversation } from "../models/conversation.js";
import { User } from "../models/user.js";
import { ApiError } from "../util/ApiError.js";
import { generateAccessAndRefreshToken } from "../util/generateAccessAndRefreshToken.js";

const isProduction = process.env.NODE_ENV === "production";

function setAuthCookies(res, accessToken, refreshToken) {
    const options = { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax" };
    res.cookie("accessToken", accessToken, { ...options, path: "/", maxAge: 1_800_000 });
    res.cookie("refreshToken", refreshToken, { ...options, path: "/auth/refreshToken", maxAge: 2_592_000_000 });
}

function clearAuthCookies(res) {
    const options = { httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax" };
    res.clearCookie("accessToken", { ...options, path: "/" });
    res.clearCookie("refreshToken", { ...options, path: "/auth/refreshToken" });
}

async function refreshSession(user, res) {
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);
}

export const updateUsername = asyncWrapper(async (req, res, next) => {
    const username = String(req.body.username || "").trim();
    if (!username) return next(new ApiError(400, "Username cannot be empty"));
    console.log(username);
    const user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));
    if (username === user.username) return next(new ApiError(400, "Choose a different username"));

    const usernameTaken = await User.exists({ username, _id: { $ne: user._id } });
    if (usernameTaken) return next(new ApiError(409, "Username already exists"));

    user.username = username;
    await refreshSession(user, res);
    res.json({ success: true, message: "Username updated", user: { username: user.username, email: user.email } });
});

export const updatePassword = asyncWrapper(async (req, res, next) => {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!currentPassword || !newPassword) return next(new ApiError(400, "Current and new passwords are required"));

    const user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));
    if (!await user.checkpassword(currentPassword)) return next(new ApiError(401, "Current password is incorrect"));

    user.password = newPassword;
    await refreshSession(user, res);
    res.json({ success: true, message: "Password updated", user: { username: user.username, email: user.email } });
});

export const deleteAccount = asyncWrapper(async (req, res, next) => {
    const currentPassword = String(req.body.currentPassword || "");
    const confirmation = String(req.body.confirmation || "");
    if (confirmation !== "DELETE") return next(new ApiError(400, "Type DELETE to confirm account deletion"));
    if (!currentPassword) return next(new ApiError(400, "Your current password is required"));

    const user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));
    if (!await user.checkpassword(currentPassword)) return next(new ApiError(401, "Current password is incorrect"));

    await Conversation.deleteMany({ owner: user._id });
    await User.deleteOne({ _id: user._id });
    clearAuthCookies(res);
    res.json({ success: true, message: "Account deleted" });
});
