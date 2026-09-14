import React from "react";
import { Link } from "react-router-dom";

export function PaimanaBrand({ size = "lg", showBadge = true, subtitle = "", to = "/" }) {
  const fontSizes = {
    sm: "18px",
    md: "22px",
    lg: "clamp(26px, 3.5vw, 36px)",
    xl: "clamp(34px, 4.5vw, 50px)",
  };

  const badgeSizes = {
    sm: 26,
    md: 30,
    lg: 36,
    xl: 44,
  };

  const currentBadgeSize = badgeSizes[size] || 32;

  const content = (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        textDecoration: "none",
        cursor: "pointer",
        transition: "transform 0.2s ease, filter 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.filter = "brightness(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.filter = "none";
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: size === "xl" ? 14 : 10 }}>
        {showBadge && (
          <div
            style={{
              width: currentBadgeSize,
              height: currentBadgeSize,
              borderRadius: size === "xl" ? "12px" : "8px",
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: size === "xl" ? "22px" : "15px",
              color: "#0F172A",
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.45)",
              flexShrink: 0,
            }}
          >
            P
          </div>
        )}
        <span
          className="paimana-rainbow-brand"
          style={{
            fontSize: fontSizes[size] || fontSizes.lg,
            lineHeight: 1.1,
            cursor: "pointer",
            filter: "drop-shadow(0 2px 10px rgba(245, 158, 11, 0.3))",
          }}
        >
          PAIMANA AI
        </span>
      </div>

      {subtitle && (
        <div
          style={{
            marginTop: "6px",
            fontSize: size === "xl" ? "13px" : "11px",
            fontWeight: 600,
            color: "#64748B",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );

  return to ? (
    <Link to={to} style={{ textDecoration: "none" }} title="Return to Home Page">
      {content}
    </Link>
  ) : (
    content
  );
}

export default PaimanaBrand;
