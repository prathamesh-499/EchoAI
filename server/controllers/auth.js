import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../models/user.js";

export const auth = asyncWrapper(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -refreshToken -conversation');
    return res.json(user);
});

