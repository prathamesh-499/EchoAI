import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Chats } from "./Chats";
import { StrictMode } from "react";
export function App() {
  return (<>
    <div className="d-flex ">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1">
        <Navbar />
        <Chats />

      </div>
    </div>
  </>


  );

}