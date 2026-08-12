import { useState,useContext } from "react";
import {Link,useNavigate} from "react-router-dom";
import toast,{Toaster} from "react-hot-toast";
import {AuthContext} from "./AuthContext";

export function Login() {
    const navigate=useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const{setUser}=useContext(AuthContext);
    const [loginError,setLoginError]=useState(null);
    const handleSubmit =async (e) => {
        e.preventDefault();
        if(username.trim()===""){
            return setLoginError("username is required");
        };
        if(password.trim()===""){
            return setLoginError("password is required");
        };
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data=await res.json();
        
        if(res.ok){
            toast.success(`Welcome ${username}`);
            setUser(data.user);
            navigate("/",{ replace: true });
        }else{
            toast.error("Login Failed");
            if(data.error=="Invalid credentials"){
                setLoginError(data.error);
            }
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
    }}/>
            <div
                className="bg-black text-white p-5 rounded shadow"
                style={{ width: "400px" }}
            >
                <h2 className="text-center mb-4">Welcome Back</h2>
                { loginError && <p className="alert alert-danger py-2 text-center" >{loginError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Username or Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
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
                        Login
                    </button>
                </form>

                <p className="text-center text-secondary mt-4 mb-0">
                    Don't have an account?{" "}
                    <Link to="/auth/signup" className="text-decoration-none">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
