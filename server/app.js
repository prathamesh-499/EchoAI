import express from "express";
import mongoose from "mongoose";
import ejs from 'ejs';

import { Chat } from "./models/chat.js";
import path from "path";

const app =express();

app.set('view engine', 'ejs');



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



app.get('/', (req, res) => {
	res.send('Hello World')
});



app.use((err,req,res,next)=>{
	console.log(err);
	res.status(500).send(err.message);

});