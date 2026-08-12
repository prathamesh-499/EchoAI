import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { generateAccessAndRefreshToken } from "../util/generateAccessAndRefreshToken.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { ApiError } from "../util/ApiError.js"
export const refreshToken = asyncWrapper(async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return next(new ApiError(401, "no token"));
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
        const decodedUser = decoded;
        const user = await User.findById(decodedUser._id).select("_id refreshToken username email");
        if (!user) {
            return next(new ApiError(401, "no user"));
        }
        if (token !== user.refreshToken) {
            console.log(token)
            return next(new ApiError(401, "db not match"));
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: 'none'

        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/auth/refreshToken",
            sameSite: 'none'

        });

        return res.json({
            success: true,
            message: "Account loggedin ",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            path: "/auth/refreshToken",
            sameSite: 'none'
        });
        return next(new ApiError(401, error));
    }




})