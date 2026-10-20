import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, matchSentence, statusNote } from '../brand.js';
import { MiniTrack, Monogram } from '../components/Brand.jsx';

const ROLE_INTRO = {
  faculty: 'Monitor student applications and endorsements from here.',
  partner: 'Review student applicants and manage your internship posts from here.',
};

// Work out where the student is on the internship track and what to do next.
function nextStep(d) {
  const { stats, updates } = d;
  const endorsed = updates.find((u) => u.status === 'Endorsed');
  const waiting = updates.find((u) => u.status === 'Under review') || updates.find((u) => u.status === 'Pending');

  if (endorsed) {
    return {
      current: 3,
      headline: `Start your OJT at ${endorsed.company}`,
      sub: `You were endorsed for ${endorsed.title}${endorsed.updated_at ? ` on ${formatDate(endorsed.updated_at)}` : ''}.`,
      action: { to: `/listings/${endorsed.internship_id}`, label: 'View application' },
    };
  }
  if (waiting) {
    return {
      current: 2,
      headline: `Wait for ${waiting.company}'s review`,
      sub: `${waiting.title}${waiting.applied_at ? `, applied ${formatDate(waiting.applied_at)}` : ''}.`,
      action: { to: `/listings/${waiting.internship_id}`, label: 'View application' },
    };
  }
  return {
    current: stats.applications > 0 ? 2 : 0,
    headline: 'Find an internship that fits you',
    sub: 'Start with the matches below, or ask the AI assistant for more.',
    action: { to: '/listings', label: 'Browse listings' },
  };
}

function TrackBand({ d }) {
  const { stats } = d;
  const step = nextStep(d);
  const waitingCount = stats.under_review + stats.pending;
  const stages = [
    { label: 'Find a listing', num: d.open_listings ?? '–', unit: 'open listings' },
    { label: 'Apply', num: stats.applications, unit: stats.applications === 1 ? 'application sent' : 'applications sent' },
    { label: 'Under review', num: waitingCount, unit: 'waiting on review' },
    { label: 'Endorsed', num: stats.endorsed, unit: stats.endorsed === 1 ? 'endorsement' : 'endorsements' },
  ];

  return (
    <section className="track-band" style={{ '--progress': step.current }}>
      <div className="track-top">
        <div className="track-text">
          <span className="track-hello">Welcome back, {d.user.name.split(' ')[0]}</span>
          <span className="track-eyebrow">Your next step</span>
          <h1>{step.headline}</h1>
          <p>{step.sub}</p>
        </div>
        <Link className="btn btn-accent" to={step.action.to}>{step.action.label}</Link>
      </div>

      <ol className="track">
        {stages.map((s, i) => {
          const state = i < step.current ? 'done' : i === step.current ? 'current' : 'todo';
          return (
            <li key={s.label} className={`stage ${state}`} style={{ '--i': i }}>
              <div className="stage-marker">
                <span className="stage-dot">{i + 1}</span>
                {i < stages.length - 1 && <span className="stage-line"><span /></span>}
              </div>
              <span className="stage-label">{s.label}</span>
              <span className="stage-count"><b>{s.num}</b>{s.unit}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api('/dashboard').then(setD).catch((e) => setError(e.message)); }, []);

  if (error) return <p className="err">{error}</p>;
  if (!d) return <p className="muted">Loading…</p>;
  const { user } = d;
  const isStudent = !user.role || user.role === 'student';
  const anyMatched = d.recommended.some((r) => r.matched?.length > 0);

  return (
    <>
      {isStudent ? (
        <TrackBand d={d} />
      ) : (
        <section className="track-band">
          <div className="track-text">
            <span className="track-hello">Welcome back</span>
            <h1>{user.name}</h1>
            <p>{ROLE_INTRO[user.role]}</p>
          </div>
        </section>
      )}

      <div className="two-col">
        <section className="card">
          <div className="card-head">
            <h3>Recommended internships</h3>
            {anyMatched && <span className="chip chip-gold">AI matched</span>}
          </div>
          {d.recommended.map((r) => {
            const why = matchSentence(r.matched);
            return (
              <Link className="rec-row" key={r.id} to={`/listings/${r.id}`}>
                <Monogram company={r.company} size={44} />
                <div className="rec-text">
                  <span className="rec-title">{r.title}</span>
                  <span className="rec-meta">{r.company}, {r.location}</span>
                  {why && <span className="rec-match">{why}</span>}
                </div>
                <span className="btn btn-text">View</span>
              </Link>
            );
          })}
        </section>

        <section className="card">
          <h3>Your applications</h3>
          {d.updates.length === 0 && (
            <p className="tip">No applications yet. Pick one of the recommended internships to get started.</p>
          )}
          {d.updates.map((u) => (
            <Link className="app-mini" key={u.internship_id} to={`/listings/${u.internship_id}`}>
              <div className="app-mini-head">
                <Monogram company={u.company} size={36} />
                <div className="app-mini-text"><b>{u.title}</b><span>{u.company}</span></div>
              </div>
              <div className="app-mini-progress">
                <MiniTrack status={u.status} />
                <span className={u.status === 'Endorsed' ? 'note-strong' : ''}>{statusNote(u.status, u.applied_at, u.updated_at, true)}</span>
              </div>
            </Link>
          ))}
          {d.updates.length > 0 && <Link className="btn btn-text btn-start" to="/applications">See all applications</Link>}
        </section>
      </div>
    </>
  );
}
