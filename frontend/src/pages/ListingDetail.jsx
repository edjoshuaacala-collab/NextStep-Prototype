import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const [i, setI] = useState(null);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api(`/internships/${id}`).then((r) => setI(r.data)).catch((e) => setError(e.message)); }, [id]);
  useEffect(() => { if (i && window.location.hash === '#apply') document.getElementById('apply')?.scrollIntoView(); }, [i]);

  async function apply(e) {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      const r = await api(`/internships/${id}/apply`, { method: 'POST', body: { cover_note: note } });
      setI({ ...i, application_status: r.data.status });
      setMsg(r.message);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  if (error && !i) return <p className="err">{error}</p>;
  if (!i) return <p className="muted">Loading…</p>;

  return (
    <>
      <Link to="/listings" className="small">← Back to listings</Link>
      <section className="card detail">
        <h1>{i.title}</h1>
        <div className="company">{i.company} · {i.location} ({i.work_setup})</div>
        <p>{i.description}</p>
        <div className="meta">
          <div><b>Role</b>{i.role_category}</div>
          <div><b>Duration</b>{i.duration}</div>
          <div><b>Allowance</b>{i.allowance || '—'}</div>
          <div><b>Slots</b>{i.slots}</div>
          <div><b>Deadline</b>{i.deadline || '—'}</div>
        </div>
        <h3>Qualifications</h3>
        <div className="chips">{i.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </section>
      <section className="card" id="apply">
        <h3>Apply to this internship</h3>
        {i.application_status ? (
          <p>You have applied. Status: <StatusBadge status={i.application_status} /></p>
        ) : (
          <form onSubmit={apply}>
            <label className="field"><span>Short note to the company (optional)</span>
              <textarea rows="4" maxLength="1000" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tell them why you are a good fit…" />
            </label>
            {error && <em className="err">{error}</em>}
            <button className="btn btn-gold" disabled={busy}>Apply now (demo)</button>
          </form>
        )}
        {msg && <p className="ok">{msg} Track it under <Link to="/applications">My Applications</Link>.</p>}
      </section>
    </>
  );
}
