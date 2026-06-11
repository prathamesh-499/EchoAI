import { useContext, useState, useEffect } from "react";
import "../styles/sidebar.css"
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export function Sidebar({ setChats ,conversationIdRef}) {
    const navigate = useNavigate();
    const { user, loading } = useContext(AuthContext);
    const [conversation, setConversation] = useState([]);

    useEffect(() => {
        if (loading || !user) return;
        const getConversation = async () => {
            try {
                const res = await fetch("http://localhost:3000/conversation", {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setConversation(data);
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        getConversation();
    }, [loading, user]);

    async function loadChat(id) {
        const res = await fetch(`http://localhost:3000/conversation/${id}`, {
            method: "GET",
            credentials: "include",
        });
        try {
            if (res.ok) {
                const data = await res.json();
                conversationIdRef.current=id;
                setChats(data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleNewChat() {
        setChats([]);
        conversationIdRef.current=null;
    }

    return (
        <div className="sidebar">
            <div className="sidebar-actions">
                <button className="sidebar-btn sidebar-btn--new" onClick={handleNewChat}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    New chat
                </button>
            </div>

            <div className="sidebar-divider" />

            {conversation.length > 0 && (
                <>
                    <p className="sidebar-section-label">Recent</p>
                    <div className="sidebar-conversations">
                        {conversation.map((chat) => (
                            <button
                                key={chat._id}
                                className="sidebar-conv-item"
                                onClick={() => loadChat(chat._id)}
                                title={chat.title}
                            >
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                    <path d="M1 1h11v8H7l-3 3V9H1V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                                </svg>
                                <span>{chat.title}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}