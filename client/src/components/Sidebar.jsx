import { useContext, useState, useEffect, useRef, useMemo } from "react";
import "../styles/sidebar.css"
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function Sidebar({ setChats, conversationIdRef, setConversation, conversation, sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const { user, loading,setUser } = useContext(AuthContext);//get login user info 
    const [openMenuId, setOpenMenuId] = useState(null);//stores the id of the 3 dot toggle button that is clicked
    const [renameId, setRenameId] = useState(null);//then rename is clicked its id is stored in this
    const [renameValue, setRenameValue] = useState("");//the rename value in the input 
    const [title, setTitle] = useState("GPT");
    const renameInputRef = useRef(null);//to make the input focus and seleted
    const [collapsed, setCollapsed] = useState(false);
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
                    data.reverse();
                    setConversation(data);
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        getConversation();
    }, [loading, user]);
    useEffect(() => {
        if (renameId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renameId]);
    useEffect(() => {
        function handleClickOutside(e) {
            if (!e.target.closest(".conv-menu-dropdown") && !e.target.closest(".conv-menu-btn")) {
                setOpenMenuId(null);
            }
        }
        if (openMenuId) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [openMenuId]);
    useEffect(() => {
        document.title = title;
    }, [title]);
    const conversationMemo = useMemo(() => {
        {
            return conversation.length > 0 && (
                <>
                    {console.log("sidebar")}

                    <p className="sidebar-section-label">Recent</p>
                    <div className="sidebar-conversations">
                        {conversation.map((chat) => {
                            return (
                                <div key={chat._id} className="conv-item-wrapper">
                                    {renameId === chat._id ? (
                                        <input

                                            ref={renameInputRef}
                                            className="conv-rename-input"
                                            value={renameValue}
                                            onChange={e => { setRenameValue(e.target.value); console.log(renameValue) }}
                                            onBlur={() => submitRename(chat._id)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") submitRename(chat._id);
                                                if (e.key === "Escape") setRenameId(null);
                                            }}
                                        />
                                    )
                                        :
                                        <>
                                            <button
                                                className="sidebar-conv-item"
                                                onClick={() => loadChat(chat._id, chat.title)}
                                            >
                                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                                    <path d="M1 1h11v8H7l-3 3V9H1V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                                                </svg>
                                                <span className="conv-title" title={chat.title} >{chat.title}</span>
                                            </button>

                                            <button
                                                className="conv-menu-btn"
                                                onClick={e => handleMenuToggle(chat._id)}
                                                aria-label="More options"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <circle cx="7" cy="2.5" r="1.2" fill="currentColor" />
                                                    <circle cx="7" cy="7" r="1.2" fill="currentColor" />
                                                    <circle cx="7" cy="11.5" r="1.2" fill="currentColor" />
                                                </svg>
                                            </button>
                                            {openMenuId === chat._id && (
                                                <div className="conv-menu-dropdown">
                                                    <button className="conv-menu-item" onClick={e => handleRename(chat)}>
                                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                            <path d="M9 2l2 2-7 7H2v-2L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                                                        </svg>
                                                        Rename
                                                    </button>
                                                    <button className="conv-menu-item conv-menu-item--delete" onClick={e => handleDelete(chat._id)}>
                                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                            <path d="M2 4h9M5 4V2h3v2M10 4l-.7 7H3.7L3 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>}</div>)
                        })}
                    </div>
                </>
            )
        }
    }, [conversation, renameId, openMenuId, renameValue]);
    function handleNewChat() {
        setChats([]);
        conversationIdRef.current = null;
        setSidebarOpen?.(false);
    }
    function handleMenuToggle(id) {
        if (id !== openMenuId) {
            setOpenMenuId(id);
        }
        else {
            setOpenMenuId(null)
        };
    }
    function handleRename(chat) {
        setRenameId(chat._id);
        setRenameValue(chat.title);
    }
    async function handleDelete(id) {
        try {
            let res = await fetch(`http://localhost:3000/conversation/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.status === 401) {
                try {
                    const res1 = await fetch("http://localhost:3000/auth/refreshToken", {
                        method: "GET",
                        credentials: "include",
                    });
                    if (res1.ok) {
                        const data = await res1.json();
                        setUser(data.user);
                        res = await fetch(`http://localhost:3000/conversation/${id}`, {
                            method: "DELETE",
                            credentials: "include",
                        });
                    }
                    else {
                        toast.error("Session expired, please log in again");
                        navigate("/auth/login");
                        return;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            if (res.ok) {
                toast.success(`Chat deleted`);
            }
        } catch (err) {
            toast.error(`Chat could not be deleted`);

            console.log(err);
        }
        finally{
            setOpenMenuId(null);
        }
        if (conversationIdRef.current == id) {
            conversationIdRef.current = null;
            setChats([]);
        }
        setConversation(pre => pre.filter(conv => conv._id !== id));
    }
    async function submitRename(id) {
        try {
            let res = await fetch(`http://localhost:3000/conversation/${id}/rename`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    renameValue: renameValue.trim()
                })
            });
            if (res.status === 401) {
                try {
                    const res1 = await fetch("http://localhost:3000/auth/refreshToken", {
                        method: "GET",
                        credentials: "include",
                    });
                    if (res1.ok) {
                        const data = await res1.json();
                        setUser(data.user);
                        res = await fetch(`http://localhost:3000/conversation/${id}/rename`, {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                renameValue: renameValue.trim()
                            })
                        });
                    }
                    else {
                        toast.error("Session expired, please log in again");
                        navigate("/auth/login");
                        return;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (err) {
            toast.error(`Chat could not be renamed`);
            console.log(err);
        }
        setOpenMenuId(null);
        setRenameValue("");
        setRenameId(null);
        setConversation(pre => {
            return pre.map(conv => {
                if (conv._id === id) {
                    conv.title = renameValue.trim();
                }
                return conv;
            })
        })


    }
    async function loadChat(id, title) {
        try {

            let res = await fetch(`http://localhost:3000/conversation/${id}`, {
                method: "GET",
                credentials: "include"
            });
            if (res.status === 401) {
                try {
                    const res1 = await fetch("http://localhost:3000/auth/refreshToken", {
                        method: "GET",
                        credentials: "include",
                    });
                    if (res1.ok) {
                        const data = await res1.json();
                        setUser(data.user);
                        res = await fetch(`http://localhost:3000/conversation/${id}`, {
                            method: "GET",
                            credentials: "include"
                        });
                    }
                    else {
                        toast.error("Session expired, please log in again");
                        navigate("/auth/login");
                        return;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            if (res.ok) {
                const data = await res.json();
                conversationIdRef.current = id;
                setTitle(title);
                setChats(data);
            }

        } catch (error) {

            console.log(error);
        }
    }

    return (
        <div className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${sidebarOpen ? "sidebar--mobile-open" : ""}`}>
            <div className="sidebar-top">
                {!collapsed && <h4 className="brandName" style={{ marginRight: "auto", marginBottom: "0px", color: "#600495", fontWeight: "bold" }}>EchoAi</h4>}
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setCollapsed(prev => !prev)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        {collapsed ? (
                            <path d="M5.5 3.5L9.5 7.5L5.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                            <path d="M9.5 3.5L5.5 7.5L9.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                    </svg>
                </button>
            </div>

            <div className="sidebar-actions">
                <button className="sidebar-btn sidebar-btn--new" onClick={handleNewChat} title="New chat">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {!collapsed && "New chat"}
                </button>
            </div>

            <div className="sidebar-divider" />
            {!collapsed && conversationMemo}
        </div>
    );
}