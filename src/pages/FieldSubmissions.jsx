import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Camera,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import Panel from "../components/Panel";

export function FieldSubmissions() {
  const navigate = useNavigate();
  const { user, submissions: contextSubmissions, officerName } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserSubmissions = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setSubmissions(contextSubmissions || []);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("daily_entries")
        .select(`
          id,
          entry_date,
          work_status,
          delay_reason,
          material_notes,
          photo_url,
          notes,
          reviewed_status,
          created_at,
          project:projects(id, code, name)
        `)
        .order("entry_date", { ascending: false });

      if (user?.id) {
        query = query.eq("submitted_by", user.id);
      }

      const { data, error: qErr } = await query;

      if (qErr) throw qErr;

      if (data && data.length > 0) {
        const formatted = data.map((d) => ({
          id: d.id,
          date: d.entry_date
            ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d.entry_date))
            : "Recent",
          projectName: d.project?.name || "Infrastructure Site",
          projectId: d.project?.code || d.project?.id || "Site Log",
          status: d.work_status,
          reason: d.delay_reason,
          materials: d.material_notes || "None logged",
          notes: d.notes,
          hasPhoto: Boolean(d.photo_url),
          photoName: d.photo_url,
          reviewStatus: d.reviewed_status,
        }));

        const existingIds = new Set(data.map((d) => d.id));
        const localOnly = (contextSubmissions || []).filter((s) => !existingIds.has(s.id));
        setSubmissions([...localOnly, ...formatted]);
      } else {
        // If query returned no remote entries, show context submissions
        setSubmissions(contextSubmissions || []);
      }
    } catch (err) {
      console.warn("Could not fetch user submissions from Supabase:", err);
      setError(err.message);
      setSubmissions(contextSubmissions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubmissions();
  }, [user?.id]);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            My Daily Site Submissions
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            Historical ground verification log submitted by <strong style={{ color: tokens.ink }}>{officerName}</strong> via Supabase.
          </div>
        </div>

        <button
          onClick={() => navigate("/field-dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: tokens.steel,
            color: "#FFFFFF",
            border: "none",
            borderRadius: tokens.radiusSm,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <PlusCircle size={14} />
          <span>New Site Entry</span>
        </button>
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} />
            <span>Database notice: {error}</span>
          </div>
          <button
            onClick={fetchUserSubmissions}
            style={{
              background: "none",
              border: "none",
              color: tokens.bad,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Submissions Table Panel */}
      <Panel>
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "110px 1.4fr 100px 1.2fr 100px 120px",
            padding: "10px 16px",
            fontSize: 11,
            color: tokens.slate,
            fontWeight: 600,
            borderBottom: `1px solid ${tokens.line}`,
            letterSpacing: "0.03em",
          }}
        >
          <div>DATE</div>
          <div>PROJECT & ID</div>
          <div>STATUS</div>
          <div>MATERIALS LOGGED</div>
          <div>EVIDENCE</div>
          <div>MOSPI AUDIT</div>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: "36px 16px", textAlign: "center", color: tokens.slate }}>
            <div style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: tokens.steel, marginBottom: 4 }}>
              Loading Submissions...
            </div>
            <div style={{ fontSize: 12 }}>Retrieving ground records from daily_entries</div>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ padding: "36px 16px", textAlign: "center", color: tokens.slate, fontSize: 13 }}>
            No submissions recorded yet for your officer profile. Use the "New Site Entry" button to log ground verification.
          </div>
        ) : (
          submissions.map((sub, idx) => {
            const isReviewed = sub.reviewStatus === "Reviewed";
            const statusTone =
              sub.status === "Running"
                ? tokens.good
                : sub.status === "Stalled"
                ? tokens.bad
                : tokens.warn;
            const statusBg =
              sub.status === "Running"
                ? tokens.goodBg
                : sub.status === "Stalled"
                ? tokens.badBg
                : tokens.warnBg;

            return (
              <div
                key={sub.id || idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1.4fr 100px 1.2fr 100px 120px",
                  padding: "13px 16px",
                  borderBottom: idx < submissions.length - 1 ? `1px solid ${tokens.line}` : "none",
                  alignItems: "center",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Date */}
                <div style={{ ...monoStyle, fontSize: 12, fontWeight: 600, color: tokens.ink }}>
                  {sub.date}
                </div>

                {/* Project */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tokens.ink }}>
                    {sub.projectName}
                  </div>
                  <div style={{ ...monoStyle, fontSize: 11, color: tokens.slate, marginTop: 1 }}>
                    {sub.projectId}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span
                    style={{
                      fontSize: 11.5,
                      ...monoStyle,
                      padding: "2px 8px",
                      borderRadius: tokens.radiusSm,
                      fontWeight: 600,
                      background: statusBg,
                      color: statusTone,
                      border: `1px solid ${statusTone}33`,
                      display: "inline-block",
                    }}
                  >
                    {sub.status}
                  </span>
                  {sub.reason && (
                    <div style={{ fontSize: 10.5, color: tokens.bad, marginTop: 3 }}>
                      {sub.reason}
                    </div>
                  )}
                </div>

                {/* Materials */}
                <div style={{ fontSize: 12, color: tokens.ink }}>
                  <div>{sub.materials}</div>
                  {sub.notes && (
                    <div
                      style={{
                        fontSize: 11,
                        color: tokens.slate,
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 240,
                      }}
                      title={sub.notes}
                    >
                      {sub.notes}
                    </div>
                  )}
                </div>

                {/* Photo Evidence */}
                <div>
                  {sub.hasPhoto ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11.5,
                        color: tokens.steel,
                        background: tokens.paper,
                        padding: "2px 6px",
                        borderRadius: tokens.radiusSm,
                        border: `1px solid ${tokens.line}`,
                      }}
                      title={sub.photoName || "Geo-tagged photo"}
                    >
                      <Camera size={12} />
                      <span>Geo Photo</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: tokens.slate }}>None</span>
                  )}
                </div>

                {/* MoSPI Review Status */}
                <div>
                  {isReviewed ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: tokens.good,
                        background: tokens.goodBg,
                        padding: "2px 8px",
                        borderRadius: tokens.radiusSm,
                        border: `1px solid ${tokens.good}33`,
                      }}
                      title={sub.reviewNote || "Reviewed by IPMD"}
                    >
                      <CheckCircle2 size={12} />
                      <span>Reviewed</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: tokens.warn,
                        background: tokens.warnBg,
                        padding: "2px 8px",
                        borderRadius: tokens.radiusSm,
                        border: `1px solid ${tokens.warn}33`,
                      }}
                    >
                      <Clock size={12} />
                      <span>Pending Review</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}

export default FieldSubmissions;
