import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authrouter from "./routes/auth/signup.routes.js";
import cors from "cors";
import chatrouter from "./routes/index/chat.routes.js"
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
		await mongoose.connect(process.env.MONGO_URI);
	}
	catch(err){
		console.log(err);
		res.status(500).send(err.message);
	}
    app.listen(3000, () => {
		console.log('Server is running')
    });

})();
app.use("/auth",authrouter);
app.use("",chatrouter);


app.use((req,res)=>{
	res.status(404).json({error:"Page not found"});
});

app.use((err,req,res,next)=>{
	console.log(err);
	res.status(err.status||500).json({error:err.message||"Internal Server Error"});

});