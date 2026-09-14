import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  HardHat,
  Search,
  Filter,
  UserPlus,
  Mail,
  MapPin,
  Briefcase,
  FolderKanban,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  X,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { Panel } from "../components/Panel";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// Seeded Comprehensive MoSPI Project Monitoring Cadre
const SEED_OFFICERS = [
  {
    id: "off-001",
    fullName: "Vishesh Indorkar",
    email: "vishu@mospi.gov.in",
    role: "admin",
    designation: "Director General & Chief Risk Auditor",
    department: "Infrastructure & Project Monitoring Division (IPMD)",
    cadre: "Indian Statistical Service (ISS)",
    zone: "MoSPI HQ, New Delhi",
    sectors: ["Roads", "Bridges", "Railways", "Power"],
    assignedProjects: [
      { id: "NH-4471", name: "Indore–Betul Highway Widening" },
      { id: "BR-7731", name: "Chenab River Arch Bridge" },
      { id: "RW-3390", name: "Mumbai–Ahmedabad HSR Pier" },
      { id: "PW-1044", name: "Bhadla–Bikaner Solar Power Complex" },
    ],
    status: "Active / On Duty",
    lastActive: "Active Now",
    phone: "+91 11 2338 4501",
    avatarBg: "#1E3A8A",
  },
  {
    id: "off-002",
    fullName: "Harshal Shinde",
    email: "field.officer@mospi.gov.in",
    role: "field_officer",
    designation: "Senior Zonal Field Inspection Engineer",
    department: "Western Zone Rail & Highway Corridor Taskforce",
    cadre: "Central Engineering Service (CES)",
    zone: "Western Zone (Mumbai / Gujarat)",
    sectors: ["Railways", "Roads"],
    assignedProjects: [
      { id: "RW-3390", name: "Mumbai–Ahmedabad HSR Pier" },
      { id: "NH-5512", name: "Ahmedabad–Dholera Expressway" },
    ],
    status: "On-Site Inspection",
    lastActive: "18 mins ago",
    phone: "+91 22 2261 8920",
    avatarBg: "#065F46",
  },
  {
    id: "off-003",
    fullName: "Er. Rajesh Verma",
    email: "rajesh.verma@mospi.gov.in",
    role: "field_officer",
    designation: "Superintending Project Engineer (Highways)",
    department: "Central Corridor Infrastructure Wing",
    cadre: "Central Engineering Service (Roads)",
    zone: "Central Zone (Bhopal / Indore)",
    sectors: ["Roads", "Bridges"],
    assignedProjects: [
      { id: "NH-4471", name: "Indore–Betul Highway Widening" },
      { id: "BR-2209", name: "Narmada River Cable-Stayed Bridge" },
    ],
    status: "Active / On Duty",
    lastActive: "42 mins ago",
    phone: "+91 755 244 1180",
    avatarBg: "#B45309",
  },
  {
    id: "off-004",
    fullName: "Amit Trivedi, IES",
    email: "amit.trivedi@mospi.gov.in",
    role: "admin",
    designation: "Joint Director (Cost Drift & Procurement Audit)",
    department: "National Infrastructure Pipeline (NIP) Monitoring Cell",
    cadre: "Indian Economic Service (IES)",
    zone: "MoSPI HQ, New Delhi",
    sectors: ["Roads", "Railways", "Power"],
    assignedProjects: [
      { id: "NH-9940", name: "Eastern Peripheral Expressway Expansion" },
      { id: "RW-8802", name: "Eastern DFC Branch Line (Kanpur Section)" },
    ],
    status: "Active / On Duty",
    lastActive: "1 hour ago",
    phone: "+91 11 2338 7820",
    avatarBg: "#4338CA",
  },
  {
    id: "off-005",
    fullName: "Dr. Sunita Deshmukh",
    email: "sunita.deshmukh@mospi.gov.in",
    role: "field_officer",
    designation: "Chief Structural Consultant & Geotech Auditor",
    department: "Northern Himalayan Bridges Taskforce",
    cadre: "National Technical Research Roster",
    zone: "Northern Zone (Jammu & Kashmir)",
    sectors: ["Bridges"],
    assignedProjects: [
      { id: "BR-7731", name: "Chenab River Arch Bridge" },
    ],
    status: "On-Site Inspection",
    lastActive: "2 hours ago",
    phone: "+91 191 254 9912",
    avatarBg: "#0E7490",
  },
  {
    id: "off-006",
    fullName: "R. K. Meena",
    email: "rk.meena@mospi.gov.in",
    role: "field_officer",
    designation: "Assistant Executive Engineer (Grid Infrastructure)",
    department: "Renewable Energy & Ultra Mega Solar Taskforce",
    cadre: "Central Power Engineering Service",
    zone: "North-Western Zone (Rajasthan)",
    sectors: ["Power"],
    assignedProjects: [
      { id: "PW-1044", name: "Bhadla–Bikaner Solar Power Complex" },
    ],
    status: "Active / On Duty",
    lastActive: "3 hours ago",
    phone: "+91 291 265 3040",
    avatarBg: "#047857",
  },
  {
    id: "off-007",
    fullName: "Pooja Bhattacharya",
    email: "pooja.b@mospi.gov.in",
    role: "admin",
    designation: "Deputy Director (GIS & Satellite Progress Verification)",
    department: "Spatial Telemetry & Remote Sensing Cell",
    cadre: "Indian Statistical Service (ISS)",
    zone: "MoSPI HQ, New Delhi",
    sectors: ["Railways", "Roads"],
    assignedProjects: [
      { id: "RW-8802", name: "Eastern DFC Branch Line (Kanpur Section)" },
      { id: "RW-1120", name: "Bhopal–Itarsi 3rd Rail Corridor" },
    ],
    status: "Active / On Duty",
    lastActive: "4 hours ago",
    phone: "+91 11 2338 6614",
    avatarBg: "#7C2D12",
  },
  {
    id: "off-008",
    fullName: "K. S. Narayanan",
    email: "ks.narayanan@mospi.gov.in",
    role: "field_officer",
    designation: "Zonal Field Engineer (Transmission & High Voltage)",
    department: "Central Transmission Corridor Supervision Unit",
    cadre: "Central Engineering Service",
    zone: "Central-East Zone (Rewa / MP)",
    sectors: ["Power"],
    assignedProjects: [
      { id: "PW-6620", name: "Rewa Solar-Grid 400kV Transmission Line" },
    ],
    status: "Active / On Duty",
    lastActive: "5 hours ago",
    phone: "+91 7662 254 700",
    avatarBg: "#6D28D9",
  },
];

