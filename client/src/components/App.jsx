import { StrictMode } from "react";
import { Home } from "./Home"
import { Login } from "./Login"
import { Signup } from "./Signup";
import { EmailVerification } from "./emailVerification";
import { Profile } from "./Profile";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
export function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/auth/login" element={<Login />} />
					<Route path="/auth/signup" element={<Signup />} />
					<Route path="/auth/email-verification" element={<EmailVerification />} />
					<Route path="/profile" element={<Profile />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>

	);

}
