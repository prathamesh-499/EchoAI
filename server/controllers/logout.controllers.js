import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

function clearAuthCookies(res) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        path: "/",
        sameSite: isProduction ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        path: "/auth/refreshToken",
        sameSite: isProduction ? "none" : "lax",
    });
}

export const logout = asyncWrapper(async (req, res, next) => {
    let userId;

    try {
        userId = jwt.verify(req.cookies?.accessToken, process.env.JWT_ACCESS_TOKEN)._id;
    } catch {
        try {
            userId = jwt.verify(req.cookies?.refreshToken, process.env.JWT_REFRESH_TOKEN)._id;
        } catch {
            
        }
    }

    if (userId) await User.updateOne({ _id: userId }, { refreshToken: null });
    clearAuthCookies(res);
    res.json({
        success: true,
        message: "Account logged Out",
    });
});
