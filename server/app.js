import express from "express";
import mongoose from "mongoose";
import { Chat } from "./models/chat.js";
import path from "path";
import cookieParser from "cookie-parser";
import signuRoutes from "./routes/signup.routes.js";
import cors from "cors";
const app =express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: 'http://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
}));

(async()=>{
	try{
		await mongoose.connect('mongodb://127.0.0.1:27017/chat');
	}
	catch(err){
		console.log(err);
		res.status(500).send(err.message);
	}
    app.listen(3000, () => {
		console.log('Server is running on http://localhost:3000')
    });

})();
app.use("/signup",signuRoutes);


app.use((req,res)=>{
	res.status(404).json({error:"Page not found"});
});

app.use((err,req,res,next)=>{
	console.log(err);
	res.status(500).json({error:err.message});

});