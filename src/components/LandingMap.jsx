import React, { useState, useMemo, useRef } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { tokens, monoStyle } from "../styles/tokens";
import { Shield, Layers, TrendingUp, AlertTriangle, CheckCircle, Info, Lock } from "lucide-react";

// Local GeoJSON loaded directly (source: adarshbiradar/maps-geojson)
const INDIA_GEO_URL = "/india.json";

function normalizeStateName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function LandingMap({ projects = [] }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState("Madhya Pradesh");
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  const handleContainerMouseMove = (e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Aggregate project telemetry by state
  const stateStats = useMemo(() => {
    const map = new Map();

    projects.forEach((p) => {
      const loc = p.location || "Unknown";
      const key = normalizeStateName(loc);
      if (!map.has(key)) {
        map.set(key, {
          rawName: loc,
          projects: [],
          totalCostOriginal: 0,
          totalCostRevised: 0,
          riskSum: 0,
        });
      }
      const entry = map.get(key);
      entry.projects.push(p);
      entry.totalCostOriginal += Number(p.costOriginal || p.cost_original || 0);
      entry.totalCostRevised += Number(p.costRevised || p.cost_revised || p.costOriginal || 0);
      entry.riskSum += Number(p.risk || p.risk_score || 0);
    });

    // Distinct signature colors for states with active projects
    const stateColorPalette = {
      madhyapradesh: "#E05D44",  // Coral / Red (4 central corridors)
      uttarpradesh: "#F39C12",   // Amber / Gold (Lucknow Exp & DFC)
      maharashtra: "#C0392B",    // Crimson (Mumbai-Ahmedabad HSR Pier)
      gujarat: "#2980B9",        // Blue (Ahmedabad-Dholera Exp)
      rajasthan: "#27AE60",      // Green (Bhadla-Bikaner Solar Power)
      jammuandkashmir: "#16A085",// Teal (Chenab River Bridge)
    };

    // Compute averages and assign distinct colors
    const result = {};
    map.forEach((val, key) => {
      const count = val.projects.length;
      const avgRisk = count > 0 ? Math.round(val.riskSum / count) : 0;
      let riskLevel = "stable";

      if (avgRisk >= 70) {
        riskLevel = "critical";
      } else if (avgRisk >= 45) {
        riskLevel = "watch";
      }

      // Distinct state color or fallback to risk color
      const distinctColor = stateColorPalette[key] || (avgRisk >= 70 ? tokens.bad : avgRisk >= 45 ? tokens.warn : tokens.good);

      result[key] = {
        name: val.rawName,
        count,
        totalOriginal: val.totalCostOriginal,
        totalRevised: val.totalCostRevised,
        avgRisk,
        riskLevel,
        color: distinctColor,
        projects: val.projects,
      };
    });

    return result;
  }, [projects]);

  // Determine active state for inspection panel (hovered takes precedence, then selected, then MP default)
  const activeKey = normalizeStateName(hoveredState || selectedState || "Madhya Pradesh");
  const activeData = stateStats[activeKey] || null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 28,
        alignItems: "center",
      }}
    >
      {/* Map Canvas Column */}
      <div
        style={{
          background: tokens.panel,
          border: `1px solid ${tokens.line}`,
          borderRadius: tokens.radiusMd,
          padding: "20px 16px",
          position: "relative",
          boxShadow: "0 4px 20px rgba(27, 36, 48, 0.04)",
        }}
      >
        {/* Map Header / Legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
            paddingBottom: 12,
            borderBottom: `1px solid ${tokens.line}`,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.ink, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              National Central Sector Grid
            </div>
            <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>
              Hover or click colored states to inspect active corridor telemetry
            </div>
          </div>

          {/* Color Legend */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#E05D44", display: "inline-block" }} />
              <span>Madhya Pradesh</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#F39C12", display: "inline-block" }} />
              <span>Uttar Pradesh</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#C0392B", display: "inline-block" }} />
              <span>Maharashtra</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#2980B9", display: "inline-block" }} />
              <span>Gujarat</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#27AE60", display: "inline-block" }} />
              <span>Rajasthan</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#16A085", display: "inline-block" }} />
              <span>J&amp;K</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#EAE8E1", border: "1px solid #D5D2C8", display: "inline-block" }} />
              <span>Other States</span>
            </div>
          </div>
        </div>

        {/* SVG Map Container */}
        <div
          ref={mapContainerRef}
          onMouseMove={handleContainerMouseMove}
          onMouseLeave={() => {
            setHoveredState(null);
            setTooltip(null);
          }}
          style={{ width: "100%", height: 480, position: "relative" }}
        >
          {/* Dynamic Floating Cursor State Tooltip */}
          {tooltip && (
            <div
              style={{
                position: "absolute",
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: `translate(${tooltipPos.x > 380 ? "-105%" : "14px"}, ${tooltipPos.y < 60 ? "16px" : "-105%"})`,
                pointerEvents: "none",
                zIndex: 100,
                background: "rgba(17, 24, 39, 0.96)",
                backdropFilter: "blur(8px)",
                color: "#FFFFFF",
                borderRadius: "6px",
                padding: "6px 12px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                whiteSpace: "nowrap",
                transition: "transform 0.04s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: tooltip.data ? tooltip.data.color : "#94A3B8",
                    boxShadow: tooltip.data ? `0 0 8px ${tooltip.data.color}` : "none",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.01em" }}>
                  {tooltip.name}
                </span>
              </div>

              {tooltip.data ? (
                <div style={{ fontSize: 10.5, color: "#CBD5E1", marginTop: 2, display: "flex", gap: 6, alignItems: "center" }}>
                  <span>{tooltip.data.count} {tooltip.data.count === 1 ? "Corridor" : "Corridors"}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: tooltip.data.avgRisk >= 70 ? "#FCA5A5" : tooltip.data.avgRisk >= 45 ? "#FDE047" : "#86EFAC",
                    }}
                  >
                    Risk {tooltip.data.avgRisk}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                  No Active Corridors
                </div>
              )}
            </div>
          )}

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1050,
              center: [82.8, 22.0],
            }}
            width={700}
            height={700}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={INDIA_GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.st_nm || geo.properties.NAME_1 || "";
                  const key = normalizeStateName(stateName);
                  const data = stateStats[key];
                  const isHovered = hoveredState === stateName;
                  const isSelected = selectedState === stateName;

                  // Base fill & stroke
                  let fillColor = "#EAE8E1";
                  let strokeColor = "#D0CDC4";
                  let strokeWidth = 0.8;

                  if (data) {
                    fillColor = isHovered || isSelected ? data.color : data.color;
                    strokeColor = isHovered || isSelected ? tokens.ink : "#FFFFFF";
                    strokeWidth = isHovered || isSelected ? 2 : 1.2;
                  } else if (isHovered) {
                    fillColor = "#DDD9D0";
                    strokeColor = tokens.slate;
                    strokeWidth = 1.2;
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      onMouseEnter={() => {
                        setHoveredState(stateName);
                        setTooltip({
                          name: stateName,
                          data: data || null,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredState(null);
                        setTooltip(null);
                      }}
                      onClick={() => {
                        if (data) setSelectedState(stateName);
                      }}
                      style={{
                        default: { outline: "none", cursor: data ? "pointer" : "default", transition: "all 0.15s ease" },
                        hover: { outline: "none", cursor: data ? "pointer" : "default", filter: data ? "brightness(1.15)" : "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {/* Source citation */}
        <div style={{ fontSize: 10, color: tokens.slate, marginTop: 8, textAlign: "right" }}>
          Source: Public Survey of India Boundaries (GeoJSON) · Aggregated MoSPI Project Registry
        </div>
      </div>

      {/* Side Inspection Card */}
      <div
        style={{
          background: tokens.panel,
          border: `1px solid ${tokens.line}`,
          borderRadius: tokens.radiusMd,
          padding: "24px 20px",
          boxShadow: "0 4px 20px rgba(27, 36, 48, 0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.radiusSm,
              background: activeData ? `${activeData.color}18` : "rgba(91, 101, 112, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={16} color={activeData ? activeData.color : tokens.slate} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              State Telemetry Profile
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: tokens.ink }}>
              {activeData ? activeData.name : (hoveredState || "Select a Highlighted State")}
            </div>
          </div>
        </div>

        {activeData ? (
          <div>
            {/* Key Metrics Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                padding: "14px",
                background: tokens.paper,
                borderRadius: tokens.radiusSm,
                border: `1px solid ${tokens.line}`,
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 10.5, color: tokens.slate, fontWeight: 600, textTransform: "uppercase" }}>
                  Active Projects
                </div>
                <div style={{ ...monoStyle, fontSize: 20, fontWeight: 700, color: tokens.ink, marginTop: 2 }}>
                  {activeData.count} <span style={{ fontSize: 11, fontWeight: 400, color: tokens.slate }}>corridors</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10.5, color: tokens.slate, fontWeight: 600, textTransform: "uppercase" }}>
                  Composite Risk
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ ...monoStyle, fontSize: 20, fontWeight: 700, color: activeData.color }}>
                    {activeData.avgRisk}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: tokens.radiusSm,
                      background: `${activeData.color}22`,
                      color: activeData.color,
                    }}
                  >
                    {activeData.riskLevel}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10.5, color: tokens.slate, fontWeight: 600, textTransform: "uppercase" }}>
                  Sanctioned CapEx
                </div>
                <div style={{ ...monoStyle, fontSize: 15, fontWeight: 700, color: tokens.ink, marginTop: 2 }}>
                  ₹{activeData.totalOriginal.toFixed(1)} Cr
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10.5, color: tokens.slate, fontWeight: 600, textTransform: "uppercase" }}>
                  Revised Estimate
                </div>
                <div style={{ ...monoStyle, fontSize: 15, fontWeight: 700, color: tokens.steel, marginTop: 2 }}>
                  ₹{activeData.totalRevised.toFixed(1)} Cr
                </div>
              </div>
            </div>

            {/* List of Corridors in this State */}
            <div style={{ fontSize: 11.5, fontWeight: 700, color: tokens.ink, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Monitored Corridors ({activeData.projects.length})
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
              {activeData.projects.map((p) => {
                const pRisk = p.risk || p.risk_score || 25;
                const pColor = pRisk >= 70 ? tokens.bad : pRisk >= 45 ? tokens.warn : tokens.good;
                return (
                  <div
                    key={p.code || p.id}
                    style={{
                      padding: "10px 12px",
                      background: tokens.panel,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ ...monoStyle, fontSize: 11, fontWeight: 700, color: tokens.steel }}>
                          {p.code || p.id}
                        </span>
                        <span style={{ fontSize: 10, color: tokens.slate, background: tokens.paper, padding: "1px 5px", borderRadius: "2px" }}>
                          {p.sector}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: tokens.ink, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.name}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ ...monoStyle, fontSize: 13, fontWeight: 700, color: pColor }}>
                        {pRisk}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, fontSize: 9.5, color: tokens.steel, fontWeight: 600 }}>
                        <Lock size={9} />
                        <span>Restricted</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              color: tokens.slate,
              fontSize: 12.5,
              background: tokens.paper,
              borderRadius: tokens.radiusSm,
              border: `1px dashed ${tokens.line}`,
            }}
          >
            <Info size={24} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
            <div>No active central sector infrastructure projects currently monitored in this state.</div>
            <div style={{ fontSize: 11, marginTop: 4, color: tokens.slate }}>
              Hover over Madhya Pradesh, Uttar Pradesh, Jammu & Kashmir, Gujarat, Rajasthan, or Maharashtra.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingMap;
