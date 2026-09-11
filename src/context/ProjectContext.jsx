import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { fetchProjectsFromSupabase, normalizeProject } from "../utils/supabaseHelpers";
import { mockProjects } from "../data/mockProjects";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => mockProjects.map(normalizeProject));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await fetchProjectsFromSupabase();
      if (fetchErr && isSupabaseConfigured()) {
        setError(fetchErr.message || "Failed to load projects from Supabase.");
      }
      if (data) {
        setProjects(data);
      }
    } catch (err) {
      setError(err.message || "Failed to connect to Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const addProject = async (projectData, userId = null) => {
    const cost = Number(projectData.costOriginal) || 500;
    const duration = Number(projectData.duration) || 36;
    const code = projectData.id?.trim() || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isSupabaseConfigured()) {
      // Local fallback if Supabase is not configured yet
      const fallbackProject = normalizeProject({
        id: code,
        code: code,
        name: projectData.name?.trim() || "New Infrastructure Project",
        sector: projectData.sector || "Roads",
        location: projectData.location?.trim() || "State / Circle",
        contractor: projectData.contractor?.trim() || "Contractor Unassigned",
        cost_original: cost,
        cost_revised: cost,
        duration_months: duration,
        start_date: "2026-11-01",
        target_date: "2029-11-01",
        planned_progress: 0,
        actual_progress: 0,
        risk_score: 25,
        reason: "Initial site mobilization & alignment survey stage",
        recommendation: "Awaiting first ground entry from Field Officer.",
        days_flagged: 0,
        trend: [
          { m: "Apr", v: 25 },
          { m: "May", v: 25 },
          { m: "Jun", v: 25 },
          { m: "Jul", v: 25 },
          { m: "Aug", v: 25 },
          { m: "Sep", v: 25 },
        ],
        factors: [
          { f: "Initial mobilization & survey", w: 60 },
          { f: "Baseline statutory clearance", w: 40 },
        ],
        billing: [],
      });
      setProjects((prev) => [fallbackProject, ...prev]);
      return fallbackProject;
    }

    try {
      // Insert into projects table
      const { data: newRow, error: insertErr } = await supabase
        .from("projects")
        .insert({
          code,
          name: projectData.name?.trim() || "New Infrastructure Project",
          sector: projectData.sector || "Roads",
          location: projectData.location?.trim() || "State / Circle",
          contractor: projectData.contractor?.trim() || "Contractor Unassigned",
          cost_original: cost,
          cost_revised: cost,
          duration_months: duration,
          start_date: "2026-11-01",
          target_date: "2029-11-01",
          planned_progress: 0,
          actual_progress: 0,
          risk_score: 25,
          reason: "Initial site mobilization & alignment survey stage",
          recommendation: "Awaiting first ground entry from Field Officer.",
          days_flagged: 0,
          created_by: userId || null,
        })
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }

      // Insert baseline risk_trend and risk_factors
      if (newRow?.id) {
        const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
        const trendInserts = months.map((m) => ({
          project_id: newRow.id,
          month_label: m,
          risk_value: 25,
        }));
        await supabase.from("risk_trend").insert(trendInserts);

        await supabase.from("risk_factors").insert([
          { project_id: newRow.id, factor_text: "Initial mobilization & survey", weight: 60 },
          { project_id: newRow.id, factor_text: "Baseline statutory clearance", weight: 40 },
        ]);
      }

      await loadProjects();
      return normalizeProject(newRow);
    } catch (err) {
      console.error("Error adding project to Supabase:", err);
      throw err;
    }
  };

  const getProject = (idOrCode) => {
    return projects.find((p) => p.id === idOrCode || p.code === idOrCode);
  };

  const sectors = ["All", ...new Set(projects.map((p) => p.sector).filter(Boolean))];

  return (
    <ProjectContext.Provider
      value={{
        projects,
        sectors,
        loading,
        error,
        refreshProjects: loadProjects,
        addProject,
        getProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return ctx;
}

export default ProjectContext;
