import { Link } from "react-router-dom";
import "../styles/navbar.css"
import { useContext } from "react";
import { AuthContext } from "./AuthContext"

export function Navbar() {
    const { user, loading } = useContext(AuthContext);

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : null;

    return (
        <div className="navbar-bar">
            {!loading && (
                user ? (
                    <div className="navbar-user-chip">
                        <div className="navbar-avatar">{initials}</div>
                        <span className="navbar-username">{user.username}</span>
                    </div>
                ) : (
                    <div className="navbar-auth-links">
                        <Link className="navbar-link" to="/auth/signup">Sign up</Link>
                        <Link className="navbar-link navbar-link--primary" to="/auth/login">Log in</Link>
                    </div>
                )
            )}
        </div>
    );
}