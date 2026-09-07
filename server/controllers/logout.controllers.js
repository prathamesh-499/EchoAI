import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../models/user.js";
import { ApiError } from "../util/ApiError.js";

export const logout = asyncWrapper(async (req, res, next) => {

    const user = req.user;
    const updatedUser = await User.findOneAndUpdate({ _id: user._id }, { refreshToken: null });
    if (!updatedUser) {
        return next(new ApiError(404, "User not found"));
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/auth/refreshToken",

    });
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",

    });
    res.json({
        success: true,
        message: "Account logged Out",
        user: {
            username: user.username,
        },
    });
});