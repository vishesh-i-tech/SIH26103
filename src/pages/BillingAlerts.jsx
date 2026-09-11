import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, ChevronRight, ShieldAlert, FileText } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import Panel from "../components/Panel";

export function BillingAlerts() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  // Extract all flagged billing entries across all projects
  const flaggedItems = projects.flatMap((project) =>
    (project.billing || [])
      .filter((b) => b.status === "flagged")
      .map((b) => ({ ...b, project }))
  );

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          Billing Anomaly Detection Alerts
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          {flaggedItems.length} running account (RA) bills flagged for material quantity or cost outpacing verified ground records.
        </div>
      </div>

      <Panel>
        {flaggedItems.map((item, idx) => {
          const variance = (((item.claimed - item.expected) / item.expected) * 100).toFixed(1);
          return (
            <div
              key={`${item.project.id}-${item.id}`}
              onClick={() => navigate(`/projects/${item.project.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderBottom: idx < flaggedItems.length - 1 ? `1px solid ${tokens.line}` : "none",
                cursor: "pointer",
                transition: "background 0.1s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Alert Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.radiusSm,
                  background: tokens.badBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${tokens.bad}33`,
                }}
              >
                <AlertTriangle size={16} color={tokens.bad} />
              </div>

              {/* Bill & Project Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink }}>
                    {item.id} · {item.project.name}
                  </span>
                  <span style={{ ...monoStyle, fontSize: 11, color: tokens.slate }}>
                    ({item.project.id})
                  </span>
                </div>
                <div style={{ fontSize: 12, color: tokens.slate, marginTop: 3 }}>
                  Contractor: <span style={{ color: tokens.ink }}>{item.project.contractor}</span>
                  {" · "}
                  <span>Pending approval gate: <b>{item.project.daysFlagged} days</b></span>
                </div>
              </div>

              {/* Claimed vs Expected */}
              <div style={{ textAlign: "right" }}>
                <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.ink }}>
                  ₹{item.claimed.toFixed(1)} Cr claimed
                </div>
                <div style={{ ...monoStyle, fontSize: 11.5, color: tokens.slate }}>
                  ₹{item.expected.toFixed(1)} Cr expected
                </div>
              </div>

              {/* Variance Tag */}
              <div
                style={{
                  ...monoStyle,
                  fontSize: 13,
                  fontWeight: 700,
                  color: tokens.bad,
                  width: 75,
                  textAlign: "right",
                }}
              >
                +{variance}%
              </div>

              {/* Action */}
              <div style={{ display: "flex", alignItems: "center", color: tokens.slate }}>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

export default BillingAlerts;
