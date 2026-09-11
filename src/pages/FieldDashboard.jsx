import React, { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { normalizeProject } from "../utils/supabaseHelpers";
import { mockProjects } from "../data/mockProjects";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";
import ProgressBar from "../components/ProgressBar";

export function FieldDashboard() {
  const navigate = useNavigate();
  const { user, officerName } = useAuth();

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [todayLoggedCount, setTodayLoggedCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFieldDashboardData = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const fallback = mockProjects
        .filter((p) => p.id === "NH-4471" || p.id === "BR-2209")
        .map(normalizeProject);
      setAssignedProjects(fallback);
      setTodayLoggedCount(1);
      setMonthlyCount(18);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch user's submissions to find previously worked-on projects
      let submittedProjectIds = [];
      if (user?.id) {
        const { data: userEntries } = await supabase
          .from("daily_entries")
          .select("project_id, entry_date")
          .eq("submitted_by", user.id);

        if (userEntries && userEntries.length > 0) {
          submittedProjectIds = [...new Set(userEntries.map((e) => e.project_id))];
          setMonthlyCount(userEntries.length);

          const todayIso = new Date().toISOString().split("T")[0];
          const todayEntries = userEntries.filter((e) => e.entry_date === todayIso);
          setTodayLoggedCount(todayEntries.length);
        }
      }

      // 2. Fetch projects (either previously submitted by officer, or all projects if none submitted yet)
      let projectQuery = supabase.from("projects").select(`
        *,
        daily_entries(id, entry_date, work_status, created_at)
      `);

      if (submittedProjectIds.length > 0) {
        projectQuery = projectQuery.in("id", submittedProjectIds);
      } else {
        // Show primary active projects for new officers
        projectQuery = projectQuery.limit(4);
      }

      const { data: prjData, error: prjErr } = await projectQuery;
      if (prjErr) throw prjErr;

      const normalized = (prjData || []).map(normalizeProject);
      setAssignedProjects(normalized);
    } catch (err) {
      console.warn("Error loading field dashboard data:", err);
      setError(err.message);
      setAssignedProjects(
        mockProjects.filter((p) => p.id === "NH-4471" || p.id === "BR-2209").map(normalizeProject)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldDashboardData();
  }, [user?.id]);

  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Officer Header Card */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            Field Operations & Site Telemetry
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            Assigned to <strong style={{ color: tokens.ink }}>{officerName}</strong> · Live telemetry connection to Supabase
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
          <span>View Today's Checklist</span>
        </button>
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} />
            <span>Database query notice: {error}</span>
          </div>
          <button
            onClick={fetchFieldDashboardData}
            style={{
              background: "none",
              border: "none",
              color: tokens.bad,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Stat Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <Panel style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase" }}>
            Assigned Construction Sites
          </div>
          <div style={{ ...monoStyle, fontSize: 24, fontWeight: 700, color: tokens.ink, marginTop: 4 }}>
            {assignedProjects.length}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 2 }}>
            Infrastructure sites under your surveillance
          </div>
        </Panel>

        <Panel style={{ padding: "14px 16px", borderLeft: `3px solid ${todayLoggedCount > 0 ? tokens.good : tokens.warn}` }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase" }}>
            Today's Log Status
          </div>
          <div style={{ ...monoStyle, fontSize: 24, fontWeight: 700, color: todayLoggedCount > 0 ? tokens.good : tokens.warn, marginTop: 4 }}>
            {todayLoggedCount > 0 ? `${todayLoggedCount} Submitted` : "Entry Pending"}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 2 }}>
            {todayLoggedCount > 0 ? "Daily verification recorded in database" : "Awaiting ground entry upload"}
          </div>
        </Panel>

        <Panel style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase" }}>
            Total Site Submissions
          </div>
          <div style={{ ...monoStyle, fontSize: 24, fontWeight: 700, color: tokens.steel, marginTop: 4 }}>
            {monthlyCount} Entries
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 2 }}>
            Stored persistently in daily_entries table
          </div>
        </Panel>
      </div>

      {/* Assigned Projects Section */}
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink, marginBottom: 12 }}>
          My Construction Sites
        </div>

        {loading ? (
          <Panel style={{ padding: 32, textAlign: "center", color: tokens.slate }}>
            <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.steel, marginBottom: 4 }}>
              Loading Assigned Sites...
            </div>
            <div style={{ fontSize: 12 }}>Fetching projects and recent submission timestamps</div>
          </Panel>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {assignedProjects.map((p) => {
              // Check if an entry was logged today for this project
              const entries = p.daily_entries || [];
              const hasTodayLog = entries.some((e) => e.entry_date === todayIso);

              return (
                <Panel
                  key={p.id}
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    borderTop: hasTodayLog ? `3px solid ${tokens.good}` : `3px solid ${tokens.warn}`,
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ ...monoStyle, fontSize: 12, fontWeight: 700, color: tokens.steel }}>
                          {p.code || p.id}
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

                  {/* Log Status */}
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
                      <span style={{ color: tokens.slate }}>Today's Verification:</span>
                    </div>
                    {hasTodayLog ? (
                      <span style={{ color: tokens.good, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                        <CheckCircle2 size={12} /> Logged in Database
                      </span>
                    ) : (
                      <span style={{ color: tokens.warn, fontWeight: 600 }}>Entry Due</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                    <button
                      onClick={() => navigate(`/field-entry/${p.id}`)}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        background: hasTodayLog ? tokens.panel : tokens.steel,
                        color: hasTodayLog ? tokens.ink : "#FFFFFF",
                        border: `1px solid ${hasTodayLog ? tokens.line : tokens.steel}`,
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
                      <span>{hasTodayLog ? "Add Additional Entry" : "Submit Ground Log"}</span>
                    </button>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FieldDashboard;
