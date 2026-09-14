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
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PaimanaBrand from "./PaimanaBrand";

const adminNavItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    textColor: "#1E3A8A",
    iconColor: "#2563EB",
    bgNormal: "#EFF6FF",
    borderNormal: "#BFDBFE",
    bgActive: "#DBEAFE",
    borderActive: "#3B82F6",
    shadowActive: "rgba(59, 130, 246, 0.25)",
  },
  {
    to: "/projects",
    label: "Projects",
    icon: FolderKanban,
    textColor: "#065F46",
    iconColor: "#059669",
    bgNormal: "#ECFDF5",
    borderNormal: "#A7F3D0",
    bgActive: "#D1FAE5",
    borderActive: "#10B981",
    shadowActive: "rgba(16, 185, 129, 0.25)",
  },
  {
    to: "/priority-queue",
    label: "Priority Queue",
    icon: ListOrdered,
    textColor: "#9F1239",
    iconColor: "#E11D48",
    bgNormal: "#FFF1F2",
    borderNormal: "#FECDD3",
    bgActive: "#FFE4E6",
    borderActive: "#F43F5E",
    shadowActive: "rgba(244, 63, 94, 0.25)",
  },
  {
    to: "/benchmarking",
    label: "Benchmarking",
    icon: GitCompareArrows,
    textColor: "#5B21B6",
    iconColor: "#7C3AED",
    bgNormal: "#F5F3FF",
    borderNormal: "#DDD6FE",
    bgActive: "#EDE9FE",
    borderActive: "#8B5CF6",
    shadowActive: "rgba(139, 92, 246, 0.25)",
  },
  {
    to: "/billing-alerts",
    label: "Billing Alerts",
    icon: ReceiptText,
    textColor: "#92400E",
    iconColor: "#D97706",
    bgNormal: "#FFFBEB",
    borderNormal: "#FDE68A",
    bgActive: "#FEF3C7",
    borderActive: "#F59E0B",
    shadowActive: "rgba(245, 158, 11, 0.25)",
  },
  {
    to: "/simulator",
    label: "What-If Simulator",
    icon: SlidersHorizontal,
    textColor: "#075985",
    iconColor: "#0284C7",
    bgNormal: "#F0F9FF",
    borderNormal: "#BAE6FD",
    bgActive: "#E0F2FE",
    borderActive: "#0EA5E9",
    shadowActive: "rgba(14, 165, 233, 0.25)",
  },
  {
    to: "/assistant",
    label: "AI Assistant",
    icon: Bot,
    textColor: "#86198F",
    iconColor: "#C026D3",
    bgNormal: "#FDF4FF",
    borderNormal: "#F5D0FE",
    bgActive: "#FAE8FF",
    borderActive: "#D946EF",
    shadowActive: "rgba(217, 70, 239, 0.3)",
    isSpecialAi: true,
  },
  {
    to: "/officers",
    label: "Officers Directory",
    icon: Users,
    textColor: "#3730A3",
    iconColor: "#4F46E5",
    bgNormal: "#EEF2FF",
    borderNormal: "#C7D2FE",
    bgActive: "#E0E7FF",
    borderActive: "#6366F1",
    shadowActive: "rgba(99, 102, 241, 0.25)",
  },
];

const fieldNavItems = [
  {
    to: "/field-dashboard",
    label: "My Projects",
    icon: HardHat,
    textColor: "#92400E",
    iconColor: "#D97706",
    bgNormal: "#FFFBEB",
    borderNormal: "#FDE68A",
    bgActive: "#FEF3C7",
    borderActive: "#F59E0B",
    shadowActive: "rgba(245, 158, 11, 0.25)",
  },
  {
    to: "/field-tasks",
    label: "Today's Tasks",
    icon: ClipboardList,
    textColor: "#075985",
    iconColor: "#0284C7",
    bgNormal: "#F0F9FF",
    borderNormal: "#BAE6FD",
    bgActive: "#E0F2FE",
    borderActive: "#0EA5E9",
    shadowActive: "rgba(14, 165, 233, 0.25)",
  },
  {
    to: "/field-submissions",
    label: "My Submissions",
    icon: Send,
    textColor: "#065F46",
    iconColor: "#059669",
    bgNormal: "#ECFDF5",
    borderNormal: "#A7F3D0",
    bgActive: "#D1FAE5",
    borderActive: "#10B981",
    shadowActive: "rgba(16, 185, 129, 0.25)",
  },
];

export function Header() {
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
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        gap: 12,
        overflow: "visible",
      }}
    >
      {/* Left: Clickable PaimanaBrand to Home Page / */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <PaimanaBrand size="sm" showBadge={true} to="/" />
        <span style={{ width: 1, height: 18, background: "#CBD5E1" }} />
        <div
          style={{
            fontSize: "10.5px",
            color: "#64748B",
            fontWeight: 700,
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
          }}
        >
          {isField ? "Field Grid" : "MoSPI · IPMD"}
        </div>
      </div>

      {/* Center: Top Navigation Links in Rich Distinctive Colors (Never clipped) */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
          whiteSpace: "nowrap",
          overflow: "visible",
          padding: "2px 0",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="box-hover-lift"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 11px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: isActive ? 800 : 600,
                color: item.textColor,
                background: isActive ? item.bgActive : item.bgNormal,
                border: isActive
                  ? `1.5px solid ${item.borderActive}`
                  : `1px solid ${item.borderNormal}`,
                textDecoration: "none",
                whiteSpace: "nowrap",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: isActive
                  ? `0 2px 10px ${item.shadowActive}`
                  : "0 1px 2px rgba(0, 0, 0, 0.03)",
                transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "5px",
                      background: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <Icon size={13} color={item.iconColor} />
                  </div>
                  <span style={{ letterSpacing: "0.01em" }}>{item.label}</span>
                  {item.isSpecialAi && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 900,
                        padding: "1px 5px",
                        borderRadius: "4px",
                        background: "linear-gradient(135deg, #9333EA 0%, #C026D3 100%)",
                        color: "#FFFFFF",
                        letterSpacing: "0.05em",
                        boxShadow: "0 0 8px rgba(192, 38, 211, 0.4)",
                      }}
                    >
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Right: Quick Controls & Session (Streamlined so navbar has max room) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Role Switcher Button */}
        <button
          onClick={handleToggleRole}
          className="box-hover-lift"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 11px",
            background: isField ? "#F0F9FF" : "#FFFBEB",
            border: `1.5px solid ${isField ? "#0284C7" : "#F59E0B"}`,
            color: isField ? "#0369A1" : "#B45309",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            borderRadius: "7px",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
          title={isField ? "Switch to MoSPI Admin Executive View" : "Switch to Field Officer Site Telemetry View"}
        >
          {isField ? <ShieldCheck size={13} color="#0284C7" /> : <HardHat size={13} color="#D97706" />}
          <span>{isField ? "Admin ⇄" : "Field ⇄"}</span>
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleSwitchUser}
          className="box-hover-lift"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 10px",
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#475569",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            borderRadius: "7px",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
          title="Sign out and return to login"
        >
          <LogOut size={12} color="#64748B" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
