import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Logo from './Logo.jsx';
import ChatWidget from './ChatWidget.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const showChat = pathname === '/' || pathname === '/listings';

  const openChat = () => { if (!showChat) navigate('/'); setChatOpen(true); };

  return (
    <div className="shell">
      <header className="topbar">
        <Logo />
        <div className="topbar-right">
          <span>Student Portal · {user.name}</span>
          <button className="btn btn-gold btn-sm" onClick={logout}>Log out</button>
        </div>
      </header>
      <aside className="sidebar">
        <NavLink to="/" end className="nav">Dashboard</NavLink>
        <NavLink to="/listings" className="nav">Internship Listings</NavLink>
        <button className="nav nav-btn" onClick={openChat}>AI Matching Assistant</button>
        <NavLink to="/applications" className="nav">My Applications</NavLink>
      </aside>
      <main className="main"><Outlet /></main>
      <ChatWidget hidden={!showChat} open={chatOpen} setOpen={setChatOpen} />
    </div>
  );
}
