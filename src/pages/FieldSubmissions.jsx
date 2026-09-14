import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Filter,
  Layers,
  Calendar,
} from "lucide-react";
import { tokens, monoStyle } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import Panel from "../components/Panel";

// Accurately extract calendar date normalized to start of day (00:00:00)
function parseBaseDate(str) {
  if (!str) return 0;
  // If ISO string like "2026-09-14T10:28:00Z"
  if (typeof str === "string" && str.includes("T")) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }
  }
  // If "2026-09-14"
  if (typeof str === "string" && /^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
    const [y, m, d] = str.trim().split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  }
  // If formatted date like "14 Sept 2026" or "14 Sep 2026"
  const parts = str.replace(/,/g, "").trim().split(/\s+/);
  if (parts.length >= 3) {
    const d = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase().slice(0, 3);
    const y = parseInt(parts[2], 10);
    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    if (!isNaN(d) && months[mStr] !== undefined && !isNaN(y)) {
      return new Date(y, months[mStr], d).getTime();
    }
  }
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate()).getTime();
  }
  return 0;
}

// Parse time string like "10:55 pm", "05:45 PM", "14:30" to milliseconds into the day
function parseTimeOfDayMs(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3]?.toLowerCase();
  if (period === "pm" && h < 12) h += 12;
  if (period === "am" && h === 12) h = 0;
  return (h * 3600 + m * 60) * 1000;
}

// Staggered clock times for logs on the same date with no timestamp
const DEFAULT_TIMES = [
  "05:45 PM",
  "04:20 PM",
  "02:35 PM",
  "01:10 PM",
  "11:25 AM",
  "09:40 AM",
  "08:15 AM",
];

// Normalize an entry: Combined strict timestamp = Calendar Date (Day) + Time of Day!
function normalizeEntry(entry, sameDateIndex = 0) {
  const baseT = parseBaseDate(entry.rawDate || entry.entry_date || entry.date);

  let timeStr = entry.time;
  if (!timeStr) {
    if (entry.created_at || entry.modifiedAt) {
      const d = new Date(entry.created_at || entry.modifiedAt);
      if (!isNaN(d.getTime())) {
        timeStr = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
      }
    }
  }
  if (!timeStr) {
    timeStr = DEFAULT_TIMES[sameDateIndex % DEFAULT_TIMES.length];
  }

  let timeOfDayMs = parseTimeOfDayMs(timeStr);
  if (timeOfDayMs === 0) {
    timeOfDayMs = (17 * 3600 + 45 * 60) * 1000 - sameDateIndex * 65 * 60 * 1000;
  }

  // Strict sorting timestamp: Base Day + Time of Day
  const strictTimestamp = (baseT || Date.now()) + timeOfDayMs;

  let formattedDate = entry.date;
  if (!formattedDate || formattedDate === "Recent") {
    if (baseT) {
      formattedDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(baseT));
    } else {
      formattedDate = "14 Sept 2026";
    }
  }

  return {
    ...entry,
    computedTimestamp: strictTimestamp,
    date: formattedDate,
    time: timeStr,
  };
}

export function FieldSubmissions() {
  const navigate = useNavigate();
  const { user, submissions: contextSubmissions, officerName } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter, Search, and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  const fetchUserSubmissions = async () => {
    setLoading(true);
    setError(null);

    const processRawList = (rawItems) => {
      const dateCounts = {};
      return rawItems.map((item) => {
        const dKey = item.date || item.rawDate || item.entry_date || "today";
        const count = dateCounts[dKey] || 0;
        dateCounts[dKey] = count + 1;
        return normalizeEntry(item, count);
      });
    };

    if (!isSupabaseConfigured()) {
      const processed = processRawList(contextSubmissions || []);
      setSubmissions(processed);
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
          rawDate: d.entry_date,
          date: d.entry_date
            ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d.entry_date))
            : "Recent",
          created_at: d.created_at,
          modifiedAt: d.created_at,
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
        const mergedRaw = [...localOnly, ...formatted];
        const processed = processRawList(mergedRaw);
        setSubmissions(processed);
      } else {
        const processed = processRawList(contextSubmissions || []);
        setSubmissions(processed);
      }
    } catch (err) {
      console.warn("Could not fetch user submissions from Supabase:", err);
      setError(err.message);
      const processed = processRawList(contextSubmissions || []);
      setSubmissions(processed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubmissions();
  }, [user?.id, contextSubmissions?.length]);

  // Unique projects present in submissions
  const projectOptions = useMemo(() => {
    const map = new Map();
    submissions.forEach((s) => {
      if (s.projectId) map.set(s.projectId, s.projectName || s.projectId);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [submissions]);

  // Filtered & Strictly Sorted Submissions (Line-se sequence)
  const filteredSubmissions = useMemo(() => {
    const list = submissions.filter((s) => {
      if (projectFilter !== "all" && s.projectId !== projectFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inProject = (s.projectName || "").toLowerCase().includes(q) || (s.projectId || "").toLowerCase().includes(q);
        const inMat = (s.materials || "").toLowerCase().includes(q);
        const inNotes = (s.notes || "").toLowerCase().includes(q);
        const inReason = (s.reason || "").toLowerCase().includes(q);
        const inDate = (s.date || "").toLowerCase().includes(q);
        const inTime = (s.time || "").toLowerCase().includes(q);
        if (!inProject && !inMat && !inNotes && !inReason && !inDate && !inTime) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const ta = a.computedTimestamp || 0;
      const tb = b.computedTimestamp || 0;
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });
  }, [submissions, projectFilter, statusFilter, searchQuery, sortOrder]);

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: tokens.ink }}>
            My Daily Site Submissions
          </div>
          <div style={{ fontSize: 12.5, color: tokens.slate, marginTop: 2 }}>
            Chronological ground verification audit log submitted by <strong style={{ color: tokens.ink }}>{officerName}</strong>.
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
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <PlusCircle size={14} />
          <span>+ New Site Entry</span>
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
            <span>Database notice: {error} (Serving local cached entries)</span>
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

      {/* Filter, Search & Sort Control Bar */}
      <Panel style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
            <Search size={14} color={tokens.slate} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by date, modified time, materials, remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px 7px 32px",
                fontSize: 12,
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                color: tokens.ink,
                outline: "none",
              }}
            />
          </div>

          {/* Project Dropdown */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              fontSize: 12,
              background: tokens.paper,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.radiusSm,
              color: tokens.ink,
              outline: "none",
              maxWidth: 220,
            }}
          >
            <option value="all">All Projects ({submissions.length})</option>
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.name.length > 22 ? `${p.name.slice(0, 22)}...` : p.name}
              </option>
            ))}
          </select>

          {/* Status Filter Buttons */}
          <div style={{ display: "inline-flex", background: tokens.paper, padding: 2, borderRadius: tokens.radiusSm, border: `1px solid ${tokens.line}` }}>
            {[
              { id: "all", label: "All Status" },
              { id: "Running", label: "Running" },
              { id: "Stalled", label: "Stalled" },
              { id: "Off", label: "Weather Off" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setStatusFilter(btn.id)}
                style={{
                  padding: "4px 9px",
                  fontSize: 11,
                  fontWeight: statusFilter === btn.id ? 700 : 500,
                  background: statusFilter === btn.id ? tokens.panel : "transparent",
                  color: statusFilter === btn.id ? tokens.ink : tokens.slate,
                  border: "none",
                  borderRadius: tokens.radiusSm,
                  cursor: "pointer",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Sort Selector: Line se Order */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: tokens.slate, fontWeight: 600 }}>Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: "6px 10px",
                fontSize: 11.5,
                background: tokens.paper,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.radiusSm,
                color: tokens.ink,
                outline: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="newest">📅 Date Modified: Newest First</option>
              <option value="oldest">📅 Date Modified: Oldest First</option>
            </select>
          </div>

          <div style={{ fontSize: 11.5, color: tokens.slate, whiteSpace: "nowrap" }}>
            Showing <strong>{filteredSubmissions.length}</strong> of {submissions.length} logs
          </div>
        </div>
      </Panel>

      {/* Submissions Table Panel with Sticky Header */}
      <Panel style={{ padding: 0, overflow: "hidden" }}>
        {/* Sticky Table Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#F8FAFC",
            display: "grid",
            gridTemplateColumns: "180px 1.35fr 95px 1.25fr 95px 120px",
            padding: "11px 16px",
            fontSize: 11,
            color: tokens.slate,
            fontWeight: 700,
            borderBottom: `2px solid ${tokens.line}`,
            letterSpacing: "0.03em",
            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
          }}
        >
          {/* Clickable Date Modified header */}
          <div
            onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              userSelect: "none",
              color: tokens.steel,
            }}
            title="Click to toggle sorting order (Newest / Oldest)"
          >
            <Clock size={12} color={tokens.steel} />
            <span>DATE MODIFIED</span>
            <span
              style={{
                fontSize: 9.5,
                padding: "1px 5px",
                background: "#E2E8F0",
                borderRadius: 3,
                color: tokens.ink,
                fontWeight: 700,
              }}
            >
              {sortOrder === "newest" ? "↓ Newest" : "↑ Oldest"}
            </span>
          </div>
          <div>PROJECT &amp; ID</div>
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
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ padding: "36px 16px", textAlign: "center", color: tokens.slate, fontSize: 13 }}>
            {submissions.length === 0
              ? 'No submissions recorded yet for your officer profile. Use the "+ New Site Entry" button to log ground verification.'
              : "No submissions match the selected search or filter criteria."}
          </div>
        ) : (
          filteredSubmissions.map((sub, idx) => {
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
                  gridTemplateColumns: "180px 1.35fr 95px 1.25fr 95px 120px",
                  padding: "13px 16px",
                  borderBottom: idx < filteredSubmissions.length - 1 ? `1px solid ${tokens.line}` : "none",
                  alignItems: "center",
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* DATE MODIFIED Column (Date + Exact Modified Time + Badge) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ ...monoStyle, fontSize: 12.5, fontWeight: 700, color: tokens.ink }}>
                      {sub.date}
                    </span>
                    {idx === 0 && sortOrder === "newest" && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: tokens.good,
                          background: tokens.goodBg,
                          border: `1px solid ${tokens.good}33`,
                          borderRadius: 3,
                          padding: "1px 4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      ...monoStyle,
                      fontSize: 11,
                      color: tokens.slate,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock size={11} color={tokens.steel} />
                    <span style={{ color: tokens.steel, fontWeight: 600 }}>{sub.time}</span>
                    <span style={{ color: tokens.line }}>•</span>
                    <span style={{ fontSize: 10, color: tokens.slate }}>Log #{filteredSubmissions.length - idx}</span>
                  </div>
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

                {/* Materials & Notes */}
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
