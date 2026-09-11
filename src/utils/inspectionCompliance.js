import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { tokens } from "../styles/tokens";

/**
 * PAIMANA AI — MoSPI Statutory Inspection Role Compliance Engine
 * Dynamically computes role-based site verification compliance based on:
 * - Project infrastructure sector (Roads, Bridges, Railways, Power)
 * - Project risk severity (Critical >= 70, Watch 45-69, Stable < 45)
 * - Ground verification entries (daily submissions from site engineers)
 * - Project impediment factors & days flagged
 */

export function getInspectionCompliance(project) {
  if (!project) return [];

  // If the project already has explicit curated compliance records, return them
  if (Array.isArray(project.inspectionCompliance) && project.inspectionCompliance.length > 0) {
    return project.inspectionCompliance.map((item) => ({
      ...item,
      icon: item.iconType === "bad" ? XCircle : item.iconType === "warn" ? Clock : item.iconType === "alert" ? AlertTriangle : CheckCircle2,
      color: item.iconType === "bad" ? tokens.bad : item.iconType === "warn" ? tokens.warn : item.iconType === "alert" ? tokens.bad : tokens.good,
    }));
  }

  const risk = Number(project.risk ?? 25);
  const sector = project.sector || "Roads";
  const daysFlagged = Number(project.daysFlagged ?? (risk >= 70 ? 6 : 0));
  const entries = project.dailyEntries || [];
  const hasEntries = entries.length > 0;
  const latestEntry = hasEntries ? entries[0] : null;
  const isStalled = latestEntry?.status === "Stalled";
  const isOff = latestEntry?.status === "Off";
  const factors = project.factors || [];
  const factorTexts = factors.map((f) => (f.f || "").toLowerCase()).join(" ");

  // Sector-tailored statutory engineering roles
  const roles = {
    Roads: {
      site: "Highway Resident Engineer",
      sub: "Assistant Sub Engineer (Circle)",
      qa: "QA/QC Pavement Lab",
      mat: "Material Inspector (MTC)",
    },
    Bridges: {
      site: "Structural Resident Engineer",
      sub: "Sub Engineer (Substructure)",
      qa: "QA/QC Non-Destructive Lab (NDT)",
      mat: "Independent Engineer (TPIA)",
    },
    Railways: {
      site: "P-Way Resident Engineer",
      sub: "Section Engineer (Track/OHE)",
      qa: "CRS Railway Safety Audit",
      mat: "Metallurgical & Weld Inspector",
    },
    Power: {
      site: "Transmission Line Engineer",
      sub: "Substation Sub Engineer",
      qa: "Electrical Grid QA/QC",
      mat: "High-Voltage Material Inspector",
    },
  }[sector] || {
    site: "Site Resident Engineer",
    sub: "Assistant Sub Engineer",
    qa: "QA/QC Technical Audit",
    mat: "Material Inspector",
  };

  // 1. SITE ENGINEER STATUS
  let siteItem = {
    role: roles.site,
    status: "Verified Today",
    icon: CheckCircle2,
    color: tokens.good,
    detail: "Standard telemetry & work log submitted",
  };

  if (hasEntries) {
    if (isStalled) {
      siteItem = {
        role: roles.site,
        status: latestEntry.reason ? `Impediment: ${latestEntry.reason}` : "Site Stoppage Logged",
        icon: AlertTriangle,
        color: tokens.bad,
        detail: `Logged by ${latestEntry.submittedBy || "Site Engineer"} (${latestEntry.date})`,
      };
    } else if (isOff) {
      siteItem = {
        role: roles.site,
        status: `Work Off (${latestEntry.reason || "Weather"})`,
        icon: Clock,
        color: tokens.warn,
        detail: `Recorded on ${latestEntry.date}`,
      };
    } else {
      siteItem = {
        role: roles.site,
        status: `Verified (${latestEntry.date || "Today"})`,
        icon: CheckCircle2,
        color: tokens.good,
        detail: `Logged by ${latestEntry.submittedBy || "Site Engineer"}`,
      };
    }
  } else if (project.actual === 0 || (project.planned === 0 && risk <= 30)) {
    siteItem = {
      role: roles.site,
      status: "Baseline Survey Logged",
      icon: CheckCircle2,
      color: tokens.steel,
      detail: "Initial ground mobilization benchmark recorded",
    };
  } else if (risk >= 75) {
    if (/land|dispute|row|clearance/i.test(factorTexts)) {
      siteItem = {
        role: roles.site,
        status: `RoW Access Blockage (${daysFlagged}d)`,
        icon: AlertTriangle,
        color: tokens.bad,
        detail: "Ground entry impeded at designated chainage",
      };
    } else {
      siteItem = {
        role: roles.site,
        status: `Execution Exception (${daysFlagged}d Flagged)`,
        icon: AlertTriangle,
        color: tokens.bad,
        detail: "Site telemetry deviates from approved baseline",
      };
    }
  } else if (risk >= 50) {
    siteItem = {
      role: roles.site,
      status: "Verified (2d ago)",
      icon: CheckCircle2,
      color: tokens.good,
      detail: "Routine site log current within tolerance",
    };
  }

  // 2. SUB ENGINEER STATUS
  let subItem = {
    role: roles.sub,
    status: "Joint Measurement OK",
    icon: CheckCircle2,
    color: tokens.good,
    detail: "Physical cross-sections match field report",
  };

  if (project.actual === 0) {
    subItem = {
      role: roles.sub,
      status: "Demarcation in Progress",
      icon: Clock,
      color: tokens.steel,
      detail: "Statutory boundary demarcation under review",
    };
  } else if (risk >= 80) {
    subItem = {
      role: roles.sub,
      status: "Measurement Drift Flagged",
      icon: AlertTriangle,
      color: tokens.bad,
      detail: "RA billing claimed vs physical survey variance",
    };
  } else if (risk >= 60) {
    if (/monsoon|rain|water/i.test(factorTexts)) {
      subItem = {
        role: roles.sub,
        status: "Gauge / Weather Monitored",
        icon: Clock,
        color: tokens.warn,
        detail: "Environmental limits logged at river/site gauge",
      };
    } else {
      subItem = {
        role: roles.sub,
        status: "Verified (3d ago)",
        icon: CheckCircle2,
        color: tokens.good,
        detail: "Periodic joint measurement approved",
      };
    }
  }

  // 3. QA/QC LABORATORY & SAFETY AUDIT
  let qaItem = {
    role: roles.qa,
    status: "Audit Cleared (Full Pass)",
    icon: CheckCircle2,
    color: tokens.good,
    detail: "Non-destructive & compressive strength tests meet IS/IRC codes",
  };

  if (project.actual === 0) {
    qaItem = {
      role: roles.qa,
      status: "Quality Protocol Established",
      icon: CheckCircle2,
      color: tokens.steel,
      detail: "Contractor Quality Assurance Plan (QAP) approved",
    };
  } else if (/defect|rejection|sonic|cross-hole|crack/i.test(factorTexts) || /iit roorkee|qa\/qc/i.test((project.recommendation || "").toLowerCase())) {
    qaItem = {
      role: roles.qa,
      status: "Third-Party Audit Ordered",
      icon: AlertTriangle,
      color: tokens.bad,
      detail: "Structural sampling re-test mandated before next pour",
    };
  } else if (risk >= 80) {
    qaItem = {
      role: roles.qa,
      status: `Audit Overdue (${daysFlagged || 5}d Delay)`,
      icon: XCircle,
      color: tokens.bad,
      detail: "Statutory milestone quality audit pending inspection team visit",
    };
  } else if (risk >= 60) {
    qaItem = {
      role: roles.qa,
      status: "Notice Under Review",
      icon: Clock,
      color: tokens.warn,
      detail: "Minor compliance observations pending contractor rectification",
    };
  } else if (risk >= 45) {
    qaItem = {
      role: roles.qa,
      status: "Audit Cleared with Remarks",
      icon: CheckCircle2,
      color: tokens.good,
      detail: "Standard quality tolerances verified with routine remarks",
    };
  }

  // 4. MATERIAL INSPECTOR (TPIA / MTC)
  let matItem = {
    role: roles.mat,
    status: "Cert Verified (MTC Pass)",
    icon: CheckCircle2,
    color: tokens.good,
    detail: "Cement, steel, aggregate batch test certificates approved",
  };

  if (project.actual === 0) {
    matItem = {
      role: roles.mat,
      status: "Vendor Sources Approved",
      icon: CheckCircle2,
      color: tokens.steel,
      detail: "OEM vendor & batching plant pre-qualification complete",
    };
  } else if (/material.*supply|supply.*gap|cement.*shortage|aggregate|delivery.*delay/i.test(factorTexts)) {
    matItem = {
      role: roles.mat,
      status: "Batch Supply Gap Flagged",
      icon: AlertTriangle,
      color: tokens.bad,
      detail: "Material dispatch shortfall impacting active critical path",
    };
  } else if (risk >= 85) {
    matItem = {
      role: roles.mat,
      status: "Sample Re-Testing Mandated",
      icon: XCircle,
      color: tokens.bad,
      detail: "Independent laboratory core test sampling ordered",
    };
  } else if (risk >= 65) {
    matItem = {
      role: roles.mat,
      status: "Mill Test Cert Awaited",
      icon: Clock,
      color: tokens.warn,
      detail: "Incoming shipment physical inspection cleared; mill cert awaited",
    };
  }

  return [siteItem, subItem, qaItem, matItem];
}

