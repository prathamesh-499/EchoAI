import {asyncWrapper} from "../middleware/asyncWrapper.js"
import { User } from "../models/user.js";
import{Conversation}from "../models/conversation.js"
import { geminiAiTitle } from "../services/geminiApi.js";


export const chat= asyncWrapper(async(req,res,next)=>{
    
    next();
}
);