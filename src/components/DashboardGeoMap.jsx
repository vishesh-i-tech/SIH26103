import React, { useState, useMemo, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useNavigate } from "react-router-dom";
import { tokens, monoStyle } from "../styles/tokens";
import { Shield, ArrowRight, Layers, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";

// Local GeoJSON loaded directly (source: public/india.json)
const INDIA_GEO_URL = "/india.json";

function normalizeStateName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Approximate project geographic coordinates for map markers
const PROJECT_COORDINATES = {
  "NH-4471": [75.8577, 22.7196], // Indore-Betul
  "BR-2209": [77.7333, 22.7500], // Narmada Bridge
  "RW-1120": [77.4126, 23.2599], // Bhopal-Itarsi
  "PW-6620": [81.2986, 24.5362], // Rewa Solar
  "RW-8802": [80.3319, 26.8467], // Lucknow-Kanpur
  "NH-9940": [77.4538, 28.6692], // Eastern Peripheral
  "RW-3390": [72.9781, 19.2183], // Mumbai-Ahmedabad HSR
  "NH-5512": [72.2312, 22.2470], // Ahmedabad-Dholera
  "PW-1044": [72.8986, 27.8986], // Bhadla-Bikaner
  "BR-7731": [74.8800, 33.1500], // Chenab Bridge J&K
};

// Fallback state center coordinates for dynamically added projects
const STATE_CENTERS = {
  madhyapradesh: [77.5, 23.5],
  uttarpradesh: [80.5, 27.0],
  maharashtra: [75.5, 19.5],
  gujarat: [71.5, 22.5],
  rajasthan: [73.5, 26.5],
  jammuandkashmir: [75.0, 33.5],
};

export function DashboardGeoMap({ projects = [] }) {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
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

    // Curated state color palette matching MoSPI sector mapping
    const stateColorPalette = {
      madhyapradesh: "#E05D44",  // Coral Red (Indore-Betul, Narmada, Bhopal, Rewa)
      uttarpradesh: "#F39C12",   // Amber / Gold (Lucknow Exp & DFC)
      maharashtra: "#C0392B",    // Crimson (Mumbai-Ahmedabad HSR Pier)
      gujarat: "#2980B9",        // Blue (Ahmedabad-Dholera Exp)
      rajasthan: "#27AE60",      // Green (Bhadla-Bikaner Solar Power)
      jammuandkashmir: "#16A085",// Teal (Chenab River Bridge)
    };

    const result = {};
    map.forEach((val, key) => {
      const count = val.projects.length;
      const avgRisk = count > 0 ? Math.round(val.riskSum / count) : 0;
      let riskLevel = "stable";
      let riskColor = tokens.good;

      if (avgRisk >= 70) {
        riskLevel = "critical";
        riskColor = tokens.bad;
      } else if (avgRisk >= 45) {
        riskLevel = "watch";
        riskColor = tokens.warn;
      }

      const distinctColor = stateColorPalette[key] || riskColor;

      result[key] = {
        name: val.rawName,
        count,
        totalOriginal: val.totalCostOriginal,
        totalRevised: val.totalCostRevised,
        avgRisk,
        riskLevel,
        riskColor,
        color: distinctColor,
        projects: val.projects,
      };
    });

    return result;
  }, [projects]);

  // Project marker locations
  const projectMarkers = useMemo(() => {
    return projects
      .map((p) => {
        const pCode = p.code || p.id;
        let coords = PROJECT_COORDINATES[pCode];
        if (!coords && p.location) {
          const key = normalizeStateName(p.location);
          coords = STATE_CENTERS[key];
        }
        if (!coords) return null;

        const risk = Number(p.risk || p.risk_score || 0);
        const tone = risk >= 70 ? tokens.bad : risk >= 45 ? tokens.warn : tokens.good;

        return {
          id: p.id,
          code: pCode,
          name: p.name,
          location: p.location,
          risk,
          tone,
          progress: p.actualProgress || p.actual || p.actual_progress || 0,
          coordinates: coords,
        };
      })
      .filter(Boolean);
  }, [projects]);

  const activeSelectedStateData = selectedState ? stateStats[normalizeStateName(selectedState)] : null;

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* State Legend Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: `1px solid ${tokens.line}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E05D44", display: "inline-block" }} />
            <span>Madhya Pradesh (Risk 87)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#F39C12", display: "inline-block" }} />
            <span>Uttar Pradesh (Risk 64)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#C0392B", display: "inline-block" }} />
            <span>Maharashtra (Risk 72)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#2980B9", display: "inline-block" }} />
            <span>Gujarat (Risk 38)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#27AE60", display: "inline-block" }} />
            <span>Rajasthan (Risk 31)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.slate }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#16A085", display: "inline-block" }} />
            <span>J&K (Risk 44)</span>
          </div>
        </div>

        <div style={{ fontSize: 10.5, color: tokens.steel, fontStyle: "italic" }}>
          Click state for project list
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
        style={{
          width: "100%",
          height: 380,
          position: "relative",
          background: tokens.panel,
          borderRadius: tokens.radiusSm,
        }}
      >
        {/* Dynamic Floating Cursor State Tooltip (Shows State, Risk, AND Project Breakdown) */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: `translate(${tooltipPos.x > 320 ? "-105%" : "16px"}, ${tooltipPos.y < 90 ? "16px" : "-105%"})`,
              pointerEvents: "none",
              zIndex: 100,
              background: "rgba(15, 23, 42, 0.96)",
              backdropFilter: "blur(10px)",
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "10px 14px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              minWidth: 240,
              maxWidth: 320,
              transition: "transform 0.04s ease",
            }}
          >
            {/* Tooltip Header: State + Corridor Count + Risk */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 6, borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
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

              {tooltip.data && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: tooltip.data.avgRisk >= 70 ? "rgba(224, 93, 68, 0.25)" : tooltip.data.avgRisk >= 45 ? "rgba(243, 156, 18, 0.25)" : "rgba(39, 174, 96, 0.25)",
                    color: tooltip.data.avgRisk >= 70 ? "#FCA5A5" : tooltip.data.avgRisk >= 45 ? "#FDE047" : "#86EFAC",
                    border: `1px solid ${tooltip.data.avgRisk >= 70 ? "rgba(224, 93, 68, 0.4)" : tooltip.data.avgRisk >= 45 ? "rgba(243, 156, 18, 0.4)" : "rgba(39, 174, 96, 0.4)"}`,
                  }}
                >
                  Risk {tooltip.data.avgRisk} · {tooltip.data.riskLevel.toUpperCase()}
                </span>
              )}
            </div>

            {/* Tooltip Body: Active Projects in this State */}
            {tooltip.data && tooltip.data.projects && tooltip.data.projects.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
                  {tooltip.data.count} Monitored {tooltip.data.count === 1 ? "Project" : "Projects"}:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {tooltip.data.projects.slice(0, 4).map((p) => {
                    const pRisk = p.risk || p.risk_score || 0;
                    const pTone = pRisk >= 70 ? "#EF4444" : pRisk >= 45 ? "#F59E0B" : "#10B981";
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 11,
                          gap: 8,
                          background: "rgba(255, 255, 255, 0.05)",
                          padding: "3px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <span style={{ ...monoStyle, fontWeight: 700, color: "#E2E8F0", marginRight: 5 }}>
                            {p.code || p.id}
                          </span>
                          <span style={{ color: "#94A3B8" }}>
                            {p.name.length > 22 ? `${p.name.slice(0, 20)}...` : p.name}
                          </span>
                        </div>
                        <span style={{ ...monoStyle, fontWeight: 700, color: pTone, flexShrink: 0 }}>
                          {pRisk}
                        </span>
                      </div>
                    );
                  })}
                  {tooltip.data.projects.length > 4 && (
                    <div style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic", textAlign: "right" }}>
                      +{tooltip.data.projects.length - 4} more projects
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 6, fontStyle: "italic" }}>
                No active central sector projects in this region.
              </div>
            )}
          </div>
        )}

        {/* Responsive Map Canvas */}
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 780,
            center: [82.8, 23.0],
          }}
          width={500}
          height={500}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {/* India State Boundaries */}
          <Geographies geography={INDIA_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.st_nm || geo.properties.NAME_1 || "";
                const key = normalizeStateName(stateName);
                const data = stateStats[key];
                const isHovered = hoveredState === stateName;
                const isSelected = selectedState === stateName;

                let fillColor = "#EAE8E1";
                let strokeColor = "#D5D2C8";
                let strokeWidth = 0.8;

                if (data) {
                  fillColor = data.color;
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
                      if (data) {
                        setSelectedState(selectedState === stateName ? null : stateName);
                      }
                    }}
                    style={{
                      default: {
                        outline: "none",
                        cursor: data ? "pointer" : "default",
                        transition: "all 0.15s ease",
                      },
                      hover: {
                        outline: "none",
                        cursor: data ? "pointer" : "default",
                        filter: data ? "brightness(1.15)" : "none",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Project Coordinate Pins (Interactive Markers) */}
          {projectMarkers.map((marker) => (
            <Marker
              key={marker.id}
              coordinates={marker.coordinates}
              onClick={() => navigate(`/projects/${marker.id}`)}
              onMouseEnter={() => {
                const key = normalizeStateName(marker.location);
                setTooltip({
                  name: marker.location,
                  data: stateStats[key] || {
                    name: marker.location,
                    count: 1,
                    avgRisk: marker.risk,
                    riskLevel: marker.risk >= 70 ? "critical" : marker.risk >= 45 ? "watch" : "stable",
                    color: marker.tone,
                    projects: [marker],
                  },
                });
              }}
              style={{
                default: { cursor: "pointer" },
                hover: { cursor: "pointer" },
                pressed: { cursor: "pointer" },
              }}
            >
              {/* Outer Pulsing Aura for Critical Projects */}
              {marker.risk >= 70 && (
                <circle
                  r={7}
                  fill="none"
                  stroke={marker.tone}
                  strokeWidth={1.5}
                  opacity={0.7}
                />
              )}
              {/* Solid Pin Core */}
              <circle
                r={4}
                fill={marker.tone}
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* Selected State Inspection Drawer (Appears when user clicks any state) */}
      {activeSelectedStateData && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            background: tokens.paper,
            border: `1px solid ${tokens.line}`,
            borderRadius: tokens.radiusSm,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeSelectedStateData.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: tokens.ink }}>
                {activeSelectedStateData.name} ({activeSelectedStateData.count} Projects · Avg Risk {activeSelectedStateData.avgRisk})
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {activeSelectedStateData.projects.map((p) => {
              const pRisk = p.risk || p.risk_score || 0;
              const pTone = pRisk >= 70 ? tokens.bad : pRisk >= 45 ? tokens.warn : tokens.good;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 8px",
                    background: tokens.panel,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                    fontSize: 11,
                    cursor: "pointer",
                    color: tokens.ink,
                  }}
                  title={`Open ${p.name}`}
                >
                  <span style={{ ...monoStyle, fontWeight: 700 }}>{p.code || p.id}</span>
                  <span style={{ ...monoStyle, fontWeight: 700, color: pTone }}>{pRisk}</span>
                  <ExternalLink size={10} color={tokens.slate} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardGeoMap;
