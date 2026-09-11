/**
 * PAIMANA AI — MoSPI Infrastructure Project Monitoring Platform
 * Design Tokens & Engineering-Grade Gov Dashboard System Theme
 */

export const tokens = {
  // Color Palette
  ink: "#1B2430",          // Text, high contrast dark chrome
  paper: "#F4F3EF",        // Main background canvas
  panel: "#FFFFFF",        // Card & table panel background
  line: "#D9D6CE",         // Hairline 1px borders
  steel: "#2F5D73",        // Primary accent / engineering slate blue
  steelDeep: "#1F4351",    // Darker interactive accent
  slate: "#5B6570",        // Muted secondary text
  good: "#3E7A52",         // Low risk / on track (green)
  warn: "#B07C22",         // Medium risk / watch (amber)
  bad: "#A6402F",          // High risk / critical (red)
  goodBg: "#EAF2EC",       // Light green tint for status chips
  warnBg: "#FBF1E0",       // Light amber tint for status chips
  badBg: "#F7E7E3",        // Light red tint for status chips

  // Extended UI Chrome
  sidebarBg: "#1B2430",
  sidebarHover: "#243040",
  sidebarActive: "#28333F",
  sidebarBorder: "#2A343F",
  sidebarText: "#DDE2E6",
  sidebarMuted: "#8B94A0",

  // Typography Stacks
  fontSans: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontMono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',

  // Border Radii (Minimal/Sharp: 2-3px)
  radiusSm: "2px",
  radiusMd: "3px",
  radiusLg: "4px",

  // Hairline Borders (Avoid drop shadows)
  borderDefault: "1px solid #D9D6CE",
  borderDark: "1px solid #2A343F",
  borderSteel: "1px solid #2F5D73",

  // Dimensions
  sidebarWidth: "216px",
  headerHeight: "52px",
};

export const monoStyle = {
  fontFamily: tokens.fontMono,
  letterSpacing: "-0.02em",
};

export default tokens;
