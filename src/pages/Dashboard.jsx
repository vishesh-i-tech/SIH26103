import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  MapPin,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { riskTone, riskLabel, formatINR } from "../utils/risk";
import { useProjects } from "../context/ProjectContext";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";
import DashboardGeoMap from "../components/DashboardGeoMap";

export function Dashboard() {
  const navigate = useNavigate();
  const { projects, loading, error, refreshProjects } = useProjects();
  const [portfolioView, setPortfolioView] = useState("map"); // "map" | "trajectory"

  const totalProjects = projects.length;
  const highRiskProjects = projects.filter((p) => p.risk >= 70);
  const watchProjects = projects.filter((p) => p.risk >= 45 && p.risk < 70);
  const stableProjects = projects.filter((p) => p.risk < 45);

  const totalOriginalCost = projects.reduce((s, p) => s + (p.costOriginal || 0), 0);
  const totalRevisedCost = projects.reduce((s, p) => s + (p.costRevised || 0), 0);
  const costDriftPct = totalOriginalCost > 0
    ? (((totalRevisedCost - totalOriginalCost) / totalOriginalCost) * 100).toFixed(1)
    : "0.0";

  // 6-month portfolio average risk trend
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const avgTrend = months.map((m, i) => ({
    m,
    v: projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.trend?.[i]?.v || 0), 0) / projects.length)
      : 0,
  }));

  const firstAvg = avgTrend[0]?.v || 50;
  const lastAvg = avgTrend[avgTrend.length - 1]?.v || 50;
  const isRising = lastAvg > firstAvg;
  const isFalling = lastAvg < firstAvg;
  const portfolioTrendColor = isRising ? tokens.bad : isFalling ? tokens.good : tokens.steel;

  // Top ranked projects by risk
  const ranked = [...projects].sort((a, b) => b.risk - a.risk);

  if (loading) {
    return (
      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            Central Sector Portfolio Overview
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            Connecting to Supabase and computing portfolio KPIs...
          </div>
        </div>
        <Panel style={{ padding: 36, textAlign: "center" }}>
          <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.steel, marginBottom: 6 }}>
            Loading live portfolio analytics...
          </div>
          <div style={{ fontSize: 12, color: tokens.slate }}>
            Fetching projects, cost metrics, and risk trajectories from Postgres.
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Title & Scope */}
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          Central Sector Portfolio Overview
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          Real-time risk scoring, milestone variance & anomaly detection for ₹150 Cr+ central infrastructure projects.
        </div>
      </div>

      {/* KPI Metric Panels */}
      <div className="responsive-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <Panel style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Total Monitored Projects
          </div>
          <div style={{ ...monoStyle, fontSize: 26, fontWeight: 700, color: tokens.ink, marginTop: 4 }}>
            {totalProjects}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            Across 4 central infrastructure sectors
          </div>
        </Panel>

        <Panel style={{ padding: "16px 18px", borderLeft: `3px solid ${tokens.bad}` }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            High-Risk / Critical
          </div>
          <div style={{ ...monoStyle, fontSize: 26, fontWeight: 700, color: tokens.bad, marginTop: 4 }}>
            {highRiskProjects.length}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            Score ≥ 70 requiring officer escalation
          </div>
        </Panel>

        <Panel style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Sanctioned vs Revised Cost
          </div>
          <div style={{ ...monoStyle, fontSize: 26, fontWeight: 700, color: tokens.ink, marginTop: 4 }}>
            {formatINR(totalRevisedCost)}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            Sanctioned: {formatINR(totalOriginalCost)}
          </div>
        </Panel>

        <Panel style={{ padding: "16px 18px", borderLeft: `3px solid ${tokens.warn}` }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Portfolio Cost Drift
          </div>
          <div style={{ ...monoStyle, fontSize: 26, fontWeight: 700, color: tokens.warn, marginTop: 4 }}>
            +{costDriftPct}%
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            ₹{totalRevisedCost - totalOriginalCost} Cr over original sanction
          </div>
        </Panel>
      </div>

      {/* Main Grid: Risk Trend & Priority Worklist */}
      <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        {/* Left Column: National Geo Grid Map OR Risk Trajectory Trend */}
        <Panel style={{ padding: 18, display: "flex", flexDirection: "column" }}>
          {/* Card Header with View Switcher */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.ink, display: "flex", alignItems: "center", gap: 6 }}>
                {portfolioView === "map" ? (
                  <>
                    <MapPin size={15} color={tokens.bad} />
                    <span>Risk Distribution Across India</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={15} color={tokens.steel} />
                    <span>Portfolio Risk Trajectory</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>
                {portfolioView === "map"
                  ? "Interactive GIS spatial risk grid · Hover states to inspect active corridors"
                  : "6-month weighted average risk progression across all projects"}
              </div>
            </div>

            {/* Pill Toggle Switcher */}
            <div
              style={{
                display: "inline-flex",
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                padding: 2,
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setPortfolioView("map")}
                style={{
                  padding: "5px 11px",
                  fontSize: 11.5,
                  fontWeight: portfolioView === "map" ? 700 : 500,
                  background: portfolioView === "map" ? tokens.panel : "transparent",
                  color: portfolioView === "map" ? tokens.ink : tokens.slate,
                  border: "none",
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: portfolioView === "map" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <MapPin size={12} color={portfolioView === "map" ? tokens.bad : tokens.slate} />
                <span>National Map</span>
              </button>

              <button
                type="button"
                onClick={() => setPortfolioView("trajectory")}
                style={{
                  padding: "5px 11px",
                  fontSize: 11.5,
                  fontWeight: portfolioView === "trajectory" ? 700 : 500,
                  background: portfolioView === "trajectory" ? tokens.panel : "transparent",
                  color: portfolioView === "trajectory" ? tokens.ink : tokens.slate,
                  border: "none",
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: portfolioView === "trajectory" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <TrendingUp size={12} color={portfolioView === "trajectory" ? tokens.steel : tokens.slate} />
                <span>Risk Trajectory</span>
              </button>
            </div>
          </div>

          {/* View Content */}
          {portfolioView === "map" ? (
            <DashboardGeoMap projects={projects} />
          ) : (
            <>
              {/* Trajectory Header Info */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, fontSize: 11.5, color: tokens.slate, marginBottom: 8 }}>
                <span style={{ width: 10, height: 2, background: portfolioTrendColor, display: "inline-block" }} />
                <span style={{ ...monoStyle, color: portfolioTrendColor, fontWeight: 600 }}>
                  Circle Mean ({lastAvg}) · {isRising ? "Rising Trajectory (+)" : isFalling ? "Improving Trajectory (-)" : "Stable"}
                </span>
              </div>

              {/* LineChart */}
              <div style={{ height: 260, width: "100%", marginTop: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={avgTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke={tokens.line} strokeDasharray="2 2" vertical={false} />
                    <XAxis
                      dataKey="m"
                      tick={{ fontSize: 11, fill: tokens.slate }}
                      axisLine={{ stroke: tokens.line }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: tokens.slate }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} / 100`, "Risk Score"]}
                      contentStyle={{
                        fontSize: 12,
                        background: tokens.panel,
                        border: `1px solid ${tokens.line}`,
                        borderRadius: tokens.radiusSm,
                        boxShadow: "none",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={portfolioTrendColor}
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: portfolioTrendColor }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Bottom Summary Bar */}
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              background: tokens.paper,
              borderRadius: tokens.radiusSm,
              border: `1px solid ${tokens.line}`,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11.5,
            }}
          >
            <div>
              <span style={{ color: tokens.slate }}>Stable (&lt;45): </span>
              <strong style={{ color: tokens.good, ...monoStyle }}>{stableProjects.length}</strong>
            </div>
            <div>
              <span style={{ color: tokens.slate }}>Watch (45-69): </span>
              <strong style={{ color: tokens.warn, ...monoStyle }}>{watchProjects.length}</strong>
            </div>
            <div>
              <span style={{ color: tokens.slate }}>Critical (≥70): </span>
              <strong style={{ color: tokens.bad, ...monoStyle }}>{highRiskProjects.length}</strong>
            </div>
          </div>
        </Panel>

        {/* Priority Worklist Preview */}
        <Panel style={{ padding: 18, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: tokens.ink }}>
                Priority Worklist
              </div>
              <div style={{ fontSize: 11, color: tokens.slate, marginTop: 1 }}>
                Top projects requiring immediate MoSPI intervention
              </div>
            </div>
            <Link
              to="/priority-queue"
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: tokens.steel,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>Full Queue</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {ranked.slice(0, 4).map((p, idx) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="box-hover-lift"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${tokens.line}`,
                  background: tokens.panel,
                  cursor: "pointer",
                }}
              >
                <div style={{ ...monoStyle, fontSize: 12, fontWeight: 700, color: tokens.slate, width: 16 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: tokens.ink,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: tokens.slate,
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.reason}
                  </div>
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

export default Dashboard;
