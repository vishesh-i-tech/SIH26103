import React from "react";
import { useNavigate } from "react-router-dom";
import {
  HardHat,
  PlusCircle,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { mockProjects } from "../data/mockProjects";
import { tokens, monoStyle } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";
import ProgressBar from "../components/ProgressBar";

export function FieldDashboard() {
  const navigate = useNavigate();
  const { officerName } = useAuth();

  // Pick 2-3 projects assigned to this Field Officer
  const assignedProjects = mockProjects.filter(
    (p) => p.id === "NH-4471" || p.id === "BR-2209"
  );

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Officer Header Card */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            Field Operations & Site Telemetry
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            Assigned to <strong style={{ color: tokens.ink }}>{officerName}</strong> · Madhya Pradesh Infrastructure Circle
          </div>
        </div>

        {/* Quick jump to tasks */}
        <button
          onClick={() => navigate("/field-tasks")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: tokens.panel,
            border: `1px solid ${tokens.line}`,
            borderRadius: tokens.radiusSm,
            fontSize: 12,
            fontWeight: 600,
            color: tokens.steelDeep,
            cursor: "pointer",
          }}
        >
          <ClipboardList size={14} color={tokens.steel} />
          <span>View Today's Checklist (3 items)</span>
        </button>
      </div>

      {/* Summary Stat Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <Panel style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase" }}>
            Assigned Projects
          </div>
          <div style={{ ...monoStyle, fontSize: 24, fontWeight: 700, color: tokens.ink, marginTop: 4 }}>
            {assignedProjects.length}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 2 }}>
            Roads & Bridge sector active sites
          </div>
        </Panel>

        <Panel style={{ padding: "14px 16px", borderLeft: `3px solid ${tokens.warn}` }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase" }}>
            Today's Log Status
          </div>
          <div style={{ ...monoStyle, fontSize: 24, fontWeight: 700, color: tokens.warn, marginTop: 4 }}>
            1 Pending
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 2 }}>
            BR-2209 logged · NH-4471 awaiting daily upload
          </div>
        </Panel>

        <Panel style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase" }}>
            Monthly Site Submissions
          </div>
          <div style={{ ...monoStyle, fontSize: 24, fontWeight: 700, color: tokens.good, marginTop: 4 }}>
            18 Entries
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 2 }}>
            100% geo-tag verification rate
          </div>
        </Panel>
      </div>

      {/* Assigned Projects Section */}
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink, marginBottom: 12 }}>
          My Assigned Construction Sites
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {assignedProjects.map((p) => {
            const isNH = p.id === "NH-4471";
            const lastEntry = isNH ? "Yesterday, 10 Sep 2026" : "Today, 11 Sep 2026 (Submitted)";
            const needsTodayEntry = isNH;

            return (
              <Panel
                key={p.id}
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  borderTop: needsTodayEntry ? `3px solid ${tokens.warn}` : `3px solid ${tokens.good}`,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...monoStyle, fontSize: 12, fontWeight: 700, color: tokens.steel }}>
                        {p.id}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "1px 6px",
                          background: tokens.paper,
                          border: `1px solid ${tokens.line}`,
                          borderRadius: tokens.radiusSm,
                          color: tokens.slate,
                        }}
                      >
                        {p.sector}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: tokens.ink, marginTop: 4 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: tokens.slate, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={12} />
                      <span>{p.location}</span>
                      <span>·</span>
                      <span>{p.contractor}</span>
                    </div>
                  </div>

                  <RiskChip score={p.risk} />
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5 }}>
                    <span style={{ color: tokens.slate }}>Site Progress:</span>
                    <span style={{ ...monoStyle, fontWeight: 600 }}>
                      Actual {p.actual}% / Planned {p.planned}%
                    </span>
                  </div>
                  <ProgressBar planned={p.planned} actual={p.actual} />
                </div>

                {/* Last Entry Status */}
                <div
                  style={{
                    padding: "8px 10px",
                    background: tokens.paper,
                    borderRadius: tokens.radiusSm,
                    border: `1px solid ${tokens.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={13} color={tokens.slate} />
                    <span style={{ color: tokens.slate }}>Last Ground Log:</span>
                    <strong style={{ color: tokens.ink }}>{lastEntry}</strong>
                  </div>
                  {needsTodayEntry ? (
                    <span style={{ color: tokens.warn, fontWeight: 600 }}>Entry Due</span>
                  ) : (
                    <span style={{ color: tokens.good, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                      <CheckCircle2 size={12} /> Logged
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                  <button
                    onClick={() => navigate(`/field-entry/${p.id}`)}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      background: needsTodayEntry ? tokens.steel : tokens.panel,
                      color: needsTodayEntry ? "#FFFFFF" : tokens.ink,
                      border: `1px solid ${needsTodayEntry ? tokens.steel : tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      fontWeight: 600,
                      fontSize: 12.5,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <PlusCircle size={14} />
                    <span>{needsTodayEntry ? "Add Today's Entry" : "Add Additional Entry"}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    style={{
                      padding: "9px 12px",
                      background: tokens.panel,
                      color: tokens.slate,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      fontWeight: 500,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    title="View full project intelligence"
                  >
                    <span>Inspect</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FieldDashboard;
