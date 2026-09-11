import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, HardHat, ArrowRight, AlertCircle, CheckCircle2, Lock, Mail, User } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";
import Panel from "../components/Panel";

export function Register() {
  const navigate = useNavigate();
  const { signUp, isConfigured } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("field_officer"); // 'admin' | 'field_officer'
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter your official full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please provide a valid official email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
      });

      if (error) {
        // Humanize common Supabase errors
        let friendly = error.message;
        if (error.message.includes("already registered") || error.message.includes("already been taken")) {
          friendly = "An account with this email address already exists. Please log in instead.";
        } else if (error.message.includes("Password should be")) {
          friendly = "Password is too weak. Please use at least 6 characters with mixed letters and numbers.";
        } else if (error.message.includes("valid email")) {
          friendly = "Please enter a properly formatted email address.";
        }
        setErrorMsg(friendly);
      } else {
        setSuccessMsg("Registration successful! Redirecting to your dashboard...");
        setTimeout(() => {
          if (role === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/field-dashboard");
          }
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsSubmitting(false);
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
      <div style={{ width: "100%", maxWidth: 480 }}>
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
            Infrastructure & Project Monitoring Division (IPMD) · Portal Registration
          </div>
        </div>

        {/* Register Box */}
        <Panel style={{ padding: "28px 26px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink, marginBottom: 16 }}>
              Register Official Officer Account
            </div>

            {/* Error Notification */}
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

            {/* Success Notification */}
            {successMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  background: tokens.goodBg,
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${tokens.good}44`,
                  color: tokens.good,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Full Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 5 }}>
                OFFICIAL FULL NAME *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Er. Rajesh Verma or Dr. Alok Sharma"
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
                <User size={15} color={tokens.slate} style={{ position: "absolute", left: 10, top: 11 }} />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 5 }}>
                OFFICIAL EMAIL ADDRESS *
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

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 5 }}>
                SECURITY PASSCODE (MIN. 6 CHARS) *
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

            {/* Role Selection Dropdown */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 5 }}>
                GOVERNMENT ROLE SCOPE *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              >
                <option value="field_officer">Field Officer (Site Engineer / Ground Telemetry)</option>
                <option value="admin">MoSPI Admin (Central IPMD Oversight & Risk Governance)</option>
              </select>
              <div style={{ fontSize: 11, color: tokens.slate, marginTop: 4 }}>
                {role === "admin"
                  ? "Access central portfolio overview, project directory, priority queue, and billing anomaly gates."
                  : "Submit ground verification entries, upload site evidence, and track assigned work orders."}
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
              <span>{isSubmitting ? "Creating Account..." : "Complete Registration"}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Switch to Login */}
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
            Already have an officer account?{" "}
            <Link
              to="/login"
              style={{
                color: tokens.steel,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Login here
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default Register;
