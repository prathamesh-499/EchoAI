import { User } from "../models/user.js";
import { ApiError } from "../util/ApiError.js";
import { generateAccessAndRefreshToken } from "../util/generateAccessAndRefreshToken.js"
import { asyncWrapper } from "../middleware/asyncWrapper.js"
export const login = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;

    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });

    if (!user) {
        return next(new ApiError(401, "Invalid credentials"));
    }
    if (!await user.checkpassword(password)) {
        return next(new ApiError(401, "Invalid credentials"));
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/"
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/auth/refreshToken"
    });
    res.json({
        success: true,
        message: "Account loggedin ",
        user: {
            username: user.username,
        },
    });

});