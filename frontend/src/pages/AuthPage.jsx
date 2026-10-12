import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import Logo from '../components/Logo.jsx';

function Field({ label, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {error && <em className="err">{error}</em>}
    </label>
  );
}

export default function AuthPage() {
  const { login, register } = useAuth();
  const [lf, setLf] = useState({ email: '', password: '' });
  const [rf, setRf] = useState({ name: '', student_number: '', email: '', password: '' });
  const [lerr, setLerr] = useState(null);
  const [rerr, setRerr] = useState({ message: null, errors: {} });
  const [busy, setBusy] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault(); setBusy(true); setLerr(null);
    try { await login(lf.email, lf.password); } catch (err) { setLerr(err.message); } finally { setBusy(false); }
  };
  const submitRegister = async (e) => {
    e.preventDefault(); setBusy(true); setRerr({ message: null, errors: {} });
    try { await register(rf); } catch (err) { setRerr({ message: err.message, errors: err.errors }); } finally { setBusy(false); }
  };
  const first = (k) => rerr.errors?.[k]?.[0];

  return (
    <div className="auth-page">
      <Logo dark size={34} />
      <h1>Welcome to NextStep</h1>
      <p className="muted">Jose Rizal University internship and linkages platform</p>
      <div className="auth-grid">
        <form className="card" onSubmit={submitLogin}>
          <h2>Log in</h2>
          <Field label="Email" type="email" placeholder="name@jru.edu" value={lf.email} onChange={(e) => setLf({ ...lf, email: e.target.value })} required />
          <Field label="Password" type="password" placeholder="••••••••" value={lf.password} onChange={(e) => setLf({ ...lf, password: e.target.value })} required />
          {lerr && <em className="err">{lerr}</em>}
          <button className="btn btn-navy btn-block" disabled={busy}>Log in</button>
          <p className="muted small">Demo account: <strong>alex@jru.edu</strong> / <strong>password123</strong></p>
        </form>
        <form className="card" onSubmit={submitRegister}>
          <h2>Create a student account</h2>
          <Field label="Full name" placeholder="Alex Rivera" value={rf.name} error={first('name')} onChange={(e) => setRf({ ...rf, name: e.target.value })} required />
          <Field label="Student number" placeholder="2023-00000" value={rf.student_number} error={first('student_number')} onChange={(e) => setRf({ ...rf, student_number: e.target.value })} required />
          <Field label="School email" type="email" placeholder="name@jru.edu" value={rf.email} error={first('email')} onChange={(e) => setRf({ ...rf, email: e.target.value })} required />
          <Field label="Password (8+ characters, letters and numbers)" type="password" placeholder="••••••••" value={rf.password} error={first('password')} onChange={(e) => setRf({ ...rf, password: e.target.value })} required />
          {rerr.message && !Object.keys(rerr.errors || {}).length && <em className="err">{rerr.message}</em>}
          <button className="btn btn-gold btn-block" disabled={busy}>Create account</button>
        </form>
      </div>
    </div>
  );
}
