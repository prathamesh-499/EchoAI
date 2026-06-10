import { Link } from "react-router-dom";
import "../styles/navbar.css"
import { useContext } from "react";
import {AuthContext} from "./AuthContext"
export function Navbar() {
    const {user}=useContext(AuthContext);
            // console.log(user);

    return (
        <div className="Navbar bg-dark text-white d-flex flex-row justify-content-end gap-4 items-content-center p-3">
            {!user?(<>
            <Link className="btn btn-dark btn-sm" to="/auth/signup">Signin </Link>
            <Link className="btn btn-dark btn-sm " to="/auth/login">Login</Link> </>):<h6>Welcome {user.user.username}</h6> }
        </div>
    );
}