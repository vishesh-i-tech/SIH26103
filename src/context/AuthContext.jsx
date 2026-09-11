import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const initialSubmissions = [
  {
    id: "SUB-104",
    date: "11 Sep 2026",
    projectId: "NH-4471",
    projectName: "Indore–Betul Highway Widening (Package 2)",
    status: "Running",
    reason: "",
    materials: "Cement: 120 bags · Steel: 42 MT",
    notes: "Girder casting for Pier 12 completed. Slump test: 110mm.",
    hasPhoto: true,
    photoName: "geo_chainage_42_pier12.jpg",
    reviewStatus: "Pending Review",
    submittedBy: "Rajesh Verma (Site Engineer)",
  },
  {
    id: "SUB-103",
    date: "10 Sep 2026",
    projectId: "BR-2209",
    projectName: "Narmada River Bridge, Hoshangabad",
    status: "Running",
    reason: "",
    materials: "Cement: 90 bags · Sand: 28 cum",
    notes: "Abutment A2 shuttering work inspected and cleared for concrete pour.",
    hasPhoto: true,
    photoName: "narmada_abutment_a2.jpg",
    reviewStatus: "Reviewed",
    reviewNote: "Verified by IPMD Technical Cell",
    submittedBy: "Rajesh Verma (Site Engineer)",
  },
  {
    id: "SUB-102",
    date: "09 Sep 2026",
    projectId: "NH-4471",
    projectName: "Indore–Betul Highway Widening (Package 2)",
    status: "Stalled",
    reason: "Land/legal dispute",
    materials: "None logged",
    notes: "Right-of-way dispute at km 44. Local revenue authority team visited.",
    hasPhoto: true,
    photoName: "row_dispute_km44.jpg",
    reviewStatus: "Reviewed",
    reviewNote: "Escalated to District Collector",
    submittedBy: "Rajesh Verma (Site Engineer)",
  },
  {
    id: "SUB-101",
    date: "08 Sep 2026",
    projectId: "BR-2209",
    projectName: "Narmada River Bridge, Hoshangabad",
    status: "Off",
    reason: "Weather",
    materials: "None logged",
    notes: "River water level exceeded safety limit (Gauge 3.4m). Operations halted.",
    hasPhoto: false,
    photoName: null,
    reviewStatus: "Reviewed",
    reviewNote: "Monsoon stoppage logged in schedule buffer",
    submittedBy: "Rajesh Verma (Site Engineer)",
  },
];

export function AuthProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    return localStorage.getItem("paimana_role") || "admin";
  });

  const [officerName, setOfficerName] = useState(() => {
    return localStorage.getItem("paimana_officer") || "Er. Rajesh Verma";
  });

  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem("paimana_submissions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialSubmissions;
      }
    }
    return initialSubmissions;
  });

  const setRole = (newRole, name = null) => {
    setRoleState(newRole);
    localStorage.setItem("paimana_role", newRole);
    if (name) {
      setOfficerName(name);
      localStorage.setItem("paimana_officer", name);
    }
  };

  const logout = () => {
    // Reset session and set role back to unassigned or default admin
    localStorage.removeItem("paimana_role");
    setRoleState("admin");
  };

  const addSubmission = (submission) => {
    const newEntry = {
      id: `SUB-${100 + submissions.length + 1}`,
      date: new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
      reviewStatus: "Pending Review",
      submittedBy: officerName,
      ...submission,
    };
    const updated = [newEntry, ...submissions];
    setSubmissions(updated);
    localStorage.setItem("paimana_submissions", JSON.stringify(updated));
    return newEntry;
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        officerName,
        setRole,
        logout,
        submissions,
        addSubmission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
