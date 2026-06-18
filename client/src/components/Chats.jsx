import { useContext, useMemo, useState, useRef, useEffect } from "react";
import Chat from "./Chat";
import "../styles/chats.css"
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./AuthContext"

export function Chats({ chats, setChats,conversationIdRef,setConversation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const chatBottomRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats]);

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
        setChats((prev) => [...prev, { sender: "user", message }]);
        const tempPrompt = message;
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        if (user) {
            const res = await fetch("http://localhost:3000/conversation", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: conversationIdRef.current,
                    prompt: tempPrompt,
                }),
            });

            setChats((prev) => [...prev, { sender: "ai", message: "" }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const raw = decoder.decode(value);
                const lines = raw.split("\n").filter((l) => l.startsWith("data:"));
                for (const line of lines) {
                    try {
                        const json = JSON.parse(line.replace("data:", "").trim());
                        if (json.conversationId) {
                            conversationIdRef.current = json.conversationId;
                            setConversation(pre=>([{title:json.title,_id:json.conversationId},...pre]));
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
                    } catch {
                        // incomplete chunk, skip
                    }
                }
            }
        }

        setLoading(false);
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
                            type="submit"
                            className="chats-send-btn"
                            disabled={loading || message.trim() === ""}
                            aria-label="Send message"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <p className="chats-input-hint">Enter to send · Shift+Enter for new line</p>
                </form>
            </div>
        </div>
    );
}