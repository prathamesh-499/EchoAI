import jwt from "jsonwebtoken";
import { ApiError } from "../util/ApiError.js";

export const verifyJwt = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return next(new ApiError(401, "Unauthorized"));
    }
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            console.log("URL From ", req.url);
            console.log(err);
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                sameSite: 'none'

            });
            return next(new ApiError(401, "Unauthorized"));
        }
        req.user = decoded;
        return next();
    });
}

