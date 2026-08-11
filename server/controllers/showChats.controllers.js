import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { Conversation } from "../models/conversation.js";
import { ApiError } from "../util/ApiError.js";
export const showChats=asyncWrapper(async(req,res,next)=>{
    
    const {id}=req.params;
    const conversation=await Conversation.findById(id);
    if(!conversation){
        return next(new ApiError(404,"Conversation not found"));
    }
    if(!conversation.owner.equals(req.user._id)){
        return next(new ApiError(403,"Forbidden"));
    }
    return res.json(conversation.chats);
});