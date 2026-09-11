import React from "react";
import { riskTone, riskBg, riskLabel } from "../utils/risk";
import { monoStyle, tokens } from "../styles/tokens";

/**
 * RiskChip component
 * Visual risk score pill with monospace digits and severity status.
 * @param {{ score: number, size?: "sm" | "md" | "lg" }} props
 */
export function RiskChip({ score, size = "md" }) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const pad = isSm ? "2px 8px" : isLg ? "6px 14px" : "4px 10px";
  const fontSize = isSm ? 11 : isLg ? 14 : 12.5;

  const tone = riskTone(score);
  const bg = riskBg(score);
  const label = riskLabel(score);

  return (
    <span
      style={{
        ...monoStyle,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: bg,
        color: tone,
        padding: pad,
        borderRadius: tokens.radiusSm,
        fontSize,
        fontWeight: 600,
        letterSpacing: "0.02em",
        border: `1px solid ${tone}44`,
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      <span>{score}</span>
      <span style={{ opacity: 0.65 }}>·</span>
      <span>{label}</span>
    </span>
  );
}

export default RiskChip;
