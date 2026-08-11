import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css"
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "./AuthContext"
import toast from "react-hot-toast";

export function Navbar({onMenuClick}) {
    const { user, loading, setUser } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const chipRef = useRef(null);
    const navigate = useNavigate();
    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : null;

    useEffect(() => {
        function handleClickOutside(e) {
            if (chipRef.current && !chipRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [menuOpen]);
    async function handleLogout() {
        setMenuOpen(false);
        try {
            const res = await fetch("http://localhost:3000/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                setUser(null);
                navigate(0);
            } else {
                toast.error("Logout failed");
            }
        } catch (err) {
            toast.error("Logout failed");
            console.log(err);
        }
    }
    return (
        <div className="navbar-bar">
            <button className="navbar-menu-toggle" onClick={onMenuClick} aria-label="Open menu">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            </button>
            {!loading && (
                user ? (
                    <div className="navbar-user-chip-wrapper" ref={chipRef}>
                        <button
                            className="navbar-user-chip"
                            onClick={() => setMenuOpen(prev => !prev)}
                        >
                            <div className="navbar-avatar">{initials}</div>
                            <span className="navbar-username">{user.username}</span>
                        </button>
                        {menuOpen && (
                            <div className="navbar-menu-dropdown">
                                <button className="navbar-menu-item navbar-menu-item--logout" onClick={handleLogout}>
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M5 1.5H2.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1H5M9 9l3-2.5L9 4M12 6.5H4.5"
                                            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Log out
                                </button>
                            </div>
                        )}
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