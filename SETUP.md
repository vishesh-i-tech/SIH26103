# PAIMANA AI — Supabase Backend Setup Guide

This guide explains how to connect PAIMANA AI to a live Supabase project (Postgres database + Supabase Authentication with Row-Level Security), run the database migrations and seed data, configure your environment variables, and create your first accounts.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **New Project**.
3. Select your organization and enter:
   - **Project Name**: `paimana-ai` (or your preferred name)
   - **Database Password**: Choose a strong password (save it safely)
   - **Region**: Choose the region closest to you (e.g. `ap-south-1` Mumbai / India)
4. Click **Create new project** and wait ~1–2 minutes for the database to provision.

---

## 2. Run Database Schema & Seed Script

### Step 2.1: Run Schema Migration
1. In your Supabase Dashboard, click on the **SQL Editor** in the left navigation sidebar.
2. Click **+ New Query**.
3. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository and copy its entire content into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. Confirm success:
   - Go to **Table Editor** in the left sidebar and verify the 6 tables are created:
     - `profiles`
     - `projects`
     - `risk_trend`
     - `risk_factors`
     - `daily_entries`
     - `billing_entries`
   - Row Level Security (RLS) is automatically enabled on all 6 tables with proper role-based policies.

### Step 2.2: Run Seed Data Script
1. In the Supabase SQL Editor, click **+ New Query**.
2. Open [`supabase/seed.sql`](./supabase/seed.sql) in this repository and copy its entire content into the SQL Editor.
3. Click **Run**.
4. Confirm success:
   - Check the **projects** table — 10 central sector projects (NH-4471, BR-2209, RW-8802, etc.) will be populated with their associated risk trends, risk factors, billing items, and initial daily verification logs.

---

## 3. Configure Environment Variables

1. In your Supabase Dashboard, go to **Project Settings** (gear icon) → **API**.
2. Locate the following two credentials:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys** → `anon` `public` key (long JWT string)
3. In your project root folder (`d:/TECH/SIH26103`), edit the `.env` file (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Set the two variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-public-key
   ```
5. Restart your Vite development server so the new environment variables take effect:
   ```bash
   npm run dev
   ```

---

## 4. Account Creation & Role-Based Access

PAIMANA AI supports two distinct government roles:
- **MoSPI Admin**: Central oversight at IPMD, high-risk priority worklist, cross-sector benchmarking, billing anomaly gates, and project onboarding.
- **Field Officer (Site Engineer)**: Ground telemetry logs, physical work status (Running/Stalled/Off), material verification, and geo-tagged photo uploads.

### Step 4.1: Register the First Admin Account
1. Open your browser to `http://localhost:5173/register`
2. Fill out the registration form:
   - **Official Full Name**: e.g., `Dr. Alok Sharma (MoSPI IPMD)`
   - **Email**: e.g., `admin@mospi.gov.in`
   - **Password**: Min 6 characters (e.g. `Admin@MoSPI2026`)
   - **Role**: Select **MoSPI Admin**
3. Click **Complete Registration**.
4. You will be automatically redirected to the Central Sector Portfolio Overview (`/dashboard`).

> [!NOTE]
> **Hackathon Demo vs Production Security Note:**
> In this prototype/hackathon release, the registration page lets the user pick their role via a dropdown for seamless evaluation and judging.
> In a production government deployment, self-registration for `admin` accounts would be restricted:
> - Admins would be provisioned strictly via invitation from existing Super-Admins or Government SSO (e.g., NIC / Parichay / MeriPehchaan).
> - New signups would default to `field_officer` pending departmental employee ID verification.

### Step 4.2: Register a Field Officer Account
1. In the sidebar, click **Switch User / Login** (which signs out the admin).
2. Click **Register here** or navigate to `/register`.
3. Fill out the form:
   - **Official Full Name**: e.g., `Er. Rajesh Verma`
   - **Email**: e.g., `rajesh.verma@mospi.gov.in`
   - **Password**: Min 6 characters (e.g. `Field@MoSPI2026`)
   - **Role**: Select **Field Officer**
4. Click **Complete Registration**.
5. You will be redirected directly to the Field Officer Dashboard (`/field-dashboard`).

---

## 5. End-to-End Verification Flow

1. **Role-Based Redirection**:
   - Log in as `admin` → redirected to `/dashboard`.
   - Try navigating to `/field-dashboard` → automatically redirected back to `/dashboard`.
   - Log out and log in as `field_officer` → redirected to `/field-dashboard`.
   - Try navigating to `/dashboard` or `/projects` → automatically redirected to `/field-dashboard`.

2. **Field Officer Ground Verification Log**:
   - As a field officer, go to `/field-dashboard` and click **Submit Ground Log** on project `NH-4471`.
   - Fill in:
     - Work Status: `Running`
     - Cement / Steel / Aggregate consumption
     - Inspection Notes: e.g., `Pier 15 reinforcement cage inspected and cleared.`
   - Click **Submit & Record Ground Entry**.
   - You will be redirected to `/field-submissions`, where your new submission appears immediately with `Pending Review`.

3. **Admin Verification & Ground Record Inspection**:
   - In the sidebar, click **Switch User / Login** and sign in as the `admin`.
   - Go to **Project Directory** (`/projects`) and open `NH-4471`.
   - Click on the **Daily Record** tab.
   - **Verify**: The exact ground entry submitted by the field officer is dynamically rendered in the **Ground Verification Timeline**!

4. **Sanction New Project**:
   - In Project Directory (`/projects`), click **+ Add Project**.
   - Enter project code, name, sector, contractor, and sanctioned cost.
   - Click **Sanction & Register Project**.
   - **Verify**: The project is inserted into the Postgres database with `created_by` set to your admin UUID, and you are redirected to the new project's intelligence file.