export function OfficersDirectory() {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const [officers, setOfficers] = useState(SEED_OFFICERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding new officer
  const [newOfficer, setNewOfficer] = useState({
    fullName: "",
    email: "",
    role: "field_officer",
    designation: "",
    department: "",
    zone: "",
    sector: "Roads",
  });

  // Load real profiles from Supabase if available
  useEffect(() => {
    async function loadSupabaseProfiles() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data, error } = await supabase.from("profiles").select("*");
        if (!error && data && data.length > 0) {
          // Map profiles and merge with seed
          const registeredIds = new Set(SEED_OFFICERS.map((o) => o.email.toLowerCase()));
          const supabaseMapped = data
            .filter((p) => !registeredIds.has((p.email || "").toLowerCase()))
            .map((p, idx) => ({
              id: p.id,
              fullName: p.full_name || "Registered Officer",
              email: p.email || `officer-${idx + 1}@mospi.gov.in`,
              role: p.role || "field_officer",
              designation: p.role === "admin" ? "MoSPI Central Coordinator" : "Zonal Field Inspection Officer",
              department: p.role === "admin" ? "MoSPI Central Secretariat" : "Zonal Infrastructure Monitoring Wing",
              cadre: p.role === "admin" ? "MoSPI Headquarters Cadre" : "Central Engineering Roster",
              zone: "National Capital Region / Zonal Site",
              sectors: ["Roads", "Railways"],
              assignedProjects: [{ id: "NH-4471", name: "Indore–Betul Highway Widening" }],
              status: "Active / On Duty",
              lastActive: "Recently active",
              phone: "+91 11 2338 0000",
              avatarBg: p.role === "admin" ? "#1E3A8A" : "#065F46",
            }));

          if (supabaseMapped.length > 0) {
            setOfficers([...SEED_OFFICERS, ...supabaseMapped]);
          }
        }
      } catch (err) {
        console.warn("Notice: Loaded demo cadre officers directory:", err);
      }
    }
    loadSupabaseProfiles();
  }, []);

  // Filtered officers
  const filteredOfficers = useMemo(() => {
    return officers.filter((off) => {
      // Role filter
      if (roleFilter !== "all" && off.role !== roleFilter) return false;

      // Sector filter
      if (sectorFilter !== "all") {
        const matchSector = off.sectors.some(
          (s) => s.toLowerCase() === sectorFilter.toLowerCase()
        );
        if (!matchSector) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = off.fullName.toLowerCase().includes(q);
        const inDesig = off.designation.toLowerCase().includes(q);
        const inDept = off.department.toLowerCase().includes(q);
        const inZone = off.zone.toLowerCase().includes(q);
        const inProject = off.assignedProjects.some((p) =>
          p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
        );
        if (!inName && !inDesig && !inDept && !inZone && !inProject) return false;
      }

      return true;
    });
  }, [officers, roleFilter, sectorFilter, searchQuery]);

  // Aggregate stats
  const totalOfficers = officers.length;
  const adminCount = officers.filter((o) => o.role === "admin").length;
  const fieldCount = officers.filter((o) => o.role === "field_officer").length;
  const monitoredProjectsCount = useMemo(() => {
    const set = new Set();
    officers.forEach((o) => o.assignedProjects.forEach((p) => set.add(p.id)));
    return set.size;
  }, [officers]);

  // Handle create officer
  const handleAddOfficerSubmit = async (e) => {
    e.preventDefault();
    if (!newOfficer.fullName || !newOfficer.email) return;

    const created = {
      id: `off-${Date.now()}`,
      fullName: newOfficer.fullName,
      email: newOfficer.email,
      role: newOfficer.role,
      designation: newOfficer.designation || (newOfficer.role === "admin" ? "MoSPI Central Coordinator" : "Site Inspection Engineer"),
      department: newOfficer.department || "MoSPI Infrastructure Monitoring Unit",
      cadre: newOfficer.role === "admin" ? "Indian Statistical Service" : "Central Engineering Service",
      zone: newOfficer.zone || "Zonal Site Office",
      sectors: [newOfficer.sector],
      assignedProjects: [{ id: "NH-4471", name: "Indore–Betul Highway Widening" }],
      status: "Active / On Duty",
      lastActive: "Just now",
      phone: "+91 11 2338 5000",
      avatarBg: newOfficer.role === "admin" ? "#1E3A8A" : "#065F46",
    };

    setOfficers([created, ...officers]);
    setShowAddModal(false);
    setNewOfficer({
      fullName: "",
      email: "",
      role: "field_officer",
      designation: "",
      department: "",
      zone: "",
      sector: "Roads",
    });
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
              }}
            >
              <Users size={18} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: tokens.ink, margin: 0, letterSpacing: "-0.01em" }}>
                MoSPI Officers &amp; Project Cadre Directory
              </h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: tokens.slate, margin: "4px 0 0 40px" }}>
            Official registry of Central MoSPI Administrators, Project Directors, and Zonal Field Inspection Engineers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            background: tokens.steel,
            color: "#FFFFFF",
            border: "none",
            borderRadius: tokens.radiusSm,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
            transition: "all 0.15s ease",
          }}
        >
          <UserPlus size={15} />
          <span>Add / Enroll Officer</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div
        className="responsive-grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        <Panel style={{ padding: "16px 18px", borderLeft: "3px solid #2563EB" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Total Registered Cadre
          </div>
          <div style={{ ...monoStyle, fontSize: 28, fontWeight: 700, color: tokens.ink, marginTop: 4 }}>
            {totalOfficers}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            Active MoSPI &amp; Zonal Personnel
          </div>
        </Panel>

        <Panel style={{ padding: "16px 18px", borderLeft: "3px solid #7C3AED" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Central MoSPI Admins
          </div>
          <div style={{ ...monoStyle, fontSize: 28, fontWeight: 700, color: "#7C3AED", marginTop: 4 }}>
            {adminCount}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            Headquarters Policy &amp; Risk Auditors
          </div>
        </Panel>

        <Panel style={{ padding: "16px 18px", borderLeft: "3px solid #059669" }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Zonal Field Engineers
          </div>
          <div style={{ ...monoStyle, fontSize: 28, fontWeight: 700, color: "#059669", marginTop: 4 }}>
            {fieldCount}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            On-ground Physical Verification Officers
          </div>
        </Panel>

        <Panel style={{ padding: "16px 18px", borderLeft: `3px solid ${tokens.warn}` }}>
          <div style={{ fontSize: 11.5, color: tokens.slate, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Corridors Supervised
          </div>
          <div style={{ ...monoStyle, fontSize: 28, fontWeight: 700, color: tokens.warn, marginTop: 4 }}>
            {monitoredProjectsCount}
          </div>
          <div style={{ fontSize: 11.5, color: tokens.slate, marginTop: 3 }}>
            Mega projects with active monitoring
          </div>
        </Panel>
      </div>

      {/* Filter and Search Bar */}
      <Panel style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          {/* Search Input */}
          <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
            <Search size={15} color={tokens.slate} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by officer name, post, zone, or project code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                fontSize: 12.5,
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                color: tokens.ink,
                outline: "none",
                fontFamily: tokens.fontSans,
              }}
            />
          </div>

          {/* Role Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11.5, color: tokens.slate, fontWeight: 600 }}>Role:</span>
            <div style={{ display: "inline-flex", background: tokens.paper, padding: 2, borderRadius: tokens.radiusSm, border: `1px solid ${tokens.line}` }}>
              {[
                { id: "all", label: "All Cadre" },
                { id: "admin", label: "Central Admin" },
                { id: "field_officer", label: "Field Officers" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setRoleFilter(btn.id)}
                  style={{
                    padding: "4px 10px",
                    fontSize: 11.5,
                    fontWeight: roleFilter === btn.id ? 700 : 500,
                    background: roleFilter === btn.id ? tokens.panel : "transparent",
                    color: roleFilter === btn.id ? tokens.ink : tokens.slate,
                    border: "none",
                    borderRadius: tokens.radiusSm,
                    cursor: "pointer",
                    boxShadow: roleFilter === btn.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Sector Filter */}
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                color: tokens.ink,
                outline: "none",
              }}
            >
              <option value="all">All Sectors</option>
              <option value="Roads">Roads &amp; Highways</option>
              <option value="Bridges">Bridges</option>
              <option value="Railways">Railways &amp; DFC</option>
              <option value="Power">Power &amp; Renewable</option>
            </select>

            {/* View Mode Switcher */}
            <div style={{ display: "inline-flex", background: tokens.paper, padding: 2, borderRadius: tokens.radiusSm, border: `1px solid ${tokens.line}` }}>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "4px 9px",
                  fontSize: 11.5,
                  fontWeight: viewMode === "grid" ? 700 : 500,
                  background: viewMode === "grid" ? tokens.panel : "transparent",
                  color: viewMode === "grid" ? tokens.ink : tokens.slate,
                  border: "none",
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                }}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                style={{
                  padding: "4px 9px",
                  fontSize: 11.5,
                  fontWeight: viewMode === "table" ? 700 : 500,
                  background: viewMode === "table" ? tokens.panel : "transparent",
                  color: viewMode === "table" ? tokens.ink : tokens.slate,
                  border: "none",
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                }}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </Panel>

      {/* Officers List / Grid */}
      {viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 16,
          }}
        >
          {filteredOfficers.map((off) => {
            const isAdmin = off.role === "admin";
            const badgeColor = isAdmin ? "#3B82F6" : "#10B981";
            const badgeBg = isAdmin ? "#EFF6FF" : "#ECFDF5";
            const badgeBorder = isAdmin ? "#BFDBFE" : "#A7F3D0";

            return (
              <Panel
                key={off.id}
                className="box-hover-lift"
                style={{
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                  position: "relative",
                  borderTop: `3px solid ${off.avatarBg}`,
                }}
              >
                {/* Header: Avatar, Name, Post, Status */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          background: off.avatarBg,
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 16,
                          ...monoStyle,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          flexShrink: 0,
                        }}
                      >
                        {off.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      {/* Name & Post */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink, letterSpacing: "-0.01em" }}>
                          {off.fullName}
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: tokens.steel, marginTop: 2 }}>
                          {off.designation}
                        </div>
                        <div style={{ fontSize: 10.5, color: tokens.slate, marginTop: 2 }}>
                          {off.cadre}
                        </div>
                      </div>
                    </div>

                    {/* Role Tag */}
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`,
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {isAdmin ? <Shield size={11} /> : <HardHat size={11} />}
                      {isAdmin ? "Central Admin" : "Field Officer"}
                    </span>
                  </div>

                  {/* Division & Location */}
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5, color: tokens.slate }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Briefcase size={12} color={tokens.slate} />
                      <span style={{ color: tokens.ink }}>{off.department}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={12} color={tokens.slate} />
                      <span>{off.zone}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Mail size={12} color={tokens.slate} />
                      <span style={{ ...monoStyle }}>{off.email}</span>
                    </div>
                  </div>

                  {/* Sectors Covered */}
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10.5, color: tokens.steel, fontWeight: 600 }}>Sectors:</span>
                    {off.sectors.map((sec) => (
                      <span
                        key={sec}
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 3,
                          background: tokens.paper,
                          border: `1px solid ${tokens.line}`,
                          color: tokens.ink,
                        }}
                      >
                        {sec}
                      </span>
                    ))}
                  </div>

                  {/* Assigned Monitored Projects */}
                  <div style={{ marginTop: 12, padding: "8px 10px", background: tokens.paper, borderRadius: tokens.radiusSm, border: `1px solid ${tokens.line}` }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: tokens.slate, marginBottom: 5 }}>
                      Assigned Corridors ({off.assignedProjects.length}):
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {off.assignedProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/projects/${p.id}`)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: 11,
                            cursor: "pointer",
                            color: tokens.steel,
                            textDecoration: "none",
                          }}
                          className="hover-underline"
                        >
                          <span style={{ ...monoStyle, fontWeight: 700 }}>{p.id}</span>
                          <span style={{ color: tokens.slate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginLeft: 6, flex: 1 }}>
                            {p.name}
                          </span>
                          <ExternalLink size={10} color={tokens.slate} style={{ marginLeft: 4 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: Status & Quick Switch Button */}
                <div
                  style={{
                    paddingTop: 10,
                    borderTop: `1px solid ${tokens.line}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: tokens.good }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: tokens.good, display: "inline-block" }} />
                    <span style={{ fontWeight: 600 }}>{off.status}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole(off.role);
                      navigate(off.role === "admin" ? "/dashboard" : "/field-dashboard");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: tokens.steel,
                      background: "transparent",
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                    title={`Switch to ${off.role === "admin" ? "Admin" : "Field Officer"} demo view`}
                  >
                    <span>Inspect As {off.role === "admin" ? "Admin" : "Field"}</span>
                    <ArrowUpRight size={11} />
                  </button>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        /* Official Cadre Table View */
        <Panel style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
            <thead>
              <tr style={{ background: tokens.paper, borderBottom: `2px solid ${tokens.line}`, color: tokens.slate }}>
                <th style={{ padding: "12px 16px", fontWeight: 700 }}>Officer Name &amp; Cadre</th>
                <th style={{ padding: "12px 16px", fontWeight: 700 }}>Designation &amp; Post</th>
                <th style={{ padding: "12px 16px", fontWeight: 700 }}>Role</th>
                <th style={{ padding: "12px 16px", fontWeight: 700 }}>Posting / Zone</th>
                <th style={{ padding: "12px 16px", fontWeight: 700 }}>Assigned Projects</th>
                <th style={{ padding: "12px 16px", fontWeight: 700 }}>Contact Email</th>
                <th style={{ padding: "12px 16px", fontWeight: 700, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOfficers.map((off, idx) => {
                const isAdmin = off.role === "admin";
                return (
                  <tr
                    key={off.id}
                    style={{
                      borderBottom: `1px solid ${tokens.line}`,
                      background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: tokens.ink }}>{off.fullName}</div>
                      <div style={{ fontSize: 11, color: tokens.slate, marginTop: 2 }}>{off.cadre}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ color: tokens.steel, fontWeight: 600 }}>{off.designation}</div>
                      <div style={{ fontSize: 11, color: tokens.slate }}>{off.department}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: isAdmin ? "#EFF6FF" : "#ECFDF5",
                          color: isAdmin ? "#2563EB" : "#059669",
                          border: `1px solid ${isAdmin ? "#BFDBFE" : "#A7F3D0"}`,
                        }}
                      >
                        {isAdmin ? "Central Admin" : "Field Officer"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: tokens.slate }}>{off.zone}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {off.assignedProjects.map((p) => (
                          <span
                            key={p.id}
                            onClick={() => navigate(`/projects/${p.id}`)}
                            style={{
                              ...monoStyle,
                              fontSize: 11,
                              fontWeight: 700,
                              color: tokens.steel,
                              background: tokens.paper,
                              padding: "2px 6px",
                              borderRadius: 3,
                              border: `1px solid ${tokens.line}`,
                              cursor: "pointer",
                            }}
                          >
                            {p.id}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", ...monoStyle, color: tokens.slate }}>{off.email}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => {
                          switchRole(off.role);
                          navigate(off.role === "admin" ? "/dashboard" : "/field-dashboard");
                        }}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: tokens.steel,
                          background: tokens.panel,
                          border: `1px solid ${tokens.line}`,
                          borderRadius: tokens.radiusSm,
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}

      {/* Add / Enroll Officer Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: tokens.panel,
              borderRadius: tokens.radiusMd,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              border: `1px solid ${tokens.line}`,
              width: "100%",
              maxWidth: 520,
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${tokens.line}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={18} color={tokens.steel} />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: tokens.ink }}>
                  Enroll New MoSPI Officer / Cadre
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.slate }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddOfficerSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                  Officer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Er. Anand Kumar"
                  value={newOfficer.fullName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: 12.5,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                    background: tokens.paper,
                    color: tokens.ink,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="officer@mospi.gov.in"
                    value={newOfficer.email}
                    onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12.5,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      background: tokens.paper,
                      color: tokens.ink,
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                    Cadre Role *
                  </label>
                  <select
                    value={newOfficer.role}
                    onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12.5,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      background: tokens.paper,
                      color: tokens.ink,
                      outline: "none",
                    }}
                  >
                    <option value="field_officer">Zonal Field Inspection Officer</option>
                    <option value="admin">Central MoSPI Admin / Auditor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                    Designation / Post
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Executive Project Engineer"
                    value={newOfficer.designation}
                    onChange={(e) => setNewOfficer({ ...newOfficer, designation: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12.5,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      background: tokens.paper,
                      color: tokens.ink,
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                    Primary Sector
                  </label>
                  <select
                    value={newOfficer.sector}
                    onChange={(e) => setNewOfficer({ ...newOfficer, sector: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12.5,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      background: tokens.paper,
                      color: tokens.ink,
                      outline: "none",
                    }}
                  >
                    <option value="Roads">Roads &amp; Highways</option>
                    <option value="Bridges">Bridges</option>
                    <option value="Railways">Railways &amp; DFC</option>
                    <option value="Power">Power &amp; Renewable</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                  Posting Zone / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Northern Zone (Jammu / Srinagar)"
                  value={newOfficer.zone}
                  onChange={(e) => setNewOfficer({ ...newOfficer, zone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: 12.5,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                    background: tokens.paper,
                    color: tokens.ink,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 12,
                    background: "transparent",
                    border: `1px solid ${tokens.line}`,
                    borderRadius: tokens.radiusSm,
                    color: tokens.slate,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background: tokens.steel,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: tokens.radiusSm,
                    cursor: "pointer",
                  }}
                >
                  Confirm &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficersDirectory;
