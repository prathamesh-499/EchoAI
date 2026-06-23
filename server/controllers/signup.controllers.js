import { asyncWrapper } from "../middleware/asyncWrapper.js"
import { User } from "../models/user.js"
import { ApiError } from "../util/ApiError.js";
import {generateAccessAndRefreshToken} from "../util/generateAccessAndRefreshToken.js"


export const signup = asyncWrapper(async (req, res,next) => {
    const { username, password, email } = req.body;
    const existUser =await User.findOne({$or:[{username},{email}]});
    if(existUser){
        if(existUser.username===username){
            return next(new ApiError(406 ,"Username Exist"));
        }
        return next(new ApiError(406 ,"Email Exist"));

    }
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
        message: "Account created successfully",
        user: {
            username: user.username,
        },
    });
})