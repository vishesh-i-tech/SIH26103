# PAIMANA AI — Infrastructure Project Risk Monitoring Platform
### Smart India Hackathon (SIH26103) · MoSPI (Ministry of Statistics and Programme Implementation)

An engineering-grade government infrastructure project monitoring dashboard and predictive risk platform built for the **Infrastructure & Project Monitoring Division (IPMD)** of MoSPI.

---

## Key Features

- **Portfolio Risk Overview (`/dashboard`)**: Macro telemetry cards, portfolio-wide risk trajectory graph, and urgent priority worklist.
- **Project Directory & Onboarding (`/projects`, `/projects/new`)**: Searchable, sector-filtered project directory across Roads, Bridges, Railways, and Power with an onboarding form for new sanctions.
- **Project Intelligence File (`/projects/:id`)**: Tabbed analytics covering Scope Overview, Daily Ground Record, ML Risk & Prediction with plain-language explainability, Billing Anomaly Verification with disbursement gap audit, and Cross-Sector Benchmarking.
- **Officer Priority Queue (`/priority-queue`)**: Algorithmic ranking of high-risk assets sorted by composite risk index and pending anomaly days.
- **Field Officer Operations Module (`/field-dashboard`, `/field-tasks`, `/field-entry/:projectId`, `/field-submissions`)**: Dedicated lightweight mobile-responsive workflow for Site Engineers to log daily progress, upload geo-tagged photos, input material consumption, and register mandatory delay reasons.
- **AI Decision Assistant (`/assistant`)**: Dynamic NLP decision-support assistant querying live project telemetry, schedule variance, cost drifts, and contractor billing anomalies.

---

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Visualizations**: Recharts (dynamic trend lines, radial risk gauges, factor distribution)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design Tokens (engineering government aesthetic with hairline borders, paper background, and monospace numerical typography)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Production build
npm run build
```
