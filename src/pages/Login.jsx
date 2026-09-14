import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, HardHat, ArrowRight, Lock, Mail, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PaimanaBrand from "../components/PaimanaBrand";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role"); // "admin" or "field_officer"
  const { signIn, switchRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [successTargetRole, setSuccessTargetRole] = useState("admin");

  useEffect(() => {
    if (requestedRole === "admin") {
      setSuccessTargetRole("admin");
    } else if (requestedRole === "field_officer" || requestedRole === "field") {
      setSuccessTargetRole("field_officer");
    }
  }, [requestedRole]);

  const triggerPortalTransition = (targetPath, roleName) => {
    setSuccessTargetRole(roleName);
    setLoginSuccess(true);
    setTimeout(() => {
      navigate(targetPath);
    }, 800);
  };

  const handleQuickRoleSelect = (roleName) => {
    switchRole(roleName);
    triggerPortalTransition(
      roleName === "field_officer" ? "/field-dashboard" : "/dashboard",
      roleName
    );
  };

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
          setErrorMsg("Invalid credentials. Please verify your official email & passcode.");
        } else {
          setErrorMsg(error.message || "Authentication failed. Please verify credentials.");
        }
        setIsSubmitting(false);
      } else {
        const userRole = data?.user?.user_metadata?.role || requestedRole || "admin";
        const target = (userRole === "field_officer" || userRole === "field")
          ? "/field-dashboard"
          : "/dashboard";
        triggerPortalTransition(target, userRole);
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred during secure authentication.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 20px",
        overflow: "hidden",
        background: "#F1F5F9",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* BACKGROUND COMMAND CENTER IMAGE (Light Ambient High-Key Atmosphere)*/}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('/images/login_bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(1.06) contrast(1.02)",
          transform: loginSuccess ? "scale(1.06)" : "scale(1.0)",
          transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease",
          zIndex: 1,
        }}
      />

      {/* Light Frosted Tint Overlay (Softly shows screens in daylight clarity) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at center, rgba(248, 250, 252, 0.86) 0%, rgba(241, 245, 249, 0.82) 50%, rgba(226, 232, 240, 0.90) 100%),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.75) 100%)
          `,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 2,
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* SUCCESS PORTAL ENTRANCE ANIMATION                                  */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.96) 0%, rgba(241, 245, 249, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              color: "#0F172A",
              textAlign: "center",
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(245, 158, 11, 0.5)",
                marginBottom: 20,
              }}
            >
              <CheckCircle2 size={44} color="#0F172A" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: "#0F172A",
                marginBottom: "8px",
              }}
            >
              Officer Identity Authorized
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                fontSize: "13.5px",
                color: "#B45309",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Connecting to {successTargetRole === "field_officer" ? "Field Telemetry Grid" : "MoSPI Executive IPMD Dashboard"}...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN LOGIN CARD CONTAINER                                         */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 480,
        }}
      >
        {/* Brand Header: Large Clean Text, Clickable to Home / (No Dark Glassy Bubble) */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <PaimanaBrand
            size="xl"
            showBadge={true}
            to="/"
            subtitle="Ministry of Statistics and Programme Implementation"
          />
          <div
            style={{
              fontSize: "12px",
              color: "#64748B",
              marginTop: "6px",
              fontWeight: 500,
            }}
          >
            Infrastructure & Project Monitoring Division (IPMD) · Portal Sign In
          </div>
        </div>

        {/* Crisp Light Executive Auth Card */}
        <div
          className="panel-box-lift"
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 2px 10px rgba(0, 0, 0, 0.04)",
            padding: "32px 28px",
          }}
        >
          {/* Quick 1-Click Role Direct Access */}
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={13} color="#D97706" />
              <span>Instant 1-Click Role Access</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* MoSPI Admin Button (Lifts up on hover) */}
              <button
                type="button"
                onClick={() => handleQuickRoleSelect("admin")}
                className="card-box-lift"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                  padding: "14px",
                  background: requestedRole === "admin" ? "rgba(245, 158, 11, 0.12)" : "#F8FAFC",
                  border: requestedRole === "admin" ? "1.5px solid #F59E0B" : "1px solid #E2E8F0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Shield size={16} color="#D97706" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>MoSPI Admin</span>
                  </div>
                  <ArrowRight size={13} color="#D97706" />
                </div>
                <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.3 }}>
                  Executive Portfolio View
                </div>
              </button>

              {/* Field Officer Button (Lifts up on hover) */}
              <button
                type="button"
                onClick={() => handleQuickRoleSelect("field_officer")}
                className="card-box-lift"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                  padding: "14px",
                  background: (requestedRole === "field_officer" || requestedRole === "field") ? "rgba(245, 158, 11, 0.12)" : "#F8FAFC",
                  border: (requestedRole === "field_officer" || requestedRole === "field") ? "1.5px solid #F59E0B" : "1px solid #E2E8F0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <HardHat size={16} color="#D97706" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Field Officer</span>
                  </div>
                  <ArrowRight size={13} color="#D97706" />
                </div>
                <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.3 }}>
                  Site Telemetry View
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0",
              color: "#94A3B8",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            <span>OR SIGN IN WITH CREDENTIALS</span>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit}>
            {/* Error Notification */}
            {errorMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#FEF2F2",
                  borderRadius: "8px",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 18,
                  lineHeight: 1.4,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Input (Lifts up on hover/focus) */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#334155",
                  letterSpacing: "0.04em",
                  marginBottom: 6,
                }}
              >
                OFFICIAL EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="card-box-lift"
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 38px",
                    fontSize: 13.5,
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    background: "#F8FAFC",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
                <Mail size={16} color="#64748B" style={{ position: "absolute", left: 12, top: 13 }} />
              </div>
            </div>

            {/* Password Input (Lifts up on hover/focus) */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#334155",
                  letterSpacing: "0.04em",
                  marginBottom: 6,
                }}
              >
                SECURITY PASSCODE
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="card-box-lift"
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 38px",
                    fontSize: 13.5,
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    background: "#F8FAFC",
                    color: "#0F172A",
                    outline: "none",
                    letterSpacing: "0.15em",
                  }}
                />
                <Lock size={16} color="#64748B" style={{ position: "absolute", left: 12, top: 13 }} />
              </div>
            </div>

            {/* Submit Button (Lifts up on hover) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="card-box-lift"
              style={{
                width: "100%",
                padding: "12px",
                background: isSubmitting
                  ? "#CBD5E1"
                  : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#0F172A",
                border: "none",
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.03em",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(245, 158, 11, 0.35)",
              }}
            >
              <span>{isSubmitting ? "Authenticating Official..." : "Sign In to Portal"}</span>
              <ArrowRight size={16} color="#0F172A" />
            </button>
          </form>

          {/* Register Link */}
          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid #E2E8F0",
              fontSize: 12.5,
              color: "#64748B",
              textAlign: "center",
            }}
          >
            Don't have an official account?{" "}
            <Link
              to="/register"
              style={{
                color: "#D97706",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Register here →
            </Link>
          </div>
        </div>

        {/* Return to Public Portal */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link
            to="/"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#64748B",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0F172A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
          >
            ← Back to National Infrastructure Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
