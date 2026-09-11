import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, HardHat, ArrowRight, UserCheck, Lock } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";
import Panel from "../components/Panel";

export function Login() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState("admin"); // 'admin' | 'field'
  const [officerId, setOfficerId] = useState("MOSPI-IPMD-088");

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === "field") {
      setOfficerId("FLD-ENG-MP-412");
    } else {
      setOfficerId("MOSPI-IPMD-088");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === "field") {
      setRole("field", "Er. Rajesh Verma");
      navigate("/field-dashboard");
    } else {
      setRole("admin", "MoSPI IPMD Admin");
      navigate("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.paper,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Government Emblem / Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: tokens.ink,
              borderRadius: tokens.radiusMd,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              border: `1px solid ${tokens.line}`,
            }}
          >
            <Shield size={24} color={tokens.steel} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink, letterSpacing: "0.02em" }}>
            PAIMANA AI
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 4 }}>
            Ministry of Statistics and Programme Implementation (MoSPI)
          </div>
          <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>
            Infrastructure & Project Monitoring Division (IPMD) · Portal Gate
          </div>
        </div>

        {/* Login Box */}
        <Panel style={{ padding: "28px 24px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink, marginBottom: 14 }}>
              Select Authentication Role
            </div>

            {/* Role Cards Picker */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {/* Admin Card */}
              <div
                onClick={() => handleRoleChange("admin")}
                style={{
                  padding: "12px 14px",
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${selectedRole === "admin" ? tokens.steel : tokens.line}`,
                  background: selectedRole === "admin" ? "#F0F4F7" : tokens.panel,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Shield size={16} color={selectedRole === "admin" ? tokens.steel : tokens.slate} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: tokens.ink }}>
                    MoSPI Admin
                  </span>
                </div>
                <div style={{ fontSize: 11, color: tokens.slate, lineHeight: 1.3 }}>
                  Central IPMD oversight, risks & billing anomalies
                </div>
              </div>

              {/* Field Officer Card */}
              <div
                onClick={() => handleRoleChange("field")}
                style={{
                  padding: "12px 14px",
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${selectedRole === "field" ? tokens.steel : tokens.line}`,
                  background: selectedRole === "field" ? "#F0F4F7" : tokens.panel,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <HardHat size={16} color={selectedRole === "field" ? tokens.steel : tokens.slate} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: tokens.ink }}>
                    Field Officer
                  </span>
                </div>
                <div style={{ fontSize: 11, color: tokens.slate, lineHeight: 1.3 }}>
                  Site Engineer daily logs, photo & material upload
                </div>
              </div>
            </div>

            {/* Officer ID Field */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, color: tokens.slate, marginBottom: 5 }}>
                {selectedRole === "field" ? "Site Engineer Badge ID" : "MoSPI Officer Service ID"}
              </label>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                style={{
                  ...monoStyle,
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>

            {/* Passcode Field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11.5, color: tokens.slate, marginBottom: 5 }}>
                Security Clearance Passcode
              </label>
              <input
                type="password"
                defaultValue="••••••••••••"
                style={{
                  ...monoStyle,
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                background: tokens.steel,
                color: "#FFFFFF",
                border: "none",
                borderRadius: tokens.radiusSm,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>
                Enter as {selectedRole === "field" ? "Field Officer (Site Engineer)" : "MoSPI IPMD Admin"}
              </span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px solid ${tokens.line}`,
              fontSize: 11,
              color: tokens.slate,
              lineHeight: 1.4,
              textAlign: "center",
            }}
          >
            Role determines access scope. Admin directs to <b>/dashboard</b>; Field Officer directs to <b>/field-dashboard</b>.
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default Login;
