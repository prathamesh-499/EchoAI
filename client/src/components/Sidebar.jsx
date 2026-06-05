import "../styles/sidebar.css"
export function Sidebar() {
    return (
        <div className="bg-dark text-white Sidebar d-flex flex-column p-4">
            <a className="SidebarElements btn btn-dark">New chat</a><br />
            <a className="SidebarElements btn btn-dark">Search chat</a><br />
            <a className="SidebarElements btn btn-dark">Recent chat</a>
        </div>);

}