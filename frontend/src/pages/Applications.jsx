import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { statusNote } from '../brand.js';
import { MiniTrack, Monogram } from '../components/Brand.jsx';

export default function Applications() {
  const [apps, setApps] = useState(null);
  useEffect(() => { api('/applications').then((r) => setApps(r.data)).catch(() => setApps([])); }, []);
  if (!apps) return <p className="muted">Loading…</p>;
  return (
    <>
      <section className="page-head">
        <h1>My Applications</h1>
        <p>Track the status of every internship you applied to.</p>
      </section>

      <div className="section-head">
        <h2>Your applications</h2>
        <span className="chip">{apps.length} total</span>
      </div>

      {apps.length === 0 && (
        <p className="card empty">No applications yet. <Link to="/listings">Browse listings</Link> to find one that fits.</p>
      )}

      <div className="rows">
        {apps.map((a) => (
          <div className="app-row" key={a.id}>
            <Monogram company={a.internship.company} />
            <div className="app-text">
              <b>{a.internship.title}</b>
              <span>{a.internship.company}</span>
            </div>
            <div className="app-progress">
              <MiniTrack status={a.status} />
              <span className={a.status === 'Endorsed' ? 'note-strong' : ''}>{statusNote(a.status, a.created_at, a.updated_at)}</span>
            </div>
            <Link className="btn btn-text" to={`/listings/${a.internship_id}`}>View</Link>
          </div>
        ))}
      </div>
    </>
  );
}
