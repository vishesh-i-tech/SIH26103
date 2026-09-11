import React from "react";
import { tokens } from "../styles/tokens";

/**
 * Government Technical Dashboard Panel
 * Features 1px hairline border, white background, 3px radius, no drop shadows.
 */
export function Panel({ children, style, className = "", ...rest }) {
  return (
    <div
      style={{
        background: tokens.panel,
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radiusMd,
        boxShadow: "none",
        ...style,
      }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Panel;
