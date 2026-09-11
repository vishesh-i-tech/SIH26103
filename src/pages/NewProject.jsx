import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  MapPin,
  PlusCircle,
  ShieldAlert,
  Info,
  CheckCircle2,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import Panel from "../components/Panel";

export function NewProject() {
  const navigate = useNavigate();
  const { addProject } = useProjects();

  const [formData, setFormData] = useState({
    id: "NH-7720",
    name: "Gwalior–Jhansi Expressway Expansion (Pkg 3)",
    sector: "Roads",
    location: "Madhya Pradesh",
    contractor: "Larsen & Toubro Infra",
    costOriginal: "850",
    start: "Nov 2026",
    duration: "36",
    end: "Nov 2029",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const created = addProject(formData);
    navigate(`/projects/${created.id}`);
  };

  return (
    <div style={{ padding: 28, maxWidth: 800, margin: "0 auto" }}>
      {/* Back Link */}
      <button
        onClick={() => navigate("/projects")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: tokens.steel,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: 16,
          padding: 0,
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Project Directory</span>
      </button>

      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          Onboard New Infrastructure Project
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          MoSPI Central Sector Project profile registration & baseline sanction (₹150 Cr+).
        </div>
      </div>

      <Panel style={{ padding: "26px 30px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Important Government Onboarding Note */}
          <div
            style={{
              padding: "14px 16px",
              background: "#F2F5F8",
              borderRadius: tokens.radiusSm,
              border: `1px solid ${tokens.steel}44`,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <Info size={18} color={tokens.steel} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: tokens.ink, lineHeight: 1.5 }}>
              <strong>One-Time Base Profile:</strong> Daily progress, risk scoring, and billing verification will populate automatically as Field Officers submit ground entries for this project.
            </div>
          </div>

          {/* Row 1: Project Name & Code */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                PROJECT SANCTION NAME *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Bhopal Metro Rail Priority Corridor Phase 1"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                PROJECT CODE / ID *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
                placeholder="e.g. NH-7720 or RW-5100"
                style={{
                  ...monoStyle,
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 2: Sector & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                INFRASTRUCTURE SECTOR *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              >
                <option value="Roads">Roads (National Highways & Expressways)</option>
                <option value="Bridges">Bridges & Elevated Corridors</option>
                <option value="Railways">Railways & DFC Dedicated Lines</option>
                <option value="Power">Power & Grid Transmission</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                STATE / LOCATION CIRCLE *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g. Madhya Pradesh"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 3: Contractor & Sanctioned Cost */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                PRIMARY CONTRACTOR (EPC / HAM CONCESSIONAIRE) *
              </label>
              <input
                type="text"
                name="contractor"
                value={formData.contractor}
                onChange={handleChange}
                required
                placeholder="e.g. Dilip Buildcon Ltd."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                ORIGINAL SANCTIONED COST (₹ CRORE) *
              </label>
              <input
                type="number"
                name="costOriginal"
                value={formData.costOriginal}
                onChange={handleChange}
                required
                min="150"
                placeholder="e.g. 650"
                style={{
                  ...monoStyle,
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 4: Start Date, Duration, Target End */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                PROJECT START DATE *
              </label>
              <input
                type="text"
                name="start"
                value={formData.start}
                onChange={handleChange}
                required
                placeholder="e.g. Nov 2026"
                style={{
                  ...monoStyle,
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                EXPECTED DURATION (MONTHS) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="6"
                placeholder="e.g. 36"
                style={{
                  ...monoStyle,
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: tokens.slate, marginBottom: 6 }}>
                TARGET COMMISSIONING DATE *
              </label>
              <input
                type="text"
                name="end"
                value={formData.end}
                onChange={handleChange}
                required
                placeholder="e.g. Nov 2029"
                style={{
                  ...monoStyle,
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.radiusSm,
                  background: tokens.panel,
                  color: tokens.ink,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Submission Buttons */}
          <div style={{ display: "flex", gap: 12, paddingTop: 10 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "11px 18px",
                background: tokens.steel,
                color: "#FFFFFF",
                border: "none",
                borderRadius: tokens.radiusSm,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <PlusCircle size={15} />
              <span>Sanction & Register Project</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/projects")}
              style={{
                padding: "11px 18px",
                background: tokens.panel,
                color: tokens.slate,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                fontWeight: 500,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

export default NewProject;
