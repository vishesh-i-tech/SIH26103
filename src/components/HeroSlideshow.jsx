import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, HardHat, ChevronLeft, ChevronRight, ArrowRight, Play, Pause, Compass, Zap, TrainFront, Layers } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";

const SLIDES = [
  {
    id: 1,
    image: "/images/slides/slide1.png",
    tag: "CONSTRUCTION & EXECUTION TELEMETRY",
    sector: "Civil Corridors & Engineering Works",
    sectorIcon: Compass,
    title: "Project Monitoring",
    subtitle: "Central Sector Infrastructure Projects Costing Rs. 150 crore & above",
    caption: "Real-time AI telemetry tracking physical milestones, vendor billing anomalies, and contractual delays.",
  },
  {
    id: 2,
    image: "/images/slides/slide2.png",
    tag: "ENERGY & TRANSMISSION TELEMETRY",
    sector: "Thermal & Hydro Power Infrastructure",
    sectorIcon: Zap,
    title: "Project Monitoring",
    subtitle: "Central Sector Infrastructure Projects Costing Rs. 150 crore & above",
    caption: "Early detection of turbine installation lag, grid interconnection bottlenecks, and environmental clearances.",
  },
  {
    id: 3,
    image: "/images/slides/slide3.png",
    tag: "RAILWAYS & FREIGHT NETWORKS",
    sector: "Dedicated Freight Corridors & High-Speed Rail",
    sectorIcon: TrainFront,
    title: "Project Monitoring",
    subtitle: "Central Sector Infrastructure Projects Costing Rs. 150 crore & above",
    caption: "Dynamic risk scoring on track-doubling alignment, signalling modernization, and freight capacity expansion.",
  },
  {
    id: 4,
    image: "/images/slides/slide4.jpg",
    tag: "MEGA INFRASTRUCTURE MANDATES",
    sector: "Multi-Modal National Connectivity",
    sectorIcon: Layers,
    title: "Project Monitoring",
    subtitle: "Central Sector Infrastructure Projects Costing Rs. 150 crore & above",
    caption: "Unified MoSPI IPMD executive dashboard synthesizing 1,800+ national infrastructure assets.",
  },
];

const AUTOPLAY_INTERVAL = 5500; // 5.5 seconds per slide

export function HeroSlideshow() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  // Auto-advance logic
  useEffect(() => {
    if (isPlaying && !isHovered) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
      }, AUTOPLAY_INTERVAL);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isHovered, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const activeSlide = SLIDES[currentIndex];
  const ActiveIcon = activeSlide.sectorIcon;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "88vh",
        maxHeight: "920px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0D14",
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND SLIDE IMAGES (Layered Seamless Cross-Fade) */}
      {/* ------------------------------------------------------------- */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1.0 : 1.05,
              }}
              transition={{
                opacity: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 6.5, ease: "easeOut" },
              }}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                willChange: "opacity, transform",
              }}
            >
              <img
                src={slide.image}
                alt={slide.sector}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />

              {/* Contrast Gradient (Lightened so photos remain vivid and clear behind the glass) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    linear-gradient(to bottom, rgba(10, 14, 23, 0.25) 0%, rgba(10, 14, 23, 0.04) 40%, rgba(10, 14, 23, 0.35) 80%, rgba(10, 14, 23, 0.80) 100%),
                    radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 45%, rgba(10, 14, 23, 0.25) 100%)
                  `,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTRAL FROSTED GLASS TRANSPARENT CARD (Ultra Translucent)    */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "92%",
          maxWidth: "980px",
          margin: "0 auto",
          padding: "clamp(24px, 4vw, 42px) clamp(20px, 5vw, 56px)",
          background: "rgba(10, 16, 28, 0.20)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.28)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          textAlign: "center",
        }}
      >
        {/* Dynamic Sector Tag Badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + "-tag"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 16px",
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#FBBF24",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <ActiveIcon size={13} color="#FBBF24" />
            <span>{activeSlide.tag}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ color: "#F1F5F9" }}>{activeSlide.sector}</span>
          </motion.div>
        </AnimatePresence>

        {/* Project Monitoring Typography (Crystal Clear & Crisp over Photo) */}
        <h1
          style={{
            fontFamily: "'Outfit', 'Manrope', system-ui, sans-serif",
            fontSize: "clamp(34px, 5.8vw, 68px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            color: "#FFFFFF",
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.6)",
            textShadow: "0 0 20px rgba(245, 158, 11, 0.45), 0 4px 16px rgba(0, 0, 0, 0.8)",
            margin: "0 auto 10px",
          }}
        >
          {activeSlide.title}
        </h1>

        {/* The Subtitle */}
        <p
          style={{
            fontSize: "clamp(13.5px, 2vw, 19px)",
            fontWeight: 500,
            color: "#FFFFFF",
            letterSpacing: "0.01em",
            lineHeight: 1.45,
            margin: "0 auto 16px",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.85)",
            maxWidth: "760px",
          }}
        >
          {activeSlide.subtitle}
        </p>

        {/* Dynamic Slide Context Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + "-caption"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              fontSize: "13px",
              color: "#E2E8F0",
              lineHeight: 1.5,
              maxWidth: "640px",
              margin: "0 auto 28px",
              textShadow: "0 2px 6px rgba(0, 0, 0, 0.85)",
            }}
          >
            {activeSlide.caption}
          </motion.div>
        </AnimatePresence>

        {/* Executive Quick Action CTAs */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => navigate("/login?role=admin")}
            style={{
              padding: "11px 24px",
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#0F172A",
              border: "none",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 800,
              letterSpacing: "0.02em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 18px rgba(245, 158, 11, 0.4)",
              transition: "transform 0.15s ease, filter 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Shield size={16} color="#0F172A" />
            <span>MoSPI Admin Login</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => navigate("/login?role=field_officer")}
            style={{
              padding: "11px 22px",
              background: "rgba(15, 23, 42, 0.55)",
              backdropFilter: "blur(10px)",
              color: "#FFFFFF",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.18)";
              e.currentTarget.style.borderColor = "#F59E0B";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(15, 23, 42, 0.55)";
              e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <HardHat size={16} color="#F59E0B" />
            <span>Field Officer Login</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("map-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "11px 20px",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              color: "#E2E8F0",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#E2E8F0";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.22)";
            }}
          >
            <span>Explore National Grid</span>
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SLIDESHOW NAVIGATION CONTROLS (Left / Right Chevron Arrows) */}
      {/* ------------------------------------------------------------- */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(245, 158, 11, 0.35)";
          e.currentTarget.style.borderColor = "#F59E0B";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(15, 23, 42, 0.65)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(245, 158, 11, 0.35)";
          e.currentTarget.style.borderColor = "#F59E0B";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(15, 23, 42, 0.65)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

export default HeroSlideshow;
