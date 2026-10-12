import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api('/dashboard').then(setD).catch((e) => setError(e.message)); }, []);

  if (error) return <p className="err">{error}</p>;
  if (!d) return <p className="muted">Loading…</p>;
  const { user, stats } = d;
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <h1>Welcome back, {user.name.split(' ')[0]}</h1>
      <p className="muted">Here is a summary of your internship progress</p>
      <div className="grid-2">
        <section className="card">
          <h3>Profile summary</h3>
          <div className="profile">
            <div className="avatar">{initials}</div>
            <div><strong>{user.name}</strong><div className="muted small">{user.program}</div><div className="muted small">Year {user.year_level}</div></div>
          </div>
          <div className="muted small">Profile completeness: {user.profile_completeness}%</div>
          <div className="bar"><div style={{ width: `${user.profile_completeness}%` }} /></div>
        </section>
        <section className="card">
          <h3>Application overview</h3>
          <div className="stats">
            <div><b>{stats.applications}</b><span>Applications</span></div>
            <div><b>{stats.under_review}</b><span>Under review</span></div>
            <div><b>{stats.endorsed}</b><span>Endorsed</span></div>
            <div><b>{stats.pending}</b><span>Pending</span></div>
          </div>
        </section>
      </div>

      <section className="card">
        <h3>Recommended internships</h3>
        {d.recommended.map((r) => (
          <div className="row" key={r.id}>
            <div>
              <strong>{r.title}</strong>
              <div className="muted small">{r.company} · {r.location}</div>
              {r.matched?.length > 0 && <div className="small gold">Matches: {r.matched.join(', ')}</div>}
            </div>
            <Link className="btn btn-navy btn-sm" to={`/listings/${r.id}`}>View details</Link>
          </div>
        ))}
      </section>

      <div className="grid-2">
        <section className="card">
          <h3>Recent updates</h3>
          {d.updates.length === 0 && <p className="muted small">No applications yet. Browse listings to get started.</p>}
          {d.updates.map((u, i) => (
            <div className="row" key={i}><span className="small">{u.company}: application</span><StatusBadge status={u.status} /></div>
          ))}
        </section>
        <section className="card">
          <h3>Quick links</h3>
          <div className="links">
            <Link className="btn btn-outline" to="/listings">Browse listings</Link>
            <Link className="btn btn-outline" to="/applications">My applications</Link>
            <p className="muted small">Tip: click the chat icon at the bottom right to ask the AI assistant.</p>
          </div>
        </section>
      </div>
    </>
  );
}
