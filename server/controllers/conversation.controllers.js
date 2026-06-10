import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../models/user.js";

export const conversation=asyncWrapper(async (req, res, next)=> {
    const user =await User.findById(req.user._id)
    .select("conversation")
    .populate(
        {
            path: "conversation",
            select: "-chats"
        }
    );
    res.json(user.conversation);
});