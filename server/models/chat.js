import mongoose from "mongoose";

const chatSchema=new mongoose.Schema(
    {
        message:{
            type:String,
            trim:true,
            minlength:1,
            required:true
        },
        users:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }]
    },
    {
        timestamps: true
    }
);


export const Chat =mongoose.model("Chat",chatSchema);

