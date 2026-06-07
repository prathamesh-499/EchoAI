import { StrictMode } from "react";
import {Home} from "./Home"
import {Login} from "./Login"
import { Signup } from "./Signup";
import { BrowserRouter, Routes, Route } from "react-router-dom";
export function App() {
	return (
		<BrowserRouter>
		<Routes>
		<Route path="/" element={<Home/>} />
		<Route path="/login" element={<Login/>}/>	
		<Route path="/signup" element={<Signup/>}/>	
		</Routes>
		</BrowserRouter>


	);

}