import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ─── FONTS ──────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap";

// ─── PALETTE ────────────────────────────────────────────────────
const C = {
  bg: "#06080e", card: "rgba(255,255,255,0.025)", border: "rgba(255,255,255,0.06)",
  green: "#00e5a0", cyan: "#00b4d8", amber: "#fbbf24", red: "#f87171",
  purple: "#a78bfa", text: "#e2e8f0", dim: "rgba(255,255,255,0.35)",
  dimmer: "rgba(255,255,255,0.2)", dimmest: "rgba(255,255,255,0.08)",
};

// ─── DATA LAYER ─────────────────────────────────────────────────
const CAMPAIGNS = [
  { id: "camp_1", name: "Summer Sale 2026", status: "active", sla: "2026-04-18", progress: 68, owner: "Sarah Chen", priority: "critical", budget: 2400000, region: "NA + EMEA" },
  { id: "camp_2", name: "Brand Refresh Q2", status: "active", sla: "2026-05-01", progress: 42, owner: "Marcus Rivera", priority: "high", budget: 1800000, region: "Global" },
  { id: "camp_3", name: "Product Launch — Aura", status: "blocked", sla: "2026-04-10", progress: 31, owner: "Priya Sharma", priority: "critical", budget: 3100000, region: "NA + APAC" },
  { id: "camp_4", name: "Partner Co-brand", status: "on_track", sla: "2026-06-15", progress: 85, owner: "Tom Nakamura", priority: "medium", budget: 600000, region: "APAC" },
];

const PAGES = [
  { id: "pg_1", name: "/summer-sale", campaign: "camp_1", status: "draft", channel: "web", modified: "2h ago" },
  { id: "pg_2", name: "/summer-sale/electronics", campaign: "camp_1", status: "review", channel: "web", modified: "45m ago" },
  { id: "pg_3", name: "/brand/about-us", campaign: "camp_2", status: "approved", channel: "web", modified: "1d ago" },
  { id: "pg_4", name: "/products/aura", campaign: "camp_3", status: "blocked", channel: "web", modified: "3d ago" },
  { id: "pg_5", name: "/partners/colab", campaign: "camp_4", status: "published", channel: "web", modified: "6h ago" },
  { id: "pg_6", name: "summer-email-blast", campaign: "camp_1", status: "draft", channel: "email", modified: "1h ago" },
  { id: "pg_7", name: "aura-social-kit", campaign: "camp_3", status: "draft", channel: "social", modified: "5h ago" },
  { id: "pg_8", name: "/brand/vision", campaign: "camp_2", status: "draft", channel: "web", modified: "12h ago" },
];

const ASSETS = [
  { id: "ast_1", name: "hero-banner-summer.jpg", type: "image", status: "approved", size: "2.4MB" },
  { id: "ast_2", name: "electronics-grid.png", type: "image", status: "pending_review", size: "1.8MB" },
  { id: "ast_3", name: "brand-video-60s.mp4", type: "video", status: "processing", size: "48MB" },
  { id: "ast_4", name: "aura-product-hero.jpg", type: "image", status: "rejected", size: "3.1MB" },
  { id: "ast_5", name: "partner-logo-pack.zip", type: "archive", status: "approved", size: "12MB" },
  { id: "ast_6", name: "summer-social-templates.psd", type: "design", status: "approved", size: "24MB" },
];

const TICKETS = [
  { id: "JIRA-1042", name: "Update hero banner copy", status: "in_progress", assignee: "Alex Kim", page: "pg_1", daysOpen: 3 },
  { id: "JIRA-1043", name: "Legal review — electronics claims", status: "blocked", assignee: "Legal Team", page: "pg_2", daysOpen: 7 },
  { id: "JIRA-1044", name: "Rebrand header component", status: "done", assignee: "Dev Team", page: "pg_3", daysOpen: 2 },
  { id: "JIRA-1045", name: "Aura product page — awaiting assets", status: "blocked", assignee: "Priya Sharma", page: "pg_4", daysOpen: 12 },
  { id: "JIRA-1046", name: "Partner page QA", status: "in_progress", assignee: "QA Team", page: "pg_5", daysOpen: 1 },
  { id: "JIRA-1047", name: "Email template responsive fix", status: "open", assignee: "Dev Team", page: "pg_6", daysOpen: 0 },
  { id: "JIRA-1048", name: "Brand vision page layout", status: "open", assignee: "Design Team", page: "pg_8", daysOpen: 1 },
];

const APPROVALS = [
  { id: "apr_1", name: "Legal Review — Summer Claims", status: "pending", blocker: true, owner: "Legal Team", target: "JIRA-1043", wait: 5 },
  { id: "apr_2", name: "Brand Sign-off — Aura Assets", status: "rejected", blocker: true, owner: "Brand Team", target: "JIRA-1045", wait: 8 },
  { id: "apr_3", name: "CMO Final Approval — Summer", status: "pending", blocker: false, owner: "Sarah Chen", target: "camp_1", wait: 2 },
  { id: "apr_4", name: "Compliance — Partner Terms", status: "approved", blocker: false, owner: "Compliance", target: "pg_5", wait: 0 },
];

const EDGES = [
  { from: "camp_1", to: "pg_1", rel: "contains" }, { from: "camp_1", to: "pg_2", rel: "contains" },
  { from: "camp_1", to: "pg_6", rel: "contains" }, { from: "camp_2", to: "pg_3", rel: "contains" },
  { from: "camp_2", to: "pg_8", rel: "contains" }, { from: "camp_3", to: "pg_4", rel: "contains" },
  { from: "camp_3", to: "pg_7", rel: "contains" }, { from: "camp_4", to: "pg_5", rel: "contains" },
  { from: "pg_1", to: "ast_1", rel: "uses" }, { from: "pg_2", to: "ast_2", rel: "uses" },
  { from: "pg_3", to: "ast_3", rel: "uses" }, { from: "pg_4", to: "ast_4", rel: "uses" },
  { from: "pg_5", to: "ast_5", rel: "uses" }, { from: "pg_6", to: "ast_6", rel: "uses" },
  { from: "pg_7", to: "ast_4", rel: "uses" }, { from: "pg_8", to: "ast_3", rel: "uses" },
  { from: "JIRA-1042", to: "pg_1", rel: "updates" }, { from: "JIRA-1043", to: "pg_2", rel: "updates" },
  { from: "JIRA-1044", to: "pg_3", rel: "updates" }, { from: "JIRA-1045", to: "pg_4", rel: "updates" },
  { from: "JIRA-1046", to: "pg_5", rel: "updates" }, { from: "JIRA-1047", to: "pg_6", rel: "updates" },
  { from: "JIRA-1048", to: "pg_8", rel: "updates" },
  { from: "apr_1", to: "JIRA-1043", rel: "blocks" }, { from: "apr_2", to: "JIRA-1045", rel: "blocks" },
  { from: "apr_3", to: "camp_1", rel: "gates" },
];

const EVENTS = [
  { time: "2m ago", type: "alert", msg: "SLA breach risk: Aura launch in 6 days, 3 blockers unresolved — $3.1M campaign at risk", severity: "critical", actionable: true, action: "Escalate to VP Brand for emergency sign-off" },
  { time: "8m ago", type: "update", msg: "Asset ast_2 submitted for review by Alex Kim", severity: "info", actionable: false },
  { time: "15m ago", type: "alert", msg: "Legal approval apr_1 pending 5 days — escalation threshold exceeded", severity: "warning", actionable: true, action: "Auto-notify Legal VP + add to standup agenda" },
  { time: "22m ago", type: "resolved", msg: "JIRA-1044 completed — brand header deployed to staging", severity: "success", actionable: false },
  { time: "34m ago", type: "alert", msg: "Asset ast_4 rejected by Brand Team — cascading to 2 pages, est. $3.1M exposure", severity: "critical", actionable: true, action: "Reassign to backup designer + fast-track review" },
  { time: "1h ago", type: "resolved", msg: "Partner page pg_5 passed QA — ready for final publish", severity: "success", actionable: false },
  { time: "1h ago", type: "prediction", msg: "AI: Summer campaign 62% on-time probability — recommend parallel approval tracks", severity: "warning", actionable: true, action: "Split Legal + CMO approvals into parallel tracks" },
  { time: "2h ago", type: "update", msg: "Summer sale hero copy updated — awaiting review", severity: "info", actionable: false },
  { time: "3h ago", type: "prediction", msg: "AI: Brand video processing completes in ~4h — downstream pages ready for integration", severity: "info", actionable: false },
  { time: "5h ago", type: "alert", msg: "Stale content: /brand/vision not updated in 14 days despite active campaign", severity: "warning", actionable: true, action: "Auto-assign to Design Team + flag in next sprint" },
];

// ─── HELPERS ────────────────────────────────────────────────────
const typeOf = (id) => {
  if (id.startsWith("camp")) return "campaign";
  if (id.startsWith("pg")) return "page";
  if (id.startsWith("ast")) return "asset";
  if (id.startsWith("JIRA")) return "ticket";
  if (id.startsWith("apr")) return "approval";
  return "unknown";
};

const entityOf = (id) => {
  const m = { campaign: CAMPAIGNS, page: PAGES, asset: ASSETS, ticket: TICKETS, approval: APPROVALS };
  return m[typeOf(id)]?.find(e => e.id === id);
};

const colorOf = (type) => ({ campaign: C.green, page: C.cyan, asset: C.amber, ticket: C.purple, approval: C.red }[type] || "#888");

const statusColor = (s) => {
  if (["active","on_track","approved","done","published","success","resolved"].includes(s)) return C.green;
  if (["draft","open","processing","info","review"].includes(s)) return C.cyan;
  if (["in_progress","pending","pending_review","warning","prediction"].includes(s)) return C.amber;
  if (["blocked","rejected","critical","alert"].includes(s)) return C.red;
  return "#888";
};

const cascade = (startId) => {
  const hit = new Set([startId]);
  const q = [startId];
  while (q.length) {
    const cur = q.shift();
    EDGES.forEach(e => {
      [e.from, e.to].forEach(n => { if ((e.from === cur || e.to === cur) && !hit.has(n)) { hit.add(n); q.push(n); } });
    });
  }
  return hit;
};

const riskOf = (camp) => {
  const pgs = PAGES.filter(p => p.campaign === camp.id);
  const blocked = pgs.filter(p => p.status === "blocked").length;
  const tix = TICKETS.filter(t => pgs.some(p => p.id === t.page));
  const blockedTix = tix.filter(t => t.status === "blocked").length;
  const avgDays = tix.length ? tix.reduce((s, t) => s + t.daysOpen, 0) / tix.length : 0;
  const pendAppr = APPROVALS.filter(a => a.status !== "approved" && a.blocker).length;
  const dl = new Date(camp.sla);
  const left = Math.max(0, (dl - new Date()) / 86400000);
  const urg = left < 7 ? 30 : left < 14 ? 15 : 5;
  return Math.min(99, Math.round(blocked * 18 + blockedTix * 14 + avgDays * 3 + pendAppr * 12 + urg + (100 - camp.progress) * 0.2));
};

const dollarImpact = (entityId) => {
  const affected = cascade(entityId);
  let total = 0;
  affected.forEach(id => {
    const camp = CAMPAIGNS.find(c => c.id === id);
    if (camp) total += camp.budget;
  });
  return total;
};

const fmt$ = (n) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}K` : `$${n}`;

// ─── UI PRIMITIVES ──────────────────────────────────────────────
const Pill = ({ children, color = "#888", small }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: small ? "1px 6px" : "2px 10px",
    fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: "0.05em",
    textTransform: "uppercase", borderRadius: 4,
    background: color + "15", color, border: `1px solid ${color}25`,
    fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6, whiteSpace: "nowrap",
  }}>{children}</span>
);

const Bar = ({ value, max = 100, color = C.green, h = 6 }) => (
  <div style={{ width: "100%", height: h, background: C.dimmest, borderRadius: h / 2 }}>
    <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: h / 2, transition: "width 0.8s ease" }} />
  </div>
);

const Gauge = ({ score, size = 120 }) => {
  const r = (size - 16) / 2, circ = Math.PI * r;
  const off = circ - (score / 100) * circ;
  const col = score > 70 ? C.red : score > 40 ? C.amber : C.green;
  return (
    <div style={{ position: "relative", width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        <path d={`M 8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`} fill="none" stroke={C.dimmest} strokeWidth="8" strokeLinecap="round" />
        <path d={`M 8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1.2s ease, stroke 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color: col, fontFamily: "'JetBrains Mono', monospace" }}>{score}</span>
        <span style={{ fontSize: 9, color: C.dim, display: "block", marginTop: -2, fontFamily: "'JetBrains Mono', monospace" }}>RISK</span>
      </div>
    </div>
  );
};

