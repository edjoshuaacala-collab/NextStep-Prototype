import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { IconBriefcase } from '../components/Icons.jsx';

export default function Applications() {
  const [apps, setApps] = useState(null);
  useEffect(() => { api('/applications').then((r) => setApps(r.data)).catch(() => setApps([])); }, []);
  if (!apps) return <p className="muted">Loading…</p>;
  return (
    <>
      <section className="hero">
        <span className="chip">Applications</span>
        <h1>My Applications</h1>
        <p>Demo applications you have submitted.</p>
      </section>

      <div className="section-head">
        <h2>Your applications</h2>
        <span className="chip">{apps.length} total</span>
      </div>

      {apps.length === 0 && (
        <p className="card empty">No applications yet. <Link to="/listings">Browse listings</Link></p>
      )}

      {apps.map((a) => (
        <div className="app-row" key={a.id}>
          <span className="app-icon"><IconBriefcase size={22} /></span>
          <div className="app-text">
            <b>{a.internship.title}</b>
            <span>{a.internship.company} · Applied {new Date(a.created_at).toLocaleDateString()}</span>
          </div>
          <StatusBadge status={a.status} />
          <Link className="btn btn-text" to={`/listings/${a.internship_id}`}>View</Link>
        </div>
      ))}
    </>
  );
}
