import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const EmailVerification = function () {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const email = state?.email;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email) return navigate("/auth/signup", { replace: true });
        if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code from your email");
        setError("");
        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/verify-email/otp`, {
                method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }),
            });
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Verification failed");
                toast.error("Verification failed");
                return;
            }
            toast.success("Email verified — account created!");
            setUser(result.user);
            navigate("/", { replace: true });
        } catch {
            setError("Unable to reach the server");
            toast.error("Verification failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!email) return <div className="bg-dark vh-100 d-flex justify-content-center align-items-center text-white">Redirecting to sign up…</div>;

    return (
        <div className="bg-dark vh-100 d-flex justify-content-center align-items-center">
            <Toaster toastOptions={{ success: { style: { background: "#000", color: "#fff" } }, error: { style: { background: "#000", color: "#fff" } } }} />
            <div className="bg-black text-white p-5 rounded shadow" style={{ width: "400px" }}>
                <h2 className="text-center mb-3">Verify your email</h2>
                <p className="text-center text-white mb-2">{email}</p>
                <p className="text-center text-secondary mb-4">Enter the 6-digit code we sent to this address.</p>
                {error && <p className="alert alert-danger py-2 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4"><input className="form-control text-center" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="6" placeholder="000000" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} autoFocus disabled={isSubmitting} /></div>
                    <button className="btn btn-primary w-100 py-2" type="submit" disabled={isSubmitting}>{isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Verifying…</> : "Verify email"}</button>
                </form>
                <p className="text-center text-secondary mt-4 mb-0"><Link to="/auth/signup" className="text-decoration-none">Use a different email</Link></p>
            </div>
        </div>
    );
};
