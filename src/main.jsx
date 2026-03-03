import { useState, useRef, useEffect } from "react";

const SUPA_URL = "https://oukvhnkrenmutwfamyuu.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91a3ZobmtyZW5tdXR3ZmFteXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTI1NjgsImV4cCI6MjA4ODA2ODU2OH0.Sd3srM-NGDq3GpiiRBMF80YszzhA6GbjdJypvRTNvUY";

const supa = {
  h: (token) => ({ "Content-Type": "application/json", "apikey": SUPA_KEY, "Authorization": `Bearer ${token || SUPA_KEY}`, "Prefer": "return=representation" }),
  async signUp(email, password, name) { const r = await fetch(`${SUPA_URL}/auth/v1/signup`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPA_KEY }, body: JSON.stringify({ email, password, data: { full_name: name } }) }); return r.json(); },
  async signIn(email, password) { const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPA_KEY }, body: JSON.stringify({ email, password }) }); return r.json(); },
  async signOut(token) { await fetch(`${SUPA_URL}/auth/v1/logout`, { method: "POST", headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${token}` } }); },
  async getTasks(userId, token) { const r = await fetch(`${SUPA_URL}/rest/v1/tasks?user_id=eq.${userId}&order=created_at.asc`, { headers: supa.h(token) }); return r.json(); },
  async addTask(task, token) { const r = await fetch(`${SUPA_URL}/rest/v1/tasks`, { method: "POST", headers: supa.h(token), body: JSON.stringify(task) }); const d = await r.json(); return Array.isArray(d) ? d[0] : d; },
  async updateTask(id, updates, token) { await fetch(`${SUPA_URL}/rest/v1/tasks?id=eq.${id}`, { method: "PATCH", headers: supa.h(token), body: JSON.stringify(updates) }); },
  async deleteTask(id, token) { await fetch(`${SUPA_URL}/rest/v1/tasks?id=eq.${id}`, { method: "DELETE", headers: supa.h(token) }); },
  async getSub(userId, token) { const r = await fetch(`${SUPA_URL}/rest/v1/subscriptions?user_id=eq.${userId}`, { headers: supa.h(token) }); const d = await r.json(); return Array.isArray(d) ? d[0] : null; },
  async upsertSub(sub, token) { await fetch(`${SUPA_URL}/rest/v1/subscriptions`, { method: "POST", headers: { ...supa.h(token), "Prefer": "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(sub) }); }
};

const PLANS = {
  free: { id: "free", label: "Free Trial", badge: null, priceMonth: 0, priceYear: 0, color: "#7C9A8A", description: "Get started with the basics", features: ["Up to 5 tasks", "2 categories", "Basic priority labels", "No AI Coach"], limits: { maxTasks: 5, aiMessages: 0, categories: ["Work", "Personal"], analytics: false } },
  recommended: { id: "recommended", label: "Recommended", badge: "MOST POPULAR", priceMonth: 7, priceYear: 75, color: "#C9914A", description: "For people serious about their time", features: ["Unlimited tasks", "All 5 categories", "AI Coach (20 msg/day)", "Time estimates & tracking"], limits: { maxTasks: Infinity, aiMessages: 20, categories: ["Work", "Personal", "Health", "Learning", "Other"], analytics: false } },
  premium: { id: "premium", label: "Premium", badge: "BEST VALUE", priceMonth: 12, priceYear: 120, color: "#5A8FC9", description: "The complete productivity system", features: ["Everything in Recommended", "Unlimited AI Coach", "Analytics dashboard", "Export to CSV"], limits: { maxTasks: Infinity, aiMessages: Infinity, categories: ["Work", "Personal", "Health", "Learning", "Other"], analytics: true } }
};

const PRIORITIES = ["High", "Medium", "Low"];
const priorityColor = { High: "#C94A4A", Medium: "#C9914A", Low: "#7C9A8A" };
const catIcon = { Work: "◈", Personal: "⌂", Health: "✦", Learning: "◉", Other: "◇" };
const fmt = (min) => { if (!min) return ""; if (min < 60) return `${min}m`; return `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ""}`; };

function Landing({ onGetStarted }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0D0F14", color: "#E8E2D9", fontFamily: "Georgia,serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}} .f1{animation:fadeUp .7s ease both} .f2{animation:fadeUp .7s .12s ease both} .f3{animation:fadeUp .7s .24s ease both} .f4{animation:fadeUp .7s .36s ease both} .hbtn:hover{background:#F0DDA8!important;transform:translateY(-2px)} .fc:hover{border-color:#C9914A!important;transform:translateY(-3px)} *{box-sizing:border-box}`}</style>
      <nav style={{ padding: "22px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1E2230" }}>
        <div><span style={{ fontSize: 11, letterSpacing: 6, color: "#C9914A", fontFamily: "monospace" }}>TASK</span><span style={{ fontSize: 11, letterSpacing: 6, color: "#5A8FC9", fontFamily: "monospace" }}>MAX</span></div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={onGetStarted} style={{ background: "none", border: "none", color: "#9B9488", cursor: "pointer", fontSize: 13, fontFamily: "Georgia,serif" }}>Sign In</button>
          <button onClick={onGetStarted} className="hbtn" style={{ padding: "10px 22px", background: "#C9914A", color: "#0D0F14", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "Georgia,serif", fontWeight: 700, transition: "all .2s" }}>Get Started Free</button>
        </div>
      </nav>
      <div style={{ textAlign: "center", padding: "80px 24px 60px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,#1a1e2e,transparent 65%)", pointerEvents: "none" }} />
        <div className="f1" style={{ fontSize: 10, letterSpacing: 8, color: "#C9914A", marginBottom: 24, fontFamily: "monospace" }}>AI-POWERED PRODUCTIVITY</div>
        <h1 className="f2" style={{ fontSize: "clamp(38px,6vw,76px)", fontWeight: 400, lineHeight: 1.05, margin: "0 0 22px", letterSpacing: -2 }}>Stop losing time.<br /><em style={{ color: "#C9914A" }}>Start owning it.</em></h1>
        <p className="f3" style={{ fontSize: 17, color: "#9B9488", maxWidth: 460, margin: "0 auto 38px", lineHeight: 1.7 }}>TaskMax uses Claude AI to help you plan, prioritize, and execute — so every hour counts.</p>
        <div className="f4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onGetStarted} className="hbtn" style={{ padding: "14px 32px", background: "#C9914A", color: "#0D0F14", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 15, fontFamily: "Georgia,serif", fontWeight: 700, transition: "all .2s" }}>Start Free Trial →</button>
          <button onClick={onGetStarted} style={{ padding: "14px 32px", background: "transparent", color: "#E8E2D9", border: "1px solid #2E3244", borderRadius: 4, cursor: "pointer", fontSize: 15, fontFamily: "Georgia,serif" }}>View Plans</button>
        </div>
      </div>
      <div style={{ padding: "20px 40px 80px", maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
        {[{ icon: "◈", title: "Smart Prioritization", desc: "AI ranks tasks by urgency and impact." }, { icon: "⏱", title: "Time Awareness", desc: "See your real daily capacity." }, { icon: "✦", title: "AI Daily Planning", desc: "Claude builds your perfect day." }, { icon: "◉", title: "Progress Analytics", desc: "Understand your productivity patterns." }].map(f => (
          <div key={f.title} className="fc" style={{ padding: "22px 18px", background: "#111420", border: "1px solid #1E2230", borderRadius: 8, transition: "all .22s" }}>
            <div style={{ fontSize: 20, color: "#C9914A", marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "#F0EAE0" }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "#6B6E7A", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Auth({ onAuth, onBack }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    if (mode === "signup" && !form.name) return setError("Please enter your name.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      if (mode === "signup") {
        const data = await supa.signUp(form.email, form.password, form.name);
        if (data.error) return setError(data.error.message);
        if (data.access_token) { onAuth({ id: data.user.id, email: form.email, name: form.name, token: data.access_token }, "pricing"); }
        else { setError("Account created! Please check your email to confirm, then sign in."); }
      } else {
        const data = await supa.signIn(form.email, form.password);
        if (data.error) return setError(data.error.message);
        const name = data.user?.user_metadata?.full_name || form.email.split("@")[0];
        const sub = await supa.getSub(data.user.id, data.access_token);
        onAuth({ id: data.user.id, email: form.email, name, token: data.access_token }, sub?.plan ? "app" : "pricing", sub?.plan, sub?.billing);
      }
    } catch (e) { setError("Network error: " + e.message); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0D0F14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif", padding: 24 }}>
      <style>{`*{box-sizing:border-box} .ai:focus{border-color:#C9914A!important;outline:none}`}</style>
      <button onClick={onBack} style={{ position: "absolute", top: 24, left: 28, background: "none", border: "none", color: "#6B6E7A", cursor: "pointer", fontSize: 13, fontFamily: "Georgia,serif" }}>← Back</button>
      <div style={{ fontSize: 10, letterSpacing: 8, color: "#C9914A", marginBottom: 32, fontFamily: "monospace" }}>TASKMAX</div>
      <div style={{ background: "#111420", border: "1px solid #1E2230", borderRadius: 10, padding: "40px 36px", width: "100%", maxWidth: 400 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 400, color: "#F0EAE0" }}>{mode === "signup" ? "Create account" : "Welcome back"}</h2>
        <p style={{ margin: "0 0 26px", color: "#6B6E7A", fontSize: 13 }}>{mode === "signup" ? "Start free — no credit card needed." : "Sign in to continue."}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {mode === "signup" && <input className="ai" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ padding: "11px 14px", background: "#0D0F14", border: "1px solid #2E3244", borderRadius: 6, color: "#E8E2D9", fontFamily: "Georgia,serif", fontSize: 14, transition: "border-color .2s" }} />}
          <input className="ai" placeholder="Email address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ padding: "11px 14px", background: "#0D0F14", border: "1px solid #2E3244", borderRadius: 6, color: "#E8E2D9", fontFamily: "Georgia,serif", fontSize: 14, transition: "border-color .2s" }} />
          <input className="ai" placeholder="Password (min 6 chars)" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && submit()} style={{ padding: "11px 14px", background: "#0D0F14", border: "1px solid #2E3244", borderRadius: 6, color: "#E8E2D9", fontFamily: "Georgia,serif", fontSize: 14, transition: "border-color .2s" }} />
        </div>
        {error && <div style={{ color: "#C94A4A", fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 18, padding: "13px", background: "#C9914A", color: "#0D0F14", border: "none", borderRadius: 6, cursor: loading ? "default" : "pointer", fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Please wait…" : mode === "signup" ? "Create Account →" : "Sign In →"}
        </button>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "#6B6E7A" }}>
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <span onClick={() => { setMode(m => m === "signup" ? "signin" : "signup"); setError(""); }} style={{ color: "#C9914A", cursor: "pointer", textDecoration: "underline" }}>
            {mode === "signup" ? "Sign in" : "Create a free account"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Pricing({ user, onSelectPlan }) {
  const [billing, setBilling] = useState("month");
  const [loading, setLoading] = useState(null);
  const selectPlan = async (planId) => {
    setLoading(planId);
    await supa.upsertSub({ user_id: user.id, plan: planId, billing }, user.token);
    setLoading(null);
    onSelectPlan(planId, billing);
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0D0F14", color: "#E8E2D9", fontFamily: "Georgia,serif", padding: "48px 20px" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}} .pc{animation:fadeUp .5s ease both;transition:transform .2s} .pc:hover{transform:translateY(-5px)} *{box-sizing:border-box}`}</style>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#C9914A", marginBottom: 12, fontFamily: "monospace" }}>CHOOSE YOUR PLAN</div>
        <h2 style={{ fontSize: "clamp(26px,4vw,46px)", fontWeight: 400, margin: "0 0 10px", letterSpacing: -1 }}>Invest in your time.</h2>
        <p style={{ color: "#6B6E7A", fontSize: 14, marginBottom: 28 }}>Hi {user.name?.split(" ")[0]}! Pick the plan that fits you.</p>
        <div style={{ display: "inline-flex", background: "#111420", border: "1px solid #1E2230", borderRadius: 28, padding: 4 }}>
          {["month", "year"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ padding: "7px 18px", borderRadius: 22, border: "none", background: billing === b ? "#C9914A" : "transparent", color: billing === b ? "#0D0F14" : "#6B6E7A", fontFamily: "Georgia,serif", fontSize: 13, cursor: "pointer", fontWeight: billing === b ? 700 : 400, transition: "all .2s" }}>
              {b === "month" ? "Monthly" : "Yearly 💰"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, maxWidth: 940, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
        {Object.values(PLANS).map((plan, i) => {
          const price = billing === "month" ? plan.priceMonth : plan.priceYear;
          return (
            <div key={plan.id} className="pc" style={{ flex: "1 1 255px", maxWidth: 295, background: plan.id === "recommended" ? "#141A28" : "#111420", border: `1.5px solid ${plan.id === "recommended" ? "#C9914A" : "#1E2230"}`, borderRadius: 12, padding: "26px 22px", display: "flex", flexDirection: "column", animationDelay: `${i * 0.1}s`, position: "relative" }}>
              {plan.badge && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#0D0F14", fontSize: 9, letterSpacing: 2, padding: "3px 12px", borderRadius: 20, fontFamily: "monospace", fontWeight: 700, whiteSpace: "nowrap" }}>{plan.badge}</div>}
              <div style={{ fontSize: 10, letterSpacing: 3, color: plan.color, marginBottom: 8, fontFamily: "monospace" }}>{plan.label.toUpperCase()}</div>
              <div style={{ fontSize: 34, fontWeight: 400, color: "#F0EAE0", letterSpacing: -1, marginBottom: 3 }}>{price === 0 ? "Free" : `$${price}`}{price > 0 && <span style={{ fontSize: 13, color: "#6B6E7A" }}>/{billing === "month" ? "mo" : "yr"}</span>}</div>
              {billing === "year" && price > 0 && <div style={{ fontSize: 11, color: "#7C9A8A", marginBottom: 4 }}>≈ ${(price / 12).toFixed(2)}/mo</div>}
              <div style={{ fontSize: 12, color: "#6B6E7A", marginBottom: 18, lineHeight: 1.5 }}>{plan.description}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
                {plan.features.map(f => <div key={f} style={{ display: "flex", gap: 8, fontSize: 12, color: "#B0A898" }}><span style={{ color: plan.color, flexShrink: 0 }}>✓</span>{f}</div>)}
              </div>
              <button onClick={() => selectPlan(plan.id)} disabled={loading === plan.id} style={{ padding: "11px", background: plan.id === "recommended" ? "#C9914A" : plan.id === "premium" ? "#5A8FC9" : "#2E3244", color: plan.id === "free" ? "#B0A898" : "#0D0F14", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, opacity: loading === plan.id ? 0.6 : 1 }}>
                {loading === plan.id ? "Saving…" : plan.id === "free" ? "Start Free" : `Choose ${plan.label} →`}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 32, fontSize: 11, color: "#3E4154" }}>🔒 Cancel anytime · No hidden fees</div>
    </div>
  );
}

function TaskApp({ user, plan, onUpgrade, onSignOut }) {
  const planData = PLANS[plan];
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", category: planData.limits.categories[0], priority: "Medium", estimated_min: "" });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [aiChat, setAiChat] = useState([{ role: "assistant", text: `Welcome, ${user.name?.split(" ")[0]}! I'm your AI productivity coach. Ask me anything — daily planning, priorities, or focus tips!` }]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCount, setAiCount] = useState(0);
  const [panel, setPanel] = useState("tasks");
  const [banner, setBanner] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => { supa.getTasks(user.id, user.token).then(d => { setTasks(Array.isArray(d) ? d : []); setLoading(false); }); }, []);
  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiChat]);

  const canAdd = tasks.length < planData.limits.maxTasks;
  const canAI = planData.limits.aiMessages === Infinity || aiCount < planData.limits.aiMessages;
  const done = tasks.filter(t => t.done);
  const progress = tasks.length ? (done.length / tasks.length) * 100 : 0;
  const pendingMin = tasks.filter(t => !t.done).reduce((a, t) => a + (t.estimated_min || 0), 0);
  const filtered = tasks.filter(t => filter === "All" ? true : filter === "Done" ? t.done : filter === "Active" ? !t.done : t.category === filter);

  const addTask = async () => {
    if (!form.title.trim()) return;
    if (!canAdd) { setBanner(true); return; }
    const t = { user_id: user.id, title: form.title, category: form.category, priority: form.priority, estimated_min: Number(form.estimated_min) || 0, done: false };
    const saved = await supa.addTask(t, user.token);
    if (saved?.id) setTasks(ts => [...ts, saved]);
    setForm(f => ({ ...f, title: "", estimated_min: "" }));
    setShowForm(false);
  };
  const toggle = async (id, cur) => { await supa.updateTask(id, { done: !cur }, user.token); setTasks(ts => ts.map(x => x.id === id ? { ...x, done: !cur } : x)); };
  const del = async (id) => { await supa.deleteTask(id, user.token); setTasks(ts => ts.filter(x => x.id !== id)); };

  const askAI = async () => {
    if (!aiInput.trim() || aiLoading || !canAI) return;
    const msg = aiInput.trim(); setAiInput("");
    setAiChat(c => [...c, { role: "user", text: msg }]); setAiCount(n => n + 1); setAiLoading(true);
    const summary = tasks.map(t => `- "${t.title}" [${t.category}, ${t.priority}, ${fmt(t.estimated_min) || "no time"}, ${t.done ? "DONE" : "pending"}]`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `You are a sharp productivity coach in TaskMax. User: ${user.name}.\nTasks:\n${summary || "None yet."}\nPending: ${fmt(pendingMin)}. Done: ${done.length}/${tasks.length}.\nBe concise (max 120 words), warm, actionable.`, messages: [...aiChat.slice(1).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })), { role: "user", content: msg }] }) });
      const d = await res.json();
      setAiChat(c => [...c, { role: "assistant", text: d.content?.map(b => b.text).join("") || "Try again." }]);
    } catch { setAiChat(c => [...c, { role: "assistant", text: "Connection error. Try again." }]); }
    setAiLoading(false);
  };

  const exportCSV = () => {
    const rows = [["Title","Category","Priority","Est.Time","Status"], ...tasks.map(t=>[t.title,t.category,t.priority,fmt(t.estimated_min)||"",t.done?"Done":"Pending"])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"})); a.download="taskmax.csv"; a.click();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0D0F14", color: "#E8E2D9", fontFamily: "Georgia,serif", overflow: "hidden" }}>
      <style>{`.tsk:hover{border-color:#2E3244!important} *{box-sizing:border-box} input::placeholder{color:#4E5168} select option{background:#111420}`}</style>
      <div style={{ display: "flex", alignItems: "center", padding: "0 18px", borderBottom: "1px solid #1E2230", height: 50, gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: 4, fontFamily: "monospace", color: "#C9914A" }}>TASK</span><span style={{ fontSize: 10, letterSpacing: 4, fontFamily: "monospace", color: "#5A8FC9" }}>MAX</span>
          <span style={{ fontSize: 9, background: planData.color + "25", color: planData.color, padding: "2px 7px", borderRadius: 10, letterSpacing: 1, fontFamily: "monospace" }}>{planData.label.toUpperCase()}</span>
          <span style={{ fontSize: 11, color: "#3E4154", marginLeft: 4 }}>Hi, {user.name?.split(" ")[0]} 👋</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 60, height: 3, background: "#1E2230", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${progress}%`, background: "#7C9A8A", transition: "width .5s" }} /></div>
          <span style={{ fontSize: 10, color: "#4E5168", fontFamily: "monospace" }}>{done.length}/{tasks.length}</span>
          {planData.limits.analytics && <button onClick={exportCSV} style={{ padding: "4px 10px", background: "#111420", border: "1px solid #1E2230", borderRadius: 4, color: "#6B6E7A", cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif" }}>CSV</button>}
          <button onClick={onUpgrade} style={{ padding: "4px 10px", background: "#111420", border: "1px solid #1E2230", borderRadius: 4, color: "#C9914A", cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif" }}>Upgrade</button>
          <button onClick={onSignOut} style={{ padding: "4px 10px", background: "transparent", border: "1px solid #1E2230", borderRadius: 4, color: "#4E5168", cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif" }}>Sign Out</button>
        </div>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #1E2230", flexShrink: 0 }}>
        {[{ key: "tasks", label: "Tasks" }, { key: "ai", label: plan === "free" ? "AI Coach 🔒" : "AI Coach" }, ...(planData.limits.analytics ? [{ key: "analytics", label: "Analytics" }] : [])].map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)} style={{ padding: "11px 18px", background: "none", border: "none", borderBottom: `2px solid ${panel === p.key ? "#C9914A" : "transparent"}`, color: panel === p.key ? "#C9914A" : "#4E5168", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13, transition: "all .2s" }}>{p.label}</button>
        ))}
        {pendingMin > 0 && <div style={{ marginLeft: "auto", padding: "11px 16px", fontSize: 11, color: "#4E5168", fontFamily: "monospace", display: "flex", alignItems: "center" }}>⏱ {fmt(pendingMin)} left</div>}
      </div>
      {banner && <div style={{ background: "#1A1420", borderBottom: "1px solid #C9914A40", padding: "9px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, flexShrink: 0 }}>
        <span style={{ color: "#B0A898" }}>🔒 This feature requires an upgrade.</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onUpgrade} style={{ padding: "5px 12px", background: "#C9914A", color: "#0D0F14", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "Georgia,serif", fontWeight: 700 }}>Upgrade</button>
          <button onClick={() => setBanner(false)} style={{ background: "none", border: "none", color: "#4E5168", cursor: "pointer", fontSize: 15 }}>×</button>
        </div>
      </div>}
      {panel === "tasks" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", "Active", "Done", ...planData.limits.categories].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 12px", borderRadius: 16, border: "1px solid", borderColor: filter === f ? "#C9914A" : "#1E2230", background: filter === f ? "#C9914A15" : "transparent", color: filter === f ? "#C9914A" : "#4E5168", fontSize: 11, cursor: "pointer", fontFamily: "Georgia,serif", transition: "all .2s" }}>{f}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {loading ? <div style={{ textAlign: "center", padding: "48px", color: "#3E4154" }}>Loading your tasks…</div> :
              filtered.length === 0 ? <div style={{ textAlign: "center", padding: "48px", color: "#3E4154", fontStyle: "italic" }}>No tasks here. Add one below!</div> :
                filtered.map(task => (
                  <div key={task.id} className="tsk" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#111420", border: "1px solid #1A1D28", borderRadius: 8, transition: "border-color .2s", opacity: task.done ? 0.6 : 1 }}>
                    <button onClick={() => toggle(task.id, task.done)} style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${task.done ? "#7C9A8A" : "#2E3244"}`, background: task.done ? "#7C9A8A" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
                      {task.done && <span style={{ color: "#0D0F14", fontSize: 11 }}>✓</span>}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: task.done ? "#4E5168" : "#E8E2D9", textDecoration: task.done ? "line-through" : "none", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                      <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#4E5168" }}>
                        <span>{catIcon[task.category]} {task.category}</span>
                        <span style={{ color: priorityColor[task.priority] }}>● {task.priority}</span>
                        {task.estimated_min > 0 && <span>⏱ {fmt(task.estimated_min)}</span>}
                      </div>
                    </div>
                    <button onClick={() => del(task.id)} style={{ background: "none", border: "none", color: "#2E3244", cursor: "pointer", fontSize: 17, padding: "0 4px" }}>×</button>
                  </div>
                ))}
          </div>
          {!showForm ? (
            <button onClick={() => canAdd ? setShowForm(true) : setBanner(true)} style={{ padding: "13px", border: "1.5px dashed #1E2230", borderRadius: 8, background: "transparent", cursor: "pointer", color: "#3E4154", fontSize: 13, fontFamily: "Georgia,serif" }}>
              + Add task{!canAdd ? ` (limit: ${planData.limits.maxTasks})` : ""}
            </button>
          ) : (
            <div style={{ background: "#111420", border: "1px solid #2E3244", borderRadius: 8, padding: "16px" }}>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="What needs to be done?" autoFocus style={{ width: "100%", padding: "8px 0", background: "transparent", border: "none", borderBottom: "1px solid #2E3244", color: "#E8E2D9", fontFamily: "Georgia,serif", fontSize: 14, marginBottom: 12, outline: "none" }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ flex: 1, minWidth: 90, padding: "7px 8px", background: "#0D0F14", border: "1px solid #2E3244", borderRadius: 5, color: "#B0A898", fontFamily: "Georgia,serif", fontSize: 12 }}>{planData.limits.categories.map(c => <option key={c}>{c}</option>)}</select>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ flex: 1, minWidth: 90, padding: "7px 8px", background: "#0D0F14", border: "1px solid #2E3244", borderRadius: 5, color: "#B0A898", fontFamily: "Georgia,serif", fontSize: 12 }}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select>
                <input value={form.estimated_min} onChange={e => setForm(f => ({ ...f, estimated_min: e.target.value }))} placeholder="mins" type="number" style={{ width: 70, padding: "7px 8px", background: "#0D0F14", border: "1px solid #2E3244", borderRadius: 5, color: "#B0A898", fontFamily: "Georgia,serif", fontSize: 12 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addTask} style={{ flex: 1, padding: "9px", background: "#C9914A", color: "#0D0F14", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700 }}>Add Task</button>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 14px", background: "transparent", color: "#4E5168", border: "1px solid #1E2230", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
      {panel === "ai" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {plan === "free" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>✦</div>
              <h3 style={{ margin: "0 0 10px", fontWeight: 400, fontSize: 20, color: "#C9914A" }}>AI Coach is a paid feature</h3>
              <p style={{ color: "#6B6E7A", maxWidth: 300, lineHeight: 1.7, marginBottom: 22 }}>Upgrade to unlock your personal AI coach powered by Claude.</p>
              <button onClick={onUpgrade} style={{ padding: "12px 26px", background: "#C9914A", color: "#0D0F14", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700 }}>View Plans →</button>
            </div>
          ) : (
            <>
              {planData.limits.aiMessages !== Infinity && <div style={{ padding: "6px 16px", background: "#111420", fontSize: 11, color: "#4E5168", fontFamily: "monospace", borderBottom: "1px solid #1E2230" }}>{aiCount}/{planData.limits.aiMessages} msgs used{!canAI && <span style={{ color: "#C94A4A", marginLeft: 8 }}>— Upgrade for unlimited</span>}</div>}
              <div style={{ padding: "8px 14px", display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid #1E2230", flexShrink: 0 }}>
                {["Plan my day", "What's most urgent?", "How long until I'm free?", "Help me focus"].map(p => <button key={p} onClick={() => setAiInput(p)} style={{ padding: "4px 10px", background: "#111420", border: "1px solid #1E2230", borderRadius: 12, color: "#6B6E7A", fontSize: 11, cursor: "pointer", fontFamily: "Georgia,serif" }}>{p}</button>)}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {aiChat.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "#C9914A" : "#111420", color: msg.role === "user" ? "#0D0F14" : "#C8C2B8", fontSize: 13, lineHeight: 1.7, fontFamily: "Georgia,serif", whiteSpace: "pre-wrap", border: msg.role === "assistant" ? "1px solid #1E2230" : "none" }}>{msg.text}</div>
                  </div>
                ))}
                {aiLoading && <div style={{ display: "flex" }}><div style={{ padding: "10px 14px", background: "#111420", border: "1px solid #1E2230", borderRadius: "16px 16px 16px 4px", color: "#3E4154", fontSize: 13 }}>Thinking…</div></div>}
                <div ref={chatRef} />
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid #1E2230", display: "flex", gap: 8, flexShrink: 0 }}>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()} disabled={!canAI} placeholder={canAI ? "Ask your coach..." : "Limit reached — upgrade"} style={{ flex: 1, padding: "10px 14px", background: "#111420", border: "1px solid #2E3244", borderRadius: 22, color: "#E8E2D9", fontFamily: "Georgia,serif", fontSize: 13, outline: "none" }} />
                <button onClick={askAI} disabled={aiLoading || !canAI} style={{ width: 38, height: 38, borderRadius: "50%", background: canAI && !aiLoading ? "#C9914A" : "#1E2230", border: "none", cursor: "pointer", fontSize: 15, color: "#0D0F14", flexShrink: 0 }}>↑</button>
              </div>
            </>
          )}
        </div>
      )}
      {panel === "analytics" && (
        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#5A8FC9", fontFamily: "monospace", marginBottom: 18 }}>ANALYTICS DASHBOARD</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[{ label: "Completion", value: `${tasks.length ? Math.round((done.length / tasks.length) * 100) : 0}%`, color: "#7C9A8A" }, { label: "Time Done", value: fmt(done.reduce((a, t) => a + (t.estimated_min || 0), 0)) || "0m", color: "#C9914A" }, { label: "Done", value: done.length, color: "#5A8FC9" }, { label: "Pending", value: tasks.filter(t => !t.done).length, color: "#C94A4A" }].map(s => (
              <div key={s.label} style={{ background: "#111420", border: "1px solid #1E2230", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#4E5168", letterSpacing: 2, marginTop: 4, fontFamily: "monospace" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {planData.limits.categories.map(cat => {
            const ct = tasks.filter(t => t.category === cat);
            const cd = ct.filter(t => t.done).length;
            if (!ct.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9B9488", marginBottom: 4 }}><span>{catIcon[cat]} {cat}</span><span>{cd}/{ct.length}</span></div>
                <div style={{ height: 4, background: "#1E2230", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${ct.length ? (cd / ct.length) * 100 : 0}%`, background: "#C9914A", transition: "width .5s" }} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [billing, setBilling] = useState(null);
  const handleAuth = (u, next, p, b) => { setUser(u); if (p) { setPlan(p); setBilling(b); } setScreen(next); };
  const handleSignOut = async () => { if (user?.token) await supa.signOut(user.token); setUser(null); setPlan(null); setBilling(null); setScreen("landing"); };
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {screen === "landing" && <Landing onGetStarted={() => setScreen("auth")} />}
      {screen === "auth" && <Auth onAuth={handleAuth} onBack={() => setScreen("landing")} />}
      {screen === "pricing" && user && <Pricing user={user} onSelectPlan={(p, b) => { setPlan(p); setBilling(b); setScreen("app"); }} />}
      {screen === "app" && user && plan && <TaskApp user={user} plan={plan} billing={billing} onUpgrade={() => setScreen("pricing")} onSignOut={handleSignOut} />}
    </div>
  );
}
