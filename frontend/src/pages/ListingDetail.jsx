import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { CategoryTag } from '../components/Brand.jsx';
import { formatDate } from '../brand.js';
import { IconArrowLeft, IconInfo, IconPin } from '../components/Icons.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [i, setI] = useState(null);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const canApply = !user?.role || user.role === 'student';

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
      <div>
        <Link to="/listings" className="btn btn-text" style={{ marginLeft: -14 }}><IconArrowLeft size={18} />Back to listings</Link>
      </div>

      <section className="page-head">
        <div className="chips">
          <CategoryTag category={i.role_category} />
          {i.work_setup && <span className="tag tag-plain">{i.work_setup}</span>}
        </div>
        <h1>{i.title}</h1>
        <span className="hero-sub"><IconPin size={18} />{i.company}, {i.location}</span>
      </section>

      <div className="detail-grid">
        <div className="col">
          <section className="card">
            <h3>About the role</h3>
            <p className="description">{i.description}</p>
          </section>

          <section className="card">
            <h3>Details</h3>
            <div className="tiles">
              <div className="tile"><span>Role</span><b>{i.role_category}</b></div>
              <div className="tile"><span>Duration</span><b>{i.duration}</b></div>
              <div className="tile"><span>Allowance</span><b>{i.allowance || '—'}</b></div>
              <div className="tile"><span>Slots</span><b>{i.slots}</b></div>
            </div>
          </section>

          <section className="card">
            <h3>Qualifications</h3>
            <div className="chips">{i.skills.map((s) => <span key={s} className="tag tag-skill">{s}</span>)}</div>
          </section>
        </div>

        <section className="card apply-card" id="apply">
          <h3>Apply to this internship</h3>
          {i.application_status ? (
            <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              You have applied. Status: <StatusBadge status={i.application_status} />
            </p>
          ) : !canApply ? (
            <div className="notice"><IconInfo size={18} />Only student accounts can apply to internships.</div>
          ) : (
            <form onSubmit={apply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="tip" style={{ fontSize: 13.5 }}>
                {i.deadline ? `Applications close ${formatDate(i.deadline)}. ` : ''}Add a short note so the company knows why you are a good fit.
              </p>
              <label className="field">
                <span>Short note to the company (optional)</span>
                <textarea rows="4" maxLength="1000" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tell them why you are a good fit…" />
              </label>
              {error && <em className="err">{error}</em>}
              <button className="btn btn-filled btn-lg btn-block" disabled={busy}>Apply now</button>
            </form>
          )}
          {msg && <p className="ok">{msg} Track it under <Link to="/applications">My Applications</Link>.</p>}
        </section>
      </div>
    </>
  );
}