/**
 * Compute overall compliance stats for badges
 */
export function getComplianceStats(complianceList) {
  if (!complianceList || complianceList.length === 0) {
    return { passed: 0, total: 0, percentage: 100, isAllPassed: true };
  }
  const passed = complianceList.filter((i) => i.color === tokens.good || i.color === tokens.steel).length;
  const total = complianceList.length;
  const percentage = Math.round((passed / total) * 100);
  return {
    passed,
    total,
    percentage,
    isAllPassed: passed === total,
    hasCritical: complianceList.some((i) => i.color === tokens.bad),
  };
}

/**
 * Return project-tailored ground verification entries if project has no custom daily entries
 */
export function getDefaultDailyEntries(project) {
  if (!project) return [];
  const code = (project.code || project.id || "").toUpperCase();

  const curatedEntries = {
    "NH-4471": [
      {
        id: "ent-nh4471-1",
        date: "11 Sept 2026",
        status: "Running",
        reviewStatus: "Pending Review",
        submittedBy: "Er. Rajesh Verma (Site Engineer)",
        notes: "Girder segment concrete pour commenced at chainage 42+150. Slump test and temperature within MoRTH tolerance limits.",
        materials: "Cement: 140 bags · Steel: 35 MT · Aggregate: 45 cum",
        hasPhoto: true,
      },
      {
        id: "ent-nh4471-2",
        date: "09 Sept 2026",
        status: "Stalled",
        reviewStatus: "Reviewed",
        reason: "Land/legal dispute",
        submittedBy: "Er. Rajesh Verma (Site Engineer)",
        notes: "Right-of-way dispute at km 44. Local revenue authority team visited site; demarcation verification ongoing.",
        materials: "None logged",
        hasPhoto: true,
      },
    ],
    "BR-2209": [
      {
        id: "ent-br2209-1",
        date: "10 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "Anand K. (Structural Resident Engineer)",
        notes: "Abutment A2 shuttering work inspected and cleared for concrete pour. Batching plant ready for night shifts.",
        materials: "Cement: 90 bags · Sand: 28 cum · Admixture: 40 L",
        hasPhoto: true,
      },
      {
        id: "ent-br2209-2",
        date: "08 Sept 2026",
        status: "Off",
        reviewStatus: "Reviewed",
        reason: "Monsoon river high water",
        submittedBy: "Anand K. (Structural Resident Engineer)",
        notes: "River water level exceeded safety threshold (Gauge 3.4m). Pier foundation works suspended in compliance with safety protocol.",
        materials: "None logged",
        hasPhoto: false,
      },
    ],
    "RW-8802": [
      {
        id: "ent-rw8802-1",
        date: "11 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "Deepak Tiwari (P-Way Engineer)",
        notes: "Flash-butt welding for 60kg UIC rails completed between Chainage 118+200 to 119+500. Ultrasonic flaw detection (USFD) testing passed.",
        materials: "Welding kits: 24 nos · Ballast: 180 cum",
        hasPhoto: true,
      },
      {
        id: "ent-rw8802-2",
        date: "08 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "M. K. Saxena (Section Engineer - OHE)",
        notes: "OHE mast foundation and bracket erection verified across 18 structures. Plumb-line tolerances verified within RDSO standards.",
        materials: "Steel masts: 18 nos · Foundation bolts: 72 sets",
        hasPhoto: false,
      },
    ],
    "PW-3341": [
      {
        id: "ent-pw3341-1",
        date: "11 Sept 2026",
        status: "Stalled",
        reviewStatus: "Pending Review",
        reason: "Right-of-way crop compensation negotiations",
        submittedBy: "V. Saxena (Transmission Resident Engineer)",
        notes: "Tower 84 stub erection halted by agricultural landholders demanding revised crop disturbance compensation. Sub-Divisional Magistrate liaison initiated.",
        materials: "None logged",
        hasPhoto: true,
      },
      {
        id: "ent-pw3341-2",
        date: "07 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "M. R. Joshi (Substation Engineer)",
        notes: "400kV GIS switchyard control room plinth excavation and earthing grid layout cleared by electrical safety inspector.",
        materials: "Earthing copper tape: 240 m · Cement: 60 bags",
        hasPhoto: false,
      },
    ],
    "NH-5510": [
      {
        id: "ent-nh5510-1",
        date: "11 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "K. P. Singh (Highway Resident Engineer)",
        notes: "Dense Bituminous Macadam (DBM) laying completed from km 18+400 to 19+800. Binder course temperature logged at 152°C.",
        materials: "Bitumen VG-40: 38 MT · Crushed aggregate: 220 MT",
        hasPhoto: true,
      },
      {
        id: "ent-nh5510-2",
        date: "09 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "P. Rao (QA/QC Field Engineer)",
        notes: "Core cutter density test conducted on asphalt layer; achieved 98.4% of Marshall design density. Surface regularity satisfactory.",
        materials: "Lab test specimens: 6 cores",
        hasPhoto: false,
      },
    ],
    "RW-9104": [
      {
        id: "ent-rw9104-1",
        date: "11 Sept 2026",
        status: "Stalled",
        reviewStatus: "Pending Review",
        reason: "Subgrade soil failure on 12km stretch",
        submittedBy: "Sunil Kumar (Freight Corridor Engineer)",
        notes: "Formation level subgrade soil settlement observed between km 48 to 51 after rain. Clause 14.2 technical notice issued to EPC contractor for geotextile reinforcement.",
        materials: "None logged",
        hasPhoto: true,
      },
      {
        id: "ent-rw9104-2",
        date: "08 Sept 2026",
        status: "Issue Logged",
        reviewStatus: "Reviewed",
        reason: "Subcontractor wage bottlenecks",
        submittedBy: "P. K. Verma (Section Engineer - Civil)",
        notes: "Subcontractor earthwork equipment idling due to petty contractor wage disbursement delay. Joint conciliation meeting convened.",
        materials: "None logged",
        hasPhoto: false,
      },
    ],
    "BR-1402": [
      {
        id: "ent-br1402-1",
        date: "10 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "P. S. Rathore (Structural Resident Engineer)",
        notes: "Rock anchor drilling and high-tensile strand tensioning at Pier P3 slope foundation. 12 tendon strands stressed to 1200 kN design load.",
        materials: "Tendon strands: 12 nos · Grout mix: 45 bags",
        hasPhoto: true,
      },
      {
        id: "ent-br1402-2",
        date: "07 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "A. Banerjee (QA/QC Metallurgical Engineer)",
        notes: "Ultrasonic non-destructive testing of Pier P2 base plate fillet welds verified. Zero flaw indications recorded.",
        materials: "NDT calibration blocks verified",
        hasPhoto: false,
      },
    ],
    "PW-4902": [
      {
        id: "ent-pw4902-1",
        date: "11 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "R. Bishnoi (Transmission Engineer)",
        notes: "220kV switchyard bay 3 foundation work completed. Surge arrestor and capacitive voltage transformer mounting verified.",
        materials: "Structural steel: 18 MT · Concrete: 50 cum",
        hasPhoto: true,
      },
      {
        id: "ent-pw4902-2",
        date: "08 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "G. Sharma (Electrical QA/QC Inspector)",
        notes: "Substation ground earth mat resistance measured at 0.38 Ohms, complying with CEA grid code (< 0.5 Ohm standard).",
        materials: "Earth testing kit verified",
        hasPhoto: false,
      },
    ],
    "NH-6218": [
      {
        id: "ent-nh6218-1",
        date: "11 Sept 2026",
        status: "Running",
        reviewStatus: "Reviewed",
        submittedBy: "S. G. Patil (Highway Resident Engineer)",
        notes: "Coastal causeway retaining wall reinforcement bar tying inspected. Anti-corrosive fusion bonded epoxy (FBE) rebar coating verified.",
        materials: "FBE TMT Steel: 28 MT · Binding wire: 120 kg",
        hasPhoto: true,
      },
      {
        id: "ent-nh6218-2",
        date: "07 Sept 2026",
        status: "Off",
        reviewStatus: "Reviewed",
        reason: "High tide causeway inundation",
        submittedBy: "S. G. Patil (Highway Resident Engineer)",
        notes: "High astronomical spring tide inundated causeway low-level access platform. Work halted per Maritime Board protocol.",
        materials: "None logged",
        hasPhoto: false,
      },
    ],
    "RW-7319": [
      {
        id: "ent-rw7319-1",
        date: "11 Sept 2026",
        status: "Stalled",
        reviewStatus: "Pending Review",
        reason: "Precast girder casting defect rate exceeding tolerance",
        submittedBy: "K. V. Mehta (High-Speed Rail Engineer)",
        notes: "Ultrasonic Cross-Hole Sonic Logging (CSL) on Pier 14 cap revealed consolidation anomaly. Casting halted; batch re-verification referred to IIT Roorkee team.",
        materials: "M60 Concrete test cores: 8 samples",
        hasPhoto: true,
      },
      {
        id: "ent-rw7319-2",
        date: "09 Sept 2026",
        status: "Issue Logged",
        reviewStatus: "Reviewed",
        reason: "Girder rejection threshold breach",
        submittedBy: "H. Desai (Material Engineer)",
        notes: "M60 grade high-performance precast segment 28-day cube strength tests showed 14% batch rejection rate. Technical notice served to casting yard.",
        materials: "None logged",
        hasPhoto: false,
      },
    ],
  };

  if (curatedEntries[code]) {
    return curatedEntries[code];
  }

  // Fallback for new projects or unrecognized codes
  const isNew = project.actual === 0 || (project.planned === 0 && Number(project.risk ?? 25) <= 30);
  if (isNew) {
    return [
      {
        id: `ent-${project.id || "new"}-1`,
        date: "Recent Mobilization",
        status: "Running",
        reviewStatus: "Baseline Set",
        submittedBy: "MoSPI Field Oversight Team",
        notes: `Initial ground mobilization & alignment survey benchmarked for ${project.name}. Primary chainage control coordinates logged.`,
        materials: "Statutory demarcation benchmarks established",
        hasPhoto: false,
      },
    ];
  }

  return [
    {
      id: `ent-${project.id || "def"}-1`,
      date: "11 Sept 2026",
      status: Number(project.risk ?? 25) >= 70 ? "Issue Logged" : "Running",
      reviewStatus: "Pending Review",
      submittedBy: "Field Resident Engineer",
      notes: `Site telemetry and ground execution check conducted for ${project.name} (${project.sector}). Operations proceed per approved schedule window.`,
      materials: "Routine daily materials logged",
      hasPhoto: false,
    },
  ];
}

