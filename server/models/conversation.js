import mongoose from "mongoose";
import { chatSchema } from "./chat.js";

const conversationSchema=mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
        },
        chats:[chatSchema],
        owner:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"user"
            }
    },
    {
        timestamps:true
    }

);

export const Conversation =mongoose.model("Conversation",conversationSchema);
