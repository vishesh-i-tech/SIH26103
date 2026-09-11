import React, { createContext, useContext, useState } from "react";
import { mockProjects as defaultProjects } from "../data/mockProjects";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("paimana_projects");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultProjects;
      }
    }
    return defaultProjects;
  });

  const addProject = (projectData) => {
    const cost = Number(projectData.costOriginal) || 500;
    const newId = projectData.id?.trim() || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProject = {
      id: newId,
      name: projectData.name?.trim() || "New Infrastructure Project",
      sector: projectData.sector || "Roads",
      location: projectData.location?.trim() || "State / Circle",
      contractor: projectData.contractor?.trim() || "Contractor Unassigned",
      costOriginal: cost,
      costRevised: cost,
      duration: projectData.duration ? `${projectData.duration} months` : "36 months",
      start: projectData.start || "Oct 2026",
      end: projectData.end || "Oct 2029",
      planned: 0,
      actual: 0,
      risk: 25, // moderate/stable default
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
      reason: "Initial site mobilization & alignment survey stage",
      recommendation: "Awaiting first ground entry from Field Officer.",
      billing: [],
      daysFlagged: 0,
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem("paimana_projects", JSON.stringify(updated));
    return newProject;
  };

  const getProject = (id) => {
    return projects.find((p) => p.id === id);
  };

  const sectors = ["All", ...new Set(projects.map((p) => p.sector))];

  return (
    <ProjectContext.Provider
      value={{
        projects,
        sectors,
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
