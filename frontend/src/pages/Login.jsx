import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { await login(form.email, form.password); navigate("/dashboard"); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-layout">
      <section className="auth-visual">
        <div className="visual-glow" />
        <div className="auth-brand"><div className="brand-mark"><BookOpen/></div><b>StudyVault</b></div>
        <div className="visual-copy">
          <span className="eyebrow">YOUR LEARNING, ORGANIZED</span>
          <h1>Keep every useful resource <em>within reach.</em></h1>
          <p>Save courses, documentation, videos and articles in one focused workspace built for students.</p>
          <div className="mini-stats"><span><b>1 place</b> for your resources</span><span><b>Fast search</b> when you need it</span></div>
        </div>
      </section>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <div className="form-icon"><LockKeyhole size={20}/></div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to StudyVault</h2>
          <p className="muted">Continue where you left off.</p>
          {error && <div className="alert">{error}</div>}
          <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label>
          <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required/></label>
          <button className="primary-btn" disabled={busy}>{busy ? "Signing in..." : <>Sign in <ArrowRight size={17}/></>}</button>
          <p className="switch-auth">Don't have an account? <Link to="/register">Create one</Link></p>
        </form>
      </section>
    </div>
  );
}