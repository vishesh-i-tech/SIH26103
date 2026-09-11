import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import {
  LayoutGrid, FolderKanban, ListOrdered, GitCompareArrows, ReceiptText,
  Search, MapPin, Calendar, TrendingUp, TrendingDown, AlertTriangle,
  ChevronRight, ArrowLeft, CheckCircle2, XCircle, Clock, Camera,
} from "lucide-react";

/* ---------------------------------- tokens ---------------------------------- */
const T = {
  ink: "#1B2430",
  paper: "#F4F3EF",
  panel: "#FFFFFF",
  line: "#D9D6CE",
  steel: "#2F5D73",
  steelDeep: "#1F4351",
  slate: "#5B6570",
  good: "#3E7A52",
  warn: "#B07C22",
  bad: "#A6402F",
  goodBg: "#EAF2EC",
  warnBg: "#FBF1E0",
  badBg: "#F7E7E3",
};

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

/* ---------------------------------- mock data ---------------------------------- */
const projects = [
  {
    id: "NH-4471", name: "Indore–Betul Highway Widening", sector: "Roads", location: "Madhya Pradesh",
    contractor: "Shivalik Infraprojects Ltd.", costOriginal: 640, costRevised: 705, duration: "36 months",
    start: "Feb 2024", end: "Feb 2027", planned: 68, actual: 47, risk: 87,
    trend: [{ m: "Apr", v: 38 }, { m: "May", v: 44 }, { m: "Jun", v: 51 }, { m: "Jul", v: 63 }, { m: "Aug", v: 78 }, { m: "Sep", v: 87 }],
    factors: [{ f: "Expenditure ahead of progress", w: 34 }, { f: "Milestone delays (3)", w: 27 }, { f: "Material supply gap", w: 21 }, { f: "Land clearance pending", w: 18 }],
    reason: "Expenditure outpacing physical work",
    recommendation: "Escalate material-supply contract to Divisional Engineer; freeze further RA-bill approval pending site verification.",
    billing: [
      { id: "RA-14", claimed: 42.0, expected: 31.5, status: "flagged" },
      { id: "RA-13", claimed: 28.0, expected: 27.2, status: "approved" },
    ],
    daysFlagged: 6,
  },
  {
    id: "BR-2209", name: "Narmada River Bridge, Hoshangabad", sector: "Bridges", location: "Madhya Pradesh",
    contractor: "Ganga Construction Co.", costOriginal: 310, costRevised: 338, duration: "24 months",
    start: "Jun 2024", end: "Jun 2026", planned: 55, actual: 49, risk: 61,
    trend: [{ m: "Apr", v: 30 }, { m: "May", v: 34 }, { m: "Jun", v: 41 }, { m: "Jul", v: 48 }, { m: "Aug", v: 55 }, { m: "Sep", v: 61 }],
    factors: [{ f: "Monsoon work stoppage", w: 40 }, { f: "Foundation delay", w: 25 }, { f: "Design revision", w: 20 }],
    reason: "Monsoon-linked work stoppage",
    recommendation: "Revise schedule buffer for monsoon months in next quarterly review.",
    billing: [{ id: "RA-9", claimed: 19.4, expected: 18.9, status: "approved" }],
    daysFlagged: 2,
  },
  {
    id: "RW-8802", name: "Bhopal–Itarsi Rail Doubling", sector: "Railways", location: "Madhya Pradesh",
    contractor: "Eastern Rail Infra Pvt. Ltd.", costOriginal: 920, costRevised: 918, duration: "48 months",
    start: "Jan 2023", end: "Jan 2027", planned: 71, actual: 69, risk: 22,
    trend: [{ m: "Apr", v: 24 }, { m: "May", v: 22 }, { m: "Jun", v: 20 }, { m: "Jul", v: 21 }, { m: "Aug", v: 23 }, { m: "Sep", v: 22 }],
    factors: [{ f: "Minor tender delay (resolved)", w: 60 }, { f: "Utility shifting", w: 40 }],
    reason: "On track, minor legacy delay",
    recommendation: "No action needed — continue routine monitoring.",
    billing: [{ id: "RA-22", claimed: 55.0, expected: 54.6, status: "approved" }],
    daysFlagged: 0,
  },
  {
    id: "PW-3341", name: "Rewa Solar-Grid Transmission Line", sector: "Power", location: "Madhya Pradesh",
    contractor: "Vindhya Powergrid Ltd.", costOriginal: 214, costRevised: 249, duration: "18 months",
    start: "Mar 2025", end: "Sep 2026", planned: 40, actual: 26, risk: 74,
    trend: [{ m: "Apr", v: 33 }, { m: "May", v: 41 }, { m: "Jun", v: 48 }, { m: "Jul", v: 58 }, { m: "Aug", v: 68 }, { m: "Sep", v: 74 }],
    factors: [{ f: "Right-of-way disputes", w: 38 }, { f: "Equipment import delay", w: 32 }, { f: "Contractor liquidity", w: 30 }],
    reason: "Right-of-way disputes + equipment delay",
    recommendation: "Coordinate with district revenue office on right-of-way; verify contractor's equipment procurement timeline.",
    billing: [{ id: "RA-6", claimed: 21.2, expected: 15.8, status: "flagged" }],
    daysFlagged: 11,
  },
  {
    id: "NH-5510", name: "Jabalpur Ring Road Phase II", sector: "Roads", location: "Madhya Pradesh",
    contractor: "Omkar Roadways Ltd.", costOriginal: 455, costRevised: 461, duration: "30 months",
    start: "Aug 2024", end: "Feb 2027", planned: 34, actual: 31, risk: 29,
    trend: [{ m: "Apr", v: 18 }, { m: "May", v: 20 }, { m: "Jun", v: 24 }, { m: "Jul", v: 26 }, { m: "Aug", v: 28 }, { m: "Sep", v: 29 }],
    factors: [{ f: "Slight material lag", w: 55 }, { f: "Weather", w: 45 }],
    reason: "Marginal material lag",
    recommendation: "Monitor next reporting cycle; no escalation required.",
    billing: [{ id: "RA-4", claimed: 12.0, expected: 11.7, status: "approved" }],
    daysFlagged: 0,
  },
];

const sectors = ["All", ...new Set(projects.map((p) => p.sector))];

const riskTone = (r) => (r >= 70 ? T.bad : r >= 45 ? T.warn : T.good);
const riskBg = (r) => (r >= 70 ? T.badBg : r >= 45 ? T.warnBg : T.goodBg);
const riskLabel = (r) => (r >= 70 ? "Critical" : r >= 45 ? "Watch" : "Stable");

/* ---------------------------------- primitives ---------------------------------- */
function Panel({ children, style, ...rest }) {
  return (
    <div
      style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 3, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

function RiskChip({ score, size = "md" }) {
  const pad = size === "sm" ? "2px 8px" : "4px 10px";
  const fs = size === "sm" ? 11 : 13;
  return (
    <span
      style={{
        ...mono, background: riskBg(score), color: riskTone(score), padding: pad,
        borderRadius: 2, fontSize: fs, fontWeight: 600, letterSpacing: 0.2,
        border: `1px solid ${riskTone(score)}33`,
      }}
    >
      {score} · {riskLabel(score)}
    </span>
  );
}

function ProgressBar({ planned, actual }) {
  return (
    <div style={{ position: "relative", height: 6, background: "#EDEBE4", borderRadius: 2 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${actual}%`, background: T.steel, borderRadius: 2 }} />
      <div style={{ position: "absolute", left: `${planned}%`, top: -3, bottom: -3, width: 2, background: T.ink }} />
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 12, color: T.slate, fontWeight: 600, marginBottom: 10 }}>{children}</div>;
}

/* ---------------------------------- sidebar ---------------------------------- */
function Sidebar({ view, setView }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "priority", label: "Priority Queue", icon: ListOrdered },
    { id: "benchmark", label: "Benchmarking", icon: GitCompareArrows },
    { id: "billing", label: "Billing Alerts", icon: ReceiptText },
  ];
  return (
    <div style={{ width: 216, minWidth: 216, background: T.ink, color: "#DDE2E6", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ padding: "6px 10px 22px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: 0.2 }}>PAIMANA</div>
        <div style={{ fontSize: 11, color: "#8B94A0", marginTop: 2 }}>Project Risk Monitor</div>
      </div>
      {items.map((it) => {
        const Icon = it.icon;
        const active = view === it.id || (view === "detail" && it.id === "projects");
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 3,
              background: active ? "#28333F" : "transparent", color: active ? "#fff" : "#AAB2BB",
              border: "none", cursor: "pointer", fontSize: 13, textAlign: "left", fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={15} />
            {it.label}
          </button>
        );
      })}
      <div style={{ marginTop: "auto", padding: "10px", fontSize: 11, color: "#6B7480", borderTop: "1px solid #2A343F" }}>
        Logged in as<br /><span style={{ color: "#C6CCD2" }}>MoSPI · IPMD Admin</span>
      </div>
    </div>
  );
}

/* ---------------------------------- dashboard ---------------------------------- */
function Dashboard({ openProject, setView }) {
  const high = projects.filter((p) => p.risk >= 70).length;
  const totalOrig = projects.reduce((s, p) => s + p.costOriginal, 0);
  const totalRev = projects.reduce((s, p) => s + p.costRevised, 0);
  const ranked = [...projects].sort((a, b) => b.risk - a.risk);
  const avgTrend = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({
    m, v: Math.round(projects.reduce((s, p) => s + p.trend[i].v, 0) / projects.length),
  }));

  const stat = (label, value, sub) => (
    <Panel style={{ padding: "16px 18px", flex: 1 }}>
      <div style={{ fontSize: 12, color: T.slate }}>{label}</div>
      <div style={{ ...mono, fontSize: 26, fontWeight: 600, color: T.ink, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: T.slate, marginTop: 3 }}>{sub}</div>}
    </Panel>
  );

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.ink }}>Portfolio overview</div>
        <div style={{ fontSize: 13, color: T.slate, marginTop: 2 }}>Central Sector Infrastructure Projects · Madhya Pradesh circle</div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {stat("Total projects", projects.length, "across 4 sectors")}
        {stat("High-risk projects", high, "risk score ≥ 70")}
        {stat("Sanctioned cost", `₹${totalOrig} Cr`, `revised ₹${totalRev} Cr`)}
        {stat("Cost drift", `+${(((totalRev - totalOrig) / totalOrig) * 100).toFixed(1)}%`, "vs original sanction")}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <Panel style={{ flex: 1.3, padding: 18 }}>
          <SectionLabel>Portfolio risk trend — average</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={avgTrend}>
              <CartesianGrid stroke={T.line} vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: T.slate }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.slate }} axisLine={false} tickLine={false} width={26} />
              <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${T.line}`, borderRadius: 3 }} />
              <Line type="monotone" dataKey="v" stroke={T.steel} strokeWidth={2.5} dot={{ r: 3, fill: T.steel }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel style={{ flex: 1, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SectionLabel>Priority worklist</SectionLabel>
            <button onClick={() => setView("priority")} style={{ fontSize: 11.5, color: T.steel, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              View all →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ranked.slice(0, 4).map((p, i) => (
              <div key={p.id} onClick={() => openProject(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 4px", borderRadius: 3 }}>
                <span style={{ ...mono, fontSize: 11, color: T.slate, width: 14 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.slate }}>{p.reason}</div>
                </div>
                <RiskChip score={p.risk} size="sm" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------- projects list ---------------------------------- */
function ProjectsList({ openProject }) {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("All");
  const filtered = projects.filter(
    (p) => (sector === "All" || p.sector === sector) && p.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ padding: 28 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Projects</div>
      <div style={{ fontSize: 13, color: T.slate, marginBottom: 18 }}>{filtered.length} of {projects.length} projects</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 3, padding: "8px 12px", flex: 1, maxWidth: 320 }}>
          <Search size={14} color={T.slate} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" style={{ border: "none", outline: "none", fontSize: 13, flex: 1, background: "transparent" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {sectors.map((s) => (
            <button key={s} onClick={() => setSector(s)} style={{
              fontSize: 12, padding: "7px 12px", borderRadius: 3, cursor: "pointer",
              border: `1px solid ${sector === s ? T.steel : T.line}`,
              background: sector === s ? T.steelDeep : T.panel, color: sector === s ? "#fff" : T.ink, fontWeight: 500,
            }}>{s}</button>
          ))}
        </div>
      </div>

      <Panel>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 90px 1fr 1fr 0.8fr 100px 16px", padding: "10px 16px", fontSize: 11, color: T.slate, fontWeight: 600, borderBottom: `1px solid ${T.line}` }}>
          <div>PROJECT</div><div>SECTOR</div><div>CONTRACTOR</div><div>LOCATION</div><div>PROGRESS</div><div>RISK</div><div />
        </div>
        {filtered.map((p) => (
          <div key={p.id} onClick={() => openProject(p.id)} style={{
            display: "grid", gridTemplateColumns: "1.2fr 90px 1fr 1fr 0.8fr 100px 16px", padding: "13px 16px",
            borderBottom: `1px solid ${T.line}`, cursor: "pointer", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{p.name}</div>
              <div style={{ ...mono, fontSize: 11, color: T.slate }}>{p.id}</div>
            </div>
            <div style={{ fontSize: 12, color: T.slate }}>{p.sector}</div>
            <div style={{ fontSize: 12.5, color: T.ink }}>{p.contractor}</div>
            <div style={{ fontSize: 12.5, color: T.ink, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} color={T.slate} />{p.location}</div>
            <div>
              <ProgressBar planned={p.planned} actual={p.actual} />
              <div style={{ fontSize: 10.5, color: T.slate, marginTop: 3, ...mono }}>{p.actual}% of {p.planned}%</div>
            </div>
            <div><RiskChip score={p.risk} size="sm" /></div>
            <ChevronRight size={15} color={T.slate} />
          </div>
        ))}
      </Panel>
    </div>
  );
}

/* ---------------------------------- project detail ---------------------------------- */
function ProjectDetail({ project, back }) {
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "daily record", "risk & prediction", "billing", "benchmark"];

  return (
    <div style={{ padding: 28 }}>
      <button onClick={back} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: T.steel, background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 14 }}>
        <ArrowLeft size={14} /> Back to projects
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ ...mono, fontSize: 12, color: T.slate }}>{project.id}</div>
          <div style={{ fontSize: 21, fontWeight: 700, color: T.ink, marginTop: 2 }}>{project.name}</div>
          <div style={{ fontSize: 12.5, color: T.slate, marginTop: 4, display: "flex", gap: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{project.location}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} />{project.start} – {project.end}</span>
          </div>
        </div>
        <RiskChip score={project.risk} />
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.line}`, marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            fontSize: 12.5, padding: "9px 14px", background: "none", border: "none", cursor: "pointer",
            color: tab === t ? T.ink : T.slate, fontWeight: tab === t ? 700 : 500, textTransform: "capitalize",
            borderBottom: tab === t ? `2px solid ${T.steel}` : "2px solid transparent", marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab p={project} />}
      {tab === "daily record" && <DailyRecordTab p={project} />}
      {tab === "risk & prediction" && <RiskTab p={project} />}
      {tab === "billing" && <BillingTab p={project} />}
      {tab === "benchmark" && <BenchmarkTab p={project} />}
    </div>
  );
}

function OverviewTab({ p }) {
  const cell = (label, value) => (
    <div>
      <div style={{ fontSize: 11.5, color: T.slate }}>{label}</div>
      <div style={{ fontSize: 14, color: T.ink, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Panel style={{ padding: 20, flex: 1.2 }}>
        <SectionLabel>Project profile</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {cell("Contractor", p.contractor)}
          {cell("Sector", p.sector)}
          {cell("Original cost", `₹${p.costOriginal} Cr`)}
          {cell("Revised cost", `₹${p.costRevised} Cr`)}
          {cell("Duration", p.duration)}
          {cell("Status", p.risk >= 70 ? "Delayed — at risk" : "Ongoing")}
        </div>
      </Panel>
      <Panel style={{ padding: 20, flex: 1 }}>
        <SectionLabel>Progress — planned vs actual</SectionLabel>
        <div style={{ marginTop: 8 }}>
          <ProgressBar planned={p.planned} actual={p.actual} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
            <span style={{ color: T.slate }}>Actual: <b style={{ color: T.ink, ...mono }}>{p.actual}%</b></span>
            <span style={{ color: T.slate }}>Planned: <b style={{ color: T.ink, ...mono }}>{p.planned}%</b></span>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 12, background: p.actual < p.planned ? T.warnBg : T.goodBg, borderRadius: 3, fontSize: 12, color: T.ink }}>
          {p.actual < p.planned
            ? `Running ${p.planned - p.actual} points behind planned trajectory.`
            : "Physical progress is on or ahead of plan."}
        </div>
      </Panel>
    </div>
  );
}

function DailyRecordTab({ p }) {
  const entries = [
    { date: "10 Sep 2026", status: "Running", by: "Site Engineer", note: "Girder segment 4 cast, cement bags photographed for verification." },
    { date: "9 Sep 2026", status: "Running", by: "Site Engineer", note: "Material delivery logged — 40 MT steel reinforcement." },
    { date: "8 Sep 2026", status: p.risk >= 70 ? "Stalled" : "Running", by: "Sub Engineer", note: p.risk >= 70 ? "Work halted — awaiting material clearance." : "Routine inspection completed." },
  ];
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Panel style={{ flex: 1, padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.line}` }}>
          <SectionLabel>Daily entries</SectionLabel>
        </div>
        {entries.map((e, i) => (
          <div key={i} style={{ padding: "14px 18px", borderBottom: i < entries.length - 1 ? `1px solid ${T.line}` : "none", display: "flex", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 3, background: T.paper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Camera size={15} color={T.slate} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink }}>{e.date}</span>
                <span style={{ fontSize: 11, ...mono, color: e.status === "Stalled" ? T.bad : T.good }}>{e.status}</span>
              </div>
              <div style={{ fontSize: 11.5, color: T.slate, marginTop: 2 }}>{e.by}</div>
              <div style={{ fontSize: 12.5, color: T.ink, marginTop: 5 }}>{e.note}</div>
            </div>
          </div>
        ))}
      </Panel>
      <Panel style={{ width: 250, padding: 16 }}>
        <SectionLabel>Visit log</SectionLabel>
        {["Site Engineer", "Sub Engineer", "QA/QC Engineer", "Material Engineer"].map((role, i) => (
          <div key={role} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.line}` : "none" }}>
            {i < 2 ? <CheckCircle2 size={14} color={T.good} /> : <Clock size={14} color={T.warn} />}
            <div style={{ fontSize: 12, color: T.ink }}>{role}</div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function RiskTab({ p }) {
  const gaugeData = [{ name: "risk", value: p.risk, fill: riskTone(p.risk) }];
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Panel style={{ padding: 18, width: 220, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <SectionLabel>Risk score</SectionLabel>
        <ResponsiveContainer width={140} height={140}>
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: T.paper }} maxBarSize={12} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ ...mono, fontSize: 28, fontWeight: 700, color: riskTone(p.risk), marginTop: -90 }}>{p.risk}</div>
        <div style={{ fontSize: 12, color: T.slate, marginTop: 55 }}>{riskLabel(p.risk)}</div>
      </Panel>

      <Panel style={{ padding: 18, flex: 1 }}>
        <SectionLabel>6-month risk trend</SectionLabel>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={p.trend}>
            <CartesianGrid stroke={T.line} vertical={false} />
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: T.slate }} axisLine={{ stroke: T.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: T.slate }} axisLine={false} tickLine={false} width={26} />
            <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${T.line}`, borderRadius: 3 }} />
            <Line type="monotone" dataKey="v" stroke={riskTone(p.risk)} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel style={{ padding: 18, width: 300 }}>
        <SectionLabel>Top contributing factors</SectionLabel>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={p.factors} layout="vertical" margin={{ left: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="f" width={140} tick={{ fontSize: 10.5, fill: T.ink }} axisLine={false} tickLine={false} />
            <Bar dataKey="w" fill={T.steel} radius={[0, 2, 2, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ flexBasis: "100%" }} />
      <Panel style={{ padding: 16, flex: 1, background: T.paper, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertTriangle size={16} color={T.steelDeep} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink }}>Suggested action</div>
          <div style={{ fontSize: 12.5, color: T.ink, marginTop: 3 }}>{p.recommendation}</div>
        </div>
      </Panel>
    </div>
  );
}

function BillingTab({ p }) {
  return (
    <Panel>
      <div style={{ display: "grid", gridTemplateColumns: "0.6fr 1fr 1fr 1fr 1fr", padding: "10px 16px", fontSize: 11, color: T.slate, fontWeight: 600, borderBottom: `1px solid ${T.line}` }}>
        <div>BILL</div><div>CLAIMED (₹ Cr)</div><div>AI-EXPECTED (₹ Cr)</div><div>VARIANCE</div><div>STATUS</div>
      </div>
      {p.billing.map((b) => {
        const variance = (((b.claimed - b.expected) / b.expected) * 100).toFixed(1);
        return (
          <div key={b.id} style={{ display: "grid", gridTemplateColumns: "0.6fr 1fr 1fr 1fr 1fr", padding: "13px 16px", borderBottom: `1px solid ${T.line}`, alignItems: "center" }}>
            <div style={{ ...mono, fontSize: 12.5, fontWeight: 600 }}>{b.id}</div>
            <div style={{ ...mono, fontSize: 12.5 }}>{b.claimed.toFixed(1)}</div>
            <div style={{ ...mono, fontSize: 12.5, color: T.slate }}>{b.expected.toFixed(1)}</div>
            <div style={{ ...mono, fontSize: 12.5, color: variance > 10 ? T.bad : T.good }}>{variance > 0 ? "+" : ""}{variance}%</div>
            <div>
              {b.status === "flagged" ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.bad }}><XCircle size={13} /> Flagged — awaiting reason</span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.good }}><CheckCircle2 size={13} /> Approved</span>
              )}
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

function BenchmarkTab({ p }) {
  const peers = projects.filter((x) => x.sector === p.sector);
  const avgActual = Math.round(peers.reduce((s, x) => s + x.actual, 0) / peers.length);
  return (
    <Panel style={{ padding: 20 }}>
      <SectionLabel>Compared to {peers.length} {p.sector.toLowerCase()} projects of similar profile</SectionLabel>
      <div style={{ display: "flex", gap: 40, marginTop: 10 }}>
        <div>
          <div style={{ fontSize: 11.5, color: T.slate }}>This project</div>
          <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: T.ink }}>{p.actual}%</div>
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: T.slate }}>Sector average at similar stage</div>
          <div style={{ ...mono, fontSize: 24, fontWeight: 700, color: T.slate }}>{avgActual}%</div>
        </div>
        <div>
          <div style={{ fontSize: 11.5, color: T.slate }}>Standing</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: p.actual < avgActual ? T.bad : T.good, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            {p.actual < avgActual ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
            {Math.abs(p.actual - avgActual)} pts {p.actual < avgActual ? "behind" : "ahead"} of peers
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------- priority queue ---------------------------------- */
function PriorityQueue({ openProject }) {
  const ranked = [...projects].sort((a, b) => b.risk - a.risk);
  return (
    <div style={{ padding: 28 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Priority queue</div>
      <div style={{ fontSize: 13, color: T.slate, marginBottom: 18 }}>Ranked by current risk score — most urgent first</div>
      <Panel>
        {ranked.map((p, i) => (
          <div key={p.id} onClick={() => openProject(p.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
            <div style={{ ...mono, fontSize: 15, fontWeight: 700, color: T.slate, width: 22 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{p.name}</div>
              <div style={{ fontSize: 12, color: T.slate, marginTop: 2 }}>{p.reason}</div>
            </div>
            <div style={{ fontSize: 12, color: p.daysFlagged > 0 ? T.warn : T.slate, ...mono, width: 110 }}>
              {p.daysFlagged > 0 ? `Flagged ${p.daysFlagged}d ago` : "No open flag"}
            </div>
            <RiskChip score={p.risk} />
            <ChevronRight size={15} color={T.slate} />
          </div>
        ))}
      </Panel>
    </div>
  );
}

/* ---------------------------------- benchmarking ---------------------------------- */
function Benchmarking() {
  const bySector = sectors.slice(1).map((s) => {
    const group = projects.filter((p) => p.sector === s);
    return { sector: s, avgRisk: Math.round(group.reduce((sum, p) => sum + p.risk, 0) / group.length), count: group.length };
  });
  return (
    <div style={{ padding: 28 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Benchmarking</div>
      <div style={{ fontSize: 13, color: T.slate, marginBottom: 18 }}>Cross-project comparison — read only</div>

      <Panel style={{ padding: 18, marginBottom: 16 }}>
        <SectionLabel>Average risk by sector</SectionLabel>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={bySector}>
            <CartesianGrid stroke={T.line} vertical={false} />
            <XAxis dataKey="sector" tick={{ fontSize: 12, fill: T.ink }} axisLine={{ stroke: T.line }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: T.slate }} axisLine={false} tickLine={false} width={26} />
            <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${T.line}`, borderRadius: 3 }} />
            <Bar dataKey="avgRisk" radius={[3, 3, 0, 0]} barSize={48}>
              {bySector.map((d, i) => <Bar key={i} fill={riskTone(d.avgRisk)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.7fr 0.7fr", padding: "10px 16px", fontSize: 11, color: T.slate, fontWeight: 600, borderBottom: `1px solid ${T.line}` }}>
          <div>PROJECT</div><div>SECTOR</div><div>PLANNED</div><div>ACTUAL</div><div>RISK</div>
        </div>
        {projects.map((p) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.7fr 0.7fr", padding: "12px 16px", borderBottom: `1px solid ${T.line}`, alignItems: "center" }}>
            <div style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: T.slate }}>{p.sector}</div>
            <div style={{ ...mono, fontSize: 12.5 }}>{p.planned}%</div>
            <div style={{ ...mono, fontSize: 12.5 }}>{p.actual}%</div>
            <div><RiskChip score={p.risk} size="sm" /></div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

/* ---------------------------------- billing alerts ---------------------------------- */
function BillingAlerts({ openProject }) {
  const flagged = projects.flatMap((p) => p.billing.filter((b) => b.status === "flagged").map((b) => ({ ...b, project: p })));
  return (
    <div style={{ padding: 28 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Billing alerts</div>
      <div style={{ fontSize: 13, color: T.slate, marginBottom: 18 }}>{flagged.length} bills flagged for claimed-vs-expected mismatch</div>
      <Panel>
        {flagged.map((b, i) => {
          const variance = (((b.claimed - b.expected) / b.expected) * 100).toFixed(1);
          return (
            <div key={i} onClick={() => openProject(b.project.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 18px", borderBottom: `1px solid ${T.line}`, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: 3, background: T.badBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={16} color={T.bad} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{b.project.name} — {b.id}</div>
                <div style={{ fontSize: 11.5, color: T.slate, marginTop: 2 }}>{b.project.contractor}</div>
              </div>
              <div style={{ ...mono, fontSize: 12.5, textAlign: "right" }}>
                <div>₹{b.claimed.toFixed(1)} Cr claimed</div>
                <div style={{ color: T.slate }}>₹{b.expected.toFixed(1)} Cr expected</div>
              </div>
              <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: T.bad, width: 60, textAlign: "right" }}>+{variance}%</div>
              <ChevronRight size={15} color={T.slate} />
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

/* ---------------------------------- app shell ---------------------------------- */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);

  const openProject = (id) => { setSelectedId(id); setView("detail"); };
  const selected = useMemo(() => projects.find((p) => p.id === selectedId), [selectedId]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.paper, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <Sidebar view={view} setView={(v) => { setView(v); setSelectedId(null); }} />
      <div style={{ flex: 1, overflow: "auto" }}>
        {view === "dashboard" && <Dashboard openProject={openProject} setView={setView} />}
        {view === "projects" && <ProjectsList openProject={openProject} />}
        {view === "detail" && selected && <ProjectDetail project={selected} back={() => setView("projects")} />}
        {view === "priority" && <PriorityQueue openProject={openProject} />}
        {view === "benchmark" && <Benchmarking />}
        {view === "billing" && <BillingAlerts openProject={openProject} />}
      </div>
    </div>
  );
}
