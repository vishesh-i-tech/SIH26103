import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, ChevronRight, ShieldAlert, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useProjects } from "../context/ProjectContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import Panel from "../components/Panel";

export function BillingAlerts() {
  const navigate = useNavigate();
  const { projects: contextProjects } = useProjects();
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFlaggedBills = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const fallback = contextProjects.flatMap((project) =>
        (project.billing || [])
          .filter((b) => b.status === "flagged")
          .map((b) => ({
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
              days_flagged: project.daysFlagged,
            },
          }))
      );
      setFlaggedItems(fallback);
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
        .eq("status", "flagged")
        .order("created_at", { ascending: false });

      console.log("[BillingAlerts.jsx / Supabase Query: billing_entries]", { data, error: qErr });
      if (qErr) throw qErr;

      setFlaggedItems(data || []);
    } catch (err) {
      console.warn("Billing Alerts Supabase query error:", err);
      setError(err.message);
      // Fallback to local
      const fallback = contextProjects.flatMap((project) =>
        (project.billing || [])
          .filter((b) => b.status === "flagged")
          .map((b) => ({
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
              days_flagged: project.daysFlagged,
            },
          }))
      );
      setFlaggedItems(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedBills();
  }, []);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
          Billing Anomaly Detection Alerts
        </div>
        <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
          {loading
            ? "Checking billing verification entries via Supabase..."
            : `${flaggedItems.length} running account (RA) bills flagged for material quantity or cost outpacing verified ground records.`}
        </div>
      </div>

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
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} />
            <span>Database query notice: {error} (Displaying cached alerts)</span>
          </div>
          <button
            onClick={fetchFlaggedBills}
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

      <Panel>
        {loading ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: tokens.slate }}>
            <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.steel, marginBottom: 4 }}>
              Loading Flagged Invoices...
            </div>
            <div style={{ fontSize: 12 }}>Executing billing_entries query joined with project metadata</div>
          </div>
        ) : flaggedItems.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: tokens.slate, fontSize: 13 }}>
            No flagged billing anomalies found. All running account bills match verified progress.
          </div>
        ) : (
          flaggedItems.map((item, idx) => {
            const claimed = Number(item.claimed_amount ?? item.claimed ?? 0);
            const expected = Number(item.expected_amount ?? item.expected ?? 0);
            const variance = expected > 0 ? (((claimed - expected) / expected) * 100).toFixed(1) : "0.0";
            const prj = item.project || {};

            return (
              <div
                key={`${prj.id || idx}-${item.id || item.bill_code}`}
                onClick={() => prj.id && navigate(`/projects/${prj.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderBottom: idx < flaggedItems.length - 1 ? `1px solid ${tokens.line}` : "none",
                  cursor: "pointer",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Alert Icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.radiusSm,
                    background: tokens.badBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: `1px solid ${tokens.bad}33`,
                  }}
                >
                  <AlertTriangle size={16} color={tokens.bad} />
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
                    <span>Pending approval gate: <b>{prj.days_flagged ?? prj.daysFlagged ?? 0} days</b></span>
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
                    color: tokens.bad,
                    width: 75,
                    textAlign: "right",
                  }}
                >
                  +{variance}%
                </div>

                {/* Action */}
                <div style={{ display: "flex", alignItems: "center", color: tokens.slate }}>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}

export default BillingAlerts;
