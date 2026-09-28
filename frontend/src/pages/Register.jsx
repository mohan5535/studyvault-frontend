import { Link, useNavigate } from "react-router-dom";
import { BookOpen, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { await register(form.name,form.email,form.password); navigate("/login"); }
    catch(err){setError(err.message)} finally{setBusy(false)}
  }
  return (
    <div className="auth-layout">
      <section className="auth-visual">
        <div className="visual-glow" />
        <div className="auth-brand"><div className="brand-mark"><BookOpen/></div><b>StudyVault</b></div>
        <div className="visual-copy"><span className="eyebrow">BUILD YOUR LIBRARY</span><h1>Turn scattered links into a <em>personal vault.</em></h1><p>Save what you learn, find it faster, and keep your study flow organized.</p></div>
      </section>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <div className="form-icon"><UserPlus size={20}/></div><span className="eyebrow">GET STARTED</span><h2>Create your account</h2><p className="muted">A simple workspace for your learning resources.</p>
          {error && <div className="alert">{error}</div>}
          <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required/></label>
          <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label>
          <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Minimum 8 characters" minLength="8" required/></label>
          <button className="primary-btn" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
          <p className="switch-auth">Already registered? <Link to="/login">Sign in</Link></p>
        </form>
      </section>
    </div>
  );
}