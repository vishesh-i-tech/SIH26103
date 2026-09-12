import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import {
  fetchProjectsFromSupabase,
  normalizeProject,
  getStoredProjects,
  saveStoredProjects,
  generateProjectCode,
} from "../utils/supabaseHelpers";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => getStoredProjects());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await fetchProjectsFromSupabase();
      console.log("[ProjectContext / Supabase Query: projects]", { data, error: fetchErr });
      if (fetchErr && isSupabaseConfigured()) {
        setError(fetchErr.message || "Failed to load projects from Supabase.");
      }
      if (data && data.length > 0) {
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

    // Guaranteed unique identifier for the project
    const uniqueId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `prj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Resolve project code and ensure it does not collide with any existing project
    let rawCode = (projectData.id || projectData.code || "").trim();
    if (!rawCode) {
      rawCode = generateProjectCode(projectData.sector || "Roads", projects);
    }
    const existingCodes = new Set(
      projects.map((p) => (p.code || p.id || "").toUpperCase())
    );
    let finalCode = rawCode;
    if (existingCodes.has(finalCode.toUpperCase())) {
      finalCode = `${finalCode}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const newProject = normalizeProject({
      id: uniqueId,
      code: finalCode,
      name: projectData.name?.trim() || "New Infrastructure Project",
      sector: projectData.sector || "Roads",
      location: projectData.location?.trim() || "State / Circle",
      contractor: projectData.contractor?.trim() || "Contractor Unassigned",
      cost_original: cost,
      cost_revised: cost,
      duration_months: duration,
      start_date: projectData.start || "2026-11-01",
      target_date: projectData.end || "2029-11-01",
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
      dailyEntries: [],
    });

    // Save locally immediately so it persists across refreshes without deleting any existing projects
    setProjects((prev) => {
      const updated = [newProject, ...prev.filter((p) => p.id !== uniqueId)];
      saveStoredProjects(updated);
      return updated;
    });

    // If Supabase is configured, also persist to PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        const { data: newRow, error: insertErr } = await supabase
          .from("projects")
          .insert({
            code: finalCode,
            name: newProject.name,
            sector: newProject.sector,
            location: newProject.location,
            contractor: newProject.contractor,
            cost_original: cost,
            cost_revised: cost,
            duration_months: duration,
            start_date: "2026-11-01",
            target_date: "2029-11-01",
            planned_progress: 0,
            actual_progress: 0,
            risk_score: 25,
            reason: newProject.reason,
            recommendation: newProject.recommendation,
            days_flagged: 0,
            created_by: userId || null,
          })
          .select()
          .single();

        if (insertErr) {
          console.warn("Notice: Supabase insert returned error, retained in local storage:", insertErr);
        } else if (newRow?.id) {
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

          const savedSupabaseProject = normalizeProject(newRow);
          setProjects((prev) => {
            const updated = prev.map((p) => (p.id === uniqueId ? savedSupabaseProject : p));
            saveStoredProjects(updated);
            return updated;
          });
          return savedSupabaseProject;
        }
      } catch (err) {
        console.warn("Could not insert project to Supabase, persisted in local storage:", err);
      }
    }

    return newProject;
  };

  const getProject = (idOrCode) => {
    if (!idOrCode) return null;
    const target = String(idOrCode).trim().toLowerCase();
    return projects.find(
      (p) =>
        (p.id && String(p.id).trim().toLowerCase() === target) ||
        (p.code && String(p.code).trim().toLowerCase() === target)
    );
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
