import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  FolderKanban,
  ListOrdered,
  GitCompareArrows,
  ReceiptText,
  Bot,
  SlidersHorizontal,
  ShieldCheck,
  HardHat,
  ClipboardList,
  Send,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const adminNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/priority-queue", label: "Priority Queue", icon: ListOrdered },
  { to: "/benchmarking", label: "Benchmarking", icon: GitCompareArrows },
  { to: "/billing-alerts", label: "Billing Alerts", icon: ReceiptText },
  { to: "/simulator", label: "What-If Simulator", icon: SlidersHorizontal },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
];

const fieldNavItems = [
  { to: "/field-dashboard", label: "My Projects", icon: HardHat },
  { to: "/field-tasks", label: "Today's Tasks", icon: ClipboardList },
  { to: "/field-submissions", label: "Submissions", icon: Send },
];

export function BottomNavBar() {
  const navigate = useNavigate();
  const { role, logout, officerName, switchRole } = useAuth();

  const isField = role === "field_officer" || role === "field";
  const navItems = isField ? fieldNavItems : adminNavItems;

  const handleToggleRole = () => {
    const nextRole = isField ? "admin" : "field_officer";
    switchRole(nextRole);
    navigate(isField ? "/dashboard" : "/field-dashboard");
  };

  const handleSwitchUser = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "rgba(10, 15, 26, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        gap: "12px",
      }}
    >
      {/* Left: Compact Brand & Role Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 13,
            color: "#0F172A",
            boxShadow: "0 0 10px rgba(245, 158, 11, 0.5)",
          }}
        >
          P
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.04em" }}>
            PAIMANA AI
          </div>
          <div style={{ fontSize: 10, color: "#94A3B8" }}>
            {isField ? "Field Telemetry" : "MoSPI · IPMD Oversight"}
          </div>
        </div>
      </div>

      {/* Center: Navigation Links Horizontal Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          padding: "4px 0",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 11px",
                borderRadius: "9px",
                fontSize: "12px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#FBBF24" : "#94A3B8",
                background: isActive ? "rgba(245, 158, 11, 0.16)" : "transparent",
                border: isActive ? "1px solid rgba(245, 158, 11, 0.45)" : "1px solid transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "all 0.18s ease",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.className.includes("active")) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                  e.currentTarget.style.color = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.className.includes("active")) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94A3B8";
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} color={isActive ? "#FBBF24" : "#94A3B8"} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Right: Quick Role Switch & Sign Out */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button
          onClick={handleToggleRole}
          className="cursor-highlight-glow"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            color: "#FBBF24",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
            borderRadius: "8px",
            whiteSpace: "nowrap",
          }}
          title={isField ? "Switch to MoSPI Admin Executive View" : "Switch to Field Officer Telemetry View"}
        >
          {isField ? <ShieldCheck size={14} /> : <HardHat size={14} />}
          <span>{isField ? "Switch to Admin ⇄" : "Switch to Field Officer ⇄"}</span>
        </button>

        <button
          onClick={handleSwitchUser}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#CBD5E1",
            fontSize: 11.5,
            fontWeight: 600,
            cursor: "pointer",
            borderRadius: "8px",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            e.currentTarget.style.borderColor = "#EF4444";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.color = "#CBD5E1";
          }}
          title="Sign out and return to login"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

export default BottomNavBar;