const Stat = ({ label, value, sub, accent = C.green, icon }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 140 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: C.dim, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      {icon && <span style={{ fontSize: 14, opacity: 0.4 }}>{icon}</span>}
    </div>
    <div style={{ fontSize: 30, fontWeight: 900, color: accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginTop: 6 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{sub}</div>}
  </div>
);

// ─── GRAPH ──────────────────────────────────────────────────────
const GraphCanvas = ({ selected, onSelect, simId }) => {
  const [dims, setDims] = useState({ w: 900, h: 520 });
  const ref = useRef(null);

  const allNodes = useMemo(() => [
    ...CAMPAIGNS.map(c => ({ id: c.id, label: c.name, type: "campaign" })),
    ...PAGES.map(p => ({ id: p.id, label: p.name, type: "page" })),
    ...ASSETS.map(a => ({ id: a.id, label: a.name, type: "asset" })),
    ...TICKETS.map(t => ({ id: t.id, label: t.id, type: "ticket" })),
    ...APPROVALS.map(a => ({ id: a.id, label: a.name.slice(0, 20), type: "approval" })),
  ], []);

  const pos = useMemo(() => {
    const p = {}, cx = dims.w / 2, cy = dims.h / 2;
    CAMPAIGNS.forEach((c, i) => {
      const a = -Math.PI / 2 + (i - 1.5) * 0.5;
      p[c.id] = { x: cx + Math.cos(a) * 70, y: cy + Math.sin(a) * 50 - 10 };
    });
    PAGES.forEach((pg, i) => {
      const a = (i / PAGES.length) * Math.PI * 2 - Math.PI / 2;
      p[pg.id] = { x: cx + Math.cos(a) * 200, y: cy + Math.sin(a) * 155 };
    });
    ASSETS.forEach((a, i) => {
      const ang = (i / ASSETS.length) * Math.PI * 2 - Math.PI / 3;
      p[a.id] = { x: cx + Math.cos(ang) * 320, y: cy + Math.sin(ang) * 210 };
    });
    TICKETS.forEach((t) => {
      const pg = PAGES.find(pg2 => pg2.id === t.page);
      if (pg && p[pg.id]) {
        const ang = Math.atan2(p[pg.id].y - cy, p[pg.id].x - cx) + 0.35;
        p[t.id] = { x: p[pg.id].x + Math.cos(ang) * 72, y: p[pg.id].y + Math.sin(ang) * 55 };
      } else p[t.id] = { x: 50, y: 50 };
    });
    APPROVALS.forEach((a, i) => {
      if (p[a.target]) p[a.id] = { x: p[a.target].x + 40 + i * 15, y: p[a.target].y - 48 };
      else p[a.id] = { x: dims.w - 80, y: 50 + i * 60 };
    });
    return p;
  }, [dims]);

  const affected = useMemo(() => simId ? cascade(simId) : new Set(), [simId]);
  const connected = useMemo(() => {
    if (!selected) return null;
    const s = new Set([selected]);
    EDGES.forEach(e => { if (e.from === selected) s.add(e.to); if (e.to === selected) s.add(e.from); });
    return s;
  }, [selected]);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const ob = new ResizeObserver(entries => {
      const r2 = entries[0].contentRect;
      if (r2.width > 0) setDims({ w: r2.width, h: Math.max(420, r2.height) });
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const nr = (t) => ({ campaign: 20, page: 13, asset: 11, ticket: 11, approval: 11 }[t] || 9);
  const icon = (t) => ({ campaign: "\u25C6", page: "\u25A1", asset: "\u25CE", ticket: "\u25B8", approval: "\u2691" }[t] || "\u00B7");

  return (
    <svg ref={ref} width={dims.w} height={dims.h} style={{ display: "block" }}>
      <defs>
        <marker id="ah" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.15)" />
        </marker>
        <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {EDGES.map((e, i) => {
        const f = pos[e.from], t = pos[e.to];
        if (!f || !t) return null;
        const isBlock = e.rel === "blocks";
        const isAff = simId && (affected.has(e.from) || affected.has(e.to));
        const isCon = connected && connected.has(e.from) && connected.has(e.to);
        const dim2 = (connected && !isCon) || (simId && !isAff);
        return <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
          stroke={isAff ? C.red + "88" : isBlock ? C.red + "55" : isCon ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)"}
          strokeWidth={isBlock ? 2 : 1} strokeDasharray={isBlock ? "6 3" : "none"}
          opacity={dim2 ? 0.1 : 1} markerEnd={isBlock ? "url(#ah)" : ""} style={{ transition: "all 0.4s ease" }} />;
      })}
      {allNodes.map(n => {
        const p = pos[n.id]; if (!p) return null;
        const R = nr(n.type), col = colorOf(n.type);
        const sel = selected === n.id, aff = simId && affected.has(n.id);
        const con = connected ? connected.has(n.id) : true;
        const dim2 = (connected && !con) || (simId && !aff && simId !== n.id);
        return (
          <g key={n.id} onClick={() => onSelect(n.id === selected ? null : n.id)} style={{ cursor: "pointer", transition: "opacity 0.4s" }} opacity={dim2 ? 0.12 : 1}>
            {sel && <circle cx={p.x} cy={p.y} r={R + 7} fill="none" stroke={col} strokeWidth="2" opacity="0.35" filter="url(#gl)" />}
            {aff && <circle cx={p.x} cy={p.y} r={R + 6} fill="none" stroke={C.red} strokeWidth="2" opacity="0.5">
              <animate attributeName="r" from={R + 3} to={R + 12} dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>}
            <circle cx={p.x} cy={p.y} r={R} fill={aff ? C.red + "20" : col + "12"} stroke={aff ? C.red : col} strokeWidth={sel ? 2.5 : 1.5} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central" fill={aff ? C.red : col} fontSize={R * 0.85} fontWeight="bold">{icon(n.type)}</text>
            <text x={p.x} y={p.y + R + 13} textAnchor="middle" fill={aff ? C.red : "rgba(255,255,255,0.5)"} fontSize="9" fontFamily="'DM Sans', sans-serif" fontWeight="500">
              {n.label.length > 24 ? n.label.slice(0, 22) + "\u2026" : n.label}
            </text>
          </g>
        );
      })}
      {["campaign","page","asset","ticket","approval"].map((t, i) => (
        <g key={t} transform={`translate(${14 + i * 90}, ${dims.h - 18})`}>
          <circle cx={0} cy={0} r={4} fill={colorOf(t)} />
          <text x={8} y={1} fill={C.dim} fontSize="9" dominantBaseline="central" fontFamily="'JetBrains Mono', monospace">{t}</text>
        </g>
      ))}
    </svg>
  );
};

// ─── DETAIL PANEL ───────────────────────────────────────────────
const Detail = ({ nodeId, onClose }) => {
  if (!nodeId) return null;
  const ent = entityOf(nodeId), type = typeOf(nodeId), col = colorOf(type);
  if (!ent) return null;
  const rels = EDGES.filter(e => e.from === nodeId || e.to === nodeId);
  const impact = dollarImpact(nodeId);
  return (
    <div style={{
      position: "absolute", top: 0, right: 0, width: 310, height: "100%",
      background: "rgba(8,10,16,0.97)", borderLeft: `1px solid ${C.border}`,
      padding: "20px 18px", overflowY: "auto", backdropFilter: "blur(24px)", zIndex: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Pill color={col}>{type}</Pill>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 18, padding: 0 }}>{"\u2715"}</button>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 3px", fontFamily: "'DM Sans', sans-serif" }}>{ent.name || ent.id}</h3>
      <div style={{ fontSize: 10, color: C.dimmer, marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>{ent.id}</div>
      {ent.status && <div style={{ marginBottom: 10 }}><Pill color={statusColor(ent.status)} small>{ent.status.replace("_", " ")}</Pill></div>}
      {ent.budget && <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>Budget: <span style={{ color: C.amber, fontWeight: 700 }}>{fmt$(ent.budget)}</span></div>}
      {ent.owner && <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>Owner: {ent.owner}</div>}
      {ent.assignee && <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>Assignee: {ent.assignee}</div>}
      {ent.progress !== undefined && (
        <div style={{ marginTop: 8, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginBottom: 4 }}><span>PROGRESS</span><span>{ent.progress}%</span></div>
          <Bar value={ent.progress} color={col} />
        </div>
      )}
      {impact > 0 && (
        <div style={{ padding: "8px 10px", background: C.red + "0a", border: `1px solid ${C.red}18`, borderRadius: 6, marginBottom: 14, fontSize: 11, color: C.red }}>
          Revenue exposure: <strong>{fmt$(impact)}</strong>
        </div>
      )}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 8 }}>
        <div style={{ fontSize: 9, color: C.dimmer, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'JetBrains Mono', monospace" }}>
          Connections ({rels.length})
        </div>
        {rels.map((r, i) => {
          const oid = r.from === nodeId ? r.to : r.from, oe = entityOf(oid), ot = typeOf(oid);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: 11, color: C.dim }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colorOf(ot), flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: C.dimmer, fontFamily: "'JetBrains Mono', monospace" }}>{r.rel}</span>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{oe?.name || oid}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN APPLICATION ───────────────────────────────────────────
export default function ControlTower() {
  const [view, setView] = useState("exec");
  const [tab, setTab] = useState("overview");
  const [selNode, setSelNode] = useState(null);
  const [simId, setSimId] = useState(null);
  const [actioned, setActioned] = useState(new Set());

  const risks = useMemo(() => CAMPAIGNS.map(c => ({ ...c, risk: riskOf(c) })).sort((a, b) => b.risk - a.risk), []);
  const totalBlockers = APPROVALS.filter(a => a.blocker && a.status !== "approved").length;
  const blockedTix = TICKETS.filter(t => t.status === "blocked").length;
  const avgCycle = Math.round(TICKETS.reduce((s, t) => s + t.daysOpen, 0) / TICKETS.length * 10) / 10;
  const totalAtRisk = risks.filter(r => r.risk > 50).reduce((s, r) => s + r.budget, 0);

  const tabBtn = (id, label) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding: "7px 14px", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase", cursor: "pointer", borderRadius: 6,
      background: tab === id ? (view === "exec" ? C.green + "12" : C.cyan + "12") : "transparent",
      color: tab === id ? (view === "exec" ? C.green : C.cyan) : C.dim,
      border: tab === id ? `1px solid ${view === "exec" ? C.green : C.cyan}22` : "1px solid transparent",
      fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s ease",
    }}>{label}</button>
  );

  const execTabs = [["overview", "Command View"], ["risks", "Risk Engine"], ["simulate", "Impact Sim"]];
  const opsTabs = [["graph", "Dependency Graph"], ["bottlenecks", "Bottlenecks"], ["feed", "Event Feed"], ["simulate", "Impact Sim"]];

  const doAction = (key) => setActioned(prev => new Set([...prev, key]));

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.008)", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: C.bg }}>G</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>CONTROL TOWER</div>
            <div style={{ fontSize: 8, color: C.dimmer, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Content Supply Chain Intelligence</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", background: C.dimmest, borderRadius: 8, overflow: "hidden" }}>
            {[["exec", "Executive"], ["ops", "Operator"]].map(([v, l]) => (
              <button key={v} onClick={() => { setView(v); setTab(v === "exec" ? "overview" : "graph"); }}
                style={{
                  padding: "6px 14px", fontSize: 10, fontWeight: 700, cursor: "pointer",
                  background: view === v ? (v === "exec" ? C.green + "20" : C.cyan + "20") : "transparent",
                  color: view === v ? (v === "exec" ? C.green : C.cyan) : C.dim,
                  border: "none", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}66`, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 9, color: C.dimmer, fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ padding: "8px 24px", borderBottom: `1px solid rgba(255,255,255,0.03)`, display: "flex", gap: 5, overflowX: "auto" }}>
        {(view === "exec" ? execTabs : opsTabs).map(([id, l]) => tabBtn(id, l))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px 24px", animation: "fadeIn 0.3s ease" }}>

        {/* ════ EXECUTIVE OVERVIEW ════ */}
        {view === "exec" && tab === "overview" && (<div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <Stat label="Revenue at Risk" value={fmt$(totalAtRisk)} sub={`${risks.filter(r => r.risk > 50).length} campaigns above threshold`} accent={C.red} icon="$" />
            <Stat label="Active Blockers" value={totalBlockers} sub={`${blockedTix} tickets stalled`} accent={C.red} icon={"\u26A0"} />
            <Stat label="On-Time Probability" value={`${Math.round(risks.reduce((s, r) => s + (100 - r.risk), 0) / risks.length)}%`} sub="weighted average" accent={C.amber} icon={"\u25F7"} />
            <Stat label="Avg Cycle Time" value={`${avgCycle}d`} sub="per ticket" accent={C.cyan} icon={"\u21BB"} />
          </div>

          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: C.dimmer, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>Campaign Health</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 28 }}>
            {risks.map(camp => {
              const dl = new Date(camp.sla), left = Math.max(0, Math.round((dl - new Date()) / 86400000));
              const onTime = Math.max(5, Math.min(95, Math.round(camp.progress * 1.2 - camp.risk * 0.4 + left * 2)));
              return (
                <div key={camp.id} style={{
                  background: C.card, border: `1px solid ${camp.risk > 70 ? C.red + "30" : camp.risk > 40 ? C.amber + "18" : C.border}`,
                  borderRadius: 14, padding: "18px 20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{camp.name}</div>
                      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
                        <Pill color={statusColor(camp.status)} small>{camp.status.replace("_", " ")}</Pill>
                        <Pill color={statusColor(camp.priority)} small>{camp.priority}</Pill>
                        <Pill color={C.dim} small>{camp.region}</Pill>
                      </div>
                    </div>
                    <Gauge score={camp.risk} size={86} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginBottom: 3 }}><span>Delivery</span><span>{camp.progress}%</span></div>
                    <Bar value={camp.progress} color={camp.risk > 70 ? C.red : camp.risk > 40 ? C.amber : C.green} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginTop: 10, flexWrap: "wrap", gap: 4 }}>
                    <span>{camp.owner}</span>
                    <span>Budget: <strong style={{ color: C.amber }}>{fmt$(camp.budget)}</strong></span>
                    <span>{left}d to SLA</span>
                    <span>On-time: <strong style={{ color: onTime > 70 ? C.green : onTime > 40 ? C.amber : C.red }}>{onTime}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: C.dimmer, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
            Actionable Alerts \u2014 AI Recommendations
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, maxHeight: 320, overflowY: "auto" }}>
            {EVENTS.filter(e => e.actionable).map((ev, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < EVENTS.filter(e => e.actionable).length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(ev.severity), marginTop: 5, flexShrink: 0, boxShadow: ev.severity === "critical" ? `0 0 8px ${C.red}44` : "none" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 6 }}>{ev.msg}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: 10, color: C.cyan, padding: "3px 8px", background: C.cyan + "10", border: `1px solid ${C.cyan}20`, borderRadius: 4 }}>
                        {"\u21AF"} {ev.action}
                      </div>
                      {!actioned.has("exec-" + i) ? (
                        <button onClick={() => doAction("exec-" + i)} style={{
                          padding: "3px 10px", fontSize: 10, fontWeight: 700, borderRadius: 4, cursor: "pointer",
                          background: C.green + "15", color: C.green, border: `1px solid ${C.green}25`, fontFamily: "'JetBrains Mono', monospace",
                        }}>EXECUTE</button>
                      ) : <Pill color={C.green} small>{"\u2713"} triggered</Pill>}
                      <span style={{ fontSize: 9, color: C.dimmer, fontFamily: "'JetBrains Mono', monospace" }}>{ev.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>)}

        {/* ════ RISK ENGINE ════ */}
        {view === "exec" && tab === "risks" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            {risks.map(camp => (
              <div key={camp.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, textAlign: "center" }}>
                <Gauge score={camp.risk} size={140} />
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>{camp.name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>SLA: {camp.sla}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.amber, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(camp.budget)}</div>
                <div style={{ fontSize: 9, color: C.dimmer }}>budget exposure</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: C.dimmer, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>SLA Breach Forecast</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 24 }}>
            {CAMPAIGNS.map((camp, i) => {
              const dl = new Date(camp.sla), left = Math.max(0, Math.round((dl - new Date()) / 86400000));
              const prob = Math.max(5, Math.min(95, Math.round(camp.progress * 1.2 - riskOf(camp) * 0.4 + left * 2)));
              const pc = prob > 70 ? C.green : prob > 40 ? C.amber : C.red;
              return (
                <div key={camp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < CAMPAIGNS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{camp.name}</div><div style={{ fontSize: 10, color: C.dim }}>{left}d remaining \u00B7 {camp.sla} \u00B7 {camp.region}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 800, color: pc, fontFamily: "'JetBrains Mono', monospace" }}>{prob}%</div><div style={{ fontSize: 9, color: C.dimmer }}>on-time</div></div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "18px 20px", background: `linear-gradient(135deg, ${C.red}08, ${C.amber}08)`, border: `1px solid ${C.red}18`, borderRadius: 12 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: C.red, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>Revenue Impact Analysis</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.red, fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(totalAtRisk)}</div>
                <div style={{ fontSize: 11, color: C.dim }}>total revenue at risk</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, fontFamily: "'JetBrains Mono', monospace" }}>{totalBlockers}</div>
                <div style={{ fontSize: 11, color: C.dim }}>active blockers</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(CAMPAIGNS.filter(c => riskOf(c) < 40).reduce((s, c) => s + c.budget, 0))}</div>
                <div style={{ fontSize: 11, color: C.dim }}>revenue on track</div>
              </div>
            </div>
          </div>
        </div>)}

        {/* ════ DEPENDENCY GRAPH ════ */}
        {view === "ops" && tab === "graph" && (
          <div style={{ position: "relative" }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, height: 530, overflow: "hidden", position: "relative" }}>
              <GraphCanvas selected={selNode} onSelect={setSelNode} simId={null} />
              <Detail nodeId={selNode} onClose={() => setSelNode(null)} />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: C.dimmer }}>Click any node to inspect connections, status, ownership, and revenue exposure.</div>
          </div>
        )}

        {/* ════ BOTTLENECKS ════ */}
        {view === "ops" && tab === "bottlenecks" && (<div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <Stat label="Blocking Approvals" value={APPROVALS.filter(a => a.blocker && a.status !== "approved").length} accent={C.red} icon={"\u2691"} />
            <Stat label="Blocked Tickets" value={blockedTix} accent={C.amber} icon={"\u25B8"} />
            <Stat label="Max Wait Time" value={`${Math.max(...APPROVALS.map(a => a.wait))}d`} sub="longest pending" accent={C.red} icon={"\u25F7"} />
            <Stat label="Cascade Reach" value={(() => { let mx = 0; APPROVALS.filter(a => a.blocker).forEach(a => { mx = Math.max(mx, cascade(a.id).size); }); return mx; })()} sub="max affected entities" accent={C.purple} icon={"\u21AF"} />
          </div>

          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: C.dimmer, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>Blocking Approval Chain Analysis</div>
          {APPROVALS.filter(a => a.blocker && a.status !== "approved").map((apr, idx) => {
            const aff = cascade(apr.id);
            const impact = dollarImpact(apr.id);
            return (
              <div key={apr.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div><span style={{ fontSize: 14, fontWeight: 700, marginRight: 8 }}>{apr.name}</span><Pill color={statusColor(apr.status)} small>{apr.status}</Pill></div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.red, fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(impact)}</span>
                    <span style={{ fontSize: 9, color: C.dimmer }}>exposure</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>
                  Owner: <strong>{apr.owner}</strong> \u00B7 Waiting: <strong style={{ color: apr.wait > 4 ? C.red : C.amber }}>{apr.wait} days</strong> \u00B7 Blocking: {apr.target}
                </div>
                <div style={{ padding: "10px 12px", background: C.red + "08", border: `1px solid ${C.red}15`, borderRadius: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: C.red, marginBottom: 6 }}>
                    {"\u26A0"} Cascade: <strong>{aff.size} entities</strong> affected
                    {apr.wait > 4 && <span> \u00B7 Escalation threshold exceeded</span>}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {[...aff].filter(id => id !== apr.id).slice(0, 8).map(id => {
                      const e = entityOf(id);
                      return <Pill key={id} color={colorOf(typeOf(id))} small>{(e?.name || id).slice(0, 25)}</Pill>;
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 10, color: C.cyan, padding: "4px 10px", background: C.cyan + "10", border: `1px solid ${C.cyan}20`, borderRadius: 5, flex: 1 }}>
                    {"\u21AF"} {apr.wait > 4 ? "Auto-escalate to VP" : "Send follow-up nudge"} + add to daily standup
                  </div>
                  {!actioned.has("bot-" + idx) ? (
                    <button onClick={() => doAction("bot-" + idx)} style={{
                      padding: "4px 12px", fontSize: 10, fontWeight: 700, borderRadius: 5, cursor: "pointer",
                      background: C.green + "15", color: C.green, border: `1px solid ${C.green}25`,
                      fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
                    }}>TRIGGER</button>
                  ) : <Pill color={C.green} small>{"\u2713"} sent</Pill>}
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: C.dimmer, marginTop: 24, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>Stale Content Detection</div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            {PAGES.filter(p => p.status === "draft" || p.modified.includes("d")).map((pg, i, arr) => (
              <div key={pg.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", flexWrap: "wrap", gap: 4 }}>
                <div><span style={{ fontSize: 12, fontWeight: 600 }}>{pg.name}</span><span style={{ fontSize: 10, color: C.dim, marginLeft: 8 }}>{pg.channel}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: C.amber, fontFamily: "'JetBrains Mono', monospace" }}>modified {pg.modified}</span>
                  <Pill color={statusColor(pg.status)} small>{pg.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>)}

        {/* ════ EVENT FEED ════ */}
        {view === "ops" && tab === "feed" && (<div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {["all","critical","warning","info","success"].map(f => <Pill key={f} color={f === "all" ? C.cyan : statusColor(f)}>{f}</Pill>)}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
            {EVENTS.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < EVENTS.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 50 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(ev.severity), boxShadow: ev.severity === "critical" ? `0 0 10px ${C.red}44` : "none" }} />
                  <span style={{ fontSize: 8, color: C.dimmer, fontFamily: "'JetBrains Mono', monospace" }}>{ev.time}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
                    <Pill color={statusColor(ev.severity)} small>{ev.severity}</Pill>
                    <Pill color={C.dim} small>{ev.type}</Pill>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{ev.msg}</div>
                  {ev.actionable && ev.action && (
                    <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: 10, color: C.cyan, padding: "2px 8px", background: C.cyan + "10", borderRadius: 4, border: `1px solid ${C.cyan}18` }}>
                        {"\u21AF"} {ev.action}
                      </div>
                      {!actioned.has("feed-" + i) ? (
                        <button onClick={() => doAction("feed-" + i)} style={{ padding: "2px 8px", fontSize: 9, fontWeight: 700, borderRadius: 4, cursor: "pointer", background: C.green + "15", color: C.green, border: `1px solid ${C.green}25`, fontFamily: "'JetBrains Mono', monospace" }}>EXECUTE</button>
                      ) : <Pill color={C.green} small>{"\u2713"} triggered</Pill>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>)}

        {/* ════ IMPACT SIMULATOR ════ */}
        {tab === "simulate" && (<div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: C.dimmer, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>What-If Simulation Engine</div>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>
              Select any entity to model its failure. The system calculates cascade impact across every dependency, with dollar exposure from affected campaigns.
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {[...ASSETS, ...APPROVALS].map(item => {
                const isSel = simId === item.id;
                return (
                  <button key={item.id} onClick={() => setSimId(isSel ? null : item.id)} style={{
                    padding: "5px 11px", fontSize: 10, borderRadius: 6, cursor: "pointer",
                    background: isSel ? C.red + "18" : C.dimmest,
                    border: `1px solid ${isSel ? C.red + "50" : C.border}`,
                    color: isSel ? C.red : C.dim, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                  }}>
                    {item.name.length > 32 ? item.name.slice(0, 30) + "\u2026" : item.name}
                  </button>
                );
              })}
            </div>
            {simId && (() => {
              const aff = cascade(simId);
              const impact = dollarImpact(simId);
              const ent = entityOf(simId);
              const affCamps = [...aff].filter(id => typeOf(id) === "campaign").length;
              const affPages = [...aff].filter(id => typeOf(id) === "page").length;
              return (
                <div style={{ padding: 16, background: `linear-gradient(135deg, ${C.red}0a, ${C.amber}06)`, borderRadius: 10, border: `1px solid ${C.red}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 4 }}>
                        {"\u26A0"} Removing "{(ent?.name || simId).slice(0, 40)}"
                      </div>
                      <div style={{ fontSize: 11, color: C.dim }}>
                        Impacts <strong style={{ color: C.red }}>{aff.size} entities</strong> \u00B7 <strong style={{ color: C.amber }}>{affPages} pages</strong> \u00B7 <strong style={{ color: C.green }}>{affCamps} campaign(s)</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: C.red, fontFamily: "'JetBrains Mono', monospace" }}>{fmt$(impact)}</div>
                      <div style={{ fontSize: 9, color: C.dimmer }}>revenue exposure</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {[...aff].filter(id => id !== simId).map(id => {
                      const e = entityOf(id);
                      return <Pill key={id} color={colorOf(typeOf(id))} small>{(e?.name || id).slice(0, 28)}</Pill>;
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, height: 470, overflow: "hidden", position: "relative" }}>
            <GraphCanvas selected={null} onSelect={() => {}} simId={simId} />
          </div>
        </div>)}

      </div>
    </div>
  );
}
