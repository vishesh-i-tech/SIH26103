import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  TrendingDown,
  TrendingUp,
  Info,
  DollarSign,
  AlertCircle,
  ReceiptText,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { riskTone, riskLabel, formatINR } from "../utils/risk";
import { useProjects } from "../context/ProjectContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { normalizeProject } from "../utils/supabaseHelpers";
import {
  getInspectionCompliance,
  getComplianceStats,
  getDefaultDailyEntries,
} from "../utils/inspectionCompliance";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";
import ProgressBar from "../components/ProgressBar";
import WhatIfSimulator from "../components/WhatIfSimulator";

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, projects } = useProjects();
  const [activeTab, setActiveTab] = useState("overview");
  const [showRiskTooltip, setShowRiskTooltip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(() => getProject(id) || projects[0]);

  useEffect(() => {
    let mounted = true;
    async function loadProjectDetails() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured()) {
        const found = getProject(id) || projects.find((p) => p.code === id || p.id === id) || projects[0];
        if (mounted && found) {
          let merged = found;
          try {
            const localSubmissions = JSON.parse(localStorage.getItem("paimana_submissions") || "[]");
            const projectSubmissions = localSubmissions
              .filter((s) => s.projectId === found.id || s.projectId === found.code)
              .map((s) => ({
                id: s.id,
                date: s.date,
                status: s.status,
                reason: s.reason,
                materials: s.materials,
                notes: s.notes,
                hasPhoto: s.hasPhoto,
                photoName: s.photoName,
                reviewStatus: s.reviewStatus,
                submittedBy: s.submittedBy,
              }));

            if (projectSubmissions.length > 0) {
              merged = {
                ...found,
                dailyEntries: [...projectSubmissions, ...(found.dailyEntries || [])],
              };
            }
          } catch (e) {}

          setProject(merged);
          setLoading(false);
        }
        return;
      }

      try {
        let query = supabase
          .from("projects")
          .select(`
            *,
            risk_trend(month_label, risk_value, recorded_at),
            risk_factors(factor_text, weight),
            billing_entries(id, bill_code, claimed_amount, expected_amount, status, created_at),
            daily_entries(*, profiles:submitted_by(full_name))
          `);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          query = query.eq("id", id);
        } else {
          query = query.eq("code", id);
        }

        const { data, error: qErr } = await query.maybeSingle();

        if (qErr) throw qErr;

        if (data && mounted) {
          setProject(normalizeProject(data));
        } else if (mounted) {
          const found = getProject(id) || projects[0];
          setProject(found);
        }
      } catch (err) {
        console.warn("Error fetching project details from Supabase:", err);
        if (mounted) {
          setError(err.message);
          setProject(getProject(id) || projects[0]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProjectDetails();
    return () => {
      mounted = false;
    };
  }, [id, projects]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "daily-record", label: "Daily Record" },
    { id: "risk-prediction", label: "Risk & Prediction" },
    { id: "billing", label: "Billing Verification" },
    { id: "benchmark", label: "Benchmarking" },
    { id: "what-if", label: "What-If Simulator" },
  ];

  return (
    <div style={{ padding: 28 }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/projects")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: tokens.steel,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: 14,
          padding: 0,
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Project Directory</span>
      </button>

      {/* Project Banner Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ ...monoStyle, fontSize: 12, color: tokens.slate, fontWeight: 600 }}>
            {project.id} · {project.sector}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: tokens.ink, marginTop: 3 }}>
            {project.name}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12, color: tokens.slate, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={13} color={tokens.slate} />
              {project.location}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={13} color={tokens.slate} />
              {project.start} – {project.end} ({project.duration})
            </span>
          </div>
        </div>

        {/* Risk Chip with Info Tooltip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RiskChip score={project.risk} size="lg" />
          <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={() => setShowRiskTooltip(true)}
            onMouseLeave={() => setShowRiskTooltip(false)}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: tokens.radiusSm,
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title="Risk band definitions"
            >
              <Info size={13} color={tokens.slate} />
            </div>

            {showRiskTooltip && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 6,
                  background: tokens.ink,
                  color: "#FFFFFF",
                  padding: "6px 10px",
                  borderRadius: tokens.radiusSm,
                  fontSize: 11.5,
                  whiteSpace: "nowrap",
                  zIndex: 100,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  border: `1px solid ${tokens.line}`,
                  ...monoStyle,
                }}
              >
                Stable: &lt;45 · Watch: 45–69 · Critical: ≥70
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Header */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${tokens.line}`,
          marginBottom: 20,
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: 12.5,
                padding: "8px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active ? tokens.ink : tokens.slate,
                fontWeight: active ? 700 : 500,
                borderBottom: active ? `2px solid ${tokens.steel}` : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && <OverviewTab project={project} />}
      {activeTab === "daily-record" && <DailyRecordTab project={project} />}
      {activeTab === "risk-prediction" && <RiskPredictionTab project={project} />}
      {activeTab === "billing" && <BillingTab project={project} />}
      {activeTab === "benchmark" && <BenchmarkTab project={project} />}
      {activeTab === "what-if" && <WhatIfSimulator projectId={project.id || project.code} />}
    </div>
  );
}

/* ------------------- Sub Tabs ------------------- */

function OverviewTab({ project }) {
  const cell = (label, value, isMono = false) => (
    <div>
      <div style={{ fontSize: 11, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.02em" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 13.5,
          color: tokens.ink,
          fontWeight: 600,
          marginTop: 3,
          ...(isMono ? monoStyle : {}),
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
      <Panel style={{ padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: tokens.slate, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Contract & Scope Specifications
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {cell("Primary Contractor", project.contractor)}
          {cell("Sector Division", project.sector)}
          {/* Explicit Start Date distinct from Target Commissioning */}
          {cell("Project Start Date", project.start || "Feb 2024")}
          {cell("Target Commissioning", project.end)}
          {cell("Original Sanctioned Cost", formatINR(project.costOriginal), true)}
          {cell("Revised Current Cost", formatINR(project.costRevised), true)}
          {cell("Project Duration", project.duration)}
          {cell("Current Status", project.risk >= 70 ? "Critical Delay / High Risk" : project.risk >= 45 ? "Monitoring Alert / Watch" : "On Track / Stable")}
          {cell("Flagged Anomaly Days", `${project.daysFlagged || 0} days pending`, true)}
          {cell("Location Circle", project.location)}
        </div>
      </Panel>

      <Panel style={{ padding: 20, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: tokens.slate, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Physical Progress Trajectory
        </div>

        <div style={{ marginTop: 6 }}>
          <ProgressBar planned={project.planned} actual={project.actual} height={8} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
            <span style={{ color: tokens.slate }}>
              Actual: <b style={{ color: tokens.ink, ...monoStyle }}>{project.actual}%</b>
            </span>
            <span style={{ color: tokens.slate }}>
              Planned: <b style={{ color: tokens.ink, ...monoStyle }}>{project.planned}%</b>
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 12,
            background: project.actual < project.planned ? tokens.warnBg : tokens.goodBg,
            borderRadius: tokens.radiusSm,
            fontSize: 12,
            color: tokens.ink,
            border: `1px solid ${project.actual < project.planned ? tokens.warn : tokens.good}33`,
          }}
        >
          {project.actual < project.planned
            ? `Lagging ${project.planned - project.actual} percentage points behind schedule trajectory.`
            : "Physical execution is advancing according to the approved CPM/PERT baseline."}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: tokens.slate, textTransform: "uppercase" }}>Primary Risk Driver</div>
          <div style={{ fontSize: 12.5, color: tokens.ink, fontWeight: 600, marginTop: 4 }}>
            {project.reason}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function DailyRecordTab({ project }) {
  const entries = (project.dailyEntries && project.dailyEntries.length > 0)
    ? project.dailyEntries
    : getDefaultDailyEntries(project);

  const complianceList = getInspectionCompliance(project);
  const complianceStats = getComplianceStats(complianceList);

  const badgeBg = complianceStats.isAllPassed
    ? tokens.goodBg
    : complianceStats.hasCritical
    ? tokens.badBg
    : tokens.warnBg;
  const badgeColor = complianceStats.isAllPassed
    ? tokens.good
    : complianceStats.hasCritical
    ? tokens.bad
    : tokens.warn;
  const badgeBorder = complianceStats.isAllPassed
    ? `${tokens.good}44`
    : complianceStats.hasCritical
    ? `${tokens.bad}44`
    : `${tokens.warn}44`;

  return (
    <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
      <Panel>
        <div style={{ padding: "12px 18px", borderBottom: `1px solid ${tokens.line}`, fontSize: 12, fontWeight: 700, color: tokens.slate, textTransform: "uppercase" }}>
          Ground Verification Timeline ({entries.length} records)
        </div>
        {entries.map((entry, idx) => {
          const isStalled = entry.status === "Stalled";
          const isOff = entry.status === "Off";
          const isIssue = entry.status === "Issue Logged";
          const statusTone = isStalled ? tokens.bad : (isOff || isIssue) ? tokens.warn : tokens.good;
          const statusBg = isStalled ? tokens.badBg : (isOff || isIssue) ? tokens.warnBg : tokens.goodBg;

          return (
            <div
              key={entry.id || idx}
              style={{
                padding: "14px 18px",
                borderBottom: idx < entries.length - 1 ? `1px solid ${tokens.line}` : "none",
                display: "flex",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.radiusSm,
                  background: tokens.paper,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${tokens.line}`,
                }}
              >
                <Camera size={14} color={entry.hasPhoto ? tokens.steel : tokens.slate} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: tokens.ink }}>{entry.date}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {entry.reviewStatus && (
                      <span style={{ fontSize: 10.5, color: tokens.slate }}>
                        {entry.reviewStatus}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        ...monoStyle,
                        color: statusTone,
                        background: statusBg,
                        padding: "2px 6px",
                        borderRadius: tokens.radiusSm,
                        fontWeight: 600,
                      }}
                    >
                      {entry.status}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>
                  Logged by: <strong style={{ color: tokens.ink }}>{entry.submittedBy || "Site Engineer"}</strong>
                </div>
                {entry.reason && (
                  <div style={{ fontSize: 11.5, color: tokens.bad, marginTop: 3 }}>
                    Impediment Root Cause: {entry.reason}
                  </div>
                )}
                <div style={{ fontSize: 12, color: tokens.ink, marginTop: 4 }}>
                  {entry.notes || entry.note}
                </div>
                {entry.materials && entry.materials !== "None logged" && (
                  <div style={{ fontSize: 11, color: tokens.slate, marginTop: 4 }}>
                    Materials verified: {entry.materials}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Panel>

      <Panel style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: tokens.slate, textTransform: "uppercase" }}>
            Inspection Role Compliance
          </div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: tokens.radiusSm,
              background: badgeBg,
              color: badgeColor,
              border: `1px solid ${badgeBorder}`,
            }}
          >
            {complianceStats.passed}/{complianceStats.total} Compliant ({complianceStats.percentage}%)
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {complianceList.map((item, idx) => {
            const Icon = item.icon || CheckCircle2;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: tokens.paper,
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${item.color === tokens.bad ? `${tokens.bad}44` : tokens.line}`,
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1 }}>
                  <Icon size={15} color={item.color} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: tokens.ink }}>
                      {item.role}
                    </div>
                    {item.detail && (
                      <div style={{ fontSize: 10.5, color: tokens.slate, marginTop: 2, lineHeight: 1.3 }}>
                        {item.detail}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: item.color,
                    background: item.color === tokens.bad ? tokens.badBg : item.color === tokens.warn ? tokens.warnBg : tokens.goodBg,
                    padding: "2px 7px",
                    borderRadius: tokens.radiusSm,
                    flexShrink: 0,
                    textAlign: "right",
                    maxWidth: 160,
                  }}
                >
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function RiskPredictionTab({ project }) {
  const gaugeData = [{ name: "risk", value: project.risk, fill: riskTone(project.risk) }];

  // Dynamic stock-style risk trend line direction
  const trendData = project.trend || [];
  const firstVal = trendData[0]?.v ?? project.risk;
  const lastVal = trendData[trendData.length - 1]?.v ?? project.risk;
  const isRising = lastVal > firstVal;
  const isFalling = lastVal < firstVal;
  const trendStrokeColor = isRising ? tokens.bad : isFalling ? tokens.good : tokens.steel;

  // Plain language explainability synthesis
  const lag = project.planned - project.actual;
  const topFactors = project.factors || [];
  let whyThisScore = "";
  if (project.risk >= 70) {
    whyThisScore = `Risk is ${project.risk}/100 because progress is ${lag} points behind schedule (largest factor), compounded by ${topFactors.map((f) => f.f.toLowerCase()).join(", ")}.`;
  } else if (project.risk >= 45) {
    whyThisScore = `Risk is ${project.risk}/100 due to moderate schedule variance (${lag} points behind) and ongoing ${topFactors[0]?.f.toLowerCase() || "monitoring factors"}.`;
  } else {
    whyThisScore = `Risk is stable at ${project.risk}/100 as physical execution is aligned with schedule trajectory with no major critical path impediments.`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Plain-Language Explainability Panel */}
      <Panel
        style={{
          padding: "14px 18px",
          background: "#FAF9F6",
          border: `1px solid ${tokens.line}`,
          borderLeft: `3px solid ${riskTone(project.risk)}`,
        }}
      >
        <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Why this score? — Plain-Language Explainability
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: tokens.ink, marginTop: 4, lineHeight: 1.45 }}>
          {whyThisScore}
        </div>
      </Panel>

      <div className="responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "220px 1.4fr 1.2fr", gap: 16 }}>
        {/* Risk Gauge */}
        <Panel style={{ padding: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", fontWeight: 600 }}>
            Composite Risk Score
          </div>
          <div style={{ width: 140, height: 130, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={3} background={{ fill: tokens.paper }} maxBarSize={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ ...monoStyle, fontSize: 30, fontWeight: 700, color: riskTone(project.risk) }}>
                {project.risk}
              </div>
              <div style={{ fontSize: 11, color: tokens.slate, marginTop: -2 }}>
                {riskLabel(project.risk)}
              </div>
            </div>
          </div>
        </Panel>

        {/* Trend Chart with Dynamic Stock-Style Color */}
        <Panel style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", fontWeight: 600 }}>
              6-Month Risk Trend
            </div>
            <span
              style={{
                fontSize: 11,
                ...monoStyle,
                color: trendStrokeColor,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {isRising ? <TrendingUp size={13} /> : isFalling ? <TrendingDown size={13} /> : null}
              {isRising ? `Rising (+${lastVal - firstVal} pts)` : isFalling ? `Declining (-${firstVal - lastVal} pts)` : "Stable"}
            </span>
          </div>
          <div style={{ height: 140, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={tokens.line} strokeDasharray="2 2" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: tokens.slate }} axisLine={{ stroke: tokens.line }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: tokens.slate }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v} / 100`, "Risk"]}
                  contentStyle={{
                    fontSize: 12,
                    background: tokens.panel,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={trendStrokeColor}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: trendStrokeColor }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Explainability / Factor Breakdown */}
        <Panel style={{ padding: 18 }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
            Contributing Risk Factors (SHAP Weights)
          </div>
          <div style={{ height: 140, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={project.factors} layout="vertical" margin={{ left: 0, right: 15, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="f" width={140} tick={{ fontSize: 10.5, fill: tokens.ink }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(val) => [`${val}%`, "Impact Weight"]} />
                <Bar dataKey="w" fill={tokens.steel} radius={[0, 2, 2, 0]} barSize={11} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* AI Recommendation Box */}
      <Panel
        style={{
          padding: 18,
          background: tokens.paper,
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          border: `1px solid ${tokens.line}`,
        }}
      >
        <AlertTriangle size={18} color={tokens.steel} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: tokens.ink }}>
            PAIMANA AI Next Best Action
          </div>
          <div style={{ fontSize: 12.5, color: tokens.ink, marginTop: 4, lineHeight: 1.5 }}>
            {project.recommendation}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function BillingTab({ project }) {
  // Financial Disbursement Calculations
  const approvedTotal = (project.billing || [])
    .filter((b) => b.status === "approved")
    .reduce((s, b) => s + b.claimed, 0);

  const flaggedTotal = (project.billing || [])
    .filter((b) => b.status === "flagged")
    .reduce((s, b) => s + b.claimed, 0);

  const revisedCost = project.costRevised || project.costOriginal || 1;
  const approvedPct = ((approvedTotal / revisedCost) * 100).toFixed(1);
  const flaggedPct = ((flaggedTotal / revisedCost) * 100).toFixed(1);
  const gap = (Number(approvedPct) - project.actual).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Financial Disbursement Summary Panel */}
      <Panel style={{ padding: 18 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 12 }}>
          Financial Disbursement vs Physical Progress Audit
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 14 }}>
          {/* Amount Paid / Approved */}
          <div
            style={{
              padding: "12px 14px",
              background: tokens.goodBg,
              borderRadius: tokens.radiusSm,
              border: `1px solid ${tokens.good}33`,
            }}
          >
            <div style={{ fontSize: 11, color: tokens.good, fontWeight: 600, textTransform: "uppercase" }}>
              Amount Paid / Approved
            </div>
            <div style={{ ...monoStyle, fontSize: 22, fontWeight: 700, color: tokens.good, marginTop: 3 }}>
              ₹{approvedTotal.toFixed(1)} Cr
            </div>
            <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>
              {approvedPct}% of revised cost (₹{revisedCost} Cr)
            </div>
          </div>

          {/* Amount Pending / Flagged */}
          <div
            style={{
              padding: "12px 14px",
              background: tokens.badBg,
              borderRadius: tokens.radiusSm,
              border: `1px solid ${tokens.bad}33`,
            }}
          >
            <div style={{ fontSize: 11, color: tokens.bad, fontWeight: 600, textTransform: "uppercase" }}>
              Amount Pending / Flagged
            </div>
            <div style={{ ...monoStyle, fontSize: 22, fontWeight: 700, color: tokens.bad, marginTop: 3 }}>
              ₹{flaggedTotal.toFixed(1)} Cr
            </div>
            <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>
              {flaggedPct}% of revised cost on hold
            </div>
          </div>

          {/* Comparison Against Physical Progress */}
          <div
            style={{
              padding: "12px 14px",
              background: tokens.paper,
              borderRadius: tokens.radiusSm,
              border: `1px solid ${tokens.line}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 11, color: tokens.slate, textTransform: "uppercase" }}>
              Progress Variance Gap
            </div>
            <div style={{ ...monoStyle, fontSize: 20, fontWeight: 700, color: gap > 0 ? tokens.bad : tokens.good, marginTop: 3 }}>
              {gap > 0 ? `+${gap} pts gap` : `${gap} pts gap`}
            </div>
            <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>
              {gap > 0 ? "Expenditure outpacing physical work" : "Disbursement within physical milestone"}
            </div>
          </div>
        </div>

        {/* Narrative Comparison Line */}
        <div
          style={{
            padding: "8px 12px",
            background: Number(gap) > 10 ? tokens.warnBg : tokens.paper,
            borderRadius: tokens.radiusSm,
            border: `1px solid ${Number(gap) > 10 ? tokens.warn : tokens.line}`,
            fontSize: 12,
            color: tokens.ink,
          }}
        >
          <strong>Audit Insight:</strong> Financial progress: <b>{approvedPct}%</b> of sanctioned cost disbursed vs Physical progress: <b>{project.actual}%</b> — a <b>{Math.abs(gap)}-point gap</b>. {Number(gap) > 10 ? "This triggers high priority billing anomaly monitoring." : "Disbursement trajectory complies with milestone gates."}
        </div>
      </Panel>

      {/* Bill-by-Bill Verification Table */}
      <Panel style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 640 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "0.8fr 1fr 1fr 1fr 1.2fr",
                padding: "10px 16px",
                fontSize: 11,
                color: tokens.slate,
                fontWeight: 600,
                borderBottom: `1px solid ${tokens.line}`,
                letterSpacing: "0.03em",
              }}
            >
              <div>BILL ID</div>
              <div>CLAIMED AMOUNT</div>
              <div>AI-EXPECTED (DAILY RECORD)</div>
              <div>VARIANCE %</div>
              <div>AUDIT STATUS</div>
            </div>

            {(project.billing || []).length === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center", color: tokens.slate, fontSize: 12.5 }}>
                No RA-bills submitted yet for this newly onboarded project.
              </div>
            ) : (
              (project.billing || []).map((b) => {
                const variance = (((b.claimed - b.expected) / b.expected) * 100).toFixed(1);
                const isFlagged = b.status === "flagged";
                return (
                  <div
                    key={b.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "0.8fr 1fr 1fr 1fr 1.2fr",
                      padding: "12px 16px",
                      borderBottom: `1px solid ${tokens.line}`,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ ...monoStyle, fontSize: 12.5, fontWeight: 600 }}>{b.id}</div>
                    <div style={{ ...monoStyle, fontSize: 12.5 }}>₹{b.claimed.toFixed(1)} Cr</div>
                    <div style={{ ...monoStyle, fontSize: 12.5, color: tokens.slate }}>₹{b.expected.toFixed(1)} Cr</div>
                    <div
                      style={{
                        ...monoStyle,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: variance > 10 ? tokens.bad : tokens.good,
                      }}
                    >
                      {variance > 0 ? "+" : ""}{variance}%
                    </div>
                    <div>
                      {isFlagged ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 11.5,
                            color: tokens.bad,
                            background: tokens.badBg,
                            padding: "2px 8px",
                            borderRadius: tokens.radiusSm,
                            border: `1px solid ${tokens.bad}33`,
                          }}
                        >
                          <XCircle size={13} />
                          <span>Flagged Anomaly — Hold Payment</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 11.5,
                            color: tokens.good,
                            background: tokens.goodBg,
                            padding: "2px 8px",
                            borderRadius: tokens.radiusSm,
                            border: `1px solid ${tokens.good}33`,
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Approved by MoSPI</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function BenchmarkTab({ project }) {
  const { projects } = useProjects();
  const peers = projects.filter((p) => p.sector === project.sector);
  const avgActual = Math.round(peers.reduce((s, p) => s + p.actual, 0) / peers.length);
  const diff = project.actual - avgActual;

  // Short explanation sentence of WHY
  const benchmarkWhy =
    diff < 0
      ? `Behind peers — ${project.reason || "land clearance dispute and material bottleneck are unique to this project among sector peers."}`
      : `Ahead of peers due to early material procurement, precast girder fabrication mobilization, and dry-season execution window.`;

  return (
    <Panel style={{ padding: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
        Peer Sector Benchmark: {project.sector} ({peers.length} active projects)
      </div>

      <div style={{ display: "flex", gap: 36, marginTop: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11.5, color: tokens.slate }}>This Project Actual</div>
          <div style={{ ...monoStyle, fontSize: 26, fontWeight: 700, color: tokens.ink, marginTop: 4 }}>
            {project.actual}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, color: tokens.slate }}>Sector Peer Average</div>
          <div style={{ ...monoStyle, fontSize: 26, fontWeight: 700, color: tokens.slate, marginTop: 4 }}>
            {avgActual}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, color: tokens.slate }}>Sector Relative Standing</div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: diff < 0 ? tokens.bad : tokens.good,
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {diff < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            <span>{Math.abs(diff)} percentage points {diff < 0 ? "behind" : "ahead of"} peer average</span>
          </div>
        </div>
      </div>

      {/* Benchmark Explanation Sentence (Requirement 4) */}
      <div
        style={{
          marginTop: 18,
          padding: "12px 14px",
          background: tokens.paper,
          borderRadius: tokens.radiusSm,
          border: `1px solid ${tokens.line}`,
          fontSize: 12.5,
          color: tokens.ink,
          lineHeight: 1.45,
        }}
      >
        <strong>Comparative Finding:</strong> {benchmarkWhy}
      </div>
    </Panel>
  );
}

export default ProjectDetail;
