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

## Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vishesh-i-tech/SIH26103.git
cd SIH26103
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` template:
```bash
cp .env.example .env
```
Update `.env` with your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Setup Database Schema & Seed Data
Follow the step-by-step instructions in [**`SETUP.md`**](./SETUP.md) to:
- Run `supabase/schema.sql` in your Supabase SQL Editor.
- Run `supabase/seed.sql` to import the 10 Central Sector synthetic projects dataset.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```

---

## Complete Setup & Testing Guide

For detailed instructions on Supabase setup, creating Admin/Field Officer accounts, and executing end-to-end verification tests, see [**`SETUP.md`**](./SETUP.md).
