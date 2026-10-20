import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Logo from './Logo.jsx';
import ChatWidget from './ChatWidget.jsx';
import { IconBriefcase, IconDashboard, IconFile, IconSparkle } from './Icons.jsx';

export const PORTAL_LABELS = { student: 'Student Portal', faculty: 'Faculty Portal', partner: 'Partner Portal' };

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const ROLE_LINE = { faculty: (u) => u.position, partner: (u) => u.company_name };

function ProfileFooter({ user }) {
  const pct = Number(user.profile_completeness);
  const hasPct = Number.isFinite(pct) && (!user.role || user.role === 'student');
  return (
    <div className="drawer-profile">
      <span className="ring" style={hasPct ? { '--pct': pct } : { '--pct': 100 }}>
        <span className="avatar avatar-ring">{initials(user.name)}</span>
      </span>
      <span className="drawer-profile-text">
        <b>{user.name}</b>
        {hasPct ? <span>Profile <strong>{pct}%</strong> complete</span> : <span>{ROLE_LINE[user.role]?.(user) || PORTAL_LABELS[user.role]}</span>}
      </span>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const showChat = pathname === '/' || pathname === '/listings';

  // While the chat is open, only the assistant item is highlighted.
  const navClass = ({ isActive }) => `nav${isActive && !chatOpen ? ' active' : ''}`;
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
        <NavLink to="/" end className={navClass}><IconDashboard size={22} />Dashboard</NavLink>
        <NavLink to="/listings" className={navClass}><IconBriefcase size={22} />Internship Listings</NavLink>
        <button className={`nav${chatOpen ? ' active' : ''}`} onClick={openChat}><IconSparkle size={22} />AI Matching Assistant</button>
        <NavLink to="/applications" className={navClass}><IconFile size={22} />My Applications</NavLink>
        <ProfileFooter user={user} />
      </aside>
      <main className="main"><Outlet /></main>
      <ChatWidget hidden={!showChat} open={chatOpen} setOpen={setChatOpen} />
    </div>
  );
}
