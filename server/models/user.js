import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    refreshToken:{
        type:String,
    },
    conversation:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation"
    }]

});
userSchema.pre('save',async function(){
    if(this.isModified("password") && !this.$locals.passwordIsHashed){
        const hash=await bcrypt.hash(this.password,10);
        this.password=hash;
    }
});
userSchema.methods.checkpassword=async function(password){
    return await bcrypt.compare(password,this.password);
};


export const User=mongoose.model("User",userSchema);
