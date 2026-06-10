import { asyncWrapper } from "../middleware/asyncWrapper.js"
import { User } from "../models/user.js"
import {generateAccessAndRefreshToken} from "../util/generateAccessAndRefreshToken.js"


export const signup = asyncWrapper(async (req, res,next) => {
    const { username, password, email } = req.body;
    const user = new User({
        username: username,
        password: password,
        email: email,
    });
    const { accessToken, refreshToken } =await generateAccessAndRefreshToken(user);
    user.refreshToken=refreshToken;
    await user.save();
    
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        path: "/"
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        path: "/auth/refreshToken"
    });
    res.json({
        success: true,
        message: "Account created successfully",
        user: {
            username: user.username,
            email: user.email,
        },
    });
})