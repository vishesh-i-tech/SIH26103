import React, { useEffect, useMemo, useState, useCallback } from "react";
import { tokens } from "../styles/tokens";
import { Panel } from "./Panel";

// Never hardcode the ML API host — Vite env var with a local-dev fallback.
const API_BASE = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

const LAND_STATUS_OPTIONS = ["Clear", "Pending", "Disputed"];

function riskColor(score) {
  if (score >= 66) return { fg: tokens.bad, bg: tokens.badBg, label: "High risk" };
  if (score >= 34) return { fg: tokens.warn, bg: tokens.warnBg, label: "Watch" };
  return { fg: tokens.good, bg: tokens.goodBg, label: "On track" };
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: "12px",
        color: tokens.slate,
        marginBottom: "6px",
        fontFamily: tokens.fontSans,
      }}
    >
      {children}
    </div>
  );
}

function ScoreBadge({ score, size = "lg" }) {
  const c = riskColor(score);
  const dims = size === "lg" ? { fs: "32px", pad: "10px 16px" } : { fs: "20px", pad: "6px 10px" };
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "8px",
        background: c.bg,
        border: `1px solid ${c.fg}`,
        borderRadius: tokens.radiusMd,
        padding: dims.pad,
      }}
    >
      <span
        style={{
          fontFamily: tokens.fontMono,
          fontSize: dims.fs,
          fontWeight: 600,
          color: c.fg,
          ...tokens.monoStyle,
        }}
      >
        {score}
      </span>
      <span style={{ fontSize: "12px", color: c.fg, fontFamily: tokens.fontSans }}>{c.label}</span>
    </div>
  );
}

function FactorList({ factors }) {
  if (!factors || factors.length === 0) {
    return <div style={{ fontSize: "13px", color: tokens.slate }}>No dominant factors returned.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {factors.map((f, i) => (
        <div key={`${f.feature}-${i}`}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              color: tokens.ink,
              marginBottom: "3px",
            }}
          >
            <span>{f.factor_text}</span>
            <span style={{ fontFamily: tokens.fontMono, color: tokens.slate, flexShrink: 0, marginLeft: "10px" }}>
              {f.weight}%
            </span>
          </div>
          <div
            style={{
              height: "4px",
              width: "100%",
              background: tokens.paper,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.radiusSm,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${f.weight}%`,
                background: f.shap_value >= 0 ? tokens.bad : tokens.good,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  fontSize: "13px",
  fontFamily: tokens.fontSans,
  color: tokens.ink,
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: tokens.radiusSm,
};

export function WhatIfSimulator({ projectId: initialProjectId = null }) {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [baselineProject, setBaselineProject] = useState(null);
  const [baselineAssessment, setBaselineAssessment] = useState(null);

  const [interventions, setInterventions] = useState({
    payment_delay_days: "",
    subcontracting_depth: "",
    land_clearance_status: "",
    design_scope_change_count: "",
    billing_progress_mismatch_pct: "",
  });

  const [result, setResult] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBaseline, setLoadingBaseline] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  // Load project list once.
  useEffect(() => {
    let cancelled = false;
    setLoadingProjects(true);
    fetch(`${API_BASE}/api/v1/projects`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load projects (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setProjects(data);
        if (!projectId && data.length > 0) setProjectId(data[0].id);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoadingProjects(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load baseline whenever the selected project changes.
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoadingBaseline(true);
    setResult(null);
    setError(null);
    fetch(`${API_BASE}/api/v1/projects/${encodeURIComponent(projectId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load project ${projectId} (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setBaselineProject(data.project);
        setBaselineAssessment(data.assessment);
        setInterventions({
          payment_delay_days: data.project.payment_delay_days ?? "",
          subcontracting_depth: data.project.subcontracting_depth ?? "",
          land_clearance_status: data.project.land_clearance_status ?? "",
          design_scope_change_count: data.project.design_scope_change_count ?? "",
          billing_progress_mismatch_pct: data.project.billing_progress_mismatch_pct ?? "",
        });
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoadingBaseline(false));
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const updateField = useCallback((key, value) => {
    setInterventions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasChanges = useMemo(() => {
    if (!baselineProject) return false;
    return Object.entries(interventions).some(([k, v]) => {
      if (v === "" || v === null || v === undefined) return false;
      const base = baselineProject[k];
      return String(base) !== String(v);
    });
  }, [interventions, baselineProject]);

  const runSimulation = useCallback(async () => {
    if (!projectId || !hasChanges) return;
    setSimulating(true);
    setError(null);
    try {
      const payload = {};
      if (interventions.payment_delay_days !== "")
        payload.payment_delay_days = Number(interventions.payment_delay_days);
      if (interventions.subcontracting_depth !== "")
        payload.subcontracting_depth = Number(interventions.subcontracting_depth);
      if (interventions.land_clearance_status !== "")
        payload.land_clearance_status = interventions.land_clearance_status;
      if (interventions.design_scope_change_count !== "")
        payload.design_scope_change_count = Number(interventions.design_scope_change_count);
      if (interventions.billing_progress_mismatch_pct !== "")
        payload.billing_progress_mismatch_pct = Number(interventions.billing_progress_mismatch_pct);

      const res = await fetch(`${API_BASE}/api/v1/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, interventions: payload }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Simulation failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  }, [projectId, interventions, hasChanges]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: tokens.fontSans }}>
      <div>
        <h2 style={{ fontSize: "16px", color: tokens.ink, margin: 0, marginBottom: "4px" }}>
          What-if intervention simulator
        </h2>
        <p style={{ fontSize: "13px", color: tokens.slate, margin: 0 }}>
          Adjust ground-research friction fields for a project and see how the risk score responds,
          computed live from Model B and real SHAP attribution.
        </p>
      </div>

      {error && (
        <Panel style={{ padding: "12px 14px", borderColor: tokens.bad }}>
          <span style={{ fontSize: "13px", color: tokens.bad }}>{error}</span>
        </Panel>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "16px" }}>
        {/* Controls */}
        <Panel style={{ padding: "16px" }}>
          <FieldRow label="Project">
            <select
              style={inputStyle}
              value={projectId || ""}
              disabled={loadingProjects}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Payment delay (days)">
            <input
              type="number"
              min={0}
              max={365}
              style={inputStyle}
              value={interventions.payment_delay_days}
              disabled={loadingBaseline}
              onChange={(e) => updateField("payment_delay_days", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Subcontracting depth (tiers)">
            <input
              type="number"
              min={0}
              max={5}
              style={inputStyle}
              value={interventions.subcontracting_depth}
              disabled={loadingBaseline}
              onChange={(e) => updateField("subcontracting_depth", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Land clearance status">
            <select
              style={inputStyle}
              value={interventions.land_clearance_status}
              disabled={loadingBaseline}
              onChange={(e) => updateField("land_clearance_status", e.target.value)}
            >
              {LAND_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Design / scope change count">
            <input
              type="number"
              min={0}
              max={10}
              style={inputStyle}
              value={interventions.design_scope_change_count}
              disabled={loadingBaseline}
              onChange={(e) => updateField("design_scope_change_count", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Billing / progress mismatch (%)">
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={interventions.billing_progress_mismatch_pct}
              disabled={loadingBaseline}
              onChange={(e) => updateField("billing_progress_mismatch_pct", e.target.value)}
            />
          </FieldRow>

          <button
            onClick={runSimulation}
            disabled={!hasChanges || simulating || loadingBaseline}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "13px",
              fontFamily: tokens.fontSans,
              color: "#FFFFFF",
              background: !hasChanges || simulating || loadingBaseline ? tokens.slate : tokens.steel,
              border: "none",
              borderRadius: tokens.radiusSm,
              cursor: !hasChanges || simulating || loadingBaseline ? "not-allowed" : "pointer",
            }}
          >
            {simulating ? "Running simulation…" : "Run simulation"}
          </button>
        </Panel>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Panel style={{ padding: "16px" }}>
            <SectionLabel>Baseline risk</SectionLabel>
            {loadingBaseline || !baselineAssessment ? (
              <div style={{ fontSize: "13px", color: tokens.slate }}>Loading baseline…</div>
            ) : (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <ScoreBadge score={baselineAssessment.risk_score} />
                  <span
                    style={{
                      marginLeft: "12px",
                      fontSize: "12px",
                      color: tokens.slate,
                      fontFamily: tokens.fontMono,
                    }}
                  >
                    time-overrun prob. {(baselineAssessment.time_overrun_probability * 100).toFixed(0)}%
                  </span>
                </div>
                <FactorList factors={baselineAssessment.factors} />
              </>
            )}
          </Panel>

          {result && (
            <Panel style={{ padding: "16px", borderColor: tokens.steel }}>
              <SectionLabel>Simulated risk (with interventions applied)</SectionLabel>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <ScoreBadge score={result.simulated.risk_score} />
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: tokens.fontMono,
                    color: result.improved ? tokens.good : tokens.bad,
                  }}
                >
                  {result.delta_risk_score > 0 ? "+" : ""}
                  {result.delta_risk_score} pts vs baseline
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: tokens.slate,
                    fontFamily: tokens.fontMono,
                  }}
                >
                  time-overrun prob. {(result.simulated.time_overrun_probability * 100).toFixed(0)}%
                </span>
              </div>
              <FactorList factors={result.simulated.factors} />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhatIfSimulator;
