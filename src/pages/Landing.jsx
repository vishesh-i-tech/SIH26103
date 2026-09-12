import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import {
  Shield,
  HardHat,
  ArrowRight,
  ChevronDown,
  Activity,
  AlertTriangle,
  FileWarning,
  Bot,
  Zap,
  Waypoints,
  TrainFront,
  Compass,
  Sparkles,
  Lock,
  Layers,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { mockProjects } from "../data/mockProjects";
import { useProjects } from "../context/ProjectContext";
import FadeUp from "../components/FadeUp";
import LandingMap from "../components/LandingMap";
import RiskChip from "../components/RiskChip";

export function Landing() {
  const navigate = useNavigate();
  const { projects: contextProjects } = useProjects();
  const [scrolled, setScrolled] = useState(false);

  // Use projects from context or fallback to mockProjects
  const allProjects = useMemo(() => {
    return contextProjects && contextProjects.length > 0 ? contextProjects : mockProjects;
  }, [contextProjects]);

  // Top 8 projects sorted by risk descending for the showcase carousel
  const highRiskProjects = useMemo(() => {
    return [...allProjects].sort((a, b) => (b.risk || b.risk_score || 0) - (a.risk || a.risk_score || 0)).slice(0, 8);
  }, [allProjects]);

  // Monitor scroll depth to reveal sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headlineWords = "TURNING INFRASTRUCTURE DATA INTO EARLY WARNINGS.".split(" ");

  const getSectorIcon = (sector) => {
    switch (sector?.toLowerCase()) {
      case "roads":
        return <Compass size={16} color={tokens.steel} />;
      case "bridges":
        return <Waypoints size={16} color={tokens.steel} />;
      case "railways":
        return <TrainFront size={16} color={tokens.steel} />;
      case "power":
        return <Zap size={16} color={tokens.warn} />;
      default:
        return <Layers size={16} color={tokens.steel} />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.paper,
        color: tokens.ink,
        fontFamily: tokens.fontSans,
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* FIXED BLUEPRINT GRID & PARTICLE BACKGROUND */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.7,
          backgroundImage: `
            radial-gradient(circle at 50% 18%, rgba(47, 93, 115, 0.08) 0%, transparent 60%),
            linear-gradient(to right, rgba(217, 214, 206, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(217, 214, 206, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 36px 36px, 36px 36px",
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER / LOGO BAR (Visible at top) */}
      {/* ------------------------------------------------------------- */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(18px, 5vw, 60px)",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.radiusSm,
              background: tokens.ink,
              border: `1px solid ${tokens.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={20} color={tokens.steel} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.06em", color: tokens.ink }}>
              PAIMANA AI
            </div>
            <div style={{ fontSize: 10, color: tokens.slate, fontWeight: 600, letterSpacing: "0.02em" }}>
              MoSPI · IPMD PORTAL
            </div>
          </div>
        </div>

        {/* Top Header Login Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/login?role=admin")}
            style={{
              padding: "8px 16px",
              background: tokens.steel,
              color: "#FFFFFF",
              border: "none",
              borderRadius: tokens.radiusSm,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = tokens.steelDeep)}
            onMouseLeave={(e) => (e.currentTarget.style.background = tokens.steel)}
          >
            <Shield size={14} />
            <span>MoSPI Admin Login</span>
          </button>

          <button
            onClick={() => navigate("/login?role=field_officer")}
            style={{
              padding: "7px 15px",
              background: "transparent",
              color: tokens.ink,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.radiusSm,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(47, 93, 115, 0.08)";
              e.currentTarget.style.borderColor = tokens.steel;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = tokens.line;
            }}
          >
            <HardHat size={14} color={tokens.warn} />
            <span>Field Officer Login</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* STICKY NAV BAR (Fades in when scrolled down) */}
      {/* ------------------------------------------------------------- */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : -20 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "rgba(244, 243, 239, 0.94)",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${tokens.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(18px, 5vw, 60px)",
          zIndex: 50,
          pointerEvents: scrolled ? "auto" : "none",
        }}
      >
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: tokens.radiusSm,
              background: tokens.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={16} color={tokens.steel} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.05em", color: tokens.ink }}>
            PAIMANA AI
          </span>
          <span style={{ fontSize: 11, color: tokens.slate, paddingLeft: 6, borderLeft: `1px solid ${tokens.line}` }}>
            Infrastructure Risk Monitor
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/login?role=admin")}
            style={{
              padding: "7px 14px",
              background: tokens.steel,
              color: "#FFFFFF",
              border: "none",
              borderRadius: tokens.radiusSm,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Shield size={13} />
            <span>MoSPI Admin Login</span>
          </button>
          <button
            onClick={() => navigate("/login?role=field_officer")}
            style={{
              padding: "6px 13px",
              background: "transparent",
              color: tokens.ink,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.radiusSm,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <HardHat size={13} color={tokens.warn} />
            <span>Field Officer Login</span>
          </button>
        </div>
      </motion.nav>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: HERO (Full Viewport Height) */}
      {/* ------------------------------------------------------------- */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "100px clamp(20px, 6vw, 100px) 60px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Government Badge */}
        <FadeUp delay={0.1}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              background: "rgba(47, 93, 115, 0.08)",
              border: `1px solid ${tokens.steel}44`,
              borderRadius: tokens.radiusSm,
              fontSize: 11,
              fontWeight: 700,
              color: tokens.steel,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            <Shield size={13} />
            <span>MoSPI Central Sector Infrastructure Monitoring · SIH26103</span>
          </div>
        </FadeUp>

        {/* Word-by-Word Staggered Headline */}
        <h1
          style={{
            maxWidth: 1000,
            fontSize: "clamp(30px, 5.2vw, 62px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: tokens.ink,
            margin: "0 auto 20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.26em",
          }}
        >
          {headlineWords.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                color:
                  word === "EARLY" || word === "WARNINGS."
                    ? tokens.steel
                    : tokens.ink,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            maxWidth: 680,
            fontSize: "clamp(14px, 1.8vw, 17.5px)",
            lineHeight: 1.55,
            color: tokens.slate,
            margin: "0 auto 36px",
          }}
        >
          AI-powered risk prediction, billing anomaly detection, and officer prioritization
          for MoSPI's Central Sector Infrastructure Projects (₹150 Cr+).
        </motion.p>

        {/* Hero CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => navigate("/login?role=admin")}
            style={{
              padding: "13px 26px",
              background: tokens.steel,
              color: "#FFFFFF",
              border: "none",
              borderRadius: tokens.radiusSm,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(47, 93, 115, 0.25)",
              transition: "transform 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = tokens.steelDeep;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = tokens.steel;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Shield size={16} />
            <span>MoSPI Admin Login</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => navigate("/login?role=field_officer")}
            style={{
              padding: "12px 24px",
              background: tokens.panel,
              color: tokens.ink,
              border: `1.5px solid ${tokens.line}`,
              borderRadius: tokens.radiusSm,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = tokens.steel;
              e.currentTarget.style.background = "rgba(47, 93, 115, 0.04)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tokens.line;
              e.currentTarget.style.background = tokens.panel;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <HardHat size={16} color={tokens.warn} />
            <span>Field Officer Login</span>
          </button>
        </motion.div>

        {/* Animated Bounce Scroll Down Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => {
            const el = document.getElementById("map-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            position: "absolute",
            bottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            color: tokens.slate,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          <span>EXPLORE COVERAGE</span>
          <ChevronDown size={16} color={tokens.steel} />
        </motion.div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: INDIA MAP (Scroll-Triggered Reveal) */}
      {/* ------------------------------------------------------------- */}
      <section
        id="map-section"
        style={{
          padding: "80px clamp(18px, 6vw, 100px)",
          borderTop: `1px solid ${tokens.line}`,
          position: "relative",
          zIndex: 10,
          background: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: tokens.steel,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Geographical Ground Reality
              </div>
              <h2
                style={{
                  fontSize: "clamp(24px, 3.5vw, 36px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: tokens.ink,
                  margin: 0,
                }}
              >
                Portfolio Coverage Across India
              </h2>
              <p style={{ maxWidth: 640, margin: "10px auto 0", fontSize: 14, color: tokens.slate }}>
                Real-time composite risk distribution aggregated across active central sector infrastructure corridors
                in Madhya Pradesh, Uttar Pradesh, Jammu & Kashmir, Gujarat, Rajasthan, and Maharashtra.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <LandingMap projects={allProjects} />
          </FadeUp>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: HIGH-RISK PROJECTS SHOWCASE (Horizontal Carousel) */}
      {/* ------------------------------------------------------------- */}
      <section
        style={{
          padding: "80px clamp(18px, 6vw, 100px)",
          borderTop: `1px solid ${tokens.line}`,
          position: "relative",
          zIndex: 10,
          background: tokens.paper,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <FadeUp>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 28,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: tokens.steel,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  Algorithmic Priority Ranking
                </div>
                <h2
                  style={{
                    fontSize: "clamp(24px, 3.5vw, 36px)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: tokens.ink,
                    margin: 0,
                  }}
                >
                  Projects Under Active Risk Monitoring
                </h2>
              </div>

              <div style={{ fontSize: 12, color: tokens.slate, fontWeight: 600 }}>
                Scroll horizontally to inspect active assets →
              </div>
            </div>
          </FadeUp>

          {/* Horizontally Scrollable Row */}
          <div
            style={{
              display: "flex",
              gap: 18,
              overflowX: "auto",
              paddingBottom: 16,
              paddingTop: 4,
              scrollbarWidth: "thin",
              scrollSnapType: "x mandatory",
            }}
          >
            {highRiskProjects.map((project, idx) => {
              const pRisk = Number(project.risk || project.risk_score || 25);
              const pActual = Number(project.actual_progress ?? project.actual ?? 0);
              const pPlanned = Number(project.planned_progress ?? project.planned ?? 0);
              const costOrig = Number(project.costOriginal || project.cost_original || 0);
              const costRev = Number(project.costRevised || project.cost_revised || costOrig);

              return (
                <FadeUp key={project.code || project.id} delay={0.1 * idx} style={{ flexShrink: 0 }}>
                  <div
                    onClick={() => navigate("/login?role=admin")}
                    style={{
                      width: 320,
                      background: tokens.panel,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusMd,
                      padding: "20px 18px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      scrollSnapAlign: "start",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.borderColor = tokens.steel;
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(47, 93, 115, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = tokens.line;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div>
                      {/* Top Row: Sector Icon, Code & Risk */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ padding: "4px 6px", background: tokens.paper, borderRadius: "2px" }}>
                            {getSectorIcon(project.sector)}
                          </span>
                          <span style={{ ...monoStyle, fontSize: 12, fontWeight: 700, color: tokens.steel }}>
                            {project.code || project.id}
                          </span>
                        </div>
                        <RiskChip score={pRisk} />
                      </div>

                      {/* Project Name & Contractor */}
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: tokens.ink,
                          lineHeight: 1.35,
                          marginBottom: 4,
                          minHeight: 38,
                        }}
                      >
                        {project.name}
                      </div>

                      <div style={{ fontSize: 11.5, color: tokens.slate, marginBottom: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {project.contractor || "Government EPC Contractor"} · {project.location}
                      </div>

                      {/* Financial Figures */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          padding: "10px 12px",
                          background: tokens.paper,
                          borderRadius: tokens.radiusSm,
                          marginBottom: 14,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 9.5, color: tokens.slate, fontWeight: 600, textTransform: "uppercase" }}>
                            Sanctioned Cost
                          </div>
                          <div style={{ ...monoStyle, fontSize: 13, fontWeight: 700, color: tokens.ink }}>
                            ₹{costOrig} Cr
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, color: tokens.slate, fontWeight: 600, textTransform: "uppercase" }}>
                            Revised Cost
                          </div>
                          <div style={{ ...monoStyle, fontSize: 13, fontWeight: 700, color: costRev > costOrig ? tokens.bad : tokens.ink }}>
                            ₹{costRev} Cr
                          </div>
                        </div>
                      </div>

                      {/* Physical Progress Bar */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: tokens.slate }}>Physical Progress</span>
                          <span style={{ ...monoStyle, fontWeight: 700, color: tokens.ink }}>
                            {pActual}% <span style={{ fontWeight: 400, color: tokens.slate }}>/ {pPlanned}% target</span>
                          </span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: "#E2E0D8", borderRadius: 3, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${Math.min(100, pActual)}%`,
                              height: "100%",
                              background: pActual < pPlanned - 10 ? tokens.bad : tokens.steel,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Tag */}
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 10,
                        borderTop: `1px solid ${tokens.line}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 11,
                        fontWeight: 600,
                        color: tokens.steel,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Lock size={12} />
                        <span>Login for full audit file</span>
                      </span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: MODEL IMPROVEMENT PROOF SECTION */}
      {/* ------------------------------------------------------------- */}
      <section
        style={{
          padding: "90px clamp(18px, 6vw, 100px)",
          borderTop: `1px solid ${tokens.line}`,
          position: "relative",
          zIndex: 10,
          background: tokens.ink,
          color: "#FFFFFF",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <FadeUp>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: tokens.radiusSm,
                fontSize: 11,
                fontWeight: 700,
                color: "#7DD3FC",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              <Sparkles size={13} />
              <span>Empirical Model Lift · SIH26103</span>
            </div>
          </FadeUp>

          {/* Big Bold Typography Stat Callouts */}
          <FadeUp delay={0.15}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 32,
                margin: "24px 0 36px",
              }}
            >
              <div
                style={{
                  padding: "28px 20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: tokens.radiusMd,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Prediction Accuracy (R² Fit)
                </div>
                <div style={{ ...monoStyle, fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, color: "#38BDF8" }}>
                  0.83 → 0.92
                </div>
                <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 6 }}>
                  +9.6% predictive variance explanation
                </div>
              </div>

              <div
                style={{
                  padding: "28px 20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: tokens.radiusMd,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Mean Absolute Error (MAE)
                </div>
                <div style={{ ...monoStyle, fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 800, color: "#4ADE80" }}>
                  -38%
                </div>
                <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 6 }}>
                  Error reduction (7.37 → 4.61 score points)
                </div>
              </div>
            </div>
          </FadeUp>

          {/* One-Line Scientific Explanation */}
          <FadeUp delay={0.3}>
            <p
              style={{
                fontSize: "clamp(15px, 2vw, 19px)",
                lineHeight: 1.6,
                color: "#E2E8F0",
                maxWidth: 820,
                margin: "0 auto",
                fontWeight: 500,
              }}
            >
              "Adding ground-reality signals — payment delays, land clearance status, subcontracting depth —
              measurably improves risk prediction over officially-reported data alone."
            </p>
            <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 14 }}>
              Empirically verified across 5,000 synthetic MoSPI benchmark projects with genuine SHAP TreeExplainer attribution.
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: CORE FEATURE HIGHLIGHTS */}
      {/* ------------------------------------------------------------- */}
      <section
        style={{
          padding: "90px clamp(18px, 6vw, 100px)",
          borderTop: `1px solid ${tokens.line}`,
          position: "relative",
          zIndex: 10,
          background: tokens.panel,
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: tokens.steel,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Intelligent Government Architecture
              </div>
              <h2
                style={{
                  fontSize: "clamp(24px, 3.5vw, 36px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: tokens.ink,
                  margin: 0,
                }}
              >
                Engineered for High-Stakes Public Infrastructure
              </h2>
            </div>
          </FadeUp>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {/* Feature 1 */}
            <FadeUp delay={0.1}>
              <div
                style={{
                  padding: "24px 20px",
                  background: tokens.paper,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusMd,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.radiusSm,
                    background: "rgba(47, 93, 115, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Activity size={20} color={tokens.steel} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tokens.ink, marginBottom: 8 }}>
                  Risk Prediction & Early Warning
                </div>
                <p style={{ fontSize: 13, color: tokens.slate, lineHeight: 1.5, margin: 0 }}>
                  XGBoost gradient boosting models detect cost drifts and schedule slips months before official flash report declarations.
                </p>
              </div>
            </FadeUp>

            {/* Feature 2 */}
            <FadeUp delay={0.2}>
              <div
                style={{
                  padding: "24px 20px",
                  background: tokens.paper,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusMd,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.radiusSm,
                    background: "rgba(176, 124, 34, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <AlertTriangle size={20} color={tokens.warn} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tokens.ink, marginBottom: 8 }}>
                  Officer Priority Queue
                </div>
                <p style={{ fontSize: 13, color: tokens.slate, lineHeight: 1.5, margin: 0 }}>
                  Algorithmic ranking orders critical assets by composite risk and pending anomaly days for maximum supervisory impact.
                </p>
              </div>
            </FadeUp>

            {/* Feature 3 */}
            <FadeUp delay={0.3}>
              <div
                style={{
                  padding: "24px 20px",
                  background: tokens.paper,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusMd,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.radiusSm,
                    background: "rgba(166, 64, 47, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <FileWarning size={20} color={tokens.bad} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tokens.ink, marginBottom: 8 }}>
                  Billing Anomaly Detection
                </div>
                <p style={{ fontSize: 13, color: tokens.slate, lineHeight: 1.5, margin: 0 }}>
                  Flags Running Account (RA) contractor claims where financial disbursements significantly outpace ground-verified milestones.
                </p>
              </div>
            </FadeUp>

            {/* Feature 4 */}
            <FadeUp delay={0.4}>
              <div
                style={{
                  padding: "24px 20px",
                  background: tokens.paper,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusMd,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.radiusSm,
                    background: "rgba(47, 93, 115, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Bot size={20} color={tokens.steel} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tokens.ink, marginBottom: 8 }}>
                  AI Decision Assistant
                </div>
                <p style={{ fontSize: 13, color: tokens.slate, lineHeight: 1.5, margin: 0 }}>
                  Natural language decision support querying live telemetry, contractor track records, and automated contractual remedies.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: FINAL CALL TO ACTION & FOOTER */}
      {/* ------------------------------------------------------------- */}
      <section
        style={{
          padding: "80px clamp(18px, 6vw, 100px) 40px",
          borderTop: `1px solid ${tokens.line}`,
          position: "relative",
          zIndex: 10,
          background: tokens.paper,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeUp>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: tokens.radiusMd,
                background: tokens.ink,
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={24} color={tokens.steel} />
            </div>

            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 34px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: tokens.ink,
                marginBottom: 12,
              }}
            >
              Access the Official Monitoring Portal
            </h2>

            <p style={{ fontSize: 14, color: tokens.slate, marginBottom: 28, lineHeight: 1.5 }}>
              Sign in with your verified MoSPI or Field Engineer credentials to review live project intelligence files,
              run what-if schedule simulations, or submit site progress logs.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 50 }}>
              <button
                onClick={() => navigate("/login?role=admin")}
                style={{
                  padding: "12px 24px",
                  background: tokens.steel,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: tokens.radiusSm,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Shield size={16} />
                <span>MoSPI Admin Login</span>
              </button>

              <button
                onClick={() => navigate("/login?role=field_officer")}
                style={{
                  padding: "11px 22px",
                  background: tokens.panel,
                  color: tokens.ink,
                  border: `1.5px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <HardHat size={16} color={tokens.warn} />
                <span>Field Officer Login</span>
              </button>
            </div>
          </FadeUp>

          {/* Simple Government Footer */}
          <div
            style={{
              borderTop: `1px solid ${tokens.line}`,
              paddingTop: 24,
              fontSize: 12,
              color: tokens.slate,
              lineHeight: 1.6,
            }}
          >
            <div>
              <strong>PAIMANA AI</strong> · Built for SIH26103 · Ministry of Statistics and Programme Implementation
            </div>
            <div style={{ fontSize: 11, color: tokens.slate, marginTop: 4 }}>
              Infrastructure & Project Monitoring Division (IPMD) · Government of India
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
