import { Link } from "react-router-dom";
import "../styles/navbar.css"
export function Navbar() {
    return (
        <div className="Navbar bg-dark text-white d-flex flex-row justify-content-end gap-4 items-content-center p-3">
            <Link className="btn btn-dark btn-sm" to="/signup">Signin </Link>
            <Link className="btn btn-dark btn-sm " to="/login">Login</Link>
        </div>
    );
}