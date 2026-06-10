import { useContext, useMemo, useState,useRef } from "react";
import Chat from "./Chat";
import "../styles/chats.css"
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./AuthContext"
export function Chats() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [prompt, setPrompt] = useState("");
    const conversationId=useRef(null);
    const chatsMemo = useMemo(() => {
        {
            return chats.map((chat, idx) => {
                return <Chat key={idx} prompt={chat.prompt} by={chat.by} />
            })
        }
    }, [chats]);
    async function sendPromt(e) {
        e.preventDefault();
        setLoading(true);
        setChats((prevChats) => ([...prevChats, { by: "user", prompt: prompt }]));
        const tempPrompt = prompt;
        setPrompt("");
        if (user) {
            const res = await fetch("http://localhost:3000/chat", {
                method: 'POST',
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: conversationId.current,
                    prompt: tempPrompt,
                }),
            });

            setChats((prev) => [...prev, { by: "ai", prompt: "" }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const raw = decoder.decode(value);
                const lines = raw.split("\n").filter(line => line.startsWith("data:"));
                for (const line of lines) {
                    try {
                        console.log(line);
                        const json = JSON.parse(line.replace("data:", "").trim());
                        if(json.conversationId){
                            conversationId.current=json?.conversationId;
                        }
                        const text = json?.message;
                        if (text) {
                            setChats((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    by: "ai",
                                    prompt: updated[updated.length - 1].prompt + text
                                };
                                return updated;
                            });
                        }
                    } catch (err) {
                        // incomplete chunk, skip
                    }
                }
            }
        }

        setLoading(false);
    }
    return (
        <div style={{ height: "90vh", maxWidth: "85vw" }} className="d-flex flex-column flex-grow-1 bg-dark text-white ">
            <Toaster
                toastOptions={{
                    success: {
                        style: {
                            background: "#000",
                            color: "#fff",
                        },
                    }
                }}
            />
            <div className="Chats d-flex flex-column flex-grow-1 overflow-auto align-items-center ">
                <div className="mt-auto w-100">
                    {chatsMemo}
                </div>

            </div>
            <form onSubmit={sendPromt} className="align-self-center">
                <div>
                    <input onChange={(e) => { setPrompt(e.target.value); }} value={prompt} name="prompt" type="text" placeholder="Ask anything" className=" w-60 prompt form-control bg-dark text-white mb-4 d-inline-block" />
                    <button className="btn btn-dark" disabled={(loading || (prompt.trim() === ""))} type="submit">Send</button>
                </div>
            </form>

        </div>
    );

}