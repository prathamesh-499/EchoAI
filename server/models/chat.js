import mongoose from "mongoose";

export const chatSchema=new mongoose.Schema(
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



