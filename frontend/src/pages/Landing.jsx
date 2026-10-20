import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { IconBuilding, IconCheck, IconClipboard, IconGradCap } from '../components/Icons.jsx';

const JOURNEY = ['Find a listing', 'Apply', 'Get endorsed', 'Render OJT hours'];

const ROLES = [
  {
    key: 'student',
    title: 'Student',
    icon: IconGradCap,
    desc: 'For JRU students looking for internship placements.',
    features: ['Browse and filter internship listings', 'Get AI-assisted internship matches', 'Apply and track your application status'],
    cta: 'Continue as Student',
  },
  {
    key: 'faculty',
    title: 'Faculty Member',
    icon: IconClipboard,
    desc: 'For internship coordinators and faculty advisers.',
    features: ['Monitor student applications', 'Track requirements and endorsements', 'Post job fairs and career events'],
    cta: 'Continue as Faculty',
  },
  {
    key: 'partner',
    title: 'External Partner',
    icon: IconBuilding,
    desc: 'For company representatives offering internships.',
    features: ['Post internship opportunities', 'Review student applicants', 'Join job fairs and career events'],
    cta: 'Continue as Partner',
  },
];

export function PublicTopbar({ children }) {
  return (
    <header className="topbar topbar-public">
      <Link to="/login" aria-label="NextStep home" style={{ textDecoration: 'none' }}><Logo /></Link>
      {children}
    </header>
  );
}

export default function Landing() {
  return (
    <div className="public">
      <PublicTopbar>
        <span className="topbar-link">Jose Rizal University</span>
      </PublicTopbar>

      <div className="public-body">
        <section className="hero hero-full hero-xl">
          <h1>Welcome to NextStep</h1>
          <p>Find internships, track your applications, and connect with partner companies, all in one place for the Jose Rizal University community.</p>
          <ol className="track-preview" aria-label="How NextStep works">
            {JOURNEY.map((step, i) => (
              <li key={step} className={i === JOURNEY.length - 1 ? 'next' : ''}>
                <span className="tp-dot">{i + 1}</span>
                <span className="tp-label">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="center-head">
          <h2>Choose your role</h2>
          <p className="muted" style={{ fontSize: 15 }}>Pick how you will use NextStep to get started.</p>
        </div>

        <div className="role-grid">
          {ROLES.map(({ key, title, icon: Icon, desc, features, cta }) => (
            <article className="role-card" key={key}>
              <span className="role-icon"><Icon size={26} /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <ul className="feature-list">
                {features.map((f) => (
                  <li key={f}><span className="check"><IconCheck size={12} strokeWidth={3} /></span>{f}</li>
                ))}
              </ul>
              <Link to={`/login/${key}`} className="btn btn-filled btn-lg btn-block">{cta}</Link>
            </article>
          ))}
        </div>

        <p className="footnote">Already have an account? Pick your role to log in.</p>
      </div>
    </div>
  );
}
