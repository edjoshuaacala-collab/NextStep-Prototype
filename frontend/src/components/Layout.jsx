import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Logo from './Logo.jsx';
import ChatWidget from './ChatWidget.jsx';
import { IconBriefcase, IconDashboard, IconFile, IconSparkle } from './Icons.jsx';

export const PORTAL_LABELS = { student: 'Student Portal', faculty: 'Faculty Portal', partner: 'Partner Portal' };

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

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
          <span className="portal-chip">{PORTAL_LABELS[user.role] || 'Student Portal'}</span>
          <span className="avatar avatar-sm">{initials(user.name)}</span>
          <span className="user-name">{user.name}</span>
          <button className="btn btn-onnavy" onClick={logout}>Log out</button>
        </div>
      </header>
      <aside className="drawer">
        <div className="drawer-label">Menu</div>
        <NavLink to="/" end className="nav"><IconDashboard size={22} />Dashboard</NavLink>
        <NavLink to="/listings" className="nav"><IconBriefcase size={22} />Internship Listings</NavLink>
        <button className={`nav${chatOpen ? ' active' : ''}`} onClick={openChat}><IconSparkle size={22} />AI Matching Assistant</button>
        <NavLink to="/applications" className="nav"><IconFile size={22} />My Applications</NavLink>
      </aside>
      <main className="main"><Outlet /></main>
      <ChatWidget hidden={!showChat} open={chatOpen} setOpen={setChatOpen} />
    </div>
  );
}
