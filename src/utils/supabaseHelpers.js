import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { mockProjects } from "../data/mockProjects";

/**
 * Format a database project row into UI-friendly object with both camelCase and snake_case
 */
export function normalizeProject(p) {
  if (!p) return null;

  // Format dates for UI display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(d);
    } catch {
      return dateStr;
    }
  };

  const trend = (p.risk_trend || p.trend || []).map((t) => ({
    m: t.month_label || t.m,
    v: Number(t.risk_value ?? t.v ?? 0),
    recorded_at: t.recorded_at,
  }));

  const factors = (p.risk_factors || p.factors || []).map((f) => ({
    f: f.factor_text || f.f,
    w: Number(f.weight ?? f.w ?? 0),
  }));

  const billing = (p.billing_entries || p.billing || []).map((b) => ({
    id: b.bill_code || b.id,
    claimed: Number(b.claimed_amount ?? b.claimed ?? 0),
    expected: Number(b.expected_amount ?? b.expected ?? 0),
    status: b.status,
  }));

  const daily = (p.daily_entries || p.dailyEntries || []).map((d) => ({
    id: d.id,
    date: d.entry_date
      ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d.entry_date))
      : (d.date || "Recent"),
    status: d.work_status || d.status || "Running",
    reason: d.delay_reason || d.reason || "",
    materials: d.material_notes || d.materials || "None logged",
    notes: d.notes || "",
    hasPhoto: Boolean(d.photo_url || d.hasPhoto),
    photoName: d.photo_url || d.photoName,
    reviewStatus: d.reviewed_status || d.reviewStatus || "Pending Review",
    submittedBy: d.profiles?.full_name || d.submittedBy || "Site Engineer",
  }));

  return {
    ...p,
    id: p.id,
    code: p.code || p.id,
    name: p.name,
    sector: p.sector,
    location: p.location,
    contractor: p.contractor,
    costOriginal: Number(p.cost_original ?? p.costOriginal ?? 0),
    costRevised: Number(p.cost_revised ?? p.costRevised ?? p.cost_original ?? p.costOriginal ?? 0),
    start: p.start_date ? formatDate(p.start_date) : (p.start || "Oct 2024"),
    end: p.target_date ? formatDate(p.target_date) : (p.end || "Oct 2027"),
    duration: p.duration_months ? `${p.duration_months} months` : (p.duration || "36 months"),
    planned: Number(p.planned_progress ?? p.planned ?? 0),
    actual: Number(p.actual_progress ?? p.actual ?? 0),
    risk: Number(p.risk_score ?? p.risk ?? 25),
    reason: p.reason || "Under routine site execution",
    recommendation: p.recommendation || "Maintain standard telemetry & verification logging.",
    daysFlagged: Number(p.days_flagged ?? p.daysFlagged ?? 0),
    trend: trend.length > 0 ? trend : [],
    factors: factors.length > 0 ? factors : [],
    billing: billing.length > 0 ? billing : [],
    dailyEntries: daily.length > 0 ? daily : [],
  };
}

/**
 * Get stored projects from localStorage or default mock projects
 */
export function getStoredProjects() {
  try {
    const saved = localStorage.getItem("paimana_projects");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeProject);
      }
    }
  } catch (e) {
    console.warn("Could not read local projects from storage:", e);
  }
  return mockProjects.map(normalizeProject);
}

/**
 * Save projects into localStorage
 */
export function saveStoredProjects(projects) {
  try {
    localStorage.setItem("paimana_projects", JSON.stringify(projects));
  } catch (e) {
    console.warn("Could not save projects to storage:", e);
  }
}

/**
 * Fetch all projects from Supabase with fallback to local persistent storage
 */
export async function fetchProjectsFromSupabase() {
  const localProjects = getStoredProjects();

  if (!isSupabaseConfigured()) {
    return { data: localProjects, error: null };
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        risk_trend(month_label, risk_value, recorded_at),
        risk_factors(factor_text, weight),
        billing_entries(bill_code, claimed_amount, expected_amount, status)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetchProjects error:", error);
      return { data: localProjects, error };
    }

    if (!data || data.length === 0) {
      return { data: localProjects, error: null };
    }

    const normalized = data.map(normalizeProject);
    saveStoredProjects(normalized);
    return { data: normalized, error: null };
  } catch (err) {
    console.error("fetchProjects exception:", err);
    return { data: localProjects, error: err };
  }
}
