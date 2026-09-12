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
} from "lucide-react";
import { tokens } from "../styles/tokens";
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
  { to: "/field-submissions", label: "My Submissions", icon: Send },
];

export function Sidebar() {
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
    <aside
      style={{
        width: tokens.sidebarWidth,
        minWidth: tokens.sidebarWidth,
        background: tokens.sidebarBg,
        color: tokens.sidebarText,
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 50,
        userSelect: "none",
        borderRight: `1px solid ${tokens.sidebarBorder}`,
      }}
    >
      {/* Brand & MoSPI Header */}
      <div style={{ padding: "6px 10px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: tokens.radiusSm,
              background: tokens.steel,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 12,
              color: "#FFF",
            }}
          >
            P
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.03em" }}>
              PAIMANA AI
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10.5, color: tokens.sidebarMuted, marginTop: 4, lineHeight: 1.2 }}>
          {isField ? "Field Verification Module" : "MoSPI · IPMD Risk Monitor"}
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: tokens.radiusMd,
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#FFFFFF" : "#AAB2BB",
                background: isActive ? tokens.sidebarActive : "transparent",
                border: "none",
                transition: "background 0.15s ease, color 0.15s ease",
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} color={isActive ? "#FFFFFF" : "#8B94A0"} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Role & Auth */}
      <div
        style={{
          paddingTop: 12,
          borderTop: `1px solid ${tokens.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0 6px" }}>
          {isField ? (
            <HardHat size={16} color={tokens.warn} style={{ marginTop: 2 }} />
          ) : (
            <ShieldCheck size={16} color={tokens.steel} style={{ marginTop: 2 }} />
          )}
          <div style={{ fontSize: 11, color: tokens.sidebarMuted, lineHeight: 1.3 }}>
            <div>
              Role:{" "}
              <span style={{ color: "#DDE2E6", fontWeight: 600 }}>
                {isField ? "Field Officer" : "MoSPI Admin"}
              </span>
            </div>
            <div style={{ fontSize: 10, color: "#8B94A0" }}>
              {isField ? officerName : "Central Sector Oversight"}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleRole}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "8px 10px",
            background: isField ? "rgba(56, 189, 248, 0.12)" : "rgba(245, 158, 11, 0.12)",
            border: `1px solid ${isField ? "#38BDF8" : "#F59E0B"}44`,
            color: isField ? "#38BDF8" : "#F59E0B",
            fontSize: 11.5,
            cursor: "pointer",
            borderRadius: tokens.radiusSm,
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
          title={isField ? "Switch to MoSPI Admin Executive View" : "Switch to Field Officer Site Telemetry View"}
        >
          {isField ? <ShieldCheck size={14} /> : <HardHat size={14} />}
          <span>{isField ? "Switch to Admin View ⇄" : "Switch to Field Officer ⇄"}</span>
        </button>

        <button
          onClick={handleSwitchUser}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            background: tokens.sidebarHover,
            border: `1px solid ${tokens.sidebarBorder}`,
            color: "#DDE2E6",
            fontSize: 11.5,
            cursor: "pointer",
            borderRadius: tokens.radiusSm,
            textAlign: "left",
            fontWeight: 500,
            transition: "background 0.15s ease",
          }}
          title="Sign out and return to login"
        >
          <LogOut size={13} color="#8B94A0" />
          <span>Sign Out / Return to Login</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
