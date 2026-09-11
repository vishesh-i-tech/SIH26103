import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";

export function PriorityQueue() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const ranked = [...projects].sort((a, b) => b.risk - a.risk);

  return (
    <div style={{ padding: 28 }}>
      {/* Title */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          Officer Priority Worklist
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          Algorithmic ranking of infrastructure projects prioritized by composite risk and pending anomaly days.
        </div>
      </div>

      <Panel>
        {ranked.map((project, idx) => {
          const isCritical = project.risk >= 70;
          return (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderBottom: idx < ranked.length - 1 ? `1px solid ${tokens.line}` : "none",
                cursor: "pointer",
                background: isCritical ? "#FAF9F6" : tokens.panel,
                transition: "background 0.1s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F2EB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isCritical ? "#FAF9F6" : tokens.panel)}
            >
              {/* Rank Index */}
              <div
                style={{
                  ...monoStyle,
                  fontSize: 16,
                  fontWeight: 700,
                  color: isCritical ? tokens.bad : tokens.slate,
                  width: 24,
                  textAlign: "center",
                }}
              >
                {idx + 1}
              </div>

              {/* Project Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: tokens.ink }}>
                    {project.name}
                  </span>
                  <span style={{ ...monoStyle, fontSize: 11, color: tokens.slate }}>
                    ({project.id})
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: "1px 6px",
                      background: tokens.paper,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      color: tokens.slate,
                    }}
                  >
                    {project.sector}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: tokens.slate, marginTop: 4 }}>
                  <span style={{ fontWeight: 500, color: tokens.ink }}>Root Driver: </span>
                  {project.reason}
                </div>
              </div>

              {/* Flagged Status */}
              <div style={{ width: 140, textAlign: "right" }}>
                {project.daysFlagged > 0 ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11.5,
                      color: tokens.warn,
                      fontWeight: 600,
                      ...monoStyle,
                    }}
                  >
                    <Clock size={13} />
                    <span>Flagged {project.daysFlagged}d ago</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 11.5, color: tokens.slate, ...monoStyle }}>
                    Routine Monitor
                  </span>
                )}
              </div>

              {/* Risk Chip */}
              <div>
                <RiskChip score={project.risk} />
              </div>

              {/* Action */}
              <div style={{ display: "flex", alignItems: "center", color: tokens.steel }}>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

export default PriorityQueue;
