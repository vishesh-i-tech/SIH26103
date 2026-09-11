# SIH26103 — MoSPI PAIMANA Project Monitoring Platform
### Final Consolidated Solution Document

---

## 1. Problem Statement — Core Ask

MoSPI's Infrastructure & Project Monitoring Division (IPMD) monitors Central Sector Infrastructure Projects (₹150 Cr+) via the PAIMANA portal (evolved from OCMS since 2006). Historical data exists (cost, expenditure, progress, milestones, delays) but is used mainly for **reporting/charts**, not for **predictive risk analysis**.

**Goal:** Move from reactive monitoring ("what already happened?") to proactive monitoring ("what is likely to happen next, and which project needs attention now?").

---

## 2. Real Problems Identified (from ground research + PS)

1. Project's actual progress not accurately/timely known
2. Delay is discovered only after it has already happened
3. Cost overruns
4. Time overruns
5. Comparing different projects is difficult (no benchmarking)
6. Root cause of a problem is hard to identify
7. Large historical data is underutilized
8. Officers must decide priority among thousands of projects
9. Billing/commission-driven corruption — inflated bills and quantities via Contractor → Petty Contractor → Engineer commission chains

---

## 3. Solution — Point-by-Point

### 3.1 Actual Progress Tracking
- Daily Record module — full project lifecycle log, date-filterable
- Project base profile: size, location, cost, duration, contractor
- Geo-tagged photo + material photo uploads by Site Engineer
- Material bills uploaded and verified by inspection team
- Second module: Documentation page (officer-submitted docs, MoSPI-only access)
- Role-based reminders (Site/Sub/Material/QA-QC Engineers) with visit-tracking
- Missed visits trigger automatic signal to MoSPI team

### 3.2 Delay Detection (Reactive → Proactive)
- Every "paused/off" status requires a mandatory reason from daily record
- System flow: Problem starts → Abnormal pattern detected → Early Warning → Officer investigates → Intervention
- Delay factors captured directly at source (labour, material, tools, land/legal issues)

### 3.3 Cost Overrun Control
- AI computes an expected cost/material estimate from daily record data (work done vs material used)
- Actual billing entries compared against this estimate — mismatches auto-flagged
- MoSPI team approval gate required for flagged bills with mandatory reason

### 3.4 Time Overrun Control
- Progress trend analyzed against deadline trajectory
- Automatic warning to officer/manager when current pace won't meet deadline

### 3.5 Benchmarking Across Projects
- Multi-site dashboard for managers
- Comparison page: progress/cost/duration/contractor across similar-profile projects
- Example insight: "Project A is 70% complete; similar projects average 82% at this stage"
- View-only (no edit) — pure statistics display

### 3.6 Root-Cause Identification
- Predefined reason taxonomy: land acquisition, funding, contractor performance, material availability, weather, litigation, design/scope change, etc.
- Reason auto-routed to the responsible role (e.g., material issue → Material Engineer)
- Non-response triggers escalation with full timestamped record

### 3.7 Historical Data Utilization (Core ML Engine)
- Historical project data (planned vs actual progress, expenditure, milestones) used as ML training data
- Model learns patterns correlated with past cost/time overruns
- Ongoing project's current data compared against learned patterns
- Output: Risk probability (cost overrun %, time overrun %) + composite Risk Score (0–100)
- Monthly risk-trend graph acts as a visual early-warning signal
- Key pattern example: expenditure progressing faster than physical work = high-risk indicator

### 3.8 Corruption / Billing Mismatch Risk
- Full contractor hierarchy mapped: Client → Main Contractor → Petty Contractor → Labour
- Corruption vector: commissions to Site/Material/Billing/QA-QC Engineers inflate bills & quantities
- Solution: cross-check daily ground data (material used, work done, photos) against submitted bills
- AI-estimated expected cost vs actual bill mismatch = anomaly flag → mandatory reason → MoSPI approval

### 3.9 Data Accessibility & Officer Priority
- LLM Assistant: officers/admins query in natural language ("why is Project X delayed?") and get a synthesized answer from reasons + risk data
- **Priority Queue**: auto-ranked worklist of projects needing urgent attention (by risk score, days-pending)

---

## 4. Gaps Closed (Round 2 Refinement)

