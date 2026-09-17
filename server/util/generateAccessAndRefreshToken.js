import { ApiError } from "./ApiError.js";
import jwt from "jsonwebtoken";
export async function generateAccessAndRefreshToken(user) {
    try {
        const accessToken = jwt.sign({
            _id: user._id,
            username: user.username
        }, process.env.JWT_ACCESS_TOKEN,
            { expiresIn:"30m" }
        );
        const refreshToken = jwt.sign({
            _id: user._id,
        }, process.env.JWT_REFRESH_TOKEN,
            { expiresIn:"30d" }
        );
        return { accessToken, refreshToken };
    }
    catch (err) {
        throw new ApiError(500, err.message)
    }
    
}