import mongoose from "mongoose";

const chatSchema=new mongoose.Schema(
    {
        message:{
            type:String,
            trim:true,
            minlength:1,
            required:true
        },
        sender:{
            type:String,
            required:true,
        }
    },
    {
        timestamps: true
    }
);


export const Chat =mongoose.model("Chat",chatSchema);

