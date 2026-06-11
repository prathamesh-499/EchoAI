import { data, Link ,useNavigate} from "react-router-dom";
import { useState,useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {AuthContext} from "./AuthContext"
export const Signup = function () {
    const{setUser}=useContext(AuthContext);
    const navigate = useNavigate();
    const [signUpError,setSignUpError]=useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const handleSubmit = async(e) => {
        e.preventDefault();
        if(email.trim()===""){
            return setSignUpError("Email is required");
        };
        if(username.trim()===""){
            return setSignUpError("Username is required");
        };
        if(password.trim()===""){
            return setSignUpError("Password is required");
        };
        const res = await fetch('http://localhost:3000/auth/signup', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email,username, password })
        });
        const data=await res.json();
        if(res.ok){
            toast.success("Account created!");
            setUser(data.user);
            navigate("/",{ replace: true });
        }else{
            console.error(data);
            setSignUpError(data.error);
            toast.error("Account could not be created!");
        }

    }
    return (
        <div className="bg-dark vh-100 d-flex justify-content-center align-items-center">
            <Toaster
            toastOptions={{
        success: {
            style: {
                background: "#000",
                color: "#fff",
            },
        },
        error: {
            style: {
                background: "#000",
                color: "#fff",
            },
        },
    }}
            />
            <div
                className="bg-black text-white p-5 rounded shadow"
                style={{ width: "400px" }}
            >
                <h2  className="text-center mb-4">Create Account</h2>
                { signUpError && <p className="alert alert-danger py-2 text-center" >{signUpError}</p>}

                <form onSubmit={handleSubmit}>
                    <div required className="mb-3">
                        <input
                            className="form-control"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div required className="mb-3">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div required className="mb-4">
                        <input
                            className="form-control"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn-primary w-100 py-2"
                        type="submit"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="text-center text-secondary mt-4 mb-0">
                    Have an account?{" "}
                    <Link to="/auth/login" className="text-decoration-none">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
