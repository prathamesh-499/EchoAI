import React from 'react'
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Chats } from "./Chats";
import { useState,useRef } from 'react';
import "../styles/home.css"
export const Home = function () {
    const conversationIdRef = useRef(null);
    
    const [chats, setChats] = useState([]);
    return (
        <div className="home-layout">
            <Sidebar setChats={setChats} conversationIdRef={conversationIdRef} />
            <div className="home-main">
                <Navbar />
                <Chats chats={chats} setChats={setChats} conversationIdRef={conversationIdRef} />
            </div>
        </div>
    );
}