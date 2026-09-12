import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, HardHat, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";
import Panel from "../components/Panel";

export function Login() {
  const navigate = useNavigate();
  const { signIn, isConfigured, switchRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your official email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await signIn({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Invalid email or password. Please verify your credentials.");
        } else {
          setErrorMsg(error.message || "Authentication failed. Please check your credentials.");
        }
      } else {
        // Redirect based on role
        const userRole = data?.user?.user_metadata?.role || "admin";
        if (userRole === "field_officer" || userRole === "field") {
          navigate("/field-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected network or authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper to fill demo credentials if needed
  const fillDemo = (roleKey) => {
    if (roleKey === "admin") {
      setEmail("vishu@mospi.gov.in");
      setPassword("MoSPI@Admin2026");
    } else {
      setEmail("field.officer@mospi.gov.in");
      setPassword("Field@Engineer2026");
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
            Infrastructure & Project Monitoring Division (IPMD) · Live Portal Access
          </div>
        </div>

        {/* Login Box */}
        <Panel style={{ padding: "28px 24px" }}>
          {/* Quick 1-Click Role Direct Access */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: tokens.slate,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Instant 1-Click Role Switch
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  switchRole("admin");
                  navigate("/dashboard");
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                  padding: "12px 14px",
                  background: "rgba(56, 189, 248, 0.08)",
                  border: `1.5px solid ${tokens.steel}`,
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.16)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.08)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Shield size={16} color={tokens.steel} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: tokens.ink }}>MoSPI Admin</span>
                  </div>
                  <ArrowRight size={13} color={tokens.steel} />
                </div>
                <div style={{ fontSize: 11, color: tokens.slate, lineHeight: 1.2 }}>
                  Executive Portfolio View
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchRole("field_officer");
                  navigate("/field-dashboard");
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                  padding: "12px 14px",
                  background: "rgba(245, 158, 11, 0.08)",
                  border: `1.5px solid ${tokens.warn}`,
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245, 158, 11, 0.16)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245, 158, 11, 0.08)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <HardHat size={16} color={tokens.warn} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: tokens.ink }}>Field Officer</span>
                  </div>
                  <ArrowRight size={13} color={tokens.warn} />
                </div>
                <div style={{ fontSize: 11, color: tokens.slate, lineHeight: 1.2 }}>
                  Site Telemetry View
                </div>
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "18px 0 16px",
              color: tokens.slate,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            <div style={{ flex: 1, height: 1, background: tokens.line }} />
            <span>OR SIGN IN WITH PASSWORD</span>
            <div style={{ flex: 1, height: 1, background: tokens.line }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink, marginBottom: 16 }}>
              Officer Sign In
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  background: tokens.badBg,
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${tokens.bad}44`,
                  color: tokens.bad,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 5 }}>
                OFFICIAL EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mospi.gov.in"
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 34px",
                    fontSize: 13,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                    background: tokens.panel,
                    color: tokens.ink,
                    outline: "none",
                  }}
                />
                <Mail size={15} color={tokens.slate} style={{ position: "absolute", left: 10, top: 11 }} />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 5 }}>
                SECURITY PASSCODE
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    ...monoStyle,
                    width: "100%",
                    padding: "9px 12px 9px 34px",
                    fontSize: 13,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                    background: tokens.panel,
                    color: tokens.ink,
                    outline: "none",
                  }}
                />
                <Lock size={15} color={tokens.slate} style={{ position: "absolute", left: 10, top: 11 }} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "10px",
                background: isSubmitting ? tokens.slate : tokens.steel,
                color: "#FFFFFF",
                border: "none",
                borderRadius: tokens.radiusSm,
                fontWeight: 600,
                fontSize: 13,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.15s ease",
              }}
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Portal"}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Fill Buttons (Convenient for Reviewers) */}
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              style={{
                flex: 1,
                padding: "6px 8px",
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                fontSize: 11,
                color: tokens.slate,
                cursor: "pointer",
              }}
            >
              Demo Admin Email
            </button>
            <button
              type="button"
              onClick={() => fillDemo("field")}
              style={{
                flex: 1,
                padding: "6px 8px",
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                fontSize: 11,
                color: tokens.slate,
                cursor: "pointer",
              }}
            >
              Demo Field Email
            </button>
          </div>

          {/* Register Link */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: `1px solid ${tokens.line}`,
              fontSize: 12,
              color: tokens.slate,
              textAlign: "center",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: tokens.steel,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Register here
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default Login;
