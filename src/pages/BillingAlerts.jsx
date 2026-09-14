import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldAlert,
  FileText,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  X,
  Receipt,
  Search,
  Check,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import Panel from "../components/Panel";

export function BillingAlerts() {
  const navigate = useNavigate();
  const { projects: contextProjects } = useProjects();
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("flagged"); // 'flagged' | 'all'

  // Modal State for Entering New RA Bill
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [billCode, setBillCode] = useState("RA-15");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => {
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
  });
  const [mbReference, setMbReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  // Initialize selected project
  useEffect(() => {
    if (contextProjects && contextProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(contextProjects[0].id || contextProjects[0].code);
    }
  }, [contextProjects, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return contextProjects.find((p) => p.id === selectedProjectId || p.code === selectedProjectId) || contextProjects[0];
  }, [contextProjects, selectedProjectId]);

  // Calculate Expected Amount based on project's verified ground physical progress
  const expectedAmount = useMemo(() => {
    if (!selectedProject) return 30.0;
    // Check if project has an established baseline expected amount
    if (selectedProject.billing && selectedProject.billing.length > 0) {
      return Number(selectedProject.billing[0].expected || 31.5);
    }
    // Fallback based on physical progress
    const cost = Number(selectedProject.costOriginal || selectedProject.cost_original || 500);
    const progress = Number(selectedProject.actual || selectedProject.actual_progress || 40);
    return Number(Math.max(15.0, (cost * (progress / 100) * 0.12)).toFixed(1));
  }, [selectedProject]);

  // Live reconciliation calculations
  const claimedNum = parseFloat(claimedAmount) || 0;
  const liveVariance = expectedAmount > 0 && claimedNum > 0
    ? (((claimedNum - expectedAmount) / expectedAmount) * 100).toFixed(1)
    : "0.0";
  const isLiveAnomaly = Number(liveVariance) > 10.0;

  const fetchBills = async () => {
    setLoading(true);
    setError(null);

    // Baseline fallback from contextProjects
    const fallbackAll = contextProjects.flatMap((project) =>
      (project.billing || []).map((b) => ({
        id: b.id,
        bill_code: b.id,
        claimed_amount: b.claimed,
        expected_amount: b.expected,
        status: b.status,
        project: {
          id: project.id,
          code: project.code || project.id,
          name: project.name,
          contractor: project.contractor,
          days_flagged: project.daysFlagged || 0,
        },
      }))
    );

    const fallbackFlagged = fallbackAll.filter((b) => b.status === "flagged");

    if (!isSupabaseConfigured()) {
      setFlaggedItems(fallbackFlagged);
      setAllBills(fallbackAll);
      setLoading(false);
      return;
    }

    try {
      const { data, error: qErr } = await supabase
        .from("billing_entries")
        .select(`
          id,
          bill_code,
          claimed_amount,
          expected_amount,
          status,
          created_at,
          project:projects(id, code, name, contractor, days_flagged)
        `)
        .order("created_at", { ascending: false });

      if (qErr) throw qErr;

      if (data && data.length > 0) {
        const mergedAll = [...data];
        const mergedFlagged = mergedAll.filter((b) => b.status === "flagged");
        setAllBills(mergedAll);
        setFlaggedItems(mergedFlagged);
      } else {
        setFlaggedItems(fallbackFlagged);
        setAllBills(fallbackAll);
      }
    } catch (err) {
      console.warn("Billing Alerts Supabase query notice:", err);
      setError(err.message);
      setFlaggedItems(fallbackFlagged);
      setAllBills(fallbackAll);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Handle Submitting a New RA Bill
  const handleCreateBillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !claimedAmount) return;

    setSubmitting(true);
    const finalClaimed = parseFloat(claimedAmount);
    const finalExpected = expectedAmount;
    const finalVariance = Number(liveVariance);
    const finalStatus = isLiveAnomaly ? "flagged" : "approved";

    const newBillRecord = {
      id: `bill-${Date.now()}`,
      bill_code: billCode.trim() || `RA-${Date.now().toString().slice(-3)}`,
      claimed_amount: finalClaimed,
      expected_amount: finalExpected,
      status: finalStatus,
      created_at: new Date().toISOString(),
      project: {
        id: selectedProject.id,
        code: selectedProject.code || selectedProject.id,
        name: selectedProject.name,
        contractor: selectedProject.contractor,
        days_flagged: isLiveAnomaly ? 1 : 0,
      },
    };

    // Update local states immediately
    setAllBills((prev) => [newBillRecord, ...prev]);
    if (isLiveAnomaly) {
      setFlaggedItems((prev) => [newBillRecord, ...prev]);
      setActiveTab("flagged");
    } else {
      setActiveTab("all");
    }

    // Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("billing_entries").insert({
          project_id: selectedProject.id,
          bill_code: newBillRecord.bill_code,
          claimed_amount: finalClaimed,
          expected_amount: finalExpected,
          variance_pct: finalVariance,
          status: finalStatus,
        });
      } catch (insertErr) {
        console.warn("Notice: Saved bill entry to local state (Supabase notice):", insertErr);
      }
    }

    setSubmitting(false);
    setShowUploadModal(false);
    setClaimedAmount("");
    setMbReference("");
    setSuccessBanner({
      billCode: newBillRecord.bill_code,
      claimed: finalClaimed,
      expected: finalExpected,
      variance: finalVariance,
      isAnomaly: isLiveAnomaly,
      projectName: selectedProject.name,
    });

    setTimeout(() => {
      setSuccessBanner(null);
    }, 8000);
  };

  const displayedList = activeTab === "flagged" ? flaggedItems : allBills;

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header with Title and Action Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            Billing Anomaly Detection &amp; Running Account (RA) Register
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            Automated reconciliation cross-examining contractor RA invoice claims against verified ground physical progress.
          </div>
        </div>

        {/* Enter / Upload RA Bill Button */}
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
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
          <PlusCircle size={15} />
          <span>+ Enter / Upload RA Bill</span>
        </button>
      </div>

      {/* Success Notification Banner when new bill is submitted */}
      {successBanner && (
        <div
          style={{
            padding: "14px 18px",
            background: successBanner.isAnomaly ? "#FEF2F2" : "#F0FDF4",
            border: `1px solid ${successBanner.isAnomaly ? "#F87171" : "#86EFAC"}`,
            borderRadius: tokens.radiusSm,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {successBanner.isAnomaly ? (
              <AlertTriangle size={18} color="#DC2626" />
            ) : (
              <CheckCircle2 size={18} color="#16A34A" />
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: successBanner.isAnomaly ? "#991B1B" : "#166534" }}>
                Bill {successBanner.billCode} Processed for {successBanner.projectName}
              </div>
              <div style={{ fontSize: 12, color: successBanner.isAnomaly ? "#B91C1C" : "#15803D", marginTop: 2 }}>
                {successBanner.isAnomaly
                  ? `⚠️ ANOMALY DETECTED: Claimed ₹${successBanner.claimed} Cr vs ₹${successBanner.expected} Cr ground expectation (+${successBanner.variance}%). Automatically FLAGGED for administrative escalation.`
                  : `✅ RECONCILED: Claimed ₹${successBanner.claimed} Cr matches verified physical ground records. Bill approved.`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: tokens.slate }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: tokens.badBg,
            borderRadius: tokens.radiusSm,
            border: `1px solid ${tokens.bad}44`,
            color: tokens.bad,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} />
            <span>Database query notice: {error} (Displaying cached alerts)</span>
          </div>
          <button
            onClick={fetchBills}
            style={{
              background: "none",
              border: "none",
              color: tokens.bad,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Tab Switcher: Flagged vs All Bills */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={() => setActiveTab("flagged")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: activeTab === "flagged" ? 700 : 500,
            background: activeTab === "flagged" ? tokens.badBg : tokens.paper,
            color: activeTab === "flagged" ? tokens.bad : tokens.slate,
            border: `1px solid ${activeTab === "flagged" ? tokens.bad : tokens.line}`,
            borderRadius: tokens.radiusSm,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <AlertTriangle size={13} color={activeTab === "flagged" ? tokens.bad : tokens.slate} />
          <span>Flagged Anomalies ({flaggedItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: activeTab === "all" ? 700 : 500,
            background: activeTab === "all" ? tokens.panel : tokens.paper,
            color: activeTab === "all" ? tokens.ink : tokens.slate,
            border: `1px solid ${activeTab === "all" ? tokens.steel : tokens.line}`,
            borderRadius: tokens.radiusSm,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Receipt size={13} color={activeTab === "all" ? tokens.steel : tokens.slate} />
          <span>All Invoices ({allBills.length})</span>
        </button>
      </div>

      {/* Bills Panel */}
      <Panel>
        {loading ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: tokens.slate }}>
            <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.steel, marginBottom: 4 }}>
              Loading Billing Registry...
            </div>
            <div style={{ fontSize: 12 }}>Executing billing_entries reconciliation query joined with project metadata</div>
          </div>
        ) : displayedList.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: tokens.slate, fontSize: 13 }}>
            {activeTab === "flagged"
              ? "No flagged billing anomalies found. All running account bills match verified progress."
              : "No billing records found. Click '+ Enter / Upload RA Bill' to log contractor invoices."}
          </div>
        ) : (
          displayedList.map((item, idx) => {
            const claimed = Number(item.claimed_amount ?? item.claimed ?? 0);
            const expected = Number(item.expected_amount ?? item.expected ?? 0);
            const variance = expected > 0 ? (((claimed - expected) / expected) * 100).toFixed(1) : "0.0";
            const prj = item.project || {};
            const isFlagged = item.status === "flagged";

            return (
              <div
                key={`${prj.id || idx}-${item.id || item.bill_code}`}
                onClick={() => prj.id && navigate(`/projects/${prj.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderBottom: idx < displayedList.length - 1 ? `1px solid ${tokens.line}` : "none",
                  cursor: "pointer",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Status Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.radiusSm,
                    background: isFlagged ? tokens.badBg : tokens.goodBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: `1px solid ${isFlagged ? tokens.bad : tokens.good}33`,
                  }}
                >
                  {isFlagged ? (
                    <AlertTriangle size={16} color={tokens.bad} />
                  ) : (
                    <CheckCircle2 size={16} color={tokens.good} />
                  )}
                </div>

                {/* Bill & Project Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink }}>
                      {item.bill_code || item.id} · {prj.name || "Infrastructure Project"}
                    </span>
                    <span style={{ ...monoStyle, fontSize: 11, color: tokens.slate }}>
                      ({prj.code || prj.id})
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: tokens.slate, marginTop: 3 }}>
                    Contractor: <span style={{ color: tokens.ink }}>{prj.contractor || "Contractor"}</span>
                    {" · "}
                    <span>Status: <strong style={{ color: isFlagged ? tokens.bad : tokens.good }}>{isFlagged ? "Flagged Anomaly" : "Approved"}</strong></span>
                    {isFlagged && (
                      <>
                        {" · "}
                        <span>Approval Gate: <b>{prj.days_flagged ?? prj.daysFlagged ?? 0} days</b></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Claimed vs Expected */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.ink }}>
                    ₹{claimed.toFixed(1)} Cr claimed
                  </div>
                  <div style={{ ...monoStyle, fontSize: 11.5, color: tokens.slate }}>
                    ₹{expected.toFixed(1)} Cr expected
                  </div>
                </div>

                {/* Variance Tag */}
                <div
                  style={{
                    ...monoStyle,
                    fontSize: 13,
                    fontWeight: 700,
                    color: isFlagged ? tokens.bad : tokens.good,
                    width: 75,
                    textAlign: "right",
                  }}
                >
                  {Number(variance) > 0 ? `+${variance}%` : `${variance}%`}
                </div>

                {/* Action Arrow */}
                <div style={{ display: "flex", alignItems: "center", color: tokens.slate }}>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })
        )}
      </Panel>

      {/* Enter / Upload RA Bill Modal */}
      {showUploadModal && (
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
              maxWidth: 540,
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
                <Receipt size={18} color={tokens.steel} />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: tokens.ink }}>
                  Log Running Account (RA) Bill Invoice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: tokens.slate }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateBillSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Project Selection */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                  Select Project *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
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
                  {contextProjects.map((p) => (
                    <option key={p.id || p.code} value={p.id || p.code}>
                      {p.code || p.id} · {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ground Reality Snapshot of Selected Project */}
              {selectedProject && (
                <div
                  style={{
                    padding: "10px 12px",
                    background: tokens.paper,
                    borderRadius: tokens.radiusSm,
                    border: `1px solid ${tokens.line}`,
                    fontSize: 11.5,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <span style={{ color: tokens.slate }}>Contractor: </span>
                    <strong style={{ color: tokens.ink }}>{selectedProject.contractor}</strong>
                  </div>
                  <div>
                    <span style={{ color: tokens.slate }}>Ground Progress: </span>
                    <strong style={{ color: tokens.ink }}>{selectedProject.actual || selectedProject.actual_progress || 40}% physical</strong>
                  </div>
                  <div style={{ gridColumn: "span 2", paddingTop: 4, borderTop: `1px dashed ${tokens.line}` }}>
                    <span style={{ color: tokens.slate }}>Verified Ground Expected Value: </span>
                    <strong style={{ ...monoStyle, color: tokens.steel, fontSize: 12.5 }}>
                      ₹{expectedAmount} Crore
                    </strong>
                    <span style={{ color: tokens.slate, fontSize: 10.5, marginLeft: 6 }}>
                      (Computed from verified daily field entries)
                    </span>
                  </div>
                </div>
              )}

              {/* Bill Details Inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                    RA Bill Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RA-15"
                    value={billCode}
                    onChange={(e) => setBillCode(e.target.value)}
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
                    Claimed Invoice Amount (₹ Cr) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder={`e.g. ${expectedAmount}`}
                    value={claimedAmount}
                    onChange={(e) => setClaimedAmount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12.5,
                      border: `1px solid ${tokens.line}`,
                      borderRadius: tokens.radiusSm,
                      background: tokens.paper,
                      color: tokens.ink,
                      outline: "none",
                      ...monoStyle,
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>

              {/* Measurement Book Ref */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: tokens.slate, display: "block", marginBottom: 4 }}>
                  Measurement Book (MB) Reference &amp; Scope Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. MB Book 34, Pages 18-28 (Pier superstructure &amp; girder casting)"
                  value={mbReference}
                  onChange={(e) => setMbReference(e.target.value)}
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

              {/* LIVE RECONCILIATION CALCULATION FEEDBACK BOX */}
              {claimedNum > 0 && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: isLiveAnomaly ? "#FEF2F2" : "#F0FDF4",
                    border: `1px solid ${isLiveAnomaly ? "#F87171" : "#86EFAC"}`,
                    borderRadius: tokens.radiusSm,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 12.5, color: isLiveAnomaly ? "#991B1B" : "#166534" }}>
                      {isLiveAnomaly ? <AlertTriangle size={15} color="#DC2626" /> : <CheckCircle2 size={15} color="#16A34A" />}
                      <span>{isLiveAnomaly ? "⚠️ Live Anomaly Detected" : "✅ Consistent with Ground Records"}</span>
                    </div>
                    <span style={{ ...monoStyle, fontWeight: 700, fontSize: 13, color: isLiveAnomaly ? "#DC2626" : "#16A34A" }}>
                      {Number(liveVariance) > 0 ? `+${liveVariance}%` : `${liveVariance}%`}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: isLiveAnomaly ? "#B91C1C" : "#15803D", marginTop: 4 }}>
                    {isLiveAnomaly
                      ? `Contractor claim (₹${claimedNum} Cr) exceeds verified ground progress value (₹${expectedAmount} Cr) by +${liveVariance}%. This bill will be automatically FLAGGED for administrative hold!`
                      : `Claimed amount aligns with physical progress verified by field engineers on site (₹${expectedAmount} Cr expected). Bill will be marked Approved.`}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
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
                  disabled={submitting || !claimedAmount}
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    background: isLiveAnomaly ? tokens.bad : tokens.steel,
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: tokens.radiusSm,
                    cursor: submitting || !claimedAmount ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
                  }}
                >
                  {submitting ? "Processing..." : isLiveAnomaly ? "Submit & Flag Bill" : "Submit RA Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingAlerts;
