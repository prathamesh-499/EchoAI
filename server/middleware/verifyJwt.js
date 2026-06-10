import jwt from "jsonwebtoken";
import { ApiError } from "../util/ApiError.js";

export const verifyJwt = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return next(new ApiError(401, "Unauthorized"));
    }
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return next(new ApiError(401,err.name));
        }
        req.user=decoded;
        return next();
    });
}

