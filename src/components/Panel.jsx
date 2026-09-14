import React from "react";
import { tokens } from "../styles/tokens";

/**
 * Government Technical Dashboard Panel
 * Features smooth elevation lift on hover ("cursor lekar jaane pe wo uthna chahiye uper")
 */
export function Panel({ children, style, className = "", ...rest }) {
  return (
    <div
      style={{
        background: tokens.panel,
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radiusMd,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        ...style,
      }}
      className={`panel-box-lift ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Panel;
