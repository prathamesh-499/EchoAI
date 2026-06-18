import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { Conversation } from "../models/conversation.js";
import { ApiError } from "../util/ApiError.js";
export const renameConversationTitle=asyncWrapper(async(req,res,next)=>{
    const {id,renameValue}=req.body;
    const user=req.user;
    const conversation=await Conversation.findOneAndUpdate({$and:[{_id:id},{owner:user._id}]},{title:renameValue});
    if(!conversation){
            return next(new ApiError(404,"Conversation not found"));
        }
        res.json({
        success:true,
        message:"Conversation title changed",

    });

});