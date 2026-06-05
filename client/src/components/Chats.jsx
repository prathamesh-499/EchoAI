import { useMemo, useState } from "react";
import Chat from "./Chat";
import "../styles/chats.css"
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey });



export function Chats() {
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [prompt, setPrompt] = useState("");
    const chatsMemo = useMemo(() => {
        {
            return chats.map((chat, idx) => {
                return <Chat key={idx} prompt={chat.prompt} by={chat.by} />
            })
        }
    }, [chats])
    async function geminiAi(prompt, currentChat) {
        const chat = ai.chats.create({
            model: "gemini-3.1-flash-lite",
            history: currentChat.map((chat) => {
                return {
                    role: chat.by,
                    parts: [{ text: chat.prompt }]
                }
            }),
        });
        const stream1 = await chat.sendMessageStream({
            message: prompt,
        });
        let pretext = "";
        setChats((prevChats) => ([...prevChats, { by: "model", prompt: "" }]));
        for await (const chunk of stream1) {
            pretext += chunk.text;
            setChats((prevChats) => {
                const update = [...prevChats];
                update[update.length - 1] = { by: "model", prompt: pretext };
                return update;
            });

        }
        // console.log(pretext);

    }

    async function sendPromt(e) {
        e.preventDefault();
        setLoading(true);
        setChats((prevChats) => ([...prevChats, { by: "user", prompt: prompt }]));
        const tempPrompt = prompt;
        setPrompt("");
        await geminiAi(tempPrompt, chats).catch(e => {
            console.log(e);
        });
        setLoading(false);

    }
    return (
        <div style={{ height: "90vh" }} className="d-flex flex-column flex-grow-1 bg-dark text-white ">

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