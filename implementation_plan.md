# PAIMANA AI — Infrastructure Project Risk Monitoring Platform (SIH26103)
## Foundation Setup & Architecture Plan

Build the foundation setup for the PAIMANA AI government infrastructure-project monitoring dashboard for MoSPI (Ministry of Statistics and Programme Implementation), IPMD (Infrastructure & Project Monitoring Division).

## User Review Required
> [!IMPORTANT]
> - Framework & Tooling: Vite + React (JavaScript, functional components with hooks).
> - Core dependencies: `react-router-dom` (routing), `recharts` (charts/visualizations), `lucide-react` (icons).
> - Design language: Engineering-grade government dashboard aesthetics with hairline 1px borders, #1B2430 dark sidebar, #F4F3EF paper background, sharp 2-3px radii, and strict monospace typography for numerical data.
> - Preserving existing directory contents (`.git/` and `docx/` containing problem statements, reports, and prototypes).

## Proposed Changes

### 1. Scaffolding & Configuration
Initialize a standard Vite React project structure without overwriting existing `.git` and `docx` directories.

#### [NEW] [package.json](file:///d:/TECH/SIH26103/package.json)
- Configured with dependencies:
  - `react`, `react-dom`
  - `react-router-dom`
  - `recharts`
  - `lucide-react`
- Scripts: `dev`, `build`, `preview`.

#### [NEW] [vite.config.js](file:///d:/TECH/SIH26103/vite.config.js)
- Configured Vite with React plugin and local development server options.

#### [NEW] [index.html](file:///d:/TECH/SIH26103/index.html)
- Standard HTML5 shell with title "PAIMANA AI — MoSPI Infrastructure Project Risk Monitoring Platform".
- Google Fonts preconnect / system typography stack.

---

### 2. Design Tokens & Styling

#### [NEW] [src/styles/tokens.js](file:///d:/TECH/SIH26103/src/styles/tokens.js)
Central design token definitions:
- Palette:
  - `ink`: `#1B2430` (text & dark chrome)
  - `paper`: `#F4F3EF` (main canvas background)
  - `panel`: `#FFFFFF` (card & table background)
  - `line`: `#D9D6CE` (hairline borders)
  - `steel`: `#2F5D73` (primary accent blue)
  - `steelDeep`: `#1F4351` (darker accent)
  - `slate`: `#5B6570` (muted secondary text)
  - `good`: `#3E7A52` (low risk / green)
  - `warn`: `#B07C22` (medium risk / amber)
  - `bad`: `#A6402F` (high risk / red)
  - `goodBg`: `#EAF2EC` (status chip light green tint)
  - `warnBg`: `#FBF1E0` (status chip light amber tint)
  - `badBg`: `#F7E7E3` (status chip light red tint)
- Typography:
  - `fontSans`: `system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
  - `fontMono`: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
- Radii: `radiusSm: 2px`, `radiusMd: 3px`

#### [NEW] [src/styles/index.css](file:///d:/TECH/SIH26103/src/styles/index.css)
- CSS variables mirroring tokens (`--color-ink`, `--color-paper`, `--color-line`, etc.)
- Baseline reset, box-sizing, custom scrollbar styling, and government-grade typography defaults.

---

### 3. Mock Dataset & Utilities

#### [NEW] [src/data/mockProjects.js](file:///d:/TECH/SIH26103/src/data/mockProjects.js)
10 realistic Indian central sector infrastructure projects (₹150 Cr+):
- Spanning Roads, Bridges, Railways, and Power.
- Complete data schema including `costOriginal`, `costRevised`, `planned`, `actual`, `risk` (ranging across 22-87 for full green/amber/red coverage), `trend` (6-month risk trend), `factors` (weighted risk drivers), `recommendation`, `billing` (claimed vs expected with anomaly flags), and `daysFlagged`.

#### [NEW] [src/utils/risk.js](file:///d:/TECH/SIH26103/src/utils/risk.js)
Helper functions:
- `riskTone(score)`: returns color (`bad` if ≥70, `warn` if ≥45, else `good`)
- `riskBg(score)`: returns background tint
- `riskLabel(score)`: returns "Critical" / "Watch" / "Stable"
- `formatINR(crores)`: formats `₹... Cr`
- `formatPct(num)`: formats `...%`
- `calculateVariance(claimed, expected)`

---

### 4. Shared Reusable UI Components

#### [NEW] [src/components/Panel.jsx](file:///d:/TECH/SIH26103/src/components/Panel.jsx)
- Card container with white background, 1px solid line border, 3px border-radius, no drop shadows.

#### [NEW] [src/components/RiskChip.jsx](file:///d:/TECH/SIH26103/src/components/RiskChip.jsx)
- Monospace risk chip with score and status badge ("87 · Critical").

#### [NEW] [src/components/ProgressBar.jsx](file:///d:/TECH/SIH26103/src/components/ProgressBar.jsx)
- Dual-indicator bar showing actual progress filled and planned progress indicator line.

#### [NEW] [src/components/Sidebar.jsx](file:///d:/TECH/SIH26103/src/components/Sidebar.jsx)
- Fixed 216px dark sidebar (#1B2430) with MoSPI / PAIMANA AI branding, navigation links with icons, active state highlighting, and user session badge.

#### [NEW] [src/components/Header.jsx](file:///d:/TECH/SIH26103/src/components/Header.jsx)
- Top bar with ministry breadcrumb, quick search, live date, and user role.

#### [NEW] [src/components/Layout.jsx](file:///d:/TECH/SIH26103/src/components/Layout.jsx)
- App layout with fixed Sidebar, Header, and scrollable content area with paper background (`#F4F3EF`).

---

### 5. Pages & Route Configuration

#### [NEW] [src/pages/Login.jsx](file:///d:/TECH/SIH26103/src/pages/Login.jsx)
- `/login`: MoSPI IPMD portal sign-in.

#### [NEW] [src/pages/Dashboard.jsx](file:///d:/TECH/SIH26103/src/pages/Dashboard.jsx)
- `/dashboard`: Portfolio overview with metrics, risk trend, priority worklist.

#### [NEW] [src/pages/Projects.jsx](file:///d:/TECH/SIH26103/src/pages/Projects.jsx)
- `/projects`: Project list with search, sector filters, progress bars, and risk chips.

#### [NEW] [src/pages/ProjectDetail.jsx](file:///d:/TECH/SIH26103/src/pages/ProjectDetail.jsx)
- `/projects/:id`: Detailed view with overview, daily record, risk & prediction, and billing tabs.

#### [NEW] [src/pages/PriorityQueue.jsx](file:///d:/TECH/SIH26103/src/pages/PriorityQueue.jsx)
- `/priority-queue`: Urgency-ranked worklist of flagged infrastructure projects.

#### [NEW] [src/pages/Benchmarking.jsx](file:///d:/TECH/SIH26103/src/pages/Benchmarking.jsx)
- `/benchmarking`: Cross-project and cross-sector comparison analytics.

#### [NEW] [src/pages/BillingAlerts.jsx](file:///d:/TECH/SIH26103/src/pages/BillingAlerts.jsx)
- `/billing-alerts`: Anomaly alerts for claimed vs AI-expected billing items.

#### [NEW] [src/pages/Assistant.jsx](file:///d:/TECH/SIH26103/src/pages/Assistant.jsx)
- `/assistant`: AI query assistant for MoSPI officers.

#### [NEW] [src/App.jsx](file:///d:/TECH/SIH26103/src/App.jsx) & [src/main.jsx](file:///d:/TECH/SIH26103/src/main.jsx)
- React Router configuration with `BrowserRouter`, `Routes`, and `Route` elements.

---

## Verification Plan

### Automated Tests / Build Verification
- Run `npm install` to install all dependencies cleanly.
- Run `npm run build` or Vite build check to ensure all imports, JSX syntax, and modules bundle without errors.
- Run `npm run dev` with background process verification.

### Manual Verification
- Verify that every route loads properly:
  - `/login`
  - `/dashboard`
  - `/projects`
  - `/projects/NH-4471`
  - `/priority-queue`
  - `/benchmarking`
  - `/billing-alerts`
  - `/assistant`
- Check styling: hairline borders, sharp 2-3px radii, monospace numbers, color-coded risk indicators.
