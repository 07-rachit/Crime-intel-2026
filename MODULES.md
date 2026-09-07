# CrimeIntel — Complete Module & Page Documentation

> **Live App:** https://crime-intel.vercel.app | **API Docs:** https://crime-intel.vercel.app/api/docs

A full reference for every frontend page, backend router, core service, and test module in the CrimeIntel platform.

---

## 📑 Table of Contents

1. [Frontend Pages](#-frontend-pages)
2. [Frontend Components](#-frontend-components)
3. [Backend Routers (API)](#-backend-routers-api)
4. [Core Backend Services](#-core-backend-services)
5. [Database Models](#-database-models)
6. [Test Suite](#-test-suite)
7. [Route Map Quick Reference](#-route-map-quick-reference)

---

## 🖥️ Frontend Pages

All pages live in `frontend/src/pages/`. The app is a React 18 + Vite SPA with React Router v6. Protected routes require a valid JWT token.

---

### 📄 `Login.jsx` — `/login`

**Purpose:** Authentication entry point for law enforcement officers.

**Features:**
- Email + password login form
- JWT token stored in `localStorage` on success
- Redirects authenticated users to `/` (Dashboard)
- Role badge displayed after login (Admin / Analyst / Investigator / Viewer)

**API Called:** `POST /api/auth/login`

**Access:** Public (no auth required)

---

### 📊 `Dashboard.jsx` — `/`

**Purpose:** Command center overview — the first screen officers see after login.

**Features:**
- Live KPI cards: Total Cases, Open Cases, High-Severity Cases, Offenders Tracked
- Recent high-severity case feed with severity badges
- District-level 30-day trend delta alerts (↑ rising / ↓ falling crime)
- Real-time WebSocket notification bell (new case alerts, gang detections, AI analysis)
- Quick-action links to all major platform sections

**API Called:** `GET /api/dashboard/stats`, `GET /api/notifications`

**Access:** All authenticated roles

---

### 🗂️ `Cases.jsx` — `/cases`

**Purpose:** Main case search, filter, and listing interface for all FIR records.

**Features:**
- Free-text search across Case ID, title, district, crime type, station
- Multi-filter bar: Status, Severity, Crime Type, District, Date Range, Investigation Label
- **Role Scope Selector Bar** — 6 role-based views: `admin`, `investigator`, `reviewer`, `authority`, `hospital`, `user`
- Scoped count badge: `📊 Visible Count: X Security Cases Scoped`
- Color-coded investigation label badges: ⚠️ Suspected (Amber), ✓ Verified (Emerald), 🔍 Needs Review (Indigo)
- Pagination (20 per page)
- Click-through to full Case Detail

**API Called:** `GET /api/cases?q=&district=&status=&role_scope=`

**Access:** All authenticated roles (results scoped by role)

---

### 📋 `CaseDetail.jsx` — `/cases/:id`

**Purpose:** Full case file — the most feature-rich page in the platform.

**Features:**
- Complete case header: Case ID, crime type, status, severity, district, station, incident date
- **KSP FIR Details** tab: Registered crime number, gravity code, court, registering officer
- **Suspects & Accused** tab: Linked persons with MO tags, risk score badges
- **Evidence Log** tab: All evidence items with type and description
- **Financial Trail** tab: Linked bank accounts and flagged transactions
- **Investigation Timeline** tab: Audit of all status changes and review actions
- **Collaboration** tab:
  - Officer Assignments (assign role: Lead Investigator, Reviewing Analyst, etc.)
  - Case Tasks (create, assign, track `todo → in_progress → done`)
  - Threaded Case Comments (chronological discussion feed)
- **Investigation Review Modal**: Set label (Suspected / Verified / Needs Review) with mandatory reasoning note
- **Export Case Report** button: One-click PDF / HTML / CSV generation modal
- **AI Proactive Analysis**: AI-authored case summary comment (auto-posted for high/critical cases)
- Acts & Sections: IPC / BNS / IT Act provisions linked to the case

**APIs Called:**
- `GET /api/cases/{id}`, `GET /api/cases/{id}/investigation`
- `PUT /api/cases/{id}/investigation`
- `GET /api/collaboration/cases/{id}/assignments`
- `POST /api/collaboration/cases/{id}/assignments`
- `GET /api/collaboration/cases/{id}/tasks`
- `POST /api/collaboration/cases/{id}/tasks`
- `GET /api/collaboration/cases/{id}/comments`
- `POST /api/collaboration/cases/{id}/comments`
- `GET /api/export/cases/{id}/report?format=pdf|html|csv`
- `GET /api/finance/trail/{id}`

**Access:** All authenticated roles (write actions gated to investigator / analyst / admin)

---

### 🗺️ `MapView.jsx` — `/map`

**Purpose:** Spatial crime hotspot visualization for patrol resource allocation.

**Features:**
- Leaflet.js interactive map with dark ops-room basemap (CartoDB DarkMatter)
- Incident markers color-coded by severity: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low
- Click marker → popup with Case ID, crime type, status, date
- Severity filter toggles (show/hide by severity level)
- District boundary overlay
- Cluster view for dense incident areas

**API Called:** `GET /api/cases?page_size=500` (extracts lat/long from all cases)

**Access:** All authenticated roles

---

### 🕸️ `NetworkGraph.jsx` — `/network`

**Purpose:** Criminal relationship network — detect gangs, co-accused groups, and phone links.

**Features:**
- D3.js force-directed graph with drag/zoom/pan
- Node types: Person (blue), Case (orange), Phone (green)
- Edge types: Co-accused, Shared Phone Number, Financial Transfer link
- **Gang Group Detection panel**: Lists auto-detected criminal syndicates with member count and group risk score
- Node click → side panel with full offender profile and risk score
- Filter by: Show Only Gang Members, Minimum Link Count slider
- Financial crime overlay: flags money-mule nodes in red

**APIs Called:**
- `GET /api/network/graph`
- `GET /api/network/groups` (gang detection)

**Access:** analyst, admin (investigator: read-only view)

---

### 🤖 `Assistant.jsx` — `/assistant`

**Purpose:** Full-page AI Research Desk — natural language investigation queries over all case data.

**Features:**
- Full-page chat interface with session management (multiple named sessions)
- Natural language query: *"Show all armed robbery cases linked to phone +91-9876543210"*
- **Bilingual support**: Responses in English + Kannada
- **Voice I/O**: Web Speech API microphone input + text-to-speech output
- **Context Inspector panel**: Real-time display of AI reasoning steps (which retrieval strategies fired, how many chunks retrieved, which LLM was used)
- **Agent Tool Calls**: AI can autonomously call 7 read tools (`search_cases`, `get_case_detail`, `get_network_graph`, etc.)
- **Human-in-the-Loop Write Actions**: Agent pauses on write tools (`create_task`, `assign_case`, `add_comment`) and renders an **Action Confirmation Card** — officer must explicitly confirm
- **Cited Sources**: Every AI answer lists the specific case IDs and evidence used
- **PDF Export**: Download full research session as formatted PDF
- **Explainable AI**: No black boxes — every reasoning step visible

**APIs Called:**
- `POST /api/chat/sessions`
- `GET /api/chat/sessions`
- `POST /api/chat/sessions/{id}/messages`
- `GET /api/chat/sessions/{id}/messages`
- `POST /api/chat/assistant/actions/{id}/confirm`
- `POST /api/chat/assistant/actions/{id}/cancel`

**Access:** investigator, analyst, admin

---

### 👤 `Offenders.jsx` — `/offenders`

**Purpose:** Offender profile directory with behavioral risk scoring.

**Features:**
- Searchable directory of all persons linked to crime cases
- Risk score badge: 🟢 Low (0–39), 🟡 Medium (40–69), 🔴 High (70–100)
- Risk score breakdown tooltip: Volume pts + Severity pts + Recency pts + MO Repetition pts + Network pts
- MO tags displayed as chips (e.g. `night-burglary`, `otp-fraud`, `armed-robbery`)
- Sort by: Risk Score (High to Low), Name, Cases Linked
- Click → full offender profile with all linked cases

**API Called:** `GET /api/offenders`, `GET /api/offenders/{id}`

**Access:** analyst, admin

---

### 📈 `Insights.jsx` — `/insights`

**Purpose:** Socio-demographic crime analytics and seasonal trend charts.

**Features:**
- **Crime by District** bar chart (Recharts)
- **Crime Type Distribution** pie chart
- **Age Group Distribution** of complainants
- **Gender Distribution** chart
- **Monthly Trend Lines** — 12-month incident volume per district
- **Seasonal & Event-Based Trend Analysis** — detects spikes around festivals, elections, harvest seasons
- **District Socioeconomic Correlation** — literacy rate vs. crime rate scatter plot
- Urban vs. Rural crime split

**API Called:** `GET /api/analytics/district-trends`, `GET /api/analytics/demographics`, `GET /api/analytics/seasonal`

**Access:** analyst, admin

---

### 🔍 `AuditTrail.jsx` — `/audit`

**Purpose:** Immutable action audit log for compliance and accountability.

**Features:**
- Chronological table of all user actions: case creation, status changes, login events, sensitive data access
- Filter by: User, Action Type, Date Range
- Each entry shows: User ID, Name, Role, IP Address, Timestamp, Action, Detail string
- Admin-only: sensitive field access events (`view_sensitive_complainant_data`) highlighted in red

**API Called:** `GET /api/audit/logs`

**Access:** admin only

---

### 📜 `ActivityHistory.jsx` — `/activity`

**Purpose:** Centralized persistent activity history across all platform modules.

**Features:**
- Activity feed from `ActivityLoggingMiddleware` — intercepts ALL mutating HTTP requests automatically
- Filter by: Module (cases, chat, import, export, etc.), Activity Type, Status, User, Date Range
- Expandable JSON metadata inspector drawer per activity entry
- Search bar (`q`) across activity descriptions
- Export activity log to CSV

**API Called:** `GET /api/activity?q=&module=&activity_type=&status=`

**Access:** admin (full); investigator, analyst (own activity only); viewer (blocked from deletion)

---

### ⚙️ `JobCenter.jsx` — `/jobs`

**Purpose:** Background task queue management — monitor long-running async operations.

**Features:**
- Live job list with status badges: `QUEUED → RUNNING → RETRYING → COMPLETED / FAILED`
- Auto-polling progress bars (polls every 3s while jobs are running)
- Expandable log drawer per job (stdout + error trace)
- Output download link for completed jobs (e.g., generated report files)
- 1-click **Manual Retry** button for failed jobs
- **Cancel** button for queued/running jobs
- Job types: `ai_research`, `bulk_csv_import`, `report_export`, `trend_calculation`

**APIs Called:**
- `GET /api/jobs`
- `POST /api/jobs/{id}/cancel`
- `POST /api/jobs/{id}/retry`

**Access:** investigator, analyst, admin

---

### 🔭 `Observability.jsx` — `/observability`

**Purpose:** AI agent execution tracing — inspect every multi-step AI run in detail.

**Features:**
- **Execution Tree**: Visual tree of agent runs showing tool call chains, step order, latency per step
- **Token Consumption Metrics**: Input/output tokens per agent run
- **Tool Performance Ranking**: Frequency and average latency table for all 10 agent tools
- **Sensitive Data Sanitization Log**: Confirms which fields were scrubbed from prompts
- Expandable run inspection modal: full prompt, tool inputs/outputs, timing breakdown
- Search + date filter across all agent runs

**APIs Called:**
- `GET /api/observability/agent-runs`
- `GET /api/observability/agent-runs/{id}`
- `GET /api/observability/tool-stats`

**Access:** admin, analyst

---

### 🔄 `Workflows.jsx` — `/workflows`

**Purpose:** Automated AI workflow management with human approval gates.

**Features:**
- **Create Workflow**: Input a complex natural language instruction (e.g., *"Investigate case CR-2026-0401 and freeze linked financial accounts"*)
- **Step Execution Plan**: AI decomposes instruction into ordered steps with risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- **Automatic Execution**: LOW and MEDIUM risk steps run automatically
- **Human Approval Gate**: HIGH and CRITICAL steps pause and generate an approval card
- **Approval Center**: Officers approve/reject paused workflow steps
- **Resumable State**: Workflows persist across page refreshes; resume from exact paused step
- Status badges: `PENDING → RUNNING → AWAITING_APPROVAL → COMPLETED / FAILED`

**APIs Called:**
- `POST /api/workflows`
- `GET /api/workflows`
- `GET /api/workflows/{id}`
- `POST /api/workflows/{id}/steps/{step_id}/approve`
- `POST /api/workflows/{id}/steps/{step_id}/reject`

**Access:** investigator, analyst, admin

---

### 🌐 `CitizenReport.jsx` — `/report-crime`

**Purpose:** Public-facing anonymous crime reporting portal — no login required.

**Features:**
- Anonymous crime incident submission form
- Fields: Incident Type, Date, Location (District + Area), Description, Evidence Photos/Documents upload
- Generates unique tracking code: `REP-YYYY-XXXX`
- Tracking code displayed on submission for follow-up
- Fully accessible without authentication (public route)

**API Called:** `POST /api/citizen-reports` (no auth required)

**Access:** Public — no login needed

---

### 🗃️ `CitizenReportsAdmin.jsx` — `/citizen-reports`

**Purpose:** Officer interface to review, verify, and promote citizen crime reports.

**Features:**
- Incoming citizen report queue with status: `pending`, `verified`, `rejected`
- Evidence preview panel (uploaded photos/documents)
- **Verify Report** action: validates evidence and promotes report to formal KSP FIR case
- **Reject Report** action: marks invalid with reason note
- Idempotency guard: prevents re-reviewing already processed reports
- Filter by: Status, District, Date, Crime Type

**APIs Called:**
- `GET /api/citizen-reports`
- `PUT /api/citizen-reports/{id}/verify`
- `PUT /api/citizen-reports/{id}/reject`

**Access:** investigator, analyst, admin

---

### 💼 `MyWork.jsx` — `/my-work`

**Purpose:** Personal officer workspace — all active assignments and tasks in one place.

**Features:**
- **My Case Assignments**: All cases where the logged-in officer has an active assignment role
- **My Open Tasks**: All `todo` and `in_progress` tasks assigned to the current user
- Quick status update: mark task as `in_progress` or `done` directly from this page
- Due date warnings: overdue tasks highlighted in red
- Click-through links to the full Case Detail for each item

**APIs Called:**
- `GET /api/collaboration/my-assignments`
- `GET /api/collaboration/my-tasks`
- `PATCH /api/collaboration/tasks/{id}/status`

**Access:** All authenticated roles

---

### 📥 `Import.jsx` — `/import`

**Purpose:** Bulk case import via CSV file upload.

**Features:**
- Drag-and-drop CSV file upload area
- Column mapping preview (validates headers before import)
- Background job submission — import runs async, no page timeout
- Progress tracking via Job Center link
- Error report: lists rows that failed validation with reason codes
- Sample CSV template download

**API Called:** `POST /api/import/cases` (multipart/form-data)

**Access:** admin, analyst

---

### 👑 `Admin.jsx` — `/admin`

**Purpose:** User management console for administrators.

**Features:**
- Full user directory table (ID, Name, Email, Role, Status, Created At)
- **Create User** modal: set name, email, password, role
- **Edit User** modal: change role, activate/deactivate account
- **Deactivate Account** (with Super Admin self-deactivation guard)
- Role assignment: `admin`, `analyst`, `investigator`, `viewer`
- Search and filter users by role or status

**APIs Called:**
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/{id}`
- `DELETE /api/admin/users/{id}`

**Access:** admin only

---

### 📚 `CareerPlans.jsx` — `/career-plans`

**Purpose:** Searchable career development plan repository for training officers.

**Features:**
- Career plan records with Title, Description, Topic, Difficulty, Target Goal, Deadline, Tags, Milestones, Notes
- **Keyword search** (`q`) across all text fields
- **Multi-filter**: Topic, Difficulty Level (`Beginner → Expert`), Target Goal, Deadline Horizon
- **Active Filter Chips Bar**: removable chips per active filter with individual `(x)` buttons
- **Reset Filters** button
- Create / Edit / Delete career plans (role-gated)

**APIs Called:**
- `GET /api/career-plans?q=&topic=&difficulty=`
- `POST /api/career-plans`
- `PUT /api/career-plans/{id}`
- `DELETE /api/career-plans/{id}`

**Access:** All authenticated roles (CRUD gated to admin/analyst)

---

## 🧩 Frontend Components

All shared components live in `frontend/src/components/`.

---

### `Layout.jsx`

Wraps all protected pages. Renders the sidebar navigation and `Header.jsx`. Also mounts the floating `ChatWidget`.

**Contains:**
- Sidebar navigation with route links and role-aware menu visibility
- Active route highlighting
- `ChatWidget.jsx` floating button (always visible on all protected pages)

---

### `Header.jsx`

Top bar displayed on all protected pages.

**Contains:**
- Platform logo and title
- Current user name + role badge
- Notification bell with unread count (WebSocket-driven real-time updates)
- Logout button

---

### `ChatWidget.jsx`

Floating AI assistant widget — available on every protected page without navigating to `/assistant`.

**Contains:**
- Collapsible floating chat bubble (bottom-right corner)
- Shared session state with the full `/assistant` page
- Quick-query text input + send button
- Last 5 messages visible in widget mode
- "Open Full Desk" link → navigates to `/assistant`
- Voice input button (Web Speech API)

---

## 🔌 Backend Routers (API)

All routers live in `backend/app/routers/`. Registered in `backend/app/main.py`.

---

### `auth.py` — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user, return JWT token + user profile | Public |
| `GET` | `/api/auth/me` | Get current authenticated user profile | Required |

**Rate Limited:** `/api/auth/login` → 10 req/min

---

### `cases.py` — `/api/cases`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cases` | List cases with multi-filter + role-scope query |
| `POST` | `/api/cases` | Create a new FIR case |
| `GET` | `/api/cases/{id}` | Get full case detail with all related entities |
| `PUT` | `/api/cases/{id}` | Update case fields (status, severity, etc.) |
| `GET` | `/api/cases/{id}/investigation` | Get investigation label + review history |
| `PUT` | `/api/cases/{id}/investigation` | Set investigation label with mandatory reasoning note |

**Query params on `GET /api/cases`:**
`q`, `district`, `crime_type`, `status`, `severity`, `investigation_label`, `role_scope`, `date_from`, `date_to`, `page`, `page_size`

---

### `chat.py` — `/api/chat`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/sessions` | Create new AI research session |
| `GET` | `/api/chat/sessions` | List all sessions for current user |
| `GET` | `/api/chat/sessions/{id}/messages` | Get message history for a session |
| `POST` | `/api/chat/sessions/{id}/messages` | Send a query; triggers RAG + Claude pipeline |
| `POST` | `/api/chat/assistant/actions/{id}/confirm` | Confirm a pending agent write action |
| `POST` | `/api/chat/assistant/actions/{id}/cancel` | Cancel a pending agent write action |

**Rate Limited:** `/api/chat` → 30 req/min

---

### `network.py` — `/api/network`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/network/graph` | Full person-case-phone relationship graph (nodes + edges) |
| `GET` | `/api/network/groups` | Gang / organized crime group detection results |

---

### `offenders.py` — `/api/offenders`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/offenders` | Paginated offender directory with risk scores |
| `GET` | `/api/offenders/{id}` | Full offender profile with score breakdown |

---

### `analytics.py` — `/api/analytics`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/district-trends` | 30-day incident count per district with delta |
| `GET` | `/api/analytics/demographics` | Age, gender, occupation distributions |
| `GET` | `/api/analytics/seasonal` | Month-over-month and event-based trend analysis |
| `GET` | `/api/analytics/crime-types` | Crime type breakdown with counts |

---

### `finance.py` — `/api/finance`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/finance/trail/{case_id}` | Financial account + transaction wire trail for a case |
| `GET` | `/api/finance/accounts` | All flagged financial accounts across cases |

---

### `export.py` — `/api/export`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/export/cases/{id}/report` | Generate case report — `?format=pdf`, `html`, or `csv` |

**Report Contents:** Case header, FIR details, suspects, evidence, financial trail, investigation label history, audit log entries.

---

### `collaboration.py` — `/api/collaboration`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/collaboration/cases/{id}/assignments` | List officer assignments on a case |
| `POST` | `/api/collaboration/cases/{id}/assignments` | Assign an officer to a case |
| `DELETE` | `/api/collaboration/cases/{id}/assignments/{aid}` | Remove an officer assignment |
| `GET` | `/api/collaboration/cases/{id}/tasks` | List tasks for a case |
| `POST` | `/api/collaboration/cases/{id}/tasks` | Create a new case task |
| `PATCH` | `/api/collaboration/tasks/{id}/status` | Update task status |
| `GET` | `/api/collaboration/cases/{id}/comments` | Get threaded case comments |
| `POST` | `/api/collaboration/cases/{id}/comments` | Post a new case comment |
| `GET` | `/api/collaboration/my-assignments` | All cases assigned to the current user |
| `GET` | `/api/collaboration/my-tasks` | All tasks assigned to the current user |

---

### `citizen_reports.py` — `/api/citizen-reports`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/citizen-reports` | Submit anonymous citizen crime report | Public |
| `GET` | `/api/citizen-reports` | List all incoming reports | Officers |
| `PUT` | `/api/citizen-reports/{id}/verify` | Verify report and promote to formal case | Officers |
| `PUT` | `/api/citizen-reports/{id}/reject` | Reject report with reason note | Officers |

---

### `activity.py` — `/api/activity`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/activity` | Search + filter the centralized activity history log |
| `DELETE` | `/api/activity/{id}` | Delete an activity entry (super admin only) |

**Query params:** `q`, `module`, `activity_type`, `status`, `user_id`, `date_from`, `date_to`

---

### `jobs.py` — `/api/jobs`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | List all background jobs |
| `GET` | `/api/jobs/{id}` | Get job detail + execution logs |
| `POST` | `/api/jobs/{id}/cancel` | Cancel a queued/running job |
| `POST` | `/api/jobs/{id}/retry` | Manually retry a failed job |

---

### `observability.py` (router) — `/api/observability`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/observability/agent-runs` | List all AI agent execution runs |
| `GET` | `/api/observability/agent-runs/{id}` | Full execution tree for a specific run |
| `GET` | `/api/observability/tool-stats` | Tool frequency + average latency ranking |

---

### `workflows.py` — `/api/workflows`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workflows` | Create new automated workflow from natural language |
| `GET` | `/api/workflows` | List all workflows |
| `GET` | `/api/workflows/{id}` | Get workflow detail + step statuses |
| `POST` | `/api/workflows/{id}/steps/{sid}/approve` | Approve a paused HIGH/CRITICAL step |
| `POST` | `/api/workflows/{id}/steps/{sid}/reject` | Reject a paused step |

---

### `fir.py` — `/api/fir`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/fir/{case_id}` | Create / update KSP FIR statutory details for a case |
| `GET` | `/api/fir/{case_id}` | Get full FIR details for a case |

**FIR Fields:** 18-digit crime number, gravity code (Heinous/Non-Heinous), registering officer, court, chargesheet status (CS-A/B/C), arrest records, IPC/BNS/IT Act section associations.

---

### `dashboard.py` — `/api/dashboard`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregate KPIs: total/open/high-severity case counts, offender count |

---

### `audit.py` — `/api/audit`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/audit/logs` | Immutable audit log with filter by user/action/date |

---

### `admin.py` — `/api/admin`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all platform users |
| `POST` | `/api/admin/users` | Create a new user account |
| `PUT` | `/api/admin/users/{id}` | Update user role or active status |
| `DELETE` | `/api/admin/users/{id}` | Deactivate/delete a user account |

---

### `notifications.py` — `/api/notifications` + `/ws/notifications`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | List persistent notifications for current user |
| `POST` | `/api/notifications/{id}/read` | Mark notification as read |
| `WS` | `/ws/notifications?token=JWT` | WebSocket channel for real-time push notifications |

**Trigger Events:** High-severity case creation, officer assignment, task assignment, district trend alert, gang group detection, AI proactive analysis complete.

---

### `import_csv.py` — `/api/import`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/import/cases` | Upload CSV file; enqueues background import job |

---

### `masters.py` — `/api/masters`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/masters/districts` | List all Karnataka districts |
| `GET` | `/api/masters/crime-types` | List all crime category types |
| `GET` | `/api/masters/courts` | List court master records |
| `GET` | `/api/masters/units` | List police unit / station master records |

---

### `career_plans.py` — `/api/career-plans`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/career-plans` | Search + filter career plan records |
| `POST` | `/api/career-plans` | Create new career plan |
| `PUT` | `/api/career-plans/{id}` | Update a career plan |
| `DELETE` | `/api/career-plans/{id}` | Delete a career plan |

---

## ⚙️ Core Backend Services

All core service modules live in `backend/app/`.

---

### `main.py` — FastAPI Application Entrypoint

- Registers all 23 routers via `include_router()`
- Configures CORS (`localhost`, `crime-intel.vercel.app`)
- Attaches `RequestIDMiddleware` and `ActivityLoggingMiddleware`
- Registers all exception handlers (422, 401, 403, 404, 409, 429, 500)
- On startup: creates all DB tables, runs `migrate_db_schema()`, seeds 4 default RBAC users

---

### `models.py` — SQLAlchemy ORM Data Models

| Domain Group | Key Models |
|---|---|
| Core KSP FIR | `Case`, `CaseFIRDetails`, `CaseCategoryMaster`, `GravityOffenceMaster` |
| Legal & Prosecution | `Act`, `Section`, `ActSectionAssociation`, `ArrestSurrender`, `ChargesheetDetails` |
| Court & Units | `CourtMaster`, `UnitMaster`, `CaseStatusMaster` |
| People & Offenders | `Person`, `OffenderProfile`, `EmployeeMaster` |
| Financial Crime | `FinancialAccount`, `FinancialTransaction` |
| Sociological Insights | `ComplainantDetails`, `OccupationMaster`, `ReligionMaster`, `CasteMaster`, `DistrictIndicator` |
| AI Chat & RAG | `ChatSession`, `ChatMessage` |
| Governance & Audit | `User`, `AuditLog` |
| Collaboration | `CaseAssignment`, `CaseTask`, `CaseComment` |
| Citizen Reports | `CitizenReport` |
| Notifications | `Notification` |
| Activity History | `ActivityHistory` |
| Background Jobs | `BackgroundJob` |
| Workflows | `Workflow`, `WorkflowStep`, `WorkflowApproval` |
| AI Agent | `AgentRun`, `AgentToolCall`, `PendingAgentAction` |
| Investigation Labels | `CaseInvestigationHistory` |
| Career Plans | `CareerPlan` |

---

### `rag.py` — TF-IDF Retrieval-Augmented Generation Engine

Builds an **in-memory TF-IDF bi-gram vector index** over all case text on startup.

**4 Retrieval Strategies (merged and ranked by confidence):**

| Strategy | Trigger | Confidence |
|---|---|---|
| Direct Case ID regex | `CR-\d{4}-\d{4}` pattern in query | 1.0 |
| Phone number extraction | `+?\d[\d- ]{6,}` pattern in query | 0.95 |
| TF-IDF cosine similarity | Vector similarity over case text index | 0.5–0.9 |
| Synonym-expanded keyword fallback | Typo correction + crime synonym mapping | 0.3 |

Returns top `K=8` case chunks for LLM context assembly.  
**Statutory exclusion:** `religion_id` and `caste_id` are never indexed.

---

### `agent_loop.py` — Autonomous AI Agent Execution Loop

- Multi-step tool-use execution loop (max 6 iterations per query)
- Reads LLM tool-use JSON responses and dispatches to `agent_tools.py`
- On **write tool call**: halts execution, creates `PendingAgentAction` record, returns approval request to frontend
- Logs every step to `AgentRun` + `AgentToolCall` tables for Observability

---

### `agent_tools.py` — Agent Tool Implementations

| Tool | Type | Description |
|---|---|---|
| `search_cases` | Read | Full-text + filter case search |
| `get_case_detail` | Read | Complete case file retrieval |
| `get_network_graph` | Read | Person-case graph edges |
| `get_offender_risk` | Read | Risk score + breakdown for a person |
| `get_financial_trail` | Read | Bank account + transaction trail |
| `get_similar_cases` | Read | TF-IDF similarity search for related cases |
| `get_investigation_timeline` | Read | Full audit history for a case |
| `create_task` | **Write (human-gated)** | Create case task (requires officer approval) |
| `assign_case` | **Write (human-gated)** | Assign officer to case (requires officer approval) |
| `add_comment` | **Write (human-gated)** | Post case comment (requires officer approval) |

`sanitize_tool_output()` recursively strips `religion_id`, `caste_id`, `religion`, `caste` from all tool outputs before LLM or UI consumption.

---

### `middleware.py` — Request Middleware Stack

| Middleware / Handler | Purpose |
|---|---|
| `RequestIDMiddleware` | Injects unique UUID `x-request-id` header per request |
| `app_exception_handler` | Converts `AppException` subclasses → standardized JSON error response |
| `request_validation_exception_handler` | 422 Pydantic validation errors → structured JSON |
| `http_exception_handler` | Starlette HTTP errors → JSON format |
| `rate_limit_exception_handler` | `429 Too Many Requests` → JSON |
| `db_exception_handler` | SQLAlchemy errors → 500 JSON |
| `global_exception_handler` | Catch-all unhandled exceptions → 500 JSON |

---

### `activity_logger.py` — Centralized Activity Logging Middleware

- `ActivityLoggingMiddleware` intercepts **all mutating HTTP requests** (POST, PUT, PATCH, DELETE)
- Automatically creates `ActivityHistory` records with: user ID, module, activity type, status, metadata JSON
- Excludes health check and auth routes from logging

---

### `risk_gates.py` — Pre-Execution Validation & Risk Gates

All gates execute **before any business logic**:

| Gate | What it checks |
|---|---|
| `check_auth_gate` | Session validity, active account, role permissions |
| `check_entity_gate` | Case / report / task existence before updates |
| `check_idempotency_gate` | Duplicate case IDs, duplicate FIR crime numbers |
| `check_state_transition_gate` | Valid task status progressions (`todo → in_progress → done`) |
| `check_business_constraint_gate` | Future `incident_date`, invalid lat/long, negative transactions, self-transfers, admin self-deactivation |
| `check_report_export_gate` | Authorization check before PDF/HTML/CSV report generation |

---

### `errors.py` — Typed Exception Hierarchy

| Exception Class | HTTP Status | Use Case |
|---|---|---|
| `ValidationError` | 422 | Invalid input data |
| `AuthenticationError` | 401 | Missing or invalid JWT |
| `AuthorizationError` | 403 | Insufficient role permissions |
| `ResourceNotFoundError` | 404 | Entity not found |
| `ConflictError` | 409 | Duplicate resource or state conflict |
| `BusinessRuleError` | 400 | Business constraint violation |
| `RateLimitError` | 429 | Too many requests |
| `DatabaseError` | 500 | Database operation failure |
| `InternalServerError` | 500 | Unhandled server error |

---

### `auth.py` — JWT Authentication Module

- `hash_password()` / `verify_password()` — bcrypt hashing
- `create_access_token()` — signs JWT with `SECRET_KEY` env variable
- `get_current_user()` — FastAPI dependency; validates Bearer token + loads user from DB
- `get_token_data()` — extracts claims from JWT payload

---

### `llm.py` — LLM Client (Anthropic Claude)

- Wraps Anthropic Claude API calls with structured investigation prompts
- Assembles top-K retrieved case chunks into context prompt
- Falls back to clean TF-IDF RAG summary if `ANTHROPIC_API_KEY` is not configured
- Handles bilingual synthesis (English response + Kannada summary suffix)

---

### `websocket.py` — Real-Time WebSocket Notification Manager

- Maintains active WebSocket connections per user (`connection_manager` dict)
- `broadcast_to_user(user_id, event)` — sends real-time events to a specific user's connected devices
- `broadcast_all(event)` — broadcasts to all connected users (district trend alerts)
- RBAC scoping: `viewer` role excluded from high-severity/investigation alerts
- Deduplication: suppresses duplicate alert broadcasts within 60-second window

---

### `proactive_agent.py` — Background Proactive Case Analysis Worker

- Triggered **asynchronously** upon creation of `high` or `critical` severity cases
- Executes multi-tool investigative sequence: `search_cases` → `get_network_graph` → `get_offender_risk`
- Posts a structured 3-paragraph AI-authored analysis as a case comment (`is_ai_authored=True`)
- Broadcasts `ai_case_analysis` WebSocket notification to all assigned officers on the case

---

### `workflow_engine.py` — AI Workflow Execution Engine

- Parses natural language workflow instructions into ordered execution step plans
- Classifies each step by risk level: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- Executes LOW/MEDIUM risk steps automatically without interruption
- Halts at HIGH/CRITICAL steps → creates `WorkflowApproval` record for human review
- Persists full workflow state across server restarts
- Resumes from the exact paused step upon officer approval

---

### `job_runner.py` — Background Job Worker with Exponential Retry

- Polls `BackgroundJob` table for `QUEUED` jobs
- Executes jobs in background threads (non-blocking, no request timeout)
- **Exponential backoff retry on transient failures:**
  - `QUEUED → RUNNING → RETRYING → COMPLETED`
  - Immediate halt on non-recoverable errors (validation/auth failures) — no wasted cycles
- Updates job `progress`, `logs`, and `output_path` columns in real-time during execution

---

### `observability.py` — Agent Run Instrumentation Module

- Records each `AgentRun` with: session ID, query text, total tokens consumed, duration, step count
- Records each `AgentToolCall` with: tool name, input args, sanitized output, latency, success flag
- Aggregates tool performance stats: call frequency, average latency per tool, error rate

---

### `database.py` — Database Connection Management

- SQLAlchemy `create_engine` configured via `DATABASE_URL` environment variable
- Supports `sqlite:///./crime_intel.db` (development/Vercel) and `postgresql://...` (production)
- `get_db()` — FastAPI dependency for scoped session injection per request

---

### `limiter.py` — Rate Limiter Configuration

- `slowapi` limiter instance
- `RATE_CHAT = "30/minute"` applied to all AI chat endpoints
- `RATE_LOGIN = "10/minute"` applied to auth login endpoint

---

### `logger.py` — Structured Logging

- Structured log output with `x-request-id` correlation per request
- Auto-redacts sensitive fields from all log outputs: `password`, `token`, `secret`, `caste_id`, `religion_id`

---

### `schemas.py` — Pydantic Request/Response Schemas

- 80+ Pydantic v2 schema classes for all request bodies and API response models
- Covers: Cases, FIR Details, Persons, Offenders, Financial, Chat, Agent Actions, Workflows, Jobs, Career Plans, Citizen Reports, Activity History, etc.
- Input validation enforced at the API boundary before any business logic executes

---

## 🧪 Test Suite

All tests live in `backend/tests/`. Run with:

```bash
cd backend
python -m pytest tests/ -v
```

**Total: 104 unit & integration tests — 100% pass rate**

| Test File | What It Tests | Test Count |
|---|---|---|
| `test_auth.py` | Login, JWT validation, role authentication | 4 |
| `test_cases.py` | Case CRUD, search, filter combinations | 5 |
| `test_investigation_labels.py` | Label assignment, review history, RBAC gates | 8 |
| `test_role_filters.py` | Role-scoped case list queries (6 scope types) | 7 |
| `test_report_export.py` | PDF/HTML/CSV generation, risk gate authorization | 9 |
| `test_collaboration.py` | Assignments, tasks, comments, my-work queries | 10 |
| `test_notifications.py` | WebSocket triggers, RBAC scoping, deduplication | 8 |
| `test_activity_history.py` | Middleware interception, search, filter queries | 9 |
| `test_background_jobs.py` | Job queue, exponential retry engine, cancel | 10 |
| `test_workflows.py` | Workflow creation, step execution, approval gates | 9 |
| `test_observability.py` | Agent run recording, tool performance stats | 9 |
| `test_agent.py` | Agent loop, tool dispatch, write action human gates | 8 |
| `test_citizen_reports.py` | Public submission, verify, reject, idempotency | 6 |
| `test_career_plans.py` | Search, filter chips, CRUD operations | 7 |
| `test_validation_and_risk_gates.py` | All 5 risk gate categories end-to-end | 9 |
| `test_sprint2.py` | Sprint 2 integration scenarios | 5 |
| `test_sprint3.py` | Sprint 3 integration scenarios | 4 |
| `test_sprint4.py` | Sprint 4 integration scenarios | 3 |
| `test_chat.py` | RAG pipeline, session management | 2 |
| `test_export.py` | Export endpoint basic validation | 2 |
| `test_admin.py` | Admin user management CRUD | 3 |
| `test_notifications.py` | Real-time notification dispatch | 8 |

---

## 🗺️ Route Map Quick Reference

| URL | Page | Auth Required | Min Role |
|---|---|---|---|
| `/login` | Login | ❌ Public | — |
| `/report-crime` | Citizen Report Submission | ❌ Public | — |
| `/` | Dashboard | ✅ | viewer |
| `/cases` | Case Search & List | ✅ | viewer |
| `/cases/:id` | Case Detail | ✅ | viewer |
| `/map` | Crime Hotspot Map | ✅ | viewer |
| `/network` | Criminal Network Graph | ✅ | analyst |
| `/assistant` | AI Research Desk | ✅ | investigator |
| `/my-work` | Officer Personal Workspace | ✅ | viewer |
| `/offenders` | Offender Profile Directory | ✅ | analyst |
| `/insights` | Socio-Demographic Analytics | ✅ | analyst |
| `/audit` | Audit Trail | ✅ | admin |
| `/activity` | Activity History | ✅ | investigator |
| `/jobs` | Background Job Center | ✅ | investigator |
| `/observability` | AI Agent Observability Desk | ✅ | analyst |
| `/workflows` | Automated Workflow Center | ✅ | investigator |
| `/citizen-reports` | Citizen Reports Admin Queue | ✅ | investigator |
| `/import` | CSV Bulk Import | ✅ | analyst |
| `/admin` | User Management Console | ✅ | admin |
| `/career-plans` | Career Plans Repository | ✅ | viewer |

---

*Source: `frontend/src/pages/`, `frontend/src/components/`, `backend/app/routers/`, `backend/app/*.py`*  
*CrimeIntel v1.0 — Live: https://crime-intel.vercel.app | API Docs: https://crime-intel.vercel.app/api/docs*
