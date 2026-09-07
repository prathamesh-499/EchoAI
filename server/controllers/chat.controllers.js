import {asyncWrapper} from "../middleware/asyncWrapper.js"


export const chat= asyncWrapper(async(req,res,next)=>{
    
    next();
}
);