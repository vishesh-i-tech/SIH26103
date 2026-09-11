import React from "react";
import { useLocation } from "react-router-dom";
import { Calendar, Shield, HardHat } from "lucide-react";
import { tokens } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";

const titleMap = {
  "/dashboard": "Portfolio Overview",
  "/projects": "Project Directory",
  "/priority-queue": "High-Risk Priority Queue",
  "/benchmarking": "Cross-Project Benchmarking",
  "/billing-alerts": "Billing Anomaly Alerts",
  "/assistant": "MoSPI AI Decision Assistant",
  "/field-dashboard": "My Assigned Projects",
  "/field-tasks": "Today's Field Tasks",
  "/field-submissions": "My Daily Submissions",
};

export function Header() {
  const location = useLocation();
  const { role, officerName } = useAuth();
  const currentPath = location.pathname;

  let pageTitle = titleMap[currentPath] || "Project Monitor";
  if (currentPath.startsWith("/projects/")) {
    pageTitle = "Project Intelligence File";
  } else if (currentPath.startsWith("/field-entry/")) {
    pageTitle = "Daily Ground Entry Upload";
  }

  const isField = role === "field_officer" || role === "field" || currentPath.startsWith("/field");

  const todayStr = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header
      style={{
        height: tokens.headerHeight,
        background: tokens.panel,
        borderBottom: `1px solid ${tokens.line}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink }}>
          {pageTitle}
        </div>
        <span style={{ color: tokens.line }}>|</span>
        <div style={{ fontSize: 11.5, color: tokens.slate }}>
          {isField
            ? "Site Engineer Telemetry & Material Verification"
            : "Ministry of Statistics and Programme Implementation (MoSPI)"}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            color: tokens.slate,
            padding: "4px 8px",
            background: tokens.paper,
            borderRadius: tokens.radiusSm,
            border: `1px solid ${tokens.line}`,
          }}
        >
          <Calendar size={13} color={tokens.slate} />
          <span>{todayStr}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            color: isField ? tokens.steelDeep : tokens.steel,
            fontWeight: 600,
          }}
        >
          {isField ? <HardHat size={14} color={tokens.warn} /> : <Shield size={13} />}
          <span>{isField ? `${officerName} (Site)` : "IPMD Live Portal"}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