| Gap | Resolution |
|---|---|
| **Officer Priority Queue** | Dedicated ranked worklist — top N high-risk projects with reason + days-pending, sorted automatically |
| **Actual dataset question** | Historical/ML part uses a **synthetic PAIMANA-style dataset** (planned vs actual progress, expenditure, milestones) for training. Daily Record part is framed as a **new future data-collection layer** (doesn't exist in MoSPI today) — kept clearly separate to avoid confusion |
| **Photo-based AI verification** | Simplified — full computer-vision stage/quantity detection dropped as unrealistic for hackathon scope. AI role limited to flagging **quantity/cost mismatches** via calculation, not image-based quantity extraction |
| **Actionable recommendations** | Every risk alert now includes a **suggested next action** (e.g., "Land clearance is top risk driver → escalate to concerned department"), generated from explainability output |
| **PAIMANA/OCMS integration story** | One architecture slide: system sits as an **AI layer on top of PAIMANA**, consuming existing data via API, with Daily Record as an add-on module |
| **Success/evaluation metric** | Demo includes a **before/after comparison**: traditional delay-detection lag vs system's early-warning lead time, plus a model accuracy/precision figure on historical test data |

---

## 5. Final Consolidated Feature List

1. Daily Record Module (progress, photos, material, billing, role-based flow, reminders)
2. ML Risk Engine (cost/time overrun probability, composite risk score, risk trend graph)
3. Root-Cause + Explainability (top contributing factors, reason taxonomy)
4. Actionable Recommendations (per alert)
5. Officer Priority Queue (auto-ranked worklist)
6. Benchmarking Dashboard (cross-project comparison, view-only)
7. Billing Mismatch Detection (expected vs actual, approval gate)
8. LLM Assistant (natural-language querying)
9. PAIMANA/OCMS Integration Layer (conceptual architecture)
10. Impact/Evaluation Metric (early-warning lead time + prediction accuracy)

---

## 6. Final UI Structure

### Roles
1. **MoSPI Admin/Team** — full access, approvals, oversight
2. **Field Officers** (Site Engineer, Sub Engineer, Billing Engineer, QA/QC, Material Engineer) — daily submissions
3. **Project Manager/GM** (optional) — assigned-project view

### Pages & Flow

**Login / Role Selection**
- Role-based redirect to appropriate dashboard

**MoSPI Admin — Main Dashboard**
- Summary cards: Total Projects, High-Risk Count, Delayed Projects, Budget vs Spent
- Priority Worklist widget (top 5–10 urgent projects)
- Portfolio-wide risk trend mini-graph
- Filters: sector, state, status
- Sidebar: Dashboard | Projects | Priority Queue | Benchmarking | Billing Alerts | Documents | LLM Assistant | Settings

**Projects List Page**
- Table/card view: name, sector, location, contractor, % progress, risk score (color-coded), status
- Search + filters → opens Project Detail Page

**Project Detail Page** (tabbed)
- *Overview*: basic info, planned vs actual progress bar
- *Daily Record*: date-filterable log, photos, material, work status, visit log
- *Risk & Prediction*: risk gauge, trend graph, top factors (explainability chart), recommendation box
- *Billing*: submitted vs estimated bills, flagged mismatches, approve/reject/ask-reason actions
- *Documents*: officer-uploaded files
- *Comparison/Benchmark*: overlay vs similar projects

**Priority Queue Page**
- Ranked list: rank, project, risk score, primary reason, days-since-flagged, action button

**Benchmarking Page**
- Filter by sector/size/region, side-by-side comparison charts, view-only

**Billing Alerts Page**
- All flagged mismatch cases across projects, status (Pending/Approved/Rejected), reason history

**LLM Assistant Page** (or floating chat widget)
- Natural-language Q&A tied to project data

**Field Officer Side** (simplified view)
- My Assigned Projects
- Today's Task (reminders)
- Daily Entry Upload form (photo + geo-tag, material quantity, status, notes)
- My Documents

**Reports/Export Page** (optional, if time permits)
- Generate portfolio/project summary report

### End-to-End Flow
```
Field Officer → Daily Entry Upload (photo + material + status)
        ↓
System stores + AI checks (estimate vs actual)
        ↓
ML Risk Engine recalculates project risk score
        ↓
High risk → Priority Queue + Alert to MoSPI Admin
        ↓
Admin reviews (Project Detail → Risk/Billing tab) → Approves/Escalates
        ↓
Recommendation shown → Action taken → Status updates
```

---

## 7. Status
Finalized for the **college/internal round** (idea + presentation stage). Full scope intentionally kept broad to demonstrate depth of thinking; can be trimmed to an MVP (3–4 core functional screens) if a working prototype demo becomes mandatory later.
