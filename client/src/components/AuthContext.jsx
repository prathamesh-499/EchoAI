import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {

            try {
                const res = await fetch("http://localhost:3000/auth/me", {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json()
                    setUser(data);
                }
                if (res.status === 401) {
                    const res = await fetch("http://localhost:3000/auth/refreshToken", {
                        method: "GET",
                        credentials: "include",
                    });
                }
            }
            catch (error) {
                console.error(error);

            }
            finally{
                    setLoading(false);

            }



        }; fetchUser();
    }, []
    );

    return (
        <AuthContext.Provider value={{ user,loading }}>
            {children}
        </AuthContext.Provider>
    );
}
