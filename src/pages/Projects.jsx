import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { normalizeProject } from "../utils/supabaseHelpers";
import Panel from "../components/Panel";
import RiskChip from "../components/RiskChip";
import ProgressBar from "../components/ProgressBar";

export function Projects() {
  const navigate = useNavigate();
  const { projects: contextProjects, sectors: contextSectors } = useProjects();

  const [projects, setProjects] = useState([]);
  const [sectors, setSectors] = useState(["All", "Roads", "Bridges", "Railways", "Power"]);
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects using Supabase query (.ilike for search, .eq for sector)
  const fetchFilteredProjects = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      // Local fallback
      const filtered = contextProjects.filter((p) => {
        const matchSector = selectedSector === "All" || p.sector === selectedSector;
        const matchSearch =
          !search.trim() ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.code && p.code.toLowerCase().includes(search.toLowerCase())) ||
          (p.contractor && p.contractor.toLowerCase().includes(search.toLowerCase())) ||
          (p.location && p.location.toLowerCase().includes(search.toLowerCase()));
        return matchSector && matchSearch;
      });
      setProjects(filtered);
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from("projects").select(`
        *,
        risk_trend(month_label, risk_value, recorded_at),
        risk_factors(factor_text, weight),
        billing_entries(bill_code, claimed_amount, expected_amount, status)
      `);

      if (selectedSector !== "All") {
        query = query.eq("sector", selectedSector);
      }

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`name.ilike.${term},code.ilike.${term},contractor.ilike.${term},location.ilike.${term}`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error: qErr } = await query;

      if (qErr) {
        throw qErr;
      }

      setProjects((data || []).map(normalizeProject));
    } catch (err) {
      console.warn("Error querying projects via Supabase:", err);
      setError(err.message || "Failed to query projects from database.");
      // Graceful fallback to context projects
      setProjects(contextProjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProjects();
  }, [selectedSector, search, contextProjects]);

  return (
    <div style={{ padding: 28 }}>
      {/* Page Title & Count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            Central Sector Project Directory
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            {loading ? "Querying database..." : `Showing ${projects.length} monitored infrastructure projects via Supabase`}
          </div>
        </div>

        {/* Add Project Button (Top Right) */}
        <button
          onClick={() => navigate("/projects/new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: tokens.steel,
            color: "#FFFFFF",
            border: "none",
            borderRadius: tokens.radiusSm,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "none",
          }}
        >
          <Plus size={15} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Error Alert */}
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
            <span>Database query notice: {error} (Displaying cached projects)</span>
          </div>
          <button
            onClick={fetchFilteredProjects}
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

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: tokens.panel,
            border: `1px solid ${tokens.line}`,
            borderRadius: tokens.radiusSm,
            padding: "8px 12px",
            flex: 1,
            maxWidth: 360,
          }}
        >
          <Search size={14} color={tokens.slate} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, title, contractor, state..."
            style={{
              border: "none",
              outline: "none",
              fontSize: 12.5,
              flex: 1,
              background: "transparent",
              color: tokens.ink,
            }}
          />
        </div>

        {/* Sector Tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {sectors.map((sec) => {
            const active = selectedSector === sec;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                style={{
                  fontSize: 12,
                  padding: "7px 12px",
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                  border: `1px solid ${active ? tokens.steel : tokens.line}`,
                  background: active ? tokens.steelDeep : tokens.panel,
                  color: active ? "#FFFFFF" : tokens.ink,
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.1s ease",
                }}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Table */}
      <Panel style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 860 }}>
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 100px 1.1fr 1fr 1fr 120px 24px",
                padding: "10px 16px",
                fontSize: 11,
                color: tokens.slate,
                fontWeight: 600,
                borderBottom: `1px solid ${tokens.line}`,
                letterSpacing: "0.03em",
              }}
            >
              <div>PROJECT CODE & NAME</div>
              <div>SECTOR</div>
              <div>CONTRACTOR</div>
              <div>LOCATION</div>
              <div>PROGRESS (ACTUAL / PLANNED)</div>
              <div>RISK SCORE</div>
              <div />
            </div>

            {/* Table Rows or Loading Skeleton */}
            {loading ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: tokens.slate }}>
                <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.steel, marginBottom: 4 }}>
                  Executing Postgres Query...
                </div>
                <div style={{ fontSize: 12 }}>Filtering central sector records via Supabase</div>
              </div>
            ) : projects.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: tokens.slate, fontSize: 13 }}>
                No infrastructure projects match the selected filters.
              </div>
            ) : (
              projects.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 100px 1.1fr 1fr 1fr 120px 24px",
                    padding: "13px 16px",
                    borderBottom: i < projects.length - 1 ? `1px solid ${tokens.line}` : "none",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }}>
                      {p.name}
                    </div>
                    <div style={{ ...monoStyle, fontSize: 11, color: tokens.slate, marginTop: 1 }}>
                      {p.code || p.id}
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

                  <div style={{ fontSize: 12.5, color: tokens.ink }}>
                    {p.contractor}
                  </div>

                  <div style={{ fontSize: 12, color: tokens.ink, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={12} color={tokens.slate} />
                    <span>{p.location}</span>
                  </div>

                  <div style={{ paddingRight: 16 }}>
                    <ProgressBar planned={p.planned} actual={p.actual} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: tokens.slate, marginTop: 4, ...monoStyle }}>
                      <span>Act: <b>{p.actual}%</b></span>
                      <span>Plan: {p.planned}%</span>
                    </div>
                  </div>

                  <div>
                    <RiskChip score={p.risk} size="sm" />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ChevronRight size={14} color={tokens.slate} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default Projects;
