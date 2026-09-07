# 🛡️ CrimeIntel UI — Master Design System, Color Tokens, Page Structures & Architecture Guide

> **A complete blueprint for designing, restyling, or completely rebuilding the CrimeIntel Frontend User Interface.**  
> Contains exact CSS color values, typography rules, layout hierarchies, component anatomy, and full page-by-page wireframe breakdowns.

---

## 📑 Table of Contents

1. [🎨 Master Design System & Color Palette](#1--master-design-system--color-palette)
   - [Core Color Tokens (Hex, RGB, Tailwind, Semantic Usage)](#core-color-tokens)
   - [Severity & Status Color Matrix](#severity--status-color-matrix)
   - [Data Visualization Palette (Charts & Graphs)](#data-visualization-palette)
   - [Typography & Font Hierarchies](#typography--font-hierarchies)
   - [Custom Effects & Animations](#custom-effects--animations)
2. [📐 Master Layout & Structural Grid](#2--master-layout--structural-grid)
   - [Root Shell Grid (`Layout.jsx`)](#root-shell-grid)
   - [Sidebar Anatomy & Navigation Item Specifications](#sidebar-anatomy)
   - [Top Header Anatomy (`Header.jsx`)](#top-header-anatomy)
   - [Global AI Copilot (`ChatWidget.jsx`)](#global-ai-copilot)
3. [📑 Page Structures & UI Wireframe Blueprint](#3--page-structures--ui-wireframe-blueprint)
   - [00. Authentication Screen (`/login`)](#00-login--login)
   - [00. Public Citizen Crime Portal (`/report-crime` & `/citizen-portal`)](#00-citizen-crime-portal--report-crime--citizen-portal)
   - [01. Situation Dashboard (`/`)](#01-situation-dashboard-)
   - [02. Case Search & FIR Explorer (`/cases`)](#02-case-search--fir-explorer-cases)
   - [03. Case Detail & Dossier Workspace (`/cases/:id`)](#03-case-detail--dossier-workspace-casesid)
   - [04. Hotspot Map & GIS Analysis (`/map`)](#04-hotspot-map--gis-analysis-map)
   - [05. Network & Entity Relationship Graph (`/network`)](#05-network--entity-relationship-graph-network)
   - [06. AI Crime Assistant (`/assistant`)](#06-ai-crime-assistant-assistant)
   - [07. My Work & Task Queue (`/my-work`)](#07-my-work--task-queue-my-work)
   - [08. Audit Trail & Compliance Log (`/audit`)](#08-audit-trail--compliance-log-audit)
   - [09. User Activity History (`/activity`)](#09-user-activity-history-activity)
   - [10. Job Center & Background Queue (`/jobs`)](#10-job-center--background-queue-jobs)
   - [11. Observability & System Health (`/observability`)](#11-observability--system-health-observability)
   - [12. Workflows & Approvals Engine (`/workflows`)](#12-workflows--approvals-engine-workflows)
   - [13. Career Plans & Learning Pathways (`/career-plans`)](#13-career-plans--learning-pathways-career-plans)
   - [14. Citizen Reports Admin & Processing (`/citizen-reports`)](#14-citizen-reports-admin--processing-citizen-reports)
   - [15. Offender Profiles & Repeat Offenders (`/offenders`)](#15-offender-profiles--repeat-offenders-offenders)
   - [16. Socio-Demographic & Crime Insights (`/insights`)](#16-socio-demographic--crime-insights-insights)
   - [17. Batch Case Import & Ingestion Pipeline (`/import`)](#17-batch-case-import--ingestion-pipeline-import)
   - [18. User Administration & RBAC (`/admin`)](#18-user-administration--rbac-admin)
4. [🧩 Reusable UI Component Patterns](#4--reusable-ui-component-patterns)
5. [🌐 Global State, Context & REST API Architecture](#5--global-state-context--rest-api-architecture)

---

## 1. 🎨 Master Design System & Color Palette

The interface is built around a **Dark Tactical Cyber-Intelligence aesthetic** combining high-contrast monochrome backgrounds with electric accent colors.

### Core Color Tokens

| Token Name | Tailwind Class | Hex Code | RGB | Semantic Role / Usage |
|---|---|---|---|---|
| **Base Canvas** | `bg-base` | `#0B0F17` | `rgb(11, 15, 23)` | Root document background, deep night backdrop |
| **Panel Primary** | `bg-panel` | `#111826` | `rgb(17, 24, 38)` | Sidebars, main cards, modals, table headers |
| **Panel Secondary** | `bg-panel2` | `#161F2E` | `rgb(22, 31, 46)` | Nested cards, hover states, input backgrounds, active rows |
| **Border / Divider** | `border-line` | `#232E42` | `rgb(35, 46, 66)` | 1px clean separators, card borders, grid lines |
| **Ink (High Contrast)**| `text-ink` | `#DCE3EE` | `rgb(220, 227, 238)` | Primary titles, active body text, key metrics |
| **Muted** | `text-muted` | `#7C8AA3` | `rgb(124, 138, 163)` | Subtext, timestamps, labels, inactive tabs, table headers |
| **Amber Gold** | `text-amber`, `bg-amber` | `#F0A202` | `rgb(240, 162, 2)` | Brand primary, open status, active selections, badges |
| **Teal Cyan** | `text-teal`, `bg-teal` | `#3FD6C1` | `rgb(63, 214, 193)` | AI copilot, system tags, low severity, online pulses |
| **Critical Red** | `text-crit`, `bg-crit` | `#E23D5B` | `rgb(226, 61, 91)` | Critical severity, error banners, destructive actions, danger alerts |
| **Warning Orange** | `text-high` / custom | `#E8833A` | `rgb(232, 131, 58)` | High severity alerts, pending approvals |
| **Verified Green** | `text-good` | `#3FB950` | `rgb(63, 185, 80)` | Closed cases, healthy latency, success toasts |
| **Blue Accent** | `text-blue` | `#5B8DEF` | `rgb(91, 141, 239)` | Secondary chart bars, info callouts |

---

### Severity & Status Color Matrix

| Level / Status | Text Color | Border Style | Background Style |
|---|---|---|---|
| **Low** | `#3FD6C1` (Teal) | `border-[#3FD6C1]/30` | `bg-[#3FD6C1]/10` |
| **Medium** | `#F0A202` (Amber) | `border-[#F0A202]/30` | `bg-[#F0A202]/10` |
| **High** | `#E8833A` (Orange) | `border-[#E8833A]/30` | `bg-[#E8833A]/10` |
| **Critical** | `#E23D5B` (Red) | `border-[#E23D5B]/30` | `bg-[#E23D5B]/10` |
| **Open Case** | `#F0A202` (Amber) | `border-[#F0A202]/40` | `bg-[#F0A202]/15` |
| **Under Investigation** | `#3FD6C1` (Teal) | `border-[#3FD6C1]/40` | `bg-[#3FD6C1]/15` |
| **Closed / Resolved** | `#3FB950` (Green) | `border-[#3FB950]/40` | `bg-[#3FB950]/15` |

---

### Data Visualization Palette

Standard color cycle for **Recharts**, **Leaflet heatmaps**, and **D3 node networks**:
```javascript
const CHART_PALETTE = [
  "#3FD6C1", // 1. Teal Cyan
  "#F0A202", // 2. Amber Gold
  "#E8833A", // 3. Tactical Orange
  "#E23D5B", // 4. Crimson Red
  "#5B8DEF", // 5. Electric Blue
  "#7C8AA3"  // 6. Muted Slate
];
```

---

### Typography & Font Hierarchies

Imported from Google Fonts via `index.html`:

| Font Family | CSS Identifier | Tailwind Token | Typical Usage |
|---|---|---|---|
| **Barlow Condensed** | `'Barlow Condensed', sans-serif` | `font-display` | Large metric numbers, page headers, case IDs, modal titles |
| **Inter** | `'Inter', sans-serif` | `font-body` | Standard UI body text, descriptions, table cells, form labels |
| **JetBrains Mono** | `'JetBrains Mono', monospace` | `font-mono` | Code tags, section numbers (`01`, `02`), hashes, dates, IP addresses |

#### Standard Typography Sizing:
- **Hero / Stat Number:** `font-display text-4xl` or `text-5xl font-bold`
- **Page Title:** `font-display text-2xl` or `text-3xl text-ink tracking-wide`
- **Section Code / Eyebrow:** `font-mono text-teal text-[10px]` or `text-xs tracking-[0.3em] uppercase`
- **Card Subtitle / Label:** `text-muted text-xs font-mono uppercase tracking-wide`
- **Body Text:** `text-ink text-sm leading-relaxed`

---

### Custom Effects & Animations

#### 1. Tactical Scanline Overlay
```css
.scanline {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(63, 214, 193, 0.035),
    rgba(63, 214, 193, 0.035) 1px,
    transparent 1px,
    transparent 3px
  );
}
```

#### 2. Micro-Animations
```css
@keyframes slideUp {
  from { transform: translateY(1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

---

## 2. 📐 Master Layout & Structural Grid

### Root Shell Grid
```text
+-----------------------------------------------------------------------------------------------+
| SIDEBAR (w-56)             | MAIN CONTENT AREA (flex-1)                                      |
|----------------------------+------------------------------------------------------------------|
| [LOGO] CASE-ACCESS-SYS     | TOPBAR HEADER (h-14 border-b border-line bg-panel)              |
|        CRIMEINTEL          | [Breadcrumb] [Search Box / Modal] [System Status] [Alert Bell]   |
|----------------------------+------------------------------------------------------------------|
| NAV LINKS                  | PAGE VIEWPORT (overflow-y-auto p-8)                             |
| 01 Dashboard               |                                                                  |
| 02 Case Search             |                                                                  |
| 03 Citizen Reports         |   [Page Title / Eyebrow]                                         |
| 04 Hotspot Map             |   [KPI Stat Cards Grid]                                          |
| 05 Network Graph           |   [Main Visualizations / Recharts / Tables]                      |
| 06 AI Assistant            |   [Side Panels / Detail Cards]                                   |
| 07 My Work        [Badge]  |                                                                  |
| 08 Audit Trail             |                                                                  |
| 09 Activity History        |                                                                  |
| 10 Job Center              |                                                                  |
| 11 Observability           |                                                                  |
| 12 Workflows & Approvals   |                                                                  |
| 13 Career Plans            |                                                                  |
| (Dynamic Role Nav Links)   |                                                                  |
|----------------------------+------------------------------------------------------------------|
| USER PROFILE FOOTER        | FLOATING AI COPILOT WIDGET (fixed bottom-6 right-6)              |
| [Name] [Role Badge]        |                                                                  |
| [SIGN OUT ->]              |                                                                  |
+-----------------------------------------------------------------------------------------------+
```

---

### Sidebar Anatomy
- **Width:** `w-56` (14rem / 224px) fixed.
- **Background:** `bg-panel` (`#111826`), `border-r border-line` (`#232E42`).
- **Brand Header:**
  - Eyebrow: `font-mono text-teal text-[10px] tracking-[0.3em] uppercase` -> `CASE-ACCESS-SYS`
  - App Logo: `font-display text-2xl text-ink` -> `CRIME`<span className="text-amber">`INTEL`</span>
- **Navigation Link Anatomy:**
  - Container: `flex items-center gap-3 px-5 py-2.5 text-sm transition border-l-2`
  - Active State: `border-amber text-ink bg-panel2 font-semibold`
  - Inactive State: `border-transparent text-muted hover:text-ink hover:bg-panel2/60`
  - Prefix Number: `font-mono text-xs text-muted` (e.g., `01`, `02`, `03`)
  - Badge (Optional): `ml-auto bg-amber text-base font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full`

---

### Top Header Anatomy
- **Height:** `h-14` (3.5rem / 56px) sticky bar.
- **Search Trigger:** Clickable input pill (`bg-panel2 border border-line rounded px-3 py-1.5 text-xs text-muted`) opening the global Case/Accused search modal.
- **System Health Beacon:** Green pulsating dot + text `SYSTEM OPERATIONAL (HEALTH 100%)`.
- **Notification Dropdown:** Bell icon with unread count badge showing timestamped alerts.

---

### Global AI Copilot (`ChatWidget.jsx`)
- **Docked Mode:** Fixed floating bubble at bottom-right corner (`bottom-6 right-6`) with glowing Teal beacon.
- **Expanded Flyout:** `w-96 h-[540px] bg-panel border border-line rounded-lg shadow-2xl flex flex-col z-50`.
- **Top Bar:** Model indicator (`CrimeIntel Assistant / GPT-4o-mini`), minimize, expand buttons.
- **Message Feed:** Alternating chat bubbles (User in `bg-panel2 border border-line`, AI in `bg-panel border border-teal/30 text-ink`).
- **Quick Prompts:** Pill buttons for instant actions (`Summarize Case`, `Check MO`, `IPC Lookup`).

---

## 3. 📑 Page Structures & UI Wireframe Blueprint

---

### 00. Login (`/login`)
- **Path:** `src/pages/Login.jsx`
- **Layout:** Centered tactical terminal card (`max-w-md w-full bg-panel border border-line p-8 rounded-lg scanline`).
- **Header:** System logo, classification warning banner (`UNAUTHORIZED ACCESS PROHIBITED - TIER 3 CLEARANCE`).
- **Quick Role Presets:** 4 one-click buttons (`Admin`, `Investigator`, `Analyst`, `Viewer`) for rapid authentication.
- **Form Elements:**
  - Username / Officer ID input (`bg-panel2 border border-line text-ink font-mono text-sm px-4 py-2.5 rounded`).
  - Password input with toggle visibility.
  - Sign In CTA button (`bg-amber text-base font-semibold py-2.5 rounded hover:bg-amber/90 transition`).
- **Public Portal Link:** Direct link to Citizen Crime Reporting portal (`/report-crime`).

---

### 00. Citizen Crime Portal (`/report-crime` & `/citizen-portal`)
- **Path:** `src/pages/CitizenReport.jsx`
- **Layout:** Clean citizen-facing layout with a 2-tab switcher: `Submit a Report` & `Check Status by PIN`.
- **Submission Form Modules:**
  1. **Incident Category:** Crime selector (Theft, Assault, Fraud, Cybercrime, Missing Person).
  2. **Location & Timestamp:** District dropdown, Police Station, GPS coordinate auto-fill.
  3. **Narrative & Description:** Rich text description area.
  4. **Suspect / Vehicle Info:** Known physical descriptions, license plate numbers.
  5. **File / Evidence Upload:** Image, video, document attachments.
- **Success Modal:** Generates an 8-character **Report Tracking ID & PIN** with copy-to-clipboard.
- **Status Checker View:** Lookup report by PIN showing progress steps: `Submitted` -> `Under Review` -> `FIR Registered`.

---

### 01. Situation Dashboard (`/`)
- **Path:** `src/pages/Dashboard.jsx`
- **Structure:**
  - **Top Row (4-Col KPI Grid):**
    - Total Registered Cases (`StatCard` with `text-ink`)
    - Active / Open Cases (`StatCard` with `text-amber`)
    - Critical Incidents (`StatCard` with `text-crit`)
    - Conviction / Solved Rate (`StatCard` with `text-teal`)
  - **Middle Row (2-Col Chart Grid):**
    - Left: *Crime Type Distribution* (Vertical BarChart with multi-colored category bars).
    - Right: *District Incident Breakdown* (Horizontal BarChart sorted by case density).
  - **Bottom Row (2-Col Feed Grid):**
    - Left: *Recent High-Severity Alerts* (List of FIR cards with severity badge pills).
    - Right: *Predictive Trend Alerts* (Districts with >20% rise over 30 days).

---

### 02. Case Search & FIR Explorer (`/cases`)
- **Path:** `src/pages/Cases.jsx`
- **Structure:**
  - **Header Action Bar:**
    - Live Search Input (Case ID, Title, Accused, IPC section).
    - Filter Dropdowns: District, Severity (`Low`, `Med`, `High`, `Crit`), Status (`Open`, `Under Investigation`, `Closed`).
    - Date range picker.
    - Export Button (`Export CSV / JSON`).
  - **Main Data Table:**
    - Columns: `Case ID` (Mono font, clickable link), `Incident Title`, `District & Station`, `IPC / BNS Sections`, `Severity Badge`, `Registration Date`, `Status Pill`.
    - Row hover highlighting (`hover:bg-panel2`).
  - **Pagination Controls:** Previous/Next buttons with page size selector (10, 25, 50).

---

### 03. Case Detail & Dossier Workspace (`/cases/:id`)
- **Path:** `src/pages/CaseDetail.jsx`
- **Structure:** Full 1200+ line investigative dossier workbench with tabbed sections:
  1. **Header Banner:**
     - Case ID, Title, Status selector, Severity Badge, Sensitive Case Redaction Toggle, PDF Report Export button.
  2. **Primary Details Grid (6 Key-Value Fields):**
     - Crime Category, Incident Date & Time, Registration Station, Investigating Officer, Jurisdiction District, IPC Sections.
  3. **Multi-Tab Investigation Body:**
     - **Tab 1: Case Summary & Narrative:** Full FIR complaint transcript, Modus Operandi (MO) description.
     - **Tab 2: Suspects & Accused:** Accused cards with photos, criminal history index, bail status, biometric hash.
     - **Tab 3: Evidence & Forensics:** Table of logged evidence items, chain-of-custody signatures, ballistic/digital tags.
     - **Tab 4: Investigation Timeline:** Chronological vertical timeline with interrogation logs, witness statements, and warrant dates.
     - **Tab 5: Team Assignments & Tasks:** Assign supporting officers, create sub-tasks with due dates and checkboxes.
     - **Tab 6: Financial Trail & Linkages:** Transaction flow diagram and linked bank accounts.
     - **Tab 7: AI Case Synthesis:** AI generated executive summary and predicted similar historical cases.

---

### 04. Hotspot Map & GIS Analysis (`/map`)
- **Path:** `src/pages/MapView.jsx`
- **Structure:**
  - **Top Filter Toolbar:** Time window (24h, 7d, 30d, 1y), Crime category checkboxes, Heatmap radius slider, Cluster toggle.
  - **Full-Screen GIS Map (Leaflet):**
    - Custom dark tile layer matching `#0B0F17` aesthetic.
    - Incident markers color-coded by severity.
    - Heatmap overlay showing crime density hotspots.
    - Interactive popup cards on marker click showing FIR summary and quick dossier navigation.
  - **Right Flyout Sidebar:** Summary of visible incidents, top affected police stations, and peak incident hours.

---

### 05. Network & Entity Relationship Graph (`/network`)
- **Path:** `src/pages/NetworkGraph.jsx`
- **Structure:**
  - **Mode Switcher Bar:** Toggle between `2D Force Graph (D3.js)` and `3D Spatial Graph (Three.js)`.
  - **Filter Ribbon:** Node types (`Suspects`, `Cases`, `Phone Numbers`, `Vehicles`, `Bank Accounts`), Connection weight slider.
  - **Interactive Canvas Area:**
    - Force-directed physics simulation with drag, pan, and zoom.
    - Nodes glowing by entity category.
    - Edges labeled with relationship types (`Co-accused`, `Call Frequency`, `Family`, `Transaction`).
  - **Entity Detail Side Drawer:** Inspects clicked node, showing total connections, risk score, and linked case files.

---

### 06. AI Crime Assistant (`/assistant`)
- **Path:** `src/pages/Assistant.jsx`
- **Structure:**
  - **Left Sidebar (Chat History & Prompts):** Saved intelligence sessions, pre-built prompt templates (FIR analysis, Legal Section advisor, Recidivism prediction).
  - **Main Chat Window:**
    - Full-height scrollable stream of messages.
    - Code blocks & structured data tables with syntax highlighting.
    - Evidence comparison cards rendered inline.
  - **Bottom Input Dock:** Expanding textarea with file attachment support, voice-to-text trigger, and `Send` button.

---

### 07. My Work & Task Queue (`/my-work`)
- **Path:** `src/pages/MyWork.jsx`
- **Structure:**
  - **3-Column Kanban / Tabbed View:**
    1. **Assigned Tasks:** List of task cards with status toggle (`Pending`, `In Progress`, `Done`), priority flags, and due dates.
    2. **Bookmarked / Pinned Cases:** Rapid access grid of FIR dossiers the officer is currently monitoring.
    3. **Investigator Scratchpad:** Private markdown-supported notebook for active leads and interrogation notes.

---

### 08. Audit Trail & Compliance Log (`/audit`)
- **Path:** `src/pages/AuditTrail.jsx`
- **Structure:**
  - **Filter Bar:** Search by Officer Name, Action Type (`VIEW`, `EDIT`, `EXPORT`, `LOGIN`), Date Range.
  - **Audit Ledger Table:**
    - Columns: `Timestamp` (Mono), `User / Officer ID`, `Action Performed`, `Target Resource (FIR/Record)`, `Client IP Address`, `Integrity Signature`.

---

### 09. User Activity History (`/activity`)
- **Path:** `src/pages/ActivityHistory.jsx`
- **Structure:**
  - Visual activity stream, user session analytics, breakdown of most frequently queried cases, and daily operational heatmaps.

---

### 10. Job Center & Background Queue (`/jobs`)
- **Path:** `src/pages/JobCenter.jsx`
- **Structure:**
  - **Stat Cards:** Running Jobs, Completed Jobs, Failed Jobs, Queue Latency.
  - **Active Jobs Table:** Progress bars (`0% - 100%`), Job Name (e.g. `Batch Vector Embedding Generation`), Initiated By, Remaining ETA.
  - **Job Logs Modal:** Real-time log inspector for failed or running background tasks.

---

### 11. Observability & System Health (`/observability`)
- **Path:** `src/pages/Observability.jsx`
- **Structure:**
  - **Live Metrics Dashboard:**
    - API P95 / P99 Latency sparklines (Recharts LineChart).
    - Database query latency and connection pool usage.
    - CPU & Memory gauges.
  - **Live Log Stream:** Terminal-style real-time log viewer (`font-mono text-xs bg-base text-teal p-4 rounded`) with pause/auto-scroll controls.

---

### 12. Workflows & Approvals Engine (`/workflows`)
- **Path:** `src/pages/Workflows.jsx`
- **Structure:**
  - **Approval Pipeline Tabs:** `Pending My Approval`, `Submitted by Me`, `Archived Workflows`.
  - **Workflow Cards:** Warrant Requests, Case Closure Approvals, Evidence Destruction Requests.
  - **Review Modal:** Side-by-side justification comparison with `Approve` (Green) and `Reject` (Red) buttons and signature field.

---

### 13. Career Plans & Learning Pathways (`/career-plans`)
- **Path:** `src/pages/CareerPlans.jsx`
- **Structure:**
  - Officer skill matrix (Cyber Forensics, Interrogation, Crime Scene Management).
  - Interactive training modules and assessment certifications.
  - Promotion readiness scoring gauge.

---

### 14. Citizen Reports Admin & Processing (`/citizen-reports`)
- **Path:** `src/pages/CitizenReportsAdmin.jsx`
- **Structure:**
  - Incoming public tips queue.
  - Triage filter (`Pending Review`, `Investigating`, `Dismissed`, `Converted to FIR`).
  - **Action Toolbar:** Preview tip details, verify attached images/videos, and **"Convert to Official FIR"** modal with automatic field pre-filling.

---

### 15. Offender Profiles & Repeat Offenders (`/offenders`)
- **Path:** `src/pages/Offenders.jsx`
- **Structure:**
  - Habitual offender cards with photo, aliases, known Modus Operandi (MO) tags, active gang affiliations, and risk level.
  - Search by MO, physical marks, or previous FIR convictions.

---

### 16. Socio-Demographic & Crime Insights (`/insights`)
- **Path:** `src/pages/Insights.jsx`
- **Structure:**
  - Multi-variable analytical dashboard correlating crime statistics with district-level literacy rates, unemployment figures, and population density.
  - Predictive crime forecast models and seasonal heatmaps.

---

### 17. Batch Case Import & Ingestion Pipeline (`/import`)
- **Path:** `src/pages/Import.jsx`
- **Structure:**
  - Drag-and-drop file upload zone (CSV, JSON, XML).
  - Dynamic column mapping interface (matching CSV columns to FIR database schema).
  - Validation preview table showing errors or missing required fields before ingestion.

---

### 18. User Administration & RBAC (`/admin`)
- **Path:** `src/pages/Admin.jsx`
- **Structure:**
  - User Directory Table: Name, Email, Badge ID, Assigned Station, Role (`Admin`, `Investigator`, `Analyst`, `Viewer`), Status (`Active`, `Suspended`).
  - **Create / Edit User Modal:** Form for provisioning credentials, granting station access, and assigning RBAC permissions.

---

## 4. 🧩 Reusable UI Component Patterns

### Pattern A: Tactical Stat Card (`StatCard`)
```jsx
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-panel border border-line rounded-md px-5 py-4">
      <p className="text-muted text-xs font-mono tracking-wide uppercase mb-1">{label}</p>
      <p className={`font-display text-4xl ${accent || "text-ink"}`}>{value}</p>
    </div>
  );
}
```

### Pattern B: Tactical Key-Value Field (`Field`)
```jsx
const Field = ({ label, value }) => (
  <div className="bg-panel border border-line rounded p-3">
    <p className="text-muted text-[10px] uppercase font-mono">{label}</p>
    <p className="text-ink text-sm font-semibold mt-0.5">{value || "—"}</p>
  </div>
);
```

### Pattern C: Section Header with Eyebrow
```jsx
<div className="mb-6">
  <p className="font-mono text-teal text-xs tracking-[0.3em] mb-1 uppercase">MODULE-CODE</p>
  <h2 className="font-display text-3xl text-ink tracking-wide">Module Title</h2>
</div>
```

---

## 5. 🌐 Global State, Context & REST API Architecture

### Central Axios API Client (`src/lib/api.js`)
All endpoints utilize automatic Bearer token authorization stored in `localStorage.getItem("token")`:

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Core API Function Map:
- **Auth:** `loginUser()`, `getCurrentUser()`, `logout()`, `getToken()`
- **Cases:** `fetchCases()`, `fetchCaseById()`, `createCase()`, `updateCase()`, `fetchSimilarCases()`, `fetchCaseTimeline()`
- **Tasks & Collaboration:** `fetchMyTasks()`, `fetchCaseTasks()`, `createCaseTask()`, `updateCaseTask()`, `fetchCaseAssignments()`, `fetchCaseComments()`
- **Public Reporting:** `submitCitizenReport()`, `fetchCitizenReports()`, `convertReportToFIR()`
- **Analytics & AI:** `fetchDashboardStats()`, `fetchPredictions()`, `queryAssistant()`, `fetchInsights()`
- **GIS & Network:** `fetchHotspots()`, `fetchNetworkData()`
- **Administration & Audit:** `fetchUsers()`, `updateUserRole()`, `fetchAuditLogs()`, `fetchObservabilityMetrics()`
