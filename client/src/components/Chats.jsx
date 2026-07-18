import { useContext, useMemo, useState, useRef, useEffect } from "react";
import Chat from "./Chat";
import "../styles/chats.css"
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "./AuthContext"
import { useNavigate } from "react-router-dom";

export function Chats({ chats, setChats, conversationIdRef, setConversation }) {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const chatBottomRef = useRef(null);
    const textareaRef = useRef(null);
    const abortControllerRef = useRef(null);

    const chatsMemo = useMemo(() => {
        return chats.map((chat, idx) => (
            <Chat key={chat._id || idx} message={chat.message} sender={chat.sender} />
        ));
    }, [chats]);
    function handleInput(e) {
        setMessage(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
    }
    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(e);
        }
    }
    async function sendPrompt(e) {
        e.preventDefault();
        if (!message.trim() || loading) return;
        setLoading(true);
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setChats((prev) => [...prev, { sender: "user", message }]);
        setTimeout(() => {
            chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        const tempPrompt = message;
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        if (user) {
            try {
                let res = await fetch("http://localhost:3000/conversation", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        conversationId: conversationIdRef.current,
                        prompt: tempPrompt,
                    }),
                    signal: controller.signal,
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
                            res = await fetch("http://localhost:3000/conversation", {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    conversationId: conversationIdRef.current,
                                    prompt: tempPrompt,
                                }),
                                signal: controller.signal,
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
                    setChats((prev) => [...prev, { sender: "ai", message: "" }]);

                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const raw = decoder.decode(value);
                        console.log(raw);
                        const lines = raw.split("\n").filter((l) => l.startsWith("data:"));
                        for (const line of lines) {
                            const json = JSON.parse(line.replace("data:", "").trim());
                            if (json?.conversationId) {
                                conversationIdRef.current = json.conversationId;
                                setConversation(pre => ([{ title: json.title, _id: json.conversationId }, ...pre]));
                            }
                            const text = json?.message;
                            if (text) {
                                setChats((prev) => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        sender: "ai",
                                        message: updated[updated.length - 1].message + text,
                                    };
                                    return updated;
                                });
                            }

                        }
                    }
                }
                else {
                    toast.error("Something went wrong, please try again");
                }
            } catch (error) {
                if (error.name === "AbortError") {
                    toast("Generation stopped");
                } else {
                    toast.error(error.message);
                }
            }
            finally {
                abortControllerRef.current = null;
                setLoading(false);
            }
        }
        else {
            setLoading(false);
            toast.error("Please log in to continue");
        }

    }
    function stopGeneration() {
        abortControllerRef.current?.abort();
    }
    return (
        <div className="chats-page">
            <Toaster
                toastOptions={{
                    success: {
                        style: { background: "#1e1e1e", color: "#fff", border: "0.5px solid #333" },
                    },
                }}
            />

            <div className="chats-body">
                {chats.length === 0 ? (
                    <div className="chats-empty">
                        <div className="chats-empty-icon">✦</div>
                        <h2 className="chats-empty-title">What can I help with?</h2>
                        <p className="chats-empty-sub">Ask anything — I'm here to help.</p>
                    </div>
                ) : (
                    <div className="chats-messages">
                        {chatsMemo}
                        {loading && (
                            <div className="typing-indicator">
                                <span /><span /><span />
                            </div>
                        )}
                        <div ref={chatBottomRef} />
                    </div>
                )}
            </div>

            <div className="chats-input-area">
                <form onSubmit={sendPrompt} className="chats-input-form">
                    <div className="chats-input-box">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything…"
                            className="chats-textarea"
                            rows={1}

                        />
                        <button
                            type={loading ? "button" : "submit"}
                            onClick={loading ? stopGeneration : undefined}
                            className="chats-send-btn"
                            disabled={!loading && message.trim() === ""}
                        >
                            {loading ? (
                                <svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="2" fill="currentColor" /></svg> // stop icon (square)
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="chats-input-hint">Enter to send · Shift+Enter for new line</p>
                </form>
            </div>
        </div>
    );
}