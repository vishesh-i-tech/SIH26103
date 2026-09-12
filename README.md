# PAIMANA AI — Infrastructure Project Risk Monitoring Platform
### Smart India Hackathon (SIH26103) · MoSPI (Ministry of Statistics and Programme Implementation)

An engineering-grade government infrastructure project monitoring dashboard and predictive risk platform built for the **Infrastructure & Project Monitoring Division (IPMD)** of MoSPI. 

Powered by **React + Vite** on the frontend and **Supabase (PostgreSQL + Supabase Auth + Row-Level Security)** on the backend.

---

## Key Features

- **Real Supabase Authentication & Role-Based Access (`/login`, `/register`)**:
  - Secure email/password authentication using Supabase Auth.
  - Role-based routing and protection for **MoSPI Admin** (Central IPMD Oversight) and **Field Officer** (Site Engineer).
  - Session persistence via `getSession()` and reactive state sync with `onAuthStateChange()`.
- **Portfolio Risk Overview (`/dashboard`)**: Macro telemetry cards, portfolio-wide risk trajectory graph, and urgent priority worklist calculated dynamically from Postgres database rows.
- **Project Directory & Sanctioning (`/projects`, `/projects/new`)**: Searchable (`.ilike()`), sector-filtered (`.eq()`) directory across Roads, Bridges, Railways, and Power with real database insertion for new project sanctions.
- **Project Intelligence File (`/projects/:id`)**: Tabbed analytics covering Scope Overview, **Live Daily Ground Record Timeline** (populated by site engineers), ML Risk & Prediction with plain-language explainability, Billing Anomaly Verification with disbursement gap audit, and Cross-Sector Benchmarking.
- **Officer Priority Queue (`/priority-queue`)**: Algorithmic ranking of high-risk assets sorted by composite risk index (`risk_score DESC`) and pending anomaly days.
- **Field Officer Operations Module (`/field-dashboard`, `/field-tasks`, `/field-entry/:projectId`, `/field-submissions`)**: Dedicated workflow for Site Engineers to submit ground verification logs, record materials consumption, report impediment causes, and upload site photos. Submissions reflect in real-time on the Admin's Project Intelligence file.
- **Billing Anomaly Detection (`/billing-alerts`)**: Flags running account (RA) contractor claims where claimed expenditure outpacing verified physical milestones.
- **Cross-Sector Benchmarking (`/benchmarking`)**: Sector-level aggregation and peer standing comparisons across central sector portfolios.
- **AI Decision Assistant (`/assistant`)**: NLP decision-support assistant querying live project telemetry, schedule variance, cost drifts, and contractor billing anomalies.

---

## Tech Stack & Architecture

- **Frontend**: React 18, Vite, React Router DOM v6
- **Backend & Database**: Supabase (Managed PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password with JWT sessions)
- **Security**: PostgreSQL Row Level Security (RLS) with role-based policies (`is_admin()` security definer)
- **Data Visualizations**: Recharts (dynamic trend lines, radial risk gauges, factor distribution)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design Tokens (engineering government aesthetic with hairline borders, paper background, and monospace numerical typography)

---

## Database Architecture

The backend consists of 6 core relational tables in PostgreSQL:

| Table | Description |
|---|---|
| `profiles` | Extends `auth.users` with `full_name`, `role` (`admin` or `field_officer`), and metadata |
| `projects` | Central Sector project registry (sanctioned & revised cost, schedule, progress, risk score) |
| `risk_trend` | 6-month historical monthly risk trajectory data points per project |
| `risk_factors` | Quantified SHAP risk driver weights contributing to composite risk |
| `daily_entries` | Ground telemetry logs submitted by Field Officers from active sites |
| `billing_entries` | Running Account (RA) bills verified against ground progress |

Row-Level Security (RLS) is active on all tables.

---

## ⚡ Quick Start (1-Minute Zero-Config Run)

You **do NOT need Supabase or complex database setup** to evaluate this prototype! The app includes a built-in high-fidelity local simulation mode with all 10 benchmark MoSPI projects.

### 1. Clone & Run Frontend (Instant Demo)
```bash
git clone https://github.com/vishesh-i-tech/SIH26103.git
cd SIH26103
npm install
npm run dev
```
👉 Open [http://localhost:5173](http://localhost:5173) in your browser.  
Click **"Sign In as Admin"** or **"Sign In as Field Officer"** on the login page to immediately explore the entire platform!

---

### 2. Optional: Run Python ML Simulator API (For Live Counterfactual SHAP Engine)
If you want to run the real XGBoost + SHAP TreeExplainer simulator backend locally:
```bash
cd ml
pip install -r requirements.txt
python server.py
```
👉 The simulator API will be live at [http://localhost:8000](http://localhost:8000) (Interactive Swagger docs at `http://localhost:8000/docs`).

---

### 3. Optional: Connect Live Supabase PostgreSQL (For Cloud Persistence)
*(Only needed if you want multi-device cloud database sync)*
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Put your Supabase URL & Anon Key in `.env`.
3. Run `supabase/schema.sql` and `supabase/seed.sql` in your Supabase SQL Editor.
4. Detailed cloud setup instructions are in [**`SETUP.md`**](./SETUP.md).

---

## 📚 Complete Documentation & Presentation
- **Master Platform Manual:** [**`COMPLETE_PLATFORM_DOCUMENTATION.md`**](./COMPLETE_PLATFORM_DOCUMENTATION.md) (Detailed feature breakdown for both MoSPI Admin and Field Officer roles).
- **Presentation Deck:** [**`PAIMANA_AI_SIH26103_Presentation.pptx`**](./PAIMANA_AI_SIH26103_Presentation.pptx) (10-slide executive pitch deck).
- **Model Card & Data Governance:** [**`model_card.md`**](./model_card.md) (XGBoost Model B & synthetic calibration disclosure).
- **Video Demo Script:** [**`DEMO_SCRIPT.md`**](./DEMO_SCRIPT.md) (3-minute Hinglish narration screenplay).
