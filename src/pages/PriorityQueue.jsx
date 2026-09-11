import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Clock, ChevronRight, ArrowRight, RefreshCw } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { normalizeProject } from "../utils/supabaseHelpers";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";

export function PriorityQueue() {
  const navigate = useNavigate();
  const { projects: contextProjects } = useProjects();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPriorityQueue = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const sorted = [...contextProjects].sort((a, b) => b.risk - a.risk);
      setProjects(sorted);
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
        `)
        .order("risk_score", { ascending: false });

      if (qErr) throw qErr;

      setProjects((data || []).map(normalizeProject));
    } catch (err) {
      console.warn("Priority Queue Supabase query error:", err);
      setError(err.message);
      setProjects([...contextProjects].sort((a, b) => b.risk - a.risk));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityQueue();
  }, []);

  return (
    <div style={{ padding: 28 }}>
      {/* Title */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          Officer Priority Worklist
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          Algorithmic ranking of infrastructure projects prioritized by composite risk and pending anomaly days via Supabase Postgres.
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
            <span>Database query notice: {error} (Displaying cached ranking)</span>
          </div>
          <button
            onClick={fetchPriorityQueue}
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

      <Panel>
        {loading ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: tokens.slate }}>
            <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.steel, marginBottom: 4 }}>
              Loading Priority Ranking...
            </div>
            <div style={{ fontSize: 12 }}>Sorting projects by risk_score descending from database</div>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: tokens.slate, fontSize: 13 }}>
            No monitored projects in priority queue.
          </div>
        ) : (
          projects.map((project, idx) => {
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
                  borderBottom: idx < projects.length - 1 ? `1px solid ${tokens.line}` : "none",
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
                      ({project.code || project.id})
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
          })
        )}
      </Panel>
    </div>
  );
}

export default PriorityQueue;
