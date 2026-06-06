# AirSENS — Complete Master Documentation

**Version:** 3.0 (June 2026) — Full Merge: Technical + Strategic + Roadmap
**Product:** AirSENS — Aviation Maintenance & Sustainment Platform
**Company:** Karib Aerospace Ltd, 4 Preston Road, Brighton, England BN1 4QF
**Contact:** karib.aerospace@outlook.com | UK: +44 7512 549 068 | US: +1 217 848 2193
**Company House No.:** 14231476
**Live URL:** https://airsens-karib-l8n2.vercel.app
**Repository:** https://github.com/airsens/airsens-karib (public)
**Codebase:** ~5,200 lines of production TypeScript/React

---

## Table of Contents

1. [What is AirSENS?](#1-what-is-airsens)
2. [Vision & Market Position](#2-vision--market-position)
3. [Who It's For](#3-whos-for)
4. [Technology Stack — Current](#4-technology-stack--current)
5. [Project Structure](#5-project-structure)
6. [Data Architecture](#6-data-architecture)
7. [Authentication & Access Control](#7-authentication--access-control)
8. [Navigation Modules — Full Technical Detail](#8-navigation-modules--full-technical-detail)
9. [Administration Layer](#9-administration-layer)
10. [SENS AI Assistant](#10-sens-ai-assistant)
11. [Core Engineering Engines](#11-core-engineering-engines)
12. [State Management & Store](#12-state-management--store)
13. [UI Component System](#13-ui-component-system)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)
15. [Demo Accounts](#15-demo-accounts)
16. [Competitive Analysis](#16-competitive-analysis)
17. [Master Roadmap — All 5 Phases](#17-master-roadmap--all-5-phases)
18. [Scale Architecture — 1,000–3,000 Customers](#18-scale-architecture--10003000-customers)
19. [Business Model & Pricing](#19-business-model--pricing)

---

## 1. What is AirSENS?

AirSENS is a **web-based Aviation Maintenance & Sustainment platform** built by Karib Aerospace Ltd.
It unifies Continuing Airworthiness Management Organisation (CAMO) functions, MRO (Maintenance,
Repair & Overhaul) execution, and advanced engineering analytics into a single system accessible
from any device, anywhere in the world.

The core purpose: give aviation operators a **single source of truth** for their entire
airworthiness picture — who did what, when, what is due, what is defective, what it costs,
and whether the structural and operational envelope is being respected.

**AirSENS is being built for public launch targeting 1,000 to 3,000 operator customers worldwide.**

---

## 2. Vision & Market Position

### The Problem with Today's Market

Every competitor — SAM (ASA), Blue Eye (MRX), OASES, Aerotrac, Traxxall, Ramco —
shares the same fundamental weaknesses:

| Market weakness | AirSENS solution |
|---|---|
| Windows-era desktop UIs (look like 2008) | Modern real-time cockpit-style web interface |
| Months to implement, huge onboarding cost | Self-onboard in under one hour |
| No real mobile support | Fully responsive, mobile-first from day one |
| No AI (OASES launched basic doc search 2024) | SENS reads live fleet data, answers operational questions |
| No structural fatigue modelling at operator level | Proprietary SFI engine (Promise Benebo's model) |
| No Amplification Factor concept anywhere | Unique AF engine links operations to maintenance cost |
| Ignores Caribbean, African, Middle East operators | Built specifically for this underserved market |
| Opaque "call for quote" pricing | Transparent self-service SaaS plans |
| £500–2,000/month per aircraft | Flat-rate operator pricing |

### What AirSENS Owns That Nobody Else Has

1. **Amplification Factor Engine** — Models how operational loading choices amplify
   structural fatigue and maintenance cost. Nobody in the market has this concept at all.

2. **Structural Fatigue Index (SFI)** — Promise Benebo's engineering model: load-path
   classification (Primary 3× / Secondary 1.5× / Tertiary 0.5×), WFD threshold monitoring
   at 6, 12 and 200 primary repairs, derived inspection intervals per repair. No competitor
   offers this depth for small operators.

3. **SENS AI that reads live fleet data** — OASES has keyword document search. SENS actually
   knows your fleet, reads real numbers, answers operational questions in plain English.

4. **Caribbean / African / Middle East market focus** — Every competitor ignores this market.
   AirSENS is the only platform purpose-built for these operators.

5. **Instant self-onboarding** — Competitors take weeks to implement. AirSENS gets an
   operator running in under one hour.

6. **Two-tier platform architecture** — Rilwan and Promise manage all client organisations
   via the Control Tower. No competitor offers this multi-tenant SaaS model.

7. **Dispatch Risk Score (Phase 4)** — A single 0-100 number per aircraft per day combining
   maintenance status, open defects, SFI, AF value, crew currency and weather severity.
   Nobody has this for small operators anywhere in the world.

8. **SSID / ASIP / CPCP / FAR 26 compliance tracking** — Full regulatory programme
   management built in, not bolted on.

---

## 3. Who It's For

**Platform Owners — Tier 1 (Karib Aerospace)**
- Rilwan Olowu — COO / Co-Founder
- Promise Benebo — Founder / CEO
- Full Control Tower: all organisations, all users, all analytics, all audit trails

**Org Admins — Tier 2 (per client company, 1–3 people)**
- Trusted senior staff at each operator
- Manages their engineers and module permissions
- Sees only their own organisation's data
- Cannot exceed user/aircraft quotas set by Karib Aerospace

**Engineers — Tier 3**
- Licensed engineers (B1, B2, C category etc.)
- Access limited to modules assigned by their org admin
- Log flights, raise defects, manage work orders

**Pilots — Tier 4 (Phase 1 addition)**
- Simplified mobile view: only their aircraft, current MEL, defect raise, sector sign-off
- No engineering modules

**Viewers — Tier 5**
- Quality auditors, accountants, management — read-only

---

## 4. Technology Stack — Current

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend | React | 18.3.1 | Component-based UI |
| Language | TypeScript | 5.5.4 | Type safety across entire codebase |
| Build tool | Vite | 5.4.6 | Fast dev server and production builds |
| Routing | React Router DOM | 6.26.2 | Client-side navigation with guards |
| Charts | Recharts | 2.12.7 | All data visualisations |
| Icons | Lucide React | 0.445.0 | Consistent icon system |
| Animation | Framer Motion | 11.5.4 | Page transitions and animations |
| Date utilities | date-fns | 3.6.0 | Date formatting and calculations |
| CSS utilities | clsx | 2.1.1 | Conditional class composition |
| Hosting | Vercel (Hobby) | — | Auto-deploy from GitHub push |
| Repository | GitHub | — | airsens/airsens-karib (public) |

**Current persistence:** Browser `localStorage` (key: `airsens.state.v1`).
**Backend swap point:** `src/context/store.tsx` — the `load()` and `persist()` functions only.

---

## 5. Project Structure

```
airsens_karib_pkg/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx                     # Root — login gate, route definitions, all guards
│   ├── main.tsx                    # Entry — mounts StoreProvider + ToastProvider
│   │
│   ├── components/
│   │   ├── Layout.tsx              # Sidebar, topbar, global search (keyboard nav),
│   │   │                           # notification bell (portal-based, bellPanelRef fix),
│   │   │                           # user widget wired to currentUser
│   │   ├── Toast.tsx               # Global toast system — useToast() hook
│   │   └── ui.tsx                  # PageHeader, KpiCard, StatusBadge, Bar, PanelHead
│   │
│   ├── context/
│   │   └── store.tsx               # Central store — ALL mutable state, ALL actions,
│   │                               # SEED_VERSION auto-clear, org-scoped users,
│   │                               # localStorage persistence, backend swap point
│   │
│   ├── data/
│   │   ├── types.ts                # TypeScript interfaces for every domain entity
│   │   └── seed.ts                 # Deterministic demo data (PRNG seed 20260601)
│   │                               # SEED_VERSION = v5
│   │
│   ├── lib/
│   │   ├── amplification.ts        # Amplification Factor (AF) engine
│   │   ├── structural.ts           # Structural Fatigue Index (SFI) engine
│   │   │                           # Promise Benebo's engineering model
│   │   └── exports.ts              # downloadCsv() + printPdf() utilities
│   │
│   ├── modules/
│   │   ├── Login.tsx               # Login — split screen, demo fills, company footer
│   │   ├── Dashboard.tsx           # Command Deck — KPIs, charts, priority tables
│   │   ├── AircraftModule.tsx      # Fleet register — auto-opens drawer from search
│   │   ├── LogFlight.tsx           # Log Flight drawer — rolls hours everywhere
│   │   ├── RaiseDefect.tsx         # Raise Defect — auto MEL classification
│   │   ├── ComponentsModule.tsx    # Component tree and life tracking
│   │   ├── FleetPlanningModule.tsx # Gantt maintenance forecast (new Date() not hardcoded)
│   │   ├── ReliabilityModule.tsx   # Reliability analytics + CSV/PDF export
│   │   ├── WorkOrdersModule.tsx    # Kanban + store-persisted drag + New WO + exports
│   │   ├── AmplificationModule.tsx # AF engine interactive UI with 10-yr cost chart
│   │   ├── EngineeringModules.tsx  # Configuration (wired selector) + Structural SFI
│   │   │                           # + Ageing (SSID/ASIP/CPCP/FAR26 full compliance)
│   │   ├── TableModules.tsx        # AD/SB + MEL (live defects, search highlight)
│   │   │                           # + Inventory + Logbook + AMP + Tools + Sales
│   │   │                           # All with CSV and PDF exports
│   │   ├── AIAssistant.tsx         # SENS AI — live fleet data + mailto escalation
│   │   ├── AdminPanel.tsx          # Org users + permission matrix + quota enforcement
│   │   └── ControlTower.tsx        # Platform owner panel — Rilwan & Promise only
│   │
│   └── styles/
│       └── global.css              # Design tokens, layout utilities, responsive grids
│                                   # .grid-2col/.grid-3col/.grid-chart stack at ≤700px
│
├── vercel.json                     # SPA routing — all paths serve index.html
├── vite.config.ts                  # port 5173, allowedHosts: all + .trycloudflare.com
├── package.json                    # build: "vite build" (tsc removed for Vercel compat)
├── AIRSENS_DOCUMENTATION.md        # This document
└── SESSION_STATE.md                # Dev session continuity notes
```

---

## 6. Data Architecture

### Domain Entities (`src/data/types.ts`)

**`Aircraft`**
Registration, model, variant, MSN, owner, base (ICAO), status (airworthy/due-soon/overdue/aog),
totalHours, totalCycles, lastFlight, nextCheck (type/dueDate/dueHours), utilizationDaily,
yearOfMfg, engines count, defectsOpen, melActive, maintProgram (MaintTask[]).

**`Engine`**
id, aircraftId, position (1/2...), model, sn, hours, cycles, tbo, sinceOverhaul.
Multiple per aircraft. Hours/cycles roll up automatically when flight is logged.

**`Component`**
id, aircraftId, parentId (hierarchical tree), name, pn, sn, category (rotable/fixed/consumable),
lifeLimit, tbo, sinceOverhaul, sinceNew, installedHours, status.
Auto-advances on every flight log via store action.

**`WorkOrder`**
id, wo (e.g. WO-26-1004), title, aircraftId, type (scheduled/unscheduled/ad-sb/mod),
priority (low/med/high/aog), state (backlog/planned/in-progress/qa/closed),
manHoursEst, manHoursActual, assignee, zone, openedDate, dueDate, tasks, tasksDone.

**`FlightLog`**
id, date, aircraftId, from, to, blockHours, cycles, engineHours, engineCycles,
payloadKg, loadFactor, loggedBy. Immutable after creation.

**`Defect`**
id, aircraftId, ata, description, severity (minor/major/critical), safetyCritical (bool),
melCategory (A/B/C/D/null), raisedDate, dueDate, status (open/deferred/closed),
melRef, reportedBy, closedDate.

**`MELItem`** — MEL master list (regulatory reference lookup, separate from live defects).

**`ADSB`** — ref, kind (AD/SB), subject, authority, classification, effectiveDate,
status, compliance (% fleet complied).

**`InventoryItem`** — pn, description, category, qty, minQty, location, unitCost, shelfLifeDate.

**`User`**
id, name, title, email, password (demo only — hashed server-side in production),
role (superadmin/org-admin/engineer/viewer), orgId, licenseNo, active, createdAt,
permissions: Record<ModuleKey, Permission[]>.

**`Organization`**
id, name, icaoPrefix, approvalRef, country, contactEmail,
plan (starter/professional/enterprise), status (active/suspended/pending), createdAt,
maxAdmins, maxUsers, maxAircraft (quotas set by Karib Aerospace), inviteSentAt,
activatedAt, notes (internal, not visible to org).

**`AuditEntry`** — id, ts, userId, userName, action, detail. Every action logged.

**`MaintTask`** — id, code (DAILY/WEEKLY/100HR/500HR/1000HR/5000HR/2000FC), label,
intervalType (hours/cycles/days), interval, lastDoneHours, lastDoneCycles, lastDoneDate.

**`StructuralRepair`** — id, location, ataZone, repairType, loadPath (primary/secondary/tertiary),
dtiCategory (A/B/C), cyclesAtRepair, corrosionInvolved, hardLandingRelated, dateLogged.

### Seed Data (`src/data/seed.ts`)

Deterministic PRNG (seed 20260601) — reproducible, realistic demo dataset:
- 14 aircraft, multiple models (ATR-72, B737, A320 etc.)
- 1–2 engines per aircraft with realistic hours/cycles
- Full maintenance program (7 tasks) per aircraft
- ~500 flight log entries (90 days of operations)
- 26 defects with auto MEL classification
- Component trees per aircraft
- AD/SBs, MEL master list, inventory items, work orders
- 5 seed users, 2 organisations

**`SEED_VERSION = 'v5'`** — Bump this whenever seed data changes.
On version mismatch localStorage auto-clears and fresh data loads. Zero manual resets needed.

---

## 7. Authentication & Access Control

### Current Implementation (localStorage/sessionStorage)
Email and password validated against seed users in store `login()` action.
Logged-in user stored in `sessionStorage` (`airsens.session.v1`) — survives page refresh,
cleared on browser tab close. Backend swap: replace `login()` action with API call
returning JWT, store token in sessionStorage.

### Role Hierarchy
```
superadmin  (Rilwan & Promise)
    └── Full access + Control Tower (invisible to all others)
        └── org-admin  (1–3 per client organisation)
               └── Full access to own org only, no other orgs
                   └── engineer
                          └── Only modules admin grants
                              └── viewer
                                     └── Read-only assigned modules
```

### Permission Levels (per module)
`view` → see module in sidebar and open it
`read` → see data inside module
`write` → create new records
`edit` → modify and delete existing records
Write/edit automatically include read and view.

### Permission Matrix
Admin Panel → Add/Edit User drawer has full 18-module × 4-permission toggle grid.
Write/edit granting auto-enables read+view. Admin users bypass matrix entirely.

### Org Isolation
`store.tsx` exposes `scopedUsers` — superadmins see all users, everyone else sees only
their own `orgId`. This is enforced at the JavaScript layer (Phase 2 moves it to
database row-level security, making it unbreakable).

### Route Guards
```tsx
<Guard mod="aircraft">        // checks can('aircraft', 'view')
<AdminGuard>                  // org-admin and superadmin
<SuperAdminGuard>             // superadmin only (Control Tower)
```
Failed guard shows clean "Access Restricted" message, not an error.

### Quota Enforcement
Org quotas (maxAdmins, maxUsers) set by Rilwan/Promise in Control Tower.
Admin Panel "Add Engineer" button disables at quota with tooltip:
"User limit reached (N). Contact AirSENS to upgrade."

---

## 8. Navigation Modules — Full Technical Detail

### 8.1 Command Deck (Dashboard) — `/`
**File:** `src/modules/Dashboard.tsx` | **Access:** `dashboard` view

KPI cards: Fleet Size, Open Work Orders (not closed), Open Defects (with critical count), MTBUR.

**Fleet Utilisation chart** — 30-day area chart of daily block hours. Data sorted by date
(`Object.entries(byDate).sort((a,b) => a[0].localeCompare(b[0])).slice(-30)`) so trend
is always chronologically accurate.

**Fleet Status panel** — bar chart: Airworthy / Due Soon / Overdue / AOG counts.

**Priority Aircraft table** — ordered by urgency (AOG first, overdue, due-soon).
Columns: Registration, Model, Next Check type + date, Hours remaining, Status badge.
Clicking a row navigates to `/aircraft`.

**Work Order Pipeline** — compact Kanban count by state, colour coded by priority.

All data live from store. Every action (flight logged, defect raised, WO created)
reflects immediately with no page refresh.

---

### 8.2 Aircraft — `/aircraft`
**File:** `src/modules/AircraftModule.tsx` | **Access:** `aircraft` view

Fleet register table. Columns: Registration, Model, Owner, Base (ICAO), Total Hrs,
Cycles, Next Check, Status.

**Status filter chips:** All / Airworthy / Due Soon / Overdue / AOG.

**Search integration:** Clicking an aircraft result in the global search auto-opens
its profile drawer via `useLocation()` reading `location.state.highlightId`.

**Aircraft Profile Drawer** (click any row):
- Status badge, owner, base, year of manufacture
- **Action buttons:**
  - "Log Flight / Hours" — requires `logbook` write permission
  - "Raise Defect" — requires `mel` write or `aircraft` write permission
  - Buttons disabled with tooltip if user lacks permission
- **Airframe stats:** total hours, cycles, daily utilisation, last flight
- **Engines:** each engine — model, S/N, hours, cycles
- **Maintenance Program countdowns:** all 7 tasks (DAILY/WEEKLY/100HR/500HR/1000HR/5000HR/2000FC)
  as colour-coded progress bars with remaining hours/cycles/days. Green > 25%, amber 10-25%, red < 10%
- **Open Work Orders** for this aircraft
- **Open Defects** with MEL category badges
- **Installed Components** (first 6 shown)

---

### 8.3 Log Flight / Hours — Drawer from Aircraft
**File:** `src/modules/LogFlight.tsx` | **Access:** `logbook` write

**Input fields:** Date, From (ICAO), To (ICAO), Block Hours, Landings/Cycles,
Payload (kg), Load Factor (%).

**Live rollup preview** — updates as you type block hours:
- Airframe: before → after (hours and cycles)
- Each engine: hours before → after

**On save, ALL of the following update in one atomic transaction:**
1. `aircraft.totalHours` += blockHours, `aircraft.totalCycles` += cycles
2. `aircraft.lastFlight` = date
3. Aircraft status recomputed from maintenance program margins
4. All engines: `hours` += blockHours, `cycles` += cycles, `sinceOverhaul` += blockHours
5. All installed components: `sinceOverhaul` += blockHours, `sinceNew` += blockHours,
   `installedHours` += blockHours
6. New FlightLog entry created with `loggedBy: currentUser.name`
7. Audit entry created

**This is the most important operational action in AirSENS.** Every maintenance threshold,
component life, and reliability metric depends on accurate flight logging. After Phase 1,
this will also auto-trigger Work Order creation when tasks drop below threshold.

---

### 8.4 Raise Defect — Drawer from Aircraft
**File:** `src/modules/RaiseDefect.tsx` | **Access:** `mel` write or `aircraft` write

**Input fields:** ATA Chapter dropdown (all standard chapters), Description (free text),
Severity (Minor / Major / Critical), Safety-Critical checkbox.

**Live MEL auto-classification** updates as you fill in the form:
- Safety-critical ticked → **Category A** (Immediate — aircraft grounded)
- Critical severity (not safety-critical) → **Category B** (3 days)
- Major severity → **Category C** (10 days)
- Minor severity → **Category D** (120 days)

**On save:**
1. Defect created with melCategory, dueDate (raised + interval), melRef, reportedBy
2. `aircraft.defectsOpen` incremented
3. If safetyCritical: `aircraft.status = 'aog'`
4. Defect appears live in MEL module
5. Notification bell count updates

**Closing a defect (MEL Rectify button):**
1. `defect.status = 'closed'`, `closedDate` set
2. `aircraft.defectsOpen` decremented
3. If no remaining Cat-A open defects: `aircraft.status = 'airworthy'` (AOG cleared)

---

### 8.5 Components — `/components`
**File:** `src/modules/ComponentsModule.tsx` | **Access:** `components` view

Aircraft selector → component tree with parent-child hierarchy.
Each component: P/N, S/N, category, time-since-overhaul bar (hours / TBO), status.
Hours auto-advance on every flight log — zero manual maintenance required.

---

### 8.6 Fleet Planning — `/fleet-planning`
**File:** `src/modules/FleetPlanningModule.tsx` | **Access:** `fleet-planning` view

Gantt-style 30/60/90-day maintenance forecast. Horizon toggle at top.
Today marker from `new Date()` (not hardcoded — bug fixed).
Each aircraft row shows check due date as coloured bar within selected horizon.
Green = plenty of time, amber = due within 15% of horizon, red = overdue or this week.

---

### 8.7 Logbook & Ops — `/logbook`
**File:** `src/modules/TableModules.tsx (LogbookModule)` | **Access:** `logbook` view

All flight records across the fleet. 30-day block hours trend chart (sorted chronologically).
Table: Date, Aircraft, Route, Block Hours, Cycles, Payload, Load Factor %, Logged By.

Flight entry note: directs users to Aircraft → Log Flight / Hours (not entered here directly).

**Exports:** CSV (full history, all columns with UTF-8 BOM for Excel) and PDF
(Karib letterhead, summary KPIs + last 40 entries formatted for print).

---

### 8.8 Maintenance Program — `/amp`
**File:** `src/modules/TableModules.tsx (AmpModule)` | **Access:** `amp` view

Approved Maintenance Programme reference — scheduled task hierarchy with compliance status.
"Assign Task" button (coming Phase 1) will link programme tasks to work orders.

---

### 8.9 AD / SB Tracking — `/adsb`
**File:** `src/modules/TableModules.tsx (AdSbModule)` | **Access:** `adsb` view

Kind filter (All / AD / SB). Table: Ref, Authority (EASA/FAA/OEM), Subject,
Classification (Mandatory/Recommended/Optional), Effective Date, Status, Fleet Compliance %.
Mandatory ADs highlighted.

**Exports:** CSV and PDF compliance report.

---

### 8.10 MEL (Minimum Equipment List) — `/mel`
**File:** `src/modules/TableModules.tsx (MelModule)` | **Access:** `mel` view

Live MEL items = open defects with melCategory (not a static list — driven by real defects).

**Category KPI cards:** Count of A (immediate), B (3 days), C (10 days), D (120 days).

**Table:** MEL Ref, ATA, Description, Category badge, Aircraft, Reported By,
Rectify By date (red if overdue).

**Search integration:** Clicking a defect in global search navigates here with
`location.state.highlightId` — matching row gets cyan background + "← from search" badge.

**Rectify button** (requires `mel` edit): closes defect, decrements defectsOpen,
clears AOG if last Cat-A item.

**Exports:** CSV and PDF — both suitable for authority dispatch records.

---

### 8.11 Reliability — `/reliability`
**File:** `src/modules/ReliabilityModule.tsx` | **Access:** `reliability` view

Computed from actual logged data — the more you log, the sharper it gets.

KPI cards: Dispatch Reliability %, Total Defects, Critical Defects, Tracked Components.

**Defects by ATA Chapter** — bar chart showing which systems generate the most defects.

**Defect trend** — weekly defect rate, last 12 weeks. Rising trend triggers programme
review recommendation.

**MTBUR by component family** — Mean Time Between Unscheduled Removals.

**Exports:**
- "Excel (CSV)" — real CSV download with UTF-8 BOM, opens directly in Excel
- "PDF Report" — opens styled print window with Karib letterhead, suitable for
  authority submission. Browser saves as PDF natively (no library needed).

---

### 8.12 Configuration — `/configuration`
**File:** `src/modules/EngineeringModules.tsx (ConfigurationModule)` | **Access:** `configuration` view

Aircraft selector (wired to `useState`, `ac` variable used throughout — no crash on empty fleet).
Timeline: As-Designed → As-Built → Modifications applied → As-Maintained.
Each step: date, description, state (locked/applied/current) with dot-and-line visual.

---

### 8.13 Work Orders — `/work-orders`
**File:** `src/modules/WorkOrdersModule.tsx` | **Access:** `work-orders` view

Five-column Kanban: Backlog → Planned → In Progress → QA/Sign-Off → Closed.

**Cards show:** WO number, title, aircraft, priority badge, assignee, zone,
hours (actual/estimated), task completion bar.

**Drag and drop** — persisted through store via `moveWorkOrder()` action (not local state —
fixes the bug where moves were lost on page refresh). Drag disabled without write permission.

**New Work Order drawer:** Aircraft (selector), Title, Type (Scheduled/Unscheduled/AD-SB/Mod),
Priority (Low/Med/High/AOG), Est. Man-Hours, Due Date, Assignee, Zone. Opens in Backlog.

**Exports:** CSV (open WOs, all columns) and PDF (formatted job list).

---

### 8.14 Inventory — `/inventory`
**File:** `src/modules/TableModules.tsx (InventoryModule)` | **Access:** `inventory` view

KPI: Total Parts, Low Stock count, Total Stock Value (USD).
Low-stock items highlighted. Reorder status flags.
**Exports:** CSV (full inventory with reorder flags) and PDF (stock report with value calc).

---

### 8.15 Tools & Manuals — `/tools-manuals`
**File:** `src/modules/TableModules.tsx (ToolsModule)` | **Access:** `tools-manuals` view
Reference library. Full document management added Phase 2.

---

### 8.16 Sales & Invoice — `/sales`
**File:** `src/modules/TableModules.tsx (SalesModule)` | **Access:** `sales` view
Quotation management. Full invoice builder added Phase 3.

---

### 8.17 Amplification Factor — `/amplification`
**File:** `src/modules/AmplificationModule.tsx` | **Access:** `amplification` view

**AirSENS's most unique proprietary feature. No competitor has this concept.**

Models how operational loading choices amplify structural fatigue, inspection frequency,
and total maintenance cost over the aircraft's life.

**Five input sliders:**
1. Payload Ratio (0–120% of max structural payload) — cubic stress relationship
2. Cycles per Day (landings/day)
3. Load Factor (0–100% capacity utilisation)
4. Environment Severity (1=benign inland, 5=harsh coastal/arctic)
5. Avg Sector Length (hours) — short sectors = more cycles per flight hour

**Output panel:**
- AF Value — the amplification multiplier (1.0 = baseline, up to ~3.0 = severe)
- Fatigue Index — composite 0–100 score
- Interval Tightening — how much to reduce inspection intervals (%)
- Cost Multiplier — lifecycle maintenance cost vs baseline
- Driver bar chart — which factor contributes most
- Band: Optimal / Elevated / High / Severe with recommendation text

**10-year cost projection chart** — baseline (4% annual escalation flat) vs projected
(AF compounding year over year). The gap between lines is the cost of operating choices.

**Structural modifier integration** — the SFI engine's `structuralAFModifier`
(1.0–2.0×) is applied to the AF result, linking structural condition to maintenance cost.

---

### 8.18 Structural (DTE/DTI) — `/structural`
**File:** `src/modules/EngineeringModules.tsx (StructuralModule)` | **Access:** `structural` view

**Promise Benebo's Structural Fatigue Index engine. Live and interactive.**
**The most technically sophisticated module in AirSENS and a major market differentiator.**

**Input controls:**
- Aircraft selector
- Environment Severity slider (1–5): Benign → Moderate → Significant → Harsh → Severe
- Hard Landing Events counter

**Load Path Classification — the engineering core:**
Every structural repair must be classified:
- **Primary** (3.0× weight) — main structural load bearing. Per Promise: "Primary load paths are
  critical. Once the primary one is affected, the fatigue index starts going up."
- **Secondary** (1.5× weight) — supporting structure, significant contribution
- **Tertiary** (0.5× weight) — minor/fairing structure, lowest criticality

**Fatigue Index Drivers (per Promise's model):**
1. Takeoffs and landings — normalised to 20,000 cycle reference life
2. Pressurisation cycles — approximately equal to landing cycles
3. Environment and corrosion — coastal salt, tropical heat, dust all accelerate fatigue
4. Hard landings — each event adds directly to the index
5. Repair accumulation — weighted by load path and DTI category. Per Promise:
   "The more repairs you have, they start to act as stress raisers — local increase in
   stress — and these repairs in various places can link up and break the entire thing up."

**WFD Threshold Monitoring:**
- 4+ primary repairs → monitoring begins
- 6+ primary repairs → WFD threshold crossed, warning banner appears
- 9+ primary repairs → elevated risk, enhanced NDT mandatory
- 12+ primary repairs → critical, immediate DTE review required
- 200+ primary repairs → catastrophic (per Promise: "the fatigue index starts to increase
  significantly"), full programme review mandatory

**Log Repair Drawer:**
Location, ATA Zone, Repair Type (Doubler/Crack stop/Bushing replace/Splice/Patch/
Modification/Corrosion blend), Load Path (visual selector with descriptions),
DTI Category (A/B/C), Corrosion flag, Hard Landing flag.
Index updates immediately on save.

**Four tabs:**
1. **Overview** — load path bar charts, engineering summary (total repairs, corrosion,
   hard landing, Cat-A count, structural AF modifier)
2. **Repairs** — full log table with delete capability
3. **Inspection Intervals** — derived per repair. Base interval reduced proportional to
   load path weight × DTI severity × current SFI. Red < 4,000FH, amber < 7,000FH, green ≥ 7,000FH
4. **Fatigue Drivers** — bar chart breakdown with model basis note

**Structural AF Modifier output:** `1 + (SFI/100)` → feeds Amplification Factor engine.
SFI 0 → modifier 1.0×. SFI 50 → 1.5×. SFI 100 → 2.0×.

---

### 8.19 Ageing Aircraft — `/ageing`
**File:** `src/modules/EngineeringModules.tsx (AgeingModule)` | **Access:** `ageing` view

**Full SSID / ASIP / CPCP / FAR 26 / EASA Part-26 compliance tracking.**

KPI cards: Oldest Airframe, Average Fleet Age, Aircraft over 15 years, Active Programmes.

**Structural Integrity Programmes (full detail):**

| Programme | Reference | Trigger age |
|---|---|---|
| SSID — Supplemental Structural Inspection Document | JAR 25.571 / FAR 25.571 | 12+ years |
| ASIP — Aircraft Structural Integrity Programme | EASA Part-26 / CS-26 | 10+ years |
| CPCP — Corrosion Prevention & Control Programme | AMC 20-20 / AMC4 CAMO.A.305(g) | 8+ years |
| FAR 26 / EASA Part-26 Compliance | Reg (EU) 2015/640 / 14 CFR Part 26 | All aircraft |
| WFD — Widespread Fatigue Damage Assessment | AMC 20-20 / CS 26.370 | 15+ years |
| RAP — Repair Assessment Programme | FAA AC 91-56 / EASA Part-26 | 10+ years |

Each programme card: name, regulatory reference, status indicator, live aircraft count,
full plain-English description of what it requires and why.

**Fleet by Age chart:** horizontal bar per aircraft, colour-coded green/amber/red.
Age computed dynamically from `new Date().getFullYear() - a.yearOfMfg`.
Aircraft over 12 years: "SSID required" badge. Over 15 years: "WFD review" badge.

**Programme Requirements by Age table:** what gets triggered at 8/10/12/15/20 years
with live count of how many fleet aircraft currently require each level.

---

## 9. Administration Layer

### 9.1 Admin Panel — `/admin`
**File:** `src/modules/AdminPanel.tsx` | **Access:** org-admin + superadmin

Org-admins see only their own users. Superadmins see all (via store scopedUsers).

**Live quota indicator** (top-right of page header):
`5/20 users · 1/3 admins` — updates in real time.

**Three tabs:**

**Users & Access:**
Full user table — name, title, email, role badge, license, active status.
Click row → Edit User drawer.
Delete button only for engineers/viewers (cannot delete admins — safety guard).
Add Engineer button disabled at quota limit.

**Add/Edit User Drawer:**
Name, title, email, password, role, license number, active toggle.
For engineers/viewers: permission matrix — 18 modules × 4 permission levels.
Toggle logic: write/edit auto-enables read+view; read auto-enables view.
Admin roles bypass matrix entirely.

**Audit Log:**
Every action logged: timestamp, user, action type, detail string.
"Reset Demo Data" button (superadmin only) — wipes localStorage, reloads seed,
bumps session to force re-login.

**Organization tab:**
Org name, ICAO prefix, approval reference, user count.

---

### 9.2 Control Tower — `/control-tower`
**File:** `src/modules/ControlTower.tsx` | **Access:** SUPERADMIN ONLY

**Completely invisible to all other users — does not appear in sidebar for anyone else.**

**Platform KPIs:** Total Organisations, Total Users (all orgs), Active Orgs, Audit Events.

**Organisations tab:**
Each org as expandable card. Collapsed: name, plan badge, status badge, live user/admin counts.

Expanded shows:
- **Quota bars** — Admins used/max, Users used/max with red at-limit indicator
- **Member list** — every user in org with role badge, title, email
- **Action buttons:**
  - Edit Quotas → org drawer (name, ICAO, email, country, approval ref, plan,
    maxAdmins, maxUsers, maxAircraft, internal notes)
  - Activate / Suspend toggle (colour changes status badge across platform)
  - Send Invite → opens email client pre-filled with onboarding email to org contact
  - Remove → confirmation required (ORG1 — Karib Aerospace — is protected)

**All Users tab:**
Every single user across every organisation in one table.
Name, title, org (badge), role, email, status. Org-admins cannot see this view.

**Analytics tab:**
Plan distribution bars (Starter/Professional/Enterprise).
User role breakdown bars (Superadmin/Org-Admin/Engineer/Viewer).
Org capacity table — quota utilisation per organisation.

**Audit Trail tab:**
Full platform-wide audit log — every action by every user in every organisation.

---

## 10. SENS AI Assistant

**File:** `src/modules/AIAssistant.tsx`
**Mounted:** Always visible (bottom-right floating cyan button) when logged in.

**Current implementation:** Rule-based engine reading live store data.
No API call needed. Works offline. Works on any device.

**What SENS knows and answers:**
- Live fleet: AOG count, fleet size, open defects, open WOs, due-soon checks
- How every module works and step-by-step instructions
- MEL categories (A/B/C/D) with rectification windows
- The Amplification Factor engine and how to interpret results
- How flight logging works and what it affects
- Permission and role management
- Component life tracking
- AD/SB compliance
- Reliability analysis interpretation
- How to reset demo data
- WFD and structural fatigue concepts

**Escalation path:**
When SENS cannot answer → offers "Email support" button →
opens email client to `karib.aerospace@outlook.com` with question pre-filled in body.

**Suggestion chips** appear on first open for common questions.

**Phase 4 upgrade (full Claude API):**
Server-side Node.js proxy → Anthropic API key never in frontend code.
SENS reads entire org dataset. Answers complex analytical questions.
Generates draft MEL submissions, defect narratives, maintenance reports.
Multi-language support (critical for Caribbean/African market).
Voice input on mobile.
Proactive alerts: "J7-EMG MTBUR trending down 18% — recommend early hydraulic inspection."

---

## 11. Core Engineering Engines

### 11.1 Amplification Factor Engine (`src/lib/amplification.ts`)

```typescript
computeAF(inputs: AFInputs): AFResult
projectCostCurve(af: number, years: number, baseAnnual: number): CostPoint[]
```

**Mathematical model:**
```
payloadTerm  = payloadRatio ^ 2.4          (super-linear — stress concentration proxy)
cycleTerm    = 0.6 + 0.9 × (cyclesPerDay / refCycles)
loadTerm     = 0.7 + 0.6 × loadFactor
envTerm      = 1 + (envSeverity - 1) × 0.14
raw          = payloadTerm × cycleTerm × loadTerm × envTerm
ratio        = raw / baseline
AF           = (1 + log₂(max(ratio,1)) × 0.62) × structuralFatigueModifier
```

`structuralFatigueModifier` (optional input, default 1.0) — receives SFI engine output,
linking structural condition directly to maintenance cost modelling.

`projectCostCurve` — generates 10-year annual and cumulative cost arrays:
baseline (standard 4% escalation) vs projected (AF compounding). Used for cost chart.

**Outputs:** AF value, fatigue index (0-100), interval adjustment %, cost multiplier,
driver attribution (% contribution per factor), recommendation text, band
(optimal/elevated/high/severe).

### 11.2 Structural Fatigue Index Engine (`src/lib/structural.ts`)

Promise Benebo's proprietary model:

```typescript
computeSFI(inputs: SFIInputs): SFIResult
demoRepairs: StructuralRepair[]     // 6 realistic demo repairs
```

**Mathematical model:**
```
cycleTerm       = min((totalCycles / 20000) × 25, 25)
pressTerm       = min((pressureCycles / 20000) × 10, 10)
envTerm         = (envSeverity - 1) × 3 + corrosionRepairs × 0.8
hardLandingTerm = min(hardLandingCount × 1.5, 10)
repairTerm      = Σ(loadPathWeight[r] × dtiSeverity[r] × 0.8) for each repair
wfdAmplifier    = 1 + log₂(max(primaryRepairs - 6 + 1, 1)) × 0.6  if primary ≥ 6
SFI             = min(100, round((cycleTerm + pressTerm + envTerm
                                  + hardLandingTerm + repairTerm) × wfdAmplifier))
```

Load path weights: Primary 3.0×, Secondary 1.5×, Tertiary 0.5×
DTI severity: Cat A 2.5×, Cat B 1.5×, Cat C 1.0×
WFD thresholds: 6 (monitoring), 9 (elevated), 12 (critical), 200 (catastrophic)
200+ rule per Promise: "if you have more than 200 repairs in your primary load path,
the fatigue index starts to increase significantly"

**Derived inspection interval formula per repair:**
```
reduction = loadPathWeight × dtiSeverity × (0.15 + (SFI/100) × 0.25)
intervalFH = round(12000 × (1 - min(reduction, 0.7)))
intervalFC = round(8000 × (1 - min(reduction, 0.7)))
```

**Structural AF modifier output:** `1 + (SFI / 100)` → fed into AF engine.

**Exported types:** `LoadPath`, `DTICategory`, `RepairType`, `StructuralRepair`,
`SFIInputs`, `SFIResult`.

### 11.3 Export Utilities (`src/lib/exports.ts`)

```typescript
downloadCsv(rows: (string|number|null|undefined)[][], filename: string): void
printPdf(title: string, sections: { heading: string; html: string }[]): void
```

`downloadCsv` — creates Blob with UTF-8 BOM (`\uFEFF` prefix for Excel compatibility),
triggers browser download with dated filename.

`printPdf` — opens new window with full branded print layout:
- Karib Aerospace letterhead with logo area, document title, date
- "Confidential — Internal Use Only" footer
- Colour-coded badges (red/amber/green/blue per status)
- KPI grid layout for summary metrics
- Formatted tables with alternating row shading
- "Print / Save as PDF" button — browser handles PDF generation natively
- `@media print` rules for clean A4 output

Used in: Reliability, Work Orders, MEL, Logbook, Inventory, AD/SB.

---

## 12. State Management & Store

**File:** `src/context/store.tsx`

**The single most important file in AirSENS.**
Holds all mutable state. Persists to localStorage. Exposes all actions.
The SOLE swap point for moving to a real backend.

### State Shape
```typescript
{
  aircraft: Aircraft[]
  engines: Engine[]
  flightLogs: FlightLog[]
  defects: Defect[]
  mel: MELItem[]
  workOrders: WorkOrder[]
  components: Component[]
  users: User[]
  organizations: Organization[]
  audit: AuditEntry[]
}
```

### All Actions

| Action | What it does |
|---|---|
| `login(email, password)` | Validates, sets currentUser in sessionStorage |
| `logout()` | Clears currentUser and session |
| `can(module, permission)` | Returns true/false — every guard and button uses this |
| `logFlight(entry)` | Rolls hours into aircraft + engines + all components, recomputes status from maintProgram margins |
| `raiseDefect(defect)` | Creates defect, auto-MEL category, optionally AOGs aircraft, increments defectsOpen |
| `closeDefect(id)` | Closes defect, decrements defectsOpen, clears AOG if last Cat-A |
| `createWorkOrder(wo)` | Creates WO in Backlog with sequential WO-26-NNNN number |
| `moveWorkOrder(id, state)` | Moves WO between Kanban columns, persisted to store |
| `addUser(user)` | Creates user with generated ID, logs audit |
| `updateUser(id, patch)` | Partial update, logs audit |
| `removeUser(id)` | Removes user (cannot remove yourself), logs audit |
| `addOrganization(org)` | Creates org with generated ID, logs audit |
| `updateOrganization(id, patch)` | Partial update (quotas, status etc.), logs audit |
| `removeOrganization(id)` | Removes org (ORG1 protected), logs audit |
| `resetData()` | Wipes localStorage, reloads from seed, logs audit |

### SEED_VERSION System
```typescript
const SEED_VERSION = 'v5';
const SEED_VERSION_KEY = 'airsens.seed.version';
// In load(): if saved version !== SEED_VERSION, clear localStorage and return freshState()
```
Bump `SEED_VERSION` whenever seed data changes. Every user's browser auto-clears and
loads fresh data on next visit. Zero manual resets ever needed.

### Audit System
```typescript
const currentUserRef = useRef(currentUser);
useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
const audit = useCallback((action: string, detail: string) => { ... }, []);
// Uses ref pattern — always current user, always stable function reference
```

### Backend Swap (Phase 2)
Replace these two things in `store.tsx`:
```typescript
// CURRENT
function load(): State { return JSON.parse(localStorage.getItem(KEY)) ?? freshState() }
useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)) }, [state])

// REPLACE WITH
async function load(): State { return await api.get('/state') }
// + dispatch API calls in each action (login, logFlight, raiseDefect etc.)
```
**Everything else in the application stays identical.**

---

## 13. UI Component System

### Design Tokens (`src/styles/global.css`)

```css
--bg-void        #03050b    deepest background
--bg-deep        #05070d    sidebar, page background
--bg-panel       #080b14    cards and panels
--bg-panel-2     #0a0e1a    slightly raised panels
--bg-elevated    #0d1220    raised elements, hover states
--line           rgba(255,255,255,.06)   subtle borders
--line-bright    rgba(255,255,255,.12)   visible borders
--cyan           #2fe6e0    primary accent — AirSENS brand
--cyan-dim       #1fb8b3    secondary cyan
--cyan-glow      rgba(47,230,224,.25)   glow effect
--amber          #ffb02e    warnings, due-soon
--red            #ff4d5e    alerts, AOG
--green          #3ad27a    airworthy, success
--blue           #4d8fff    info, secondary
--violet         #8b5cf6    user avatars, accents
--text-hi        rgba(255,255,255,.95)  primary text
--text           rgba(255,255,255,.75)  body text
--text-dim       rgba(255,255,255,.45)  secondary text
--font-sans      'Sora', sans-serif
--font-mono      'JetBrains Mono', monospace
--sidebar-w      248px
--topbar-h       60px
--radius         12px
```

### Shared Components (`src/components/ui.tsx`)

**`PageHeader`** — eyebrow (e.g. "CAMO · Fleet"), title, subtitle, optional actions slot.

**`KpiCard`** — label, large value, sub-label, accent colour, icon, staggered fade-up
animation via `delay` prop (0/60/120/180ms for 4-card grids).

**`StatusBadge`** — coloured badge for airworthiness status. Airworthy = green dot.
Due Soon = amber. Overdue = red. AOG = pulsing red dot.

**`Bar`** — horizontal progress bar. `value`, `max`, `color` props.

**`PanelHead`** — panel title row with icon, title, optional right-side content.

### Responsive Grid Utilities

```css
.grid-2col    { display: grid; grid-template-columns: 1fr 1fr; }
.grid-3col    { display: grid; grid-template-columns: 1fr 1fr 1fr; }
.grid-chart   { display: grid; grid-template-columns: 2fr 1fr; }
.grid-chart-alt { display: grid; grid-template-columns: 1.4fr 1fr; }

@media (max-width: 700px) {
  .grid-2col, .grid-3col, .grid-chart, .grid-chart-alt {
    grid-template-columns: 1fr !important;
  }
}
```

### Global Search (`src/components/Layout.tsx`)

- Minimum 2 characters to activate (avoids noise from single letters)
- **Searches:** aircraft (reg/model/MSN/owner), work orders (WO number/title/assignee),
  components (P/N/S/N/name), defects (description/ATA/MEL ref/reporter), inventory (P/N/description)
- **Colour-coded by type:** Aircraft=cyan, Defect=red, WO=amber, Component=blue, Part=green
- **Status badges inline:** 🔴 AOG, 🟠 High/Overdue, Low Stock
- **Keyboard navigation:** ↑↓ arrows move selection, Enter jumps, Esc clears and closes
- **Aircraft result** → auto-opens profile drawer via `useLocation()` + `highlightId` state
- **Defect result** → highlights MEL row in cyan with "← from search" badge
- Portal-based (document.body) — `z-index: 9999`, escapes all stacking contexts

### Notification Bell (`src/components/Layout.tsx`)

- Portal-based (document.body) with `bellPanelRef` attached to panel div
- Outside-click handler excludes BOTH `bellBtnRef` AND `bellPanelRef` — this was the
  critical bug: mousedown was firing before onClick, closing panel before navigation ran
- `window.location.assign(n.to)` for reliable navigation from portal context
- Children have `pointerEvents: 'none'` so clicks bubble to parent div onClick
- Shows: AOG aircraft, overdue MEL items, due-soon checks, low-stock parts
- Count badge on bell with red glow

### Toast System (`src/components/Toast.tsx`)

```typescript
const { push } = useToast();
push('message', 'success');  // green checkmark
push('message');             // cyan info icon (default)
```
`ToastProvider` wraps app in `main.tsx`. Auto-dismisses after 3.6 seconds.
Stacks multiple toasts. Manual dismiss via ✕ button.

---

## 14. Deployment & Infrastructure

**Repository:** https://github.com/airsens/airsens-karib (public)
**Hosting:** Vercel Hobby — auto-deploy on every git push to main
**Live URL:** https://airsens-karib-l8n2.vercel.app
**SPA routing:** `vercel.json` rewrites all paths to `index.html` (prevents 404 on direct URL)
**Build command:** `vite build` (tsc removed — TypeScript checked by IDE, not build pipeline)

### Deploy Workflow (every time)
```powershell
cd C:\Users\...\airsens_karib_pkg
git add .
git commit -m "description of what changed"
git push
# Vercel auto-deploys in ~45 seconds. Live URL updates instantly.
```

### New Machine Setup
```powershell
# Install: Node.js LTS (nodejs.org) + Git (git-scm.com)
# Then:
cd Documents
git clone https://airsens:YOUR_TOKEN@github.com/airsens/airsens-karib.git airsens_karib_pkg
cd airsens_karib_pkg
npm install
npm run dev    # optional — only needed for local testing
```

### Git Identity (new machine, one-time)
```powershell
git config --global user.email "rilwan.olowu@karib-aerospace.com"
git config --global user.name "Rilwan Olowu"
```

### Cloudflare Tunnel (for sharing demos)
```powershell
# Terminal 1 — app running locally
npm run dev

# Terminal 2 — public tunnel
cloudflared tunnel --url http://localhost:5173
# Gives: https://random-words.trycloudflare.com — share this URL
```

### vite.config.ts
```typescript
server: {
  port: 5173,
  host: '0.0.0.0',
  allowedHosts: ['all', '.trycloudflare.com'],
  cors: true,
}
```

---

## 15. Demo Accounts

All accounts use `@karib-aerospace.com` domain.

| Name | Email | Password | Role | Access |
|---|---|---|---|---|
| Rilwan Olowu | rilwan.olowu@karib-aerospace.com | admin | Super Admin | Everything including Control Tower |
| Promise Benebo | promise.benebo@karib-aerospace.com | admin | Org Admin | Everything including Control Tower |
| M. Okafor | m.okafor@karib-aerospace.com | engineer | Engineer (B1) | Aircraft, Logbook write, WOs write, MEL write, Components, all read |
| S. Rampersad | s.rampersad@karib-aerospace.com | engineer | Engineer (B2) | Logbook write, WOs write, MEL write, all read |
| L. Persaud | l.persaud@karib-aerospace.com | viewer | Quality Auditor | All modules read-only |

**Organisations in demo:**
- Karib Aerospace (ORG1) — Enterprise plan, Active, max 20 users / 3 admins / 30 aircraft
- Caribbean Wings Ltd (ORG2) — Professional plan, Pending, max 10 users / 2 admins / 10 aircraft

---

## 16. Competitive Analysis

| Feature | AirSENS | SAM | Blue Eye | OASES | Traxxall | Aerotrac |
|---|---|---|---|---|---|---|
| Modern web UI | ✅ | ❌ legacy | ❌ Windows | ❌ legacy | Partial | ❌ |
| Mobile responsive | ✅ | ❌ | ❌ | ❌ | Partial | ❌ |
| SENS AI (live fleet data) | ✅ | ❌ | ❌ | Basic doc search | ❌ | ❌ |
| Amplification Factor engine | ✅ Unique | ❌ | ❌ | ❌ | ❌ | ❌ |
| Structural Fatigue Index | ✅ SFI engine | ❌ | ❌ | ❌ | ❌ | ❌ |
| SSID/ASIP/CPCP/FAR26 | ✅ Full | Partial | Partial | ✅ | ❌ | Partial |
| Control Tower (multi-org) | ✅ | ❌ | ❌ | Partial | ❌ | ❌ |
| Flight hours rollup | ✅ Auto | ✅ | ✅ | ✅ | ✅ | ✅ |
| MEL dispatch | ✅ Live | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auto-WO from threshold | Phase 1 | Partial | ❌ | ✅ | Partial | ❌ |
| Electronic Tech Log | Phase 1 | Partial | ❌ | ✅ | ✅ | ❌ |
| Electronic signatures | Phase 2 | ❌ | ❌ | ✅ | ✅ | ❌ |
| Document management | Phase 2 | ✅ | Partial | ✅ | ✅ | Partial |
| Email/SMS alerts | Phase 2 | Partial | ❌ | ✅ | ✅ | ❌ |
| Licence tracking | Phase 1 | ✅ | Partial | ✅ | ✅ | ✅ |
| Predictive maintenance AI | Phase 3 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Dispatch Risk Score | Phase 4 | ❌ | ❌ | ❌ | ❌ | ❌ |
| AD/SB auto-feed | Phase 4 | Partial | ❌ | Partial | ✅ | ❌ |
| ACARS auto-flight-logging | Phase 4 | Partial | ❌ | ✅ | Partial | ❌ |
| Self-onboarding (<1 hour) | Phase 2 | ❌ weeks | ❌ weeks | ❌ weeks | ❌ | ❌ |
| Caribbean/African focus | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Transparent pricing | Phase 2 | ❌ | ❌ | ❌ | ❌ | ❌ |
| iOS/Android native app | Phase 5 | ❌ | ❌ | Partial | ✅ | ❌ |
| Regulator portal | Phase 5 | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 17. Master Roadmap — All 5 Phases

### PHASE 1 — Frontend Upgrades (This Week)
*Pure React/TypeScript. No backend needed. Deploy to Vercel in minutes.*

**1.1 Auto-WO Generation from Maintenance Thresholds**
When a task drops below 15% remaining AND no open WO exists for it → auto-create WO in Backlog.
Engineer opens app and the job is already there. Nobody manually creates it.
**How:** Add trigger inside `logFlight()` in store — after rolling hours, scan every aircraft's
`maintProgram` tasks. Compare remaining vs interval. If below threshold and no matching open WO,
call `createWorkOrder()` automatically with task details pre-filled.

**1.2 Engineer Licence & Rating Tracking**
User profiles gain: licenceType (B1/B2/C/D), typeRatings (A320/B737/ATR72 etc.),
medicalExpiry, licenceExpiry, lastTaskDate (recency).
Expiry alerts in notification bell (30 days warning, 7 days critical).
Expired licence blocks WO assignment — system prevents assigning tasks to expired engineers.
**How:** Extend `User` type. Add expiry date checking to notification engine `useMemo`.
Add validation to `createWorkOrder` / `moveWorkOrder` actions.

**1.3 Electronic Tech Log (ETL) — Basic Version**
Log Flight drawer becomes proper ETL entry.
Step 1: flight data as now. Step 2: captain signs (PIN entry or drawn signature on screen).
Step 3: engineer countersigns.
Both signatures stored as base64 strings in FlightLog record.
Signed entries show lock icon — `isLocked: true` flag, cannot be edited.
**How:** Add signature step to `LogFlight.tsx`. Extend FlightLog type with
`captainSignature`, `engineerSignature`, `isLocked` fields.

**1.4 Auto-MEL Due Date Escalation**
MEL items within 24 hours of deadline → red in notification bell, escalated priority.
Cat-A items open more than 2 hours → persistent red banner at top of page.
**How:** Add time-based checks to notification `useMemo` in Layout.tsx.

**1.5 Pilot App View**
Simplified mobile-first view for pilots — role: `pilot` (new role level).
Shows only: aircraft they fly, current MEL items, raise defect, sector sign-off.
No engineering modules, no admin, no work orders.
**How:** Add `pilot` role. Create `PilotView.tsx`. Route guard shows pilot view vs full app.

**1.6 Bulk Flight Import**
CSV/Excel upload to log multiple flights at once — for when operations are logged on paper
then transferred into AirSENS at end of day.
Column mapping wizard. Preview before committing. Batch rollup.
**How:** Add import drawer to Logbook. Parse CSV with PapaParse (already in React ecosystem).
Map columns to FlightLog fields. Preview. Commit batch to store.

---

### PHASE 2 — Backend Foundation (Weeks 2–4)
*Supabase (PostgreSQL + Auth + Storage). Replaces localStorage entirely.*

**2.1 Real Authentication**
- Bcrypt-hashed passwords (argon2 preferred), JWT access tokens, refresh tokens
- Password reset via email (Resend)
- Session timeout after inactivity (configurable per org)
- 2FA for admins (TOTP authenticator app)
- SSO via Google/Microsoft for enterprise clients

**2.2 Real Database (Supabase PostgreSQL)**
- All data migrates from localStorage to PostgreSQL
- Row-level security (RLS) policies — org isolation at database level, not JavaScript
- Real-time subscriptions — multiple users see updates live simultaneously
- Full server-side audit trail, immutable, tamper-proof
- Daily automated backups with point-in-time recovery
- 99.9% uptime SLA

**2.3 Email Alerts (Resend)**
Triggered emails:
- AOG event → immediate email to org admin + CAMO manager
- MEL due in 24hrs → email to assigned engineer
- Check due in 7 days → weekly maintenance digest
- New defect raised → email to maintenance controller
- WO assigned → email to engineer with task details
- Licence expiring 30 days → email to engineer + admin
- New user invited → onboarding email with temporary password + login link
- Organisation activated → welcome email to org admin

**2.4 SMS Alerts (Twilio)**
Critical events only (keeps cost low):
- AOG event → SMS to CAMO manager + accountable manager
- Cat-A MEL overdue → SMS to maintenance director
- Aircraft grounded unexpectedly → cascading SMS chain

**2.5 Electronic Signatures — Full Legal Compliance**
- PKI-based digital signatures (legally binding in EU and UK under eIDAS)
- Sign on screen (touch/stylus/mouse) or PIN-based confirmation
- Signature record: user identity + timestamp + IP address + device fingerprint
- Immutable after signing — cryptographic hash of record + signature stored together
- Full chain of custody: raised by → inspected by → signed off by → countersigned by
- Export signature packages for authority audits (PDF with signature certificates)

**2.6 Document & Technical Publication Management**
- Upload AMMs, CMMs, IPC, STCs, repair schemes, job cards, airworthiness approvals
- Linked to aircraft type and component P/N
- Opening a WO → related documents shown automatically in sidebar
- Version control — previous versions archived, never deleted, full revision history
- Full-text search within uploaded PDFs (Supabase vector search or Meilisearch)
- Storage: Supabase Storage (S3-compatible, CDN-backed)
- File size limits, virus scanning on upload

**2.7 Transparent Pricing & Self-Onboarding**
- Stripe integration — operator signs up, picks plan, enters card, gets access immediately
- No sales call. No "contact us for pricing". Done in under one hour.
- Plan limits enforced at database level (not just JavaScript)
- Upgrade/downgrade self-service from org admin settings
- Invoices auto-generated and emailed monthly

---

### PHASE 3 — Automation Engine (Month 2)
*The system starts doing work by itself.*

**3.1 Intelligent Maintenance Scheduler**
- Auto-generates WOs at configurable lead times per task (not just fixed 15%)
  — each task can have its own lead time: "create WO when 200FH from 1000HR check"
- Chains dependent tasks — cannot sign off C-Check until all sub-tasks complete
- Fleet optimisation across multiple aircraft — if 3 aircraft need checks same week,
  suggests staggering to avoid hangar congestion
- Accounts for: available engineers, tool calibration expiry, hangar capacity, spare parts stock

**3.2 Predictive Maintenance AI**
**Nobody in the market has this for small operators.**
Using: flight log history, component life data, environment severity, AF value, historical removals.
- Predicts when each component is likely to reach its limit — before it gets there
- Flags components degrading faster than expected (anomaly detection)
- "Predicted Removal Date" per rotable component
- "Component Health Score" (0–100) visual indicator
- Learns from historical removal data to improve predictions over time
**Technology:** Linear regression model (Phase 3 MVP) → gradient boosting (Phase 4 full).
Inference runs server-side. Results presented as visual health indicators in Components module.

**3.3 Regulatory Compliance Engine**
- Auto-checks every open WO against regulatory requirements for the task type
- Flags if assigned engineer lacks required type rating or licence currency
- Generates EASA Part-145 / Part-CAMO compliance reports on demand
- Tracks authority audit findings: raised → actioned → closed → verified
- Part-CAMO airworthiness review certificate tracking

**3.4 Inventory Automation**
- Auto-raise purchase request when stock hits reorder point (currently shows alert only)
- Auto-create replenishment WO when rotable component is removed and installed
- Shelf life monitoring — flag components expiring within 30 days before they become unserviceable
- ILS / Aviall API integration — check part availability and price without leaving AirSENS
- Quarantine tracking for parts with airworthiness concerns

**3.5 CSV/Excel Flight Data Import (Bulk)**
Import multiple flights from daily operations CSV.
Column mapping wizard. Batch preview. One-click commit.
Handles operator's existing spreadsheet format without forcing a template.

---

### PHASE 4 — Market Leadership (Months 3–4)
*Features nobody in the market has. AirSENS becomes untouchable.*

**4.1 SENS AI — Full Claude Integration**
Server-side Node.js API route proxies Anthropic API — key never in frontend.
SENS reads entire organisation's live data and answers complex analytical questions:
- "Which aircraft has the highest maintenance cost per flight hour this quarter?"
- "What's my fleet's projected maintenance spend for the next 6 months?"
- "Which components are most likely to fail before the next A-Check?"
Proactive insights pushed to notification bell:
- "J7-EMG MTBUR trending down 18% over 60 days — recommend early hydraulic inspection"
- "Runway 27 approach profile suggests harder-than-average landings on J7-JBL — check MLG"
Generates drafts: MEL submissions, defect narratives, maintenance reports, authority letters.
Multi-language support (Spanish, French, Arabic — critical for target markets).
Voice input on mobile.

**4.2 Dispatch Risk Score**
Single 0–100 number per aircraft per day. The ultimate pre-flight check.
Combines:
- Maintenance threshold proximity (weighted by check severity)
- Open defects (severity + MEL category weighted)
- Structural Fatigue Index current value
- Amplification Factor (based on planned route load)
- Engineer licence currency for today's tasks
- Weather/environment severity at route airports
**Green (0–30):** Dispatch with confidence.
**Amber (31–65):** Dispatch with caution — review flagged items.
**Red (66–100):** Ground the aircraft — engineering assessment required.
**Nobody in the world has this for small/medium operators.**

**4.3 AD/SB Regulatory Feed Integration**
Direct API connections:
- EASA AD database (public API) — auto-imports applicable ADs for fleet aircraft types
- FAA AD database (public API)
- Boeing SABLE — service bulletin notifications
- Airbus AirbusWorld — SB and OIT notifications
- ATR Customer Services — fleet campaign tracking
New ADs applicable to your aircraft types appear automatically within 24 hours of publication.
Compliance status auto-populated based on aircraft hours/cycles/date at AD issue.
Zero manual entry for regulatory requirements.

**4.4 ACARS / QAR Auto-Flight-Logging**
Aircraft datalink system integration. Full automation of flight logging.
- Each flight auto-logged when aircraft lands (ACARS OUT → AirSENS)
- Block hours, cycles, fuel burn, route — all from aircraft avionics
- Defects entered by crew via EFB during flight appear in AirSENS before aircraft parks
- Post-flight data available for MEL review before crew deboards
- Zero manual data entry for routine operations

**4.5 Full MRO Marketplace**
- Operators request quotes from MRO providers directly in AirSENS
- MRO providers list capabilities, certifications, availability and pricing
- Parts marketplace — find and order from multiple suppliers with price comparison
- Labour marketplace — licensed engineers available for AOG support (24/7 response network)
- Integrated with Stripe for payments between operators and providers

**4.6 Damage Tolerance Calculations (Promise's Model)**
Promise to provide the calculation framework.
Inputs: damage geometry (crack length/area), material properties, load spectrum (from AF engine).
Outputs:
- Crack growth rate prediction (da/dN)
- Remaining fatigue life estimate
- Critical crack size for catastrophic failure
- Inspection interval recommendation
- Repair classification (acceptable vs requires immediate repair)
Integrated with SFI engine — damage tolerance results refine the fatigue index.

**4.7 White Label & Public API**
- White label: any aviation company can deploy AirSENS under their own brand
  (custom logo, colours, domain) — premium tier
- Public REST API — operators integrate their own tools and internal systems
- Webhooks — real-time push notifications for AOG events, threshold breaches etc.
- GraphQL endpoint for advanced integrations

---

### PHASE 5 — Enterprise & Scale (Month 5+)

**5.1 iOS & Android Native Apps (Capacitor)**
Wrap existing React app — zero code rewrite needed.
Additional mobile capabilities:
- Push notifications (not just email/SMS) — instant AOG alert on phone
- Offline mode — engineers log defects and work offline, syncs on reconnect
- Barcode/QR scanning — scan part labels to add to inventory or WO
- Camera integration — attach photos to defects and WOs directly from phone
- Biometric login (Face ID / fingerprint)

**5.2 Airline-Grade Features**
For operators growing into scheduled operations:
- Flight schedule integration (SSIM format import)
- Crew rostering module (licence/rating/recency/FTL tracking)
- Weight and balance integration
- Fuel planning integration
- Airport slot coordination
- NOTAM integration

**5.3 Regulator Portal**
**First in the world to offer this for small operators.**
- Civil aviation authorities (TTCAA, GCAA, SACAA, CAA UK etc.) get read-only portal access
  to the operators they oversee
- Automated audit report generation — no manual preparation needed
- Digital oversight programme — authority can track finding closure in real time
- Reduces surveillance audit burden for both operator and authority
- AirSENS becomes the link between operator and regulator

**5.4 Advanced Analytics & Reporting**
- Custom report builder — drag-and-drop report designer
- Executive dashboard — C-suite view with cost, reliability, compliance KPIs
- Fleet comparison — benchmark against anonymised industry averages
- Carbon/emissions tracking (growing regulatory requirement)
- Maintenance cost per flight hour trending

**5.5 Training & Qualification Management**
- Engineer training records — courses, qualifications, simulator hours
- Recurrent training tracking with expiry alerts
- Integration with training organisations for certificate upload
- Authorisation matrix — who is qualified to sign off what

---

## 18. Scale Architecture — 1,000–3,000 Customers

### Database Design at Scale
```
1,000 operators × 20 users × 14 aircraft × 500 flights/year
= 140,000,000 flight records (manageable with proper indexing)

PostgreSQL with indexes on: (orgId, aircraftId, date)
Query time for 90-day fleet view: < 50ms

Supabase RLS policy:
CREATE POLICY "org_isolation" ON flight_logs
  USING (org_id = auth.jwt() ->> 'org_id');
```

### Multi-tenancy Model
All data shares a single database with Row Level Security.
Every table has `org_id` column. Every query automatically filtered at database level.
Even if a bug existed in JavaScript, the database rejects cross-org queries.
Cost-effective vs dedicated databases per org (saves ~£20/org/month at scale).

### Performance at Scale
- Vercel Edge Network: static assets cached globally (~15ms load time worldwide)
- Database queries via Supabase connection pooling (PgBouncer) — handles thousands of connections
- React code-splitting (Phase 3): split 793KB bundle into ~20 per-module chunks
  → first load < 100KB, subsequent navigation instant
- Recharts rendered server-side for PDF exports (no client computation)

### Reliability & Uptime
- Vercel SLA: 99.99% uptime for production tier
- Supabase SLA: 99.9% uptime
- Automatic point-in-time database recovery
- Instant Vercel rollback if deployment breaks
- Sentry error monitoring — team alerted before users notice issues

### Security at Scale
- All data encrypted in transit: HTTPS/TLS 1.3
- All data encrypted at rest: AES-256 (Supabase default)
- No credentials in frontend code (Phase 2 moves all auth server-side)
- API rate limiting per org (prevent abuse, fair usage)
- GDPR compliance: data deletion on request, data portability export
- SOC2 Type II target (Phase 5 — required for airline-grade customers)

### Cost Model at Scale

| Customers | Infrastructure/mo | Revenue (avg £350/operator) | Gross Margin |
|---|---|---|---|
| 10 | £70 | £3,500 | 98.0% |
| 50 | £150 | £17,500 | 99.1% |
| 100 | £250 | £35,000 | 99.3% |
| 500 | £800 | £175,000 | 99.5% |
| 1,000 | £1,500 | £350,000 | 99.6% |
| 3,000 | £4,000 | £1,050,000 | 99.6% |

Infrastructure stays near-flat while revenue scales linearly. SaaS economics are exceptional.

---

## 19. Business Model & Pricing

### Subscription Plans (Phase 2 launch)

**Starter — £199/month**
- Up to 5 aircraft
- Up to 10 users (max 2 admins)
- All CAMO modules
- Basic MRO execution
- Email alerts
- CSV/PDF exports
- 30-day free trial, no credit card required

**Professional — £499/month**
- Up to 20 aircraft
- Up to 30 users (max 5 admins)
- Everything in Starter
- Full MRO execution suite
- Electronic Tech Log (ETL)
- Document management (up to 50GB)
- SMS alerts for critical events
- Priority support (4hr response)
- API access (read-only)

**Enterprise — Custom pricing**
- Unlimited aircraft
- Unlimited users
- Everything in Professional
- White label option (custom domain + branding)
- Dedicated implementation support
- Full API access + webhooks
- SLA guarantee (99.9% uptime)
- Custom integrations (ACARS, EFB, flight ops systems)
- Quarterly engineering review with Promise Benebo

### Revenue Projections (Conservative)

| Milestone | Timeline | Operators | Monthly Revenue | Annual |
|---|---|---|---|---|
| Beta launch | Now | 10 | £3,000 | £36,000 |
| Early traction | 6 months | 50 | £15,000 | £180,000 |
| Growth | 12 months | 200 | £70,000 | £840,000 |
| Scale | 24 months | 500 | £200,000 | £2,400,000 |
| Market leader | 36 months | 1,000 | £400,000 | £4,800,000 |
| Full scale | 48 months | 3,000 | £1,200,000 | £14,400,000 |

### Target Markets (Priority Order)

1. **Caribbean island operators** — Home market, Rilwan and Promise's direct network.
   15-20 operators immediately reachable. TTCAA relationship advantage.

2. **West African regional operators** — Nigeria, Ghana, Kenya, South Africa.
   Massively underserved by current vendors. English-speaking. Fast growth.

3. **Middle East charter operators** — UAE, Qatar, Bahrain. High spend, English operations.

4. **UK/European small charter and ACMI operators** — EASA-regulated, familiar regulatory
   framework. 500+ operators currently on legacy systems.

5. **Latin American regional carriers** — Colombia, Peru, Brazil (Spanish language critical —
   Phase 4 multi-language). Huge underserved market.

### Go-to-Market Strategy

**Phase 1 (Now):** Use existing Karib Aerospace operator relationships.
Give beta access free to 5-10 operators in Caribbean. Get testimonials and case studies.

**Phase 2 (With backend):** Launch public website with pricing. Self-service onboarding.
Content marketing: publish articles about AF engine, SFI model, Caribbean aviation compliance.

**Phase 3 (Scale):** Partner with CAA/TTCAA authorities.
Attend regional aviation conferences: CASSOS, IATA Ground Handling, MRO Africa.

**Phase 4 (Market leadership):** White label partnerships with aircraft manufacturers.
ATR, DeHavilland Canada, Embraer regional sales teams recommending AirSENS to new operators.

---

*Document Version 3.0 — June 5, 2026*
*AirSENS current build status: Phase 0 complete (all 19 modules live), Phase 1 in progress*
*5,200+ lines of production TypeScript/React deployed at https://airsens-karib-l8n2.vercel.app*
*Built by Karib Aerospace Ltd — Confidential and Proprietary*
