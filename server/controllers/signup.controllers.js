import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncWrapper } from "../middleware/asyncWrapper.js"
import { User } from "../models/user.js"
import  {ApiError} from "../util/ApiError.js"
async function generateAccessAndRefreshToken(id) {
    try {
        const user = await User.findById(id);
        if (!id) {
            return new ApiError(400, "Bad Request");
        }
        const accessToken = jwt.sign({
            _id: user._id,
            username: user.username
        }, process.env.JWT_ACCESS_TOKEN,
            { expiresIn:"5h" }
        );
        const refreshToken = jwt.sign({
            _id: user._id,
        }, process.env.JWT_REFRESH_TOKEN,
            { expiresIn:"30d" }
        );
        return { accessToken, refreshToken };
    }
    catch (err) {
        return new ApiError(500, "Server Error")
    }
    
}


export const signup = asyncWrapper(async (req, res,next) => {
    const { username, password, email } = req.body;
    const user = new User({
        username: username,
        password: password,
        email: email,
    });
    await user.save();
    const { accessToken, refreshToken } =await generateAccessAndRefreshToken(user._id);
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
        path: "/refreshToken"
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