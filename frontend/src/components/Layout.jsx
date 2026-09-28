import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, FolderKanban, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><BookOpen size={21} /></div>
          <div><strong>StudyVault</strong><span>Learning workspace</span></div>
        </div>
        <nav>
          <NavLink to="/dashboard" onClick={() => setOpen(false)}><LayoutDashboard size={18}/> Dashboard</NavLink>
          <NavLink to="/resources" onClick={() => setOpen(false)}><BookOpen size={18}/> Resources</NavLink>
          <NavLink to="/categories" onClick={() => setOpen(false)}><FolderKanban size={18}/> Categories</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{(user?.name || "U").slice(0,1).toUpperCase()}</div>
            <div><b>{user?.name || "Student"}</b><span>{user?.email || ""}</span></div>
          </div>
          <button className="ghost-btn full" onClick={signOut}><LogOut size={17}/> Sign out</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="mobile-header">
          <button className="icon-btn" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
          <div className="brand compact"><div className="brand-mark"><BookOpen size={19}/></div><strong>StudyVault</strong></div>
        </header>
        {children}
      </main>
    </div>
  );
}