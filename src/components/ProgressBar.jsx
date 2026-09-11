import React from "react";
import { tokens } from "../styles/tokens";

/**
 * Dual indicator progress bar
 * Displays actual physical completion bar alongside planned milestone tick mark.
 * @param {{ planned: number, actual: number, height?: number }} props
 */
export function ProgressBar({ planned = 0, actual = 0, height = 6 }) {
  const safeActual = Math.min(Math.max(actual, 0), 100);
  const safePlanned = Math.min(Math.max(planned, 0), 100);

  return (
    <div
      style={{
        position: "relative",
        height,
        background: "#EDEBE4",
        borderRadius: tokens.radiusSm,
        width: "100%",
        overflow: "visible",
      }}
      title={`Actual: ${actual}% | Planned: ${planned}%`}
    >
      {/* Actual progress fill */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${safeActual}%`,
          background: tokens.steel,
          borderRadius: tokens.radiusSm,
          transition: "width 0.3s ease",
        }}
      />

      {/* Planned milestone line marker */}
      <div
        style={{
          position: "absolute",
          left: `${safePlanned}%`,
          top: -3,
          bottom: -3,
          width: 2,
          background: tokens.ink,
          zIndex: 2,
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}

export default ProgressBar;
