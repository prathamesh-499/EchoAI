import { Link } from "react-router-dom";
import { useState } from 'react';

export const Signup = function () {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const handleSubmit = async(e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email,username, password })
        });
        console.log(await res.json());
        setEmail("");
        setPassword("");
        setUsername("");
    }
    return (
        <div className="bg-dark vh-100 d-flex justify-content-center align-items-center">
            <div
                className="bg-black text-white p-5 rounded shadow"
                style={{ width: "400px" }}
            >
                <h2  className="text-center mb-4">Create Account</h2>

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
                    <Link to="/login" className="text-decoration-none">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
