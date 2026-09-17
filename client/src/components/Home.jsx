import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Chats } from "./Chats";
import { useContext, useRef, useState } from 'react';
import { AuthContext } from "./AuthContext";
import "../styles/home.css"
export const Home = function () {
    const { loading } = useContext(AuthContext);
    const conversationIdRef = useRef(null);
    const [conversation, setConversation] = useState([]);//user conversations
    const [chats, setChats] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

    if (loading) {
        return (
            <main className="session-loading" aria-live="polite">
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                <p>Loading your chats…</p>
            </main>
        );
    }

    return (
        <div className="home-layout">

            <Sidebar setChats={setChats}
                conversationIdRef={conversationIdRef}
                conversation={conversation}
                setConversation={setConversation}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
            )}
            <div className="home-main">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <Chats chats={chats} setConversation={setConversation} setChats={setChats} conversationIdRef={conversationIdRef} />
            </div>
        </div>
    );
}
