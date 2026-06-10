import { StrictMode } from "react";
import { Home } from "./Home"
import { Login } from "./Login"
import { Signup } from "./Signup";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
export function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/auth/login" element={<Login />} />
					<Route path="/auth/signup" element={<Signup />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>

	);

}