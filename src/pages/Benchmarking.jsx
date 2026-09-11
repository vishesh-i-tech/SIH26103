import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GitCompare, Layers, TrendingDown, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { riskTone } from "../utils/risk";
import { useProjects } from "../context/ProjectContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { normalizeProject } from "../utils/supabaseHelpers";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";

export function Benchmarking() {
  const navigate = useNavigate();
  const { projects: contextProjects, sectors: contextSectors } = useProjects();
  const [projects, setProjects] = useState([]);
  const [sectors, setSectors] = useState(["Roads", "Bridges", "Railways", "Power"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBenchmarkingData = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setProjects(contextProjects);
      setLoading(false);
      return;
    }

    try {
      const { data, error: qErr } = await supabase
        .from("projects")
        .select(`
          *,
          risk_trend(month_label, risk_value),
          risk_factors(factor_text, weight)
        `);

      if (qErr) throw qErr;

      const normalized = (data || []).map(normalizeProject);
      setProjects(normalized);
      const uniqueSectors = [...new Set(normalized.map((p) => p.sector).filter(Boolean))];
      if (uniqueSectors.length > 0) setSectors(uniqueSectors);
    } catch (err) {
      console.warn("Benchmarking Supabase query error:", err);
      setError(err.message);
      setProjects(contextProjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarkingData();
  }, []);

  // Aggregate stats per sector in JS
  const sectorData = sectors.map((sec) => {
    const list = projects.filter((p) => p.sector === sec);
    const avgRisk = list.length > 0 ? Math.round(list.reduce((sum, p) => sum + p.risk, 0) / list.length) : 0;
    const avgPlanned = list.length > 0 ? Math.round(list.reduce((sum, p) => sum + p.planned, 0) / list.length) : 0;
    const avgActual = list.length > 0 ? Math.round(list.reduce((sum, p) => sum + p.actual, 0) / list.length) : 0;
    return {
      sector: sec,
      count: list.length,
      avgRisk,
      avgPlanned,
      avgActual,
      lag: avgPlanned - avgActual,
    };
  });

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          Cross-Sector & Project Benchmarking
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          Comparative analytics aggregated across central sector portfolios via Supabase Postgres queries.
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: tokens.badBg,
            borderRadius: tokens.radiusSm,
            border: `1px solid ${tokens.bad}44`,
            color: tokens.bad,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} />
            <span>Database notice: {error} (Displaying cached benchmark data)</span>
          </div>
          <button
            onClick={fetchBenchmarkingData}
            style={{
              background: "none",
              border: "none",
              color: tokens.bad,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Sector Risk Bar Chart */}
      <Panel style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: tokens.slate, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Average Composite Risk Index by Sector
        </div>
        {loading ? (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: tokens.slate, fontSize: 12 }}>
            Aggregating sector statistics from Supabase...
          </div>
        ) : (
          <div style={{ height: 180, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={tokens.line} strokeDasharray="2 2" vertical={false} />
                <XAxis dataKey="sector" tick={{ fontSize: 12, fill: tokens.ink }} axisLine={{ stroke: tokens.line }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: tokens.slate }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} / 100`, "Sector Risk"]}
                  contentStyle={{
                    fontSize: 12,
                    background: tokens.panel,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                  }}
                />
                <Bar dataKey="avgRisk" radius={[3, 3, 0, 0]} barSize={44}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={riskTone(entry.avgRisk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      {/* Cross-Project Performance Table */}
      <Panel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 110px 100px 100px 120px 120px",
            padding: "10px 16px",
            fontSize: 11,
            color: tokens.slate,
            fontWeight: 600,
            borderBottom: `1px solid ${tokens.line}`,
            letterSpacing: "0.03em",
          }}
        >
          <div>PROJECT</div>
          <div>SECTOR</div>
          <div>PLANNED</div>
          <div>ACTUAL</div>
          <div>PACE VARIANCE</div>
          <div>RISK INDEX</div>
        </div>

        {loading ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: tokens.slate, fontSize: 12 }}>
            Loading cross-project telemetry...
          </div>
        ) : (
          projects.map((p, idx) => {
            const lag = p.planned - p.actual;
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 110px 100px 100px 120px 120px",
                  padding: "12px 16px",
                  borderBottom: idx < projects.length - 1 ? `1px solid ${tokens.line}` : "none",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }}>
                    {p.name}
                  </div>
                  <div style={{ ...monoStyle, fontSize: 11, color: tokens.slate }}>
                    {p.code || p.id} · {p.location}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: 11.5,
                      padding: "2px 6px",
                      background: tokens.paper,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      color: tokens.slate,
                    }}
                  >
                    {p.sector}
                  </span>
                </div>

                <div style={{ ...monoStyle, fontSize: 12.5, color: tokens.slate }}>
                  {p.planned}%
                </div>

                <div style={{ ...monoStyle, fontSize: 12.5, fontWeight: 600, color: tokens.ink }}>
                  {p.actual}%
                </div>

                <div
                  style={{
                    ...monoStyle,
                    fontSize: 12,
                    fontWeight: 600,
                    color: lag > 10 ? tokens.bad : lag > 0 ? tokens.warn : tokens.good,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {lag > 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  <span>{lag > 0 ? `-${lag} pts` : `+${Math.abs(lag)} pts`}</span>
                </div>

                <div>
                  <RiskChip score={p.risk} size="sm" />
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}

export default Benchmarking;
