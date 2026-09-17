import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export function Profile() {
    const { user, loading, setUser } = useContext(AuthContext);
    if (loading) return <div className="bg-dark vh-100 d-flex justify-content-center align-items-center text-white"><span className="spinner-border spinner-border-sm me-2" />Loading profile…</div>;
    if (!user) return <Navigate to="/auth/login" replace />;
    return <ProfileForm key={user.username} user={user} setUser={setUser} />;
}

function ProfileForm({ user, setUser }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState(user.username);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState("");
    const [pendingAction, setPendingAction] = useState("");

    async function request(path, method, body) {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}${path}`, {
            method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to update your profile");
        return result;
    }

    async function saveUsername(event) {
        event.preventDefault();
        if (!username.trim() || username.trim() === user.username) return setError("Choose a different username");
        setError(""); setPendingAction("username");
        try {
            const result = await request("/auth/profile/username", "POST", { username: username.trim() });
            setUser(result.user); toast.success("Username updated");
        } catch (requestError) {
            console.log(requestError);
            setError(requestError.message);
            toast.error("Username update failed");
        } finally { setPendingAction(""); }
    }

    async function savePassword(event) {
        event.preventDefault();
        if (!currentPassword || !newPassword) return setError("Enter both your current and new password");
        setError(""); setPendingAction("password");
        try {
            const result = await request("/auth/profile/password", "POST", { currentPassword, newPassword });
            setUser(result.user); setCurrentPassword(""); setNewPassword(""); toast.success("Password updated");
        } catch (requestError) {
            setError(requestError.message); toast.error("Password update failed");
        } finally { setPendingAction(""); }
    }

    async function removeAccount(event) {
        event.preventDefault();
        if (confirmation !== "DELETE") return setError("Type DELETE to confirm account deletion");
        if (!deletePassword) return setError("Enter your password to delete the account");
        setError(""); setPendingAction("delete");
        try {
            await request("/auth/profile", "DELETE", { currentPassword: deletePassword, confirmation });
            setUser(null); toast.success("Account deleted"); navigate("/auth/signup", { replace: true });
        } catch (requestError) {
            setError(requestError.message); toast.error("Account deletion failed");
        } finally { setPendingAction(""); }
    }

    const disabled = Boolean(pendingAction);
    return <div className="bg-dark min-vh-100 text-white py-5">
        <Toaster />
        <main className="bg-black p-4 p-md-5 rounded shadow mx-auto" style={{ maxWidth: "460px" }}>
            <Link to="/" className="text-decoration-none text-secondary">← Back to chats</Link>
            <h2 className="mt-4 mb-1">Profile</h2>
            <p className="text-secondary mb-4">{user.email}</p>
            {error && <p className="alert alert-danger py-2">{error}</p>}
            <form onSubmit={saveUsername} className="mb-4 pb-4 border-bottom border-secondary">
                <h5>Username</h5><p className="text-secondary small">No password required for this change.</p>
                <div className="mb-3"><label className="form-label">Username</label><input className="form-control" value={username} onChange={(event) => setUsername(event.target.value)} disabled={disabled} /></div>
                <button className="btn btn-primary" type="submit" disabled={disabled}>{pendingAction === "username" ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : "Save username"}</button>
            </form>
            <form onSubmit={savePassword} className="mb-4 pb-4 border-bottom border-secondary">
                <h5>Change password</h5><p className="text-secondary small">Confirm your current password to set a new one.</p>
                <div className="mb-3"><label className="form-label">Current password</label><input className="form-control" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={disabled} /></div>
                <div className="mb-3"><label className="form-label">New password</label><input className="form-control" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={disabled} /></div>
                <button className="btn btn-primary" type="submit" disabled={disabled}>{pendingAction === "password" ? <><span className="spinner-border spinner-border-sm me-2" />Updating…</> : "Update password"}</button>
            </form>
            <form onSubmit={removeAccount}>
                <h5 className="text-danger">Delete account</h5><p className="text-secondary small">This permanently deletes your account and all chat history.</p>
                <div className="mb-3"><label className="form-label">Current password</label><input className="form-control" type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} disabled={disabled} /></div>
                <div className="mb-3"><label className="form-label">Type <code>DELETE</code> to confirm</label><input className="form-control" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={disabled} /></div>
                <button className="btn btn-outline-danger" type="submit" disabled={disabled}>{pendingAction === "delete" ? <><span className="spinner-border spinner-border-sm me-2" />Deleting…</> : "Delete account"}</button>
            </form>
        </main>
    </div>;
}
