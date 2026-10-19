import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { initials } from '../components/Layout.jsx';
import { IconCheckCircle, IconClock, IconFile, IconHourglass } from '../components/Icons.jsx';

const DASH_LABELS = { student: 'Student dashboard', faculty: 'Faculty dashboard', partner: 'Partner dashboard' };

// Two short lines under the name, depending on the account type.
function profileLines(user) {
  if (user.role === 'faculty') return [user.position, user.department];
  if (user.role === 'partner') return [user.job_title, user.company_name];
  return [user.program, `Year ${user.year_level}`];
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api('/dashboard').then(setD).catch((e) => setError(e.message)); }, []);

  if (error) return <p className="err">{error}</p>;
  if (!d) return <p className="muted">Loading…</p>;
  const { user, stats } = d;
  const anyMatched = d.recommended.some((r) => r.matched?.length > 0);

  const STAT_CARDS = [
    { value: stats.applications, label: 'Applications', icon: IconFile },
    { value: stats.under_review, label: 'Under review', icon: IconClock },
    { value: stats.endorsed, label: 'Endorsed', icon: IconCheckCircle },
    { value: stats.pending, label: 'Pending', icon: IconHourglass },
  ];

  return (
    <>
      <section className="hero">
        <span className="chip">{DASH_LABELS[user.role] || 'Student dashboard'}</span>
        <h1>Welcome back, {user.name.split(' ')[0]}</h1>
        <p>Here is a summary of your internship progress.</p>
      </section>

      <div className="stats">
        {STAT_CARDS.map(({ value, label, icon: Icon }) => (
          <div className="card card-sm stat" key={label}>
            <span className="stat-icon"><Icon size={20} /></span>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="two-col">
        <section className="card" style={{ gap: 12 }}>
          <div className="card-head" style={{ paddingBottom: 4 }}>
            <h3>Recommended internships</h3>
            {anyMatched && <span className="chip chip-gold">AI matched</span>}
          </div>
          {d.recommended.map((r, idx) => (
            <div className="rec-row" key={r.id}>
              <span className="rec-num">{idx + 1}</span>
              <div className="rec-text">
                <span className="rec-title">{r.title}</span>
                <span className="rec-meta">{r.company} · {r.location}</span>
                {r.matched?.length > 0 && <span className="rec-match">Matches: {r.matched.join(', ')}</span>}
              </div>
              <Link className="btn btn-text" to={`/listings/${r.id}`}>View</Link>
            </div>
          ))}
        </section>

        <div className="col">
          <section className="card card-sm">
            <div className="profile">
              <span className="avatar avatar-lg">{initials(user.name)}</span>
              <div className="profile-info">
                <span className="profile-name">{user.name}</span>
                {profileLines(user).filter(Boolean).map((line) => (
                  <span className="profile-meta" key={line}>{line}</span>
                ))}
              </div>
            </div>
            <div className="progress-head"><span>Profile completeness</span><b>{user.profile_completeness}%</b></div>
            <div className="progress"><div style={{ width: `${user.profile_completeness}%` }} /></div>
          </section>

          <section className="card card-sm" style={{ gap: 10 }}>
            <h3>Recent updates</h3>
            {d.updates.length === 0 && <p className="tip">No applications yet. Browse listings to get started.</p>}
            {d.updates.map((u, i) => (
              <div className="update-row" key={i}>
                <div className="update-text"><b>{u.company}</b><span>Application</span></div>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </section>

          <section className="card card-sm" style={{ gap: 10 }}>
            <h3>Quick links</h3>
            <Link className="btn btn-tonal btn-block" to="/listings">Browse listings</Link>
            <Link className="btn btn-outlined btn-block" to="/applications">My applications</Link>
            <p className="tip">Tip: tap the gold chat button at the bottom right to ask the AI assistant.</p>
          </section>
        </div>
      </div>
    </>
  );
}
