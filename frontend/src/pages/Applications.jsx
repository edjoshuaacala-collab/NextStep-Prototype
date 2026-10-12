import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Applications() {
  const [apps, setApps] = useState(null);
  useEffect(() => { api('/applications').then((r) => setApps(r.data)).catch(() => setApps([])); }, []);
  if (!apps) return <p className="muted">Loading…</p>;
  return (
    <>
      <h1>My Applications</h1>
      <p className="muted">Demo applications you have submitted</p>
      <section className="card">
        {apps.length === 0 && <p className="muted">No applications yet. <Link to="/listings">Browse listings</Link></p>}
        {apps.map((a) => (
          <div className="row" key={a.id}>
            <div><strong>{a.internship.title}</strong><div className="muted small">{a.internship.company} · Applied {new Date(a.created_at).toLocaleDateString()}</div></div>
            <StatusBadge status={a.status} />
          </div>
        ))}
      </section>
    </>
  );
}
