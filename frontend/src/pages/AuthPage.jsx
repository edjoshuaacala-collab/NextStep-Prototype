import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { PublicTopbar } from './Landing.jsx';
import { IconArrowLeft, IconEye, IconEyeOff, IconInfo } from '../components/Icons.jsx';

const PASSWORD = { name: 'password', label: 'Password (8+ characters, letters and numbers)', type: 'password', placeholder: '••••••••' };

const ROLES = {
  student: {
    label: 'Student',
    title: 'Student account',
    sub: 'Log in or sign up with your JRU student details.',
    loginEmail: 'School email',
    loginPlaceholder: 'name@jru.edu',
    registerTitle: 'Create a student account',
    fields: [
      { name: 'name', label: 'Full name', placeholder: 'Benedict Arrollado' },
      { name: 'student_number', label: 'Student number', placeholder: '00-000000' },
      { name: 'email', label: 'School email', type: 'email', placeholder: 'name@jru.edu' },
      PASSWORD,
    ],
    cta: 'Create account',
    demo: true,
  },
  faculty: {
    label: 'Faculty Member',
    title: 'Faculty account',
    sub: 'For internship coordinators and faculty advisers.',
    loginEmail: 'JRU email',
    loginPlaceholder: 'name@jru.edu',
    registerTitle: 'Create a faculty account',
    fields: [
      { name: 'name', label: 'Full name', placeholder: 'Maria Santos' },
      [
        { name: 'employee_id', label: 'Employee ID', placeholder: 'Employee number' },
        { name: 'email', label: 'JRU email', type: 'email', placeholder: 'name@jru.edu' },
      ],
      { name: 'position', label: 'Position', options: ['Internship Coordinator', 'Faculty Adviser'] },
      { name: 'department', label: 'Department', placeholder: 'e.g. Computer Science and Engineering' },
      PASSWORD,
    ],
    cta: 'Create account',
  },
  partner: {
    label: 'External Partner',
    title: 'Partner account',
    sub: 'For company representatives offering internships.',
    loginEmail: 'Work email',
    loginPlaceholder: 'name@company.com',
    registerTitle: 'Request a partner account',
    fields: [
      { name: 'name', label: 'Full name', placeholder: 'Juan Dela Cruz' },
      [
        { name: 'company_name', label: 'Company name', placeholder: 'Bluepeak Software Inc.' },
        { name: 'job_title', label: 'Job title', placeholder: 'HR Specialist' },
      ],
      [
        { name: 'email', label: 'Work email', type: 'email', placeholder: 'name@company.com' },
        { name: 'contact_number', label: 'Contact number', placeholder: '09XX XXX XXXX' },
      ],
      PASSWORD,
    ],
    cta: 'Submit for approval',
    note: 'Partner accounts are reviewed by the JRU internship office before you can post listings.',
  },
};

function Field({ label, error, options, ...props }) {
  // Password fields get a show/hide toggle.
  const [shown, setShown] = useState(false);
  const isPassword = props.type === 'password';
  return (
    <div className="field-wrap">
      <label className={`field${options ? ' has-select' : ''}${error ? ' field-error' : ''}`}>
        <span>{label}</span>
        {options ? (
          <select {...props}>
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : isPassword ? (
          <span className="field-input-row">
            <input {...props} type={shown ? 'text' : 'password'} />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShown((v) => !v)}
              aria-label={shown ? 'Hide password' : 'Show password'}
              aria-pressed={shown}
            >
              {shown ? <IconEyeOff size={20} /> : <IconEye size={20} />}
            </button>
          </span>
        ) : (
          <input {...props} />
        )}
      </label>
      {error && <em className="err">{error}</em>}
    </div>
  );
}

const emptyForm = (cfg) =>
  Object.fromEntries(cfg.fields.flat().map((f) => [f.name, f.options ? f.options[0] : '']));

// Keyed by role so switching between /login/student and /login/faculty
// starts with a fresh form instead of reusing the previous role's state.
export default function AuthPage() {
  const { role } = useParams();
  return <AuthForm key={role} role={role} />;
}

function AuthForm({ role }) {
  const cfg = ROLES[role];
  const { login, register } = useAuth();
  const [lf, setLf] = useState({ email: '', password: '' });
  const [rf, setRf] = useState(() => (cfg ? emptyForm(cfg) : {}));
  const [lerr, setLerr] = useState(null);
  const [rerr, setRerr] = useState({ message: null, errors: {} });
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!cfg) return <Navigate to="/login" replace />;

  const submitLogin = async (e) => {
    e.preventDefault(); setBusy(true); setLerr(null);
    try { await login(lf.email, lf.password, role); } catch (err) { setLerr(err.message); } finally { setBusy(false); }
  };
  const submitRegister = async (e) => {
    e.preventDefault(); setBusy(true); setRerr({ message: null, errors: {} }); setDone(null);
    try {
      const res = await register({ ...rf, role });
      if (res?.pending) { setDone(res.message); setRf(emptyForm(cfg)); }
    } catch (err) { setRerr({ message: err.message, errors: err.errors }); } finally { setBusy(false); }
  };
  const first = (k) => rerr.errors?.[k]?.[0];

  const renderField = (f) => (
    <Field
      key={f.name}
      label={f.label}
      type={f.type || 'text'}
      placeholder={f.placeholder}
      options={f.options}
      value={rf[f.name] ?? ''}
      error={first(f.name)}
      onChange={(e) => setRf({ ...rf, [f.name]: e.target.value })}
      required
    />
  );

  return (
    <div className="public">
      <PublicTopbar>
        <Link to="/login" className="topbar-link"><IconArrowLeft size={16} />Change role</Link>
      </PublicTopbar>

      <div className="public-body" style={{ gap: 32 }}>
        <section className="hero hero-full">
          <h1>{cfg.title}</h1>
          <p>{cfg.sub}</p>
        </section>

        <div className="auth-grid">
          <form className="card auth-card" onSubmit={submitLogin}>
            <h3>Log in</h3>
            <Field label={cfg.loginEmail} type="email" placeholder={cfg.loginPlaceholder} value={lf.email} onChange={(e) => setLf({ ...lf, email: e.target.value })} required />
            <Field label="Password" type="password" placeholder="••••••••" value={lf.password} onChange={(e) => setLf({ ...lf, password: e.target.value })} required />
            {lerr && <em className="err">{lerr}</em>}
            <button className="btn btn-filled btn-lg btn-block" disabled={busy}>Log in</button>
            {cfg.demo && <p className="demo">Demo account: <strong>alex@jru.edu</strong> / <strong>password123</strong></p>}
          </form>

          <form className="card auth-card" onSubmit={submitRegister}>
            <h3>{cfg.registerTitle}</h3>
            {cfg.fields.map((f, i) =>
              Array.isArray(f)
                ? <div className="field-row" key={i}>{f.map(renderField)}</div>
                : renderField(f),
            )}
            {rerr.message && !Object.keys(rerr.errors || {}).length && <em className="err">{rerr.message}</em>}
            {cfg.note && !done && <div className="notice"><IconInfo size={18} />{cfg.note}</div>}
            {done && <div className="notice notice-ok"><IconInfo size={18} />{done}</div>}
            <button className="btn btn-filled btn-lg btn-block" disabled={busy}>{cfg.cta}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
