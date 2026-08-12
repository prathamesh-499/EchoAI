import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const navigate=useNavigate();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
                if (res.status === 401) {
                    try {
                        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/refreshToken`, {
                            method: "GET",
                            credentials: "include",
                        });
                        if(res.ok){
                            const data = await res.json();
                            setUser(data.user);
                        }
                    } catch (error) {
                        console.log(error);
                        navigate("/auth/login");
                    }

                }
            }
            catch (error) {
                console.error(error);

            }
            finally{
                    setLoading(false);

            }



        }; fetchUser();
    },[]);

    return (
        <AuthContext.Provider value={{ user,loading,setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
