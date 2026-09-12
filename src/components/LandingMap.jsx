import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { tokens, monoStyle } from "../styles/tokens";
import { Shield, Layers, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

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

    // Compute averages
    const result = {};
    map.forEach((val, key) => {
      const count = val.projects.length;
      const avgRisk = count > 0 ? Math.round(val.riskSum / count) : 0;
      let riskLevel = "stable";
      let color = tokens.good;

      if (avgRisk >= 70) {
        riskLevel = "critical";
        color = tokens.bad;
      } else if (avgRisk >= 45) {
        riskLevel = "watch";
        color = tokens.warn;
      }

      result[key] = {
        name: val.rawName,
        count,
        totalOriginal: val.totalCostOriginal,
        totalRevised: val.totalCostRevised,
        avgRisk,
        riskLevel,
        color,
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
              Hover or click states to inspect corridor telemetry
            </div>
          </div>

          {/* Color Legend */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: tokens.bad, display: "inline-block" }} />
              <span>Critical (≥70)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: tokens.warn, display: "inline-block" }} />
              <span>Watch (45-69)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: tokens.good, display: "inline-block" }} />
              <span>Stable (&lt;45)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: tokens.slate }}>
              <span style={{ width: 10, height: 10, borderRadius: "2px", background: "#E2E0D8", display: "inline-block" }} />
              <span>Unmonitored</span>
            </div>
          </div>
        </div>

        {/* SVG Map Container */}
        <div style={{ width: "100%", height: 460, position: "relative" }}>
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

                  let fillColor = "#E2E0D8";
                  if (data) {
                    fillColor = data.color;
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => {
                        if (data) setSelectedState(stateName);
                      }}
                      style={{
                        default: {
                          fill: isSelected || isHovered ? (data ? data.color : "#D3D0C7") : fillColor,
                          stroke: isHovered || isSelected ? tokens.ink : "#FFFFFF",
                          strokeWidth: isHovered || isSelected ? 1.5 : 0.6,
                          outline: "none",
                          transition: "all 0.2s ease",
                          cursor: data ? "pointer" : "default",
                          filter: isHovered ? "brightness(1.1)" : "none",
                        },
                        hover: {
                          fill: data ? data.color : "#D3D0C7",
                          stroke: tokens.ink,
                          strokeWidth: 1.8,
                          outline: "none",
                          cursor: data ? "pointer" : "default",
                        },
                        pressed: {
                          fill: data ? data.color : "#C5C2B8",
                          stroke: tokens.ink,
                          strokeWidth: 2,
                          outline: "none",
                        },
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
                      <div style={{ fontSize: 9.5, color: tokens.slate }}>
                        {p.actual_progress ?? p.actual ?? 0}% done
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
