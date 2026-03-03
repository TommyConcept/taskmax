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
        <p className="f3" style={{ fontSize: 17, color: "#9B9488", maxWidth: 460, margin: "0 auto 38px", lineHeight: 1.7 }}>TaskMax uses Cl
