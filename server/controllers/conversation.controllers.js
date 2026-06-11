import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../models/user.js";
import{ApiError}from "../util/ApiError.js"
export const conversation=asyncWrapper(async (req, res, next)=> {
    const user =await User.findById(req.user._id)
    .select("conversation")
    .populate(
        {
            path: "conversation",
            select: "-chats"
        }
    );
    if(!user){
        return next(new ApiError(404, "User not found"));
    }
    res.json(user.conversation);
});