import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { Conversation } from "../models/conversation.js";
import { User } from "../models/user.js";
import { ApiError } from "../util/ApiError.js";

export const deleteConversation = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const user = req.user;
    const conversation = await Conversation.findOneAndDelete({ $and: [{ _id: id }, { owner: user._id }] });
    if (!conversation) {
        return next(new ApiError(404, "Conversation not found"));
    }
    const updatedUser = await User.findOneAndUpdate({ _id: user._id }, { $pull: { conversation: id } });
    res.json({
        success: true,
        message: "Conversation deleted",

    });



});