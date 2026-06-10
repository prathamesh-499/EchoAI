import { useContext,useState,useEffect } from "react";
import "../styles/sidebar.css"
import { AuthContext } from "./AuthContext";

export function Sidebar() {
    const {user,loading}=useContext(AuthContext);
    const [conversation,setConversation]=useState([]);
    useEffect(()=>{
        if(loading&& !user)return;
        const getConversation=async()=>{
                console.log("hi");
                try {
                    const res=await fetch("http://localhost:3000/conversation",{
                        method:"GET",
                        credentials: 'include',
                    });
                    if(res.ok){
                        const data=await res.json();
                        setConversation(data);

                    }
                } catch (error) {
                    console.log(error);
                }
                
            };getConversation();
        },[loading,user]);
    
    return (
        <div className="bg-dark text-white Sidebar d-flex flex-column p-4">
            <a className="SidebarElements btn btn-dark">New chat</a><br />
            <a className="SidebarElements btn btn-dark">Search chat</a><br />
            <a className="SidebarElements btn btn-dark">Recent chat</a>
            <div className="conversation">
            
                
                {conversation.map((chat)=>{
                    return <p>{chat.title}</p>
                })}

            
            </div>
        </div>);

}