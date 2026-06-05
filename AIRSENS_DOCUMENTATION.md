# AirSENS — Complete Product & Technical Documentation

**Version:** 1.0 (June 2026)  
**Product:** AirSENS — Aviation Maintenance & Sustainment Platform  
**Company:** Karib Aerospace Ltd, 4 Preston Road, Brighton, England BN1 4QF  
**Contact:** karib.aerospace@outlook.com | UK: +44 7512 549 068 | US: +1 217 848 2193  
**Company House No.:** 14231476

---

## Table of Contents

1. [What is AirSENS?](#1-what-is-airsens)
2. [Who It's For](#2-who-its-for)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Data Architecture](#5-data-architecture)
6. [Authentication & Access Control](#6-authentication--access-control)
7. [Navigation Modules — Full Detail](#7-navigation-modules--full-detail)
   - [Command Deck (Dashboard)](#71-command-deck-dashboard)
   - [Aircraft](#72-aircraft)
   - [Components](#73-components)
   - [Fleet Planning](#74-fleet-planning)
   - [Logbook & Ops](#75-logbook--ops)
   - [Maintenance Program](#76-maintenance-program)
   - [AD / SB Tracking](#77-ad--sb-tracking)
   - [MEL](#78-mel-minimum-equipment-list)
   - [Reliability](#79-reliability)
   - [Configuration](#710-configuration)
   - [Work Orders](#711-work-orders)
   - [Inventory](#712-inventory)
   - [Tools & Manuals](#713-tools--manuals)
   - [Sales & Invoice](#714-sales--invoice)
   - [Amplification Factor](#715-amplification-factor)
   - [Structural (DTE/DTI)](#716-structural-dtedti)
   - [Ageing Aircraft](#717-ageing-aircraft)
8. [Administration Layer](#8-administration-layer)
   - [Admin Panel](#81-admin-panel)
   - [Control Tower](#82-control-tower)
9. [SENS AI Assistant](#9-sens-ai-assistant)
10. [Core Libraries & Engines](#10-core-libraries--engines)
    - [Amplification Factor Engine](#101-amplification-factor-engine)
    - [Structural Fatigue Index Engine](#102-structural-fatigue-index-engine)
    - [Export Utilities](#103-export-utilities)
11. [State Management & Store](#11-state-management--store)
12. [UI Component System](#12-ui-component-system)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Demo Accounts](#14-demo-accounts)
15. [Competitive Positioning](#15-competitive-positioning)
16. [Roadmap — Backend & Production](#16-roadmap--backend--production)

---

## 1. What is AirSENS?

AirSENS is a **web-based Aviation Maintenance & Sustainment platform** built by Karib Aerospace Ltd. It unifies Continuing Airworthiness Management Organisation (CAMO) functions, MRO (Maintenance, Repair & Overhaul) execution, and advanced engineering analytics into a single system accessible from any device.

The core purpose is to give aviation operators — from regional carriers to charter operators — a single source of truth for their entire airworthiness picture: who did what, when, what's due, what's defective, what it costs, and whether the structural and operational envelope is being respected.

**What makes AirSENS different from every competitor in the market today:**

| Competitor weakness | AirSENS advantage |
|---|---|
| Windows-era desktop UIs (SAM, Blue Eye, OASES) | Modern, real-time cockpit-style web interface |
| Months to implement | Onboards in minutes |
| No real mobile support | Fully responsive, mobile-first |
| No AI integration | SENS AI assistant built in from day one |
| No structural fatigue modelling | Proprietary Structural Fatigue Index (SFI) engine |
| No Amplification Factor concept | Unique AF engine links operations to maintenance cost |
| Ignores Caribbean, African, Middle East operators | Built for exactly this market |
| Opaque pricing, "call for quote" | Transparent SaaS plan model |

---

## 2. Who It's For

**Platform Owners (Tier 1):**
- Promise Benebo — Founder / CEO
- Rilwan Olowu — COO
- Full platform visibility across all client organisations

**Org Admins (Tier 2 — per client company):**
- 1–3 trusted senior staff per client organisation
- Manages engineers and their module permissions
- Can only see their own organisation's data

**Engineers (Tier 3):**
- Licensed engineers (B1, B2, C category etc.)
- Access limited to modules assigned by their org admin
- Can log flights, raise defects, manage work orders

**Viewers (Tier 4):**
- Quality auditors, accountants, management
- Read-only access to assigned modules

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend framework | React | 18.3.1 | Component-based UI |
| Language | TypeScript | 5.5.4 | Type safety across entire codebase |
| Build tool | Vite | 5.4.6 | Fast dev server and production builds |
| Routing | React Router DOM | 6.26.2 | Client-side navigation with guards |
| Charts | Recharts | 2.12.7 | All data visualisations |
| Icons | Lucide React | 0.445.0 | Consistent icon system |
| Animation | Framer Motion | 11.5.4 | Page transitions |
| Date utilities | date-fns | 3.6.0 | Date formatting and calculations |
| CSS utilities | clsx | 2.1.1 | Conditional class composition |
| Hosting | Vercel | — | Auto-deploy from GitHub |
| Repository | GitHub | — | Source control (airsens/airsens-karib) |

**Current persistence:** Browser `localStorage` (key: `airsens.state.v1`). Production backend swap point is `src/context/store.tsx` — the `load()` and `persist()` functions are the only things that need to change to move to a real API.

---

## 4. Project Structure

```
airsens_karib_pkg/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx                    # Root — login gate, route definitions, guards
│   ├── main.tsx                   # Entry point — mounts StoreProvider + ToastProvider
│   │
│   ├── components/
│   │   ├── Layout.tsx             # Sidebar, topbar, search, notifications, user widget
│   │   ├── Toast.tsx              # Global toast notification system
│   │   └── ui.tsx                 # Shared UI: PageHeader, KpiCard, StatusBadge, Bar, PanelHead
│   │
│   ├── context/
│   │   └── store.tsx              # Central state store — ALL mutable data lives here
│   │
│   ├── data/
│   │   ├── types.ts               # TypeScript interfaces for every domain entity
│   │   └── seed.ts                # Deterministic demo data generator (PRNG seeded)
│   │
│   ├── lib/
│   │   ├── amplification.ts       # Amplification Factor (AF) engine
│   │   ├── structural.ts          # Structural Fatigue Index (SFI) engine
│   │   └── exports.ts             # CSV download + print-PDF utilities
│   │
│   ├── modules/
│   │   ├── Login.tsx              # Login page
│   │   ├── Dashboard.tsx          # Command Deck
│   │   ├── AircraftModule.tsx     # Aircraft register + profile drawer
│   │   ├── LogFlight.tsx          # Log Flight / Hours drawer
│   │   ├── RaiseDefect.tsx        # Raise Defect drawer with MEL classification
│   │   ├── ComponentsModule.tsx   # Component tree and life tracking
│   │   ├── FleetPlanningModule.tsx # Gantt-style maintenance forecast
│   │   ├── ReliabilityModule.tsx  # Reliability analytics
│   │   ├── WorkOrdersModule.tsx   # Kanban work order board
│   │   ├── AmplificationModule.tsx # AF engine interactive UI
│   │   ├── EngineeringModules.tsx # Configuration, Structural SFI, Ageing
│   │   ├── TableModules.tsx       # AD/SB, MEL, Inventory, Logbook, AMP, Tools, Sales
│   │   ├── AIAssistant.tsx        # SENS AI floating assistant
│   │   ├── AdminPanel.tsx         # Org-level user and permission management
│   │   └── ControlTower.tsx       # Platform-owner panel (Rilwan & Promise only)
│   │
│   └── styles/
│       └── global.css             # Design system: variables, layout utilities, responsive
│
├── vercel.json                    # SPA routing — all URLs serve index.html
├── vite.config.ts                 # Vite config — port 5173, allowedHosts for tunnels
├── package.json                   # Dependencies and build scripts
├── tsconfig.json                  # TypeScript configuration
└── SESSION_STATE.md               # Development session notes
```

---

## 5. Data Architecture

### Domain Entities (`src/data/types.ts`)

Every piece of data in AirSENS is typed. Here are all the entities:

**`Aircraft`** — The core airframe record. Holds registration, model, MSN, owner, base, status (airworthy/due-soon/overdue/AOG), total hours, total cycles, last flight date, next check details, daily utilisation, year of manufacture, engine count, open defect count, MEL active count, and the full maintenance program task list.

**`Engine`** — Per-engine record linked to an aircraft. Tracks hours, cycles, TBO (time between overhaul), and hours/cycles since last overhaul. Multiple engines per aircraft.

**`Component`** — Individual parts installed on an aircraft. Tracks part number, serial number, category (rotable/fixed/consumable), parent component (hierarchical tree), life limit, time since overhaul, and installed hours. Hours roll up automatically when a flight is logged.

**`WorkOrder`** — A job card. Holds WO number, title, aircraft, type (scheduled/unscheduled/AD-SB/mod), priority (low/med/high/AOG), state (backlog/planned/in-progress/QA/closed), estimated and actual man-hours, assignee, zone, and task completion.

**`FlightLog`** — A single flight entry. Date, from/to ICAO, block hours, cycles (landings), engine hours, engine cycles, payload, load factor, and who logged it.

**`Defect`** — A logged defect. ATA chapter, description, severity (minor/major/critical), safety-critical flag, MEL category (A/B/C/D), raised and due dates, status (open/deferred/closed), MEL reference, and who reported it.

**`MELItem`** — The MEL master list (regulatory reference). Separate from live defects — this is the lookup table.

**`ADSB`** — An Airworthiness Directive or Service Bulletin. Authority (EASA/FAA/OEM), classification (mandatory/recommended/optional), compliance percentage across the fleet.

**`InventoryItem`** — A parts stock record. P/N, description, quantity, minimum quantity, location, unit cost, shelf life.

**`User`** — A platform user. Name, title, email, role (superadmin/org-admin/engineer/viewer), organisation, license number, active status, and per-module permissions map.

**`Organization`** — A client company. Name, ICAO prefix, approval reference, country, contact email, plan (starter/professional/enterprise), status (active/suspended/pending), and quotas (max admins, max users, max aircraft) set by the platform owners.

**`AuditEntry`** — Every action logged: timestamp, user, action type, detail string.

**`MaintTask`** — A maintenance program threshold. Code (DAILY/100HR/1000HR etc.), interval type (hours/cycles/days), interval value, last done date/hours/cycles.

### Seed Data (`src/data/seed.ts`)

The seed file generates a complete realistic demo dataset using a deterministic pseudo-random number generator (PRNG) seeded with `20260601`. This means the data looks real and varied but is reproducible. It generates:

- 14 aircraft across multiple models (ATR-72, B737, A320, etc.)
- Engines for each aircraft (1–2 per airframe)
- A full maintenance program (DAILY/WEEKLY/100HR/500HR/1000HR/5000HR/2000FC) per aircraft
- ~500 flight log entries (90 days of operations)
- 26 seeded defects with MEL classification
- Components in a hierarchical tree per aircraft
- 5 seed users (Rilwan, Promise, two engineers, one viewer)
- 2 organisations (Karib Aerospace, Caribbean Wings Ltd demo)
- AD/SB directives, MEL master list, inventory items, work orders

A `SEED_VERSION` constant (`v5`) controls auto-clearing of stale localStorage — bump this whenever seed data changes and all users automatically get fresh data on next load.

---

## 6. Authentication & Access Control

### How Login Works

The login system (`src/modules/Login.tsx` + `src/context/store.tsx`) uses email/password authentication stored in the browser session. On production, this will be replaced by a real backend with hashed passwords and JWT tokens — the swap point is the `login()` action in the store.

**Session persistence:** The logged-in user is stored in `sessionStorage` (`airsens.session.v1`). This means the session survives page refresh but is cleared when the browser tab is closed.

### Role Hierarchy

```
superadmin (Rilwan & Promise)
    └── Full access to everything including Control Tower
        └── org-admin (1–3 per client company)
                └── Full access to their org, no other orgs
                    └── engineer (licensed staff)
                            └── Access only to modules their admin grants
                                └── viewer (auditors, management)
                                        └── Read-only to assigned modules
```

### Permission System

Every module supports four permission levels: `view`, `read`, `write`, `edit`.

- **view** — can see the module in the sidebar and open it
- **read** — can see data inside the module
- **write** — can create new records (log flight, raise defect, create WO)
- **edit** — can modify and delete existing records

Write/edit permissions automatically include read and view. The permission matrix in the Admin Panel lets org-admins set these per module per engineer with a visual toggle grid.

### Route Guards

Every route in `src/App.tsx` is wrapped in a guard:

- `<Guard mod="aircraft">` — checks `can('aircraft', 'view')` before rendering
- `<AdminGuard>` — only org-admins and superadmins
- `<SuperAdminGuard>` — only superadmins (Rilwan & Promise)

If a user doesn't have access, they see a clean "Access Restricted" message instead of the module.

### Org Isolation

Org-admins and engineers see only their own organisation's users and data. The store's `scopedUsers` computed value filters the user list by `orgId` before exposing it — an org-admin literally cannot see another organisation's users even if they knew the URL.

---

## 7. Navigation Modules — Full Detail

### 7.1 Command Deck (Dashboard)

**File:** `src/modules/Dashboard.tsx`  
**Route:** `/`  
**Access:** All roles with `dashboard` view permission

The Command Deck is the first screen after login. It gives an at-a-glance picture of the entire fleet and operation.

**KPI cards (top row):**
- Fleet Size — total aircraft in the register
- Open Work Orders — all WOs not in "closed" state
- Open Defects — all defects not closed, with critical count
- MTBUR — Mean Time Between Unscheduled Removals (hrs)

**Fleet Utilisation chart** — a 30-day area chart of daily block hours across the fleet. Sorted by date so the trend is accurate left-to-right.

**Fleet Status panel** — a live bar chart showing aircraft by airworthiness status (Airworthy, Due Soon, Overdue, AOG).

**Priority Aircraft table** — lists aircraft ordered by urgency (AOG first, then overdue, then due-soon). Shows registration, model, next check type and date, hours to next check, and airworthiness status. Clicking a row navigates to the Aircraft module.

**Work Order Pipeline** — a compact view of open WOs by state (Backlog/Planned/In-Progress/QA), colour coded by priority.

**Data source:** Live from the store. Every flight logged, defect raised, or WO created is reflected here immediately.

---

### 7.2 Aircraft

**File:** `src/modules/AircraftModule.tsx`  
**Route:** `/aircraft`  
**Access:** `aircraft` view permission

The Aircraft module is the core fleet register — a table of every airframe with key stats.

**Main table columns:** Registration, Model, Owner, Base (ICAO), Total Hours, Cycles, Next Check, Status.

**Status filter chips** at the top let you filter by: All, Airworthy, Due Soon, Overdue, AOG.

**Aircraft Profile Drawer** (click any row) opens a full detail panel on the right side:
- Status badge, owner, base, year of manufacture
- Action buttons: **Log Flight / Hours** (requires `logbook` write) and **Raise Defect** (requires `mel` or `aircraft` write)
- **Airframe stats** — total hours, total cycles, daily utilisation, last flight date
- **Engines** — each engine with model, serial number, hours, cycles
- **Maintenance Program countdown** — every scheduled task (DAILY/WEEKLY/100HR/500HR/1000HR/5000HR/2000FC) shown as a colour-coded progress bar with remaining hours/cycles/days. Green = plenty of time, amber = due soon, red = overdue
- **Open Work Orders** for this aircraft
- **Open Defects** with MEL category badges
- **Installed Components** (first 6 shown)

---

### 7.3 Log Flight / Hours

**File:** `src/modules/LogFlight.tsx`  
**Route:** Drawer opened from Aircraft module  
**Access:** `logbook` write permission

This is the operational logging workflow. After every flight, an engineer opens the aircraft profile and clicks "Log Flight / Hours".

**Input fields:** Date, From (ICAO), To (ICAO), Block Hours, Landings/Cycles, Payload (kg), Load Factor (%).

**Live rollup preview** — as you type block hours, a live panel shows exactly what will change:
- Airframe hours: before → after
- Each engine hours: before → after

**On save, the following all update simultaneously:**
1. Aircraft total hours and cycles
2. Aircraft last flight date
3. Aircraft status recomputed from maintenance program margins
4. All installed engines: hours and cycles incremented
5. All installed components: `sinceOverhaul`, `sinceNew`, and `installedHours` incremented
6. New FlightLog entry created with logged-by user name
7. Audit entry created

This is the single most important operational action in AirSENS — every maintenance threshold, component life, and reliability metric depends on accurate flight logging.

---

### 7.4 Raise Defect

**File:** `src/modules/RaiseDefect.tsx`  
**Route:** Drawer opened from Aircraft module  
**Access:** `mel` write or `aircraft` write permission

Defect logging with automatic MEL classification per Promise's model.

**Input fields:** ATA Chapter (dropdown of all standard chapters), Description (free text), Severity (Minor/Major/Critical), Safety-Critical checkbox.

**Live MEL auto-classification** — as you select severity and the safety-critical flag, a live card shows the auto-derived MEL category:
- Safety-critical = **Category A** (Immediate — aircraft grounded)
- Critical (not safety-critical) = **Category B** (3 days)
- Major = **Category C** (10 days)
- Minor = **Category D** (120 days)

**On save:**
1. Defect record created with MEL category, due date (raised + interval), and reporter name
2. If safety-critical: aircraft status immediately set to AOG
3. Aircraft `defectsOpen` count incremented
4. MEL reference auto-generated (e.g. `MEL-27-45`)
5. Defect appears in the MEL module live table
6. Notification bell updated

**Closing a defect (via MEL module Rectify button):**
1. Defect status set to "closed" with closed date
2. Aircraft `defectsOpen` count decremented
3. If no remaining Category A open defects: AOG status automatically cleared

---

### 7.5 Components

**File:** `src/modules/ComponentsModule.tsx`  
**Route:** `/components`  
**Access:** `components` view permission

Tracks every installed component across the fleet in a hierarchical tree.

**Aircraft selector** — choose an aircraft to view its component tree.

**Component tree** — shows components with their parent-child relationships (e.g. Engine 1 → Fan Module → Fan Blade Set). Each component shows:
- Part Number (P/N), Serial Number (S/N)
- Category (Rotable, Fixed, Consumable)
- Time Since Overhaul bar (hours used / TBO)
- Life Limit remaining
- Status badge

**Important:** Component hours automatically advance whenever a flight is logged on the parent aircraft. No manual entry needed — the store's `logFlight()` action increments `sinceOverhaul`, `sinceNew`, and `installedHours` on every installed component in one transaction.

---

### 7.6 Fleet Planning

**File:** `src/modules/FleetPlanningModule.tsx`  
**Route:** `/fleet-planning`  
**Access:** `fleet-planning` view permission

A Gantt-style maintenance forecast showing the entire fleet's upcoming check schedule.

**Horizon selector** — view 30, 60, or 90-day window.

**Gantt chart** — each aircraft is a row. The coloured bar shows when the next check is due within the selected horizon. Colour coding: green (plenty of time), amber (due within 15% of horizon), red (overdue or due this week).

**Today marker** — a vertical line shows today's position, computed from `new Date()` (not hardcoded — fixed bug from earlier session).

Useful for maintenance planning — lets you see immediately which aircraft need to come in and roughly when to schedule hangar time.

---

### 7.7 Logbook & Ops

**File:** `src/modules/TableModules.tsx` — `LogbookModule` export  
**Route:** `/logbook`  
**Access:** `logbook` view permission

The digital flight logbook. Shows all flight records logged across the fleet.

**30-day trend chart** — block hours per day, area chart sorted chronologically.

**Flight records table** — Date, Aircraft (registration), Route (From → To), Block Hours, Cycles, Payload (kg), Load Factor %, Logged By.

**Important note to users:** Flights are not entered here directly. The module explains: "To add a flight, open Aircraft → select an aircraft → Log Flight / Hours." This is intentional — logging lives on the aircraft, not the logbook.

**Exports:** CSV (full history, all columns) and PDF (summary KPIs + last 40 entries formatted for print).

---

### 7.8 Maintenance Program

**File:** `src/modules/TableModules.tsx` — `AmpModule` export  
**Route:** `/amp`  
**Access:** `amp` view permission

The Approved Maintenance Programme reference. Shows the scheduled task hierarchy (daily, weekly, 100hr, A-Check, C-Check, etc.) with compliance status.

Currently displays the programme structure from the seed data. The "Assign Task" button (coming soon) will link programme tasks directly to work orders.

---

### 7.9 AD / SB Tracking

**File:** `src/modules/TableModules.tsx` — `AdSbModule` export  
**Route:** `/adsb`  
**Access:** `adsb` view permission

Tracks Airworthiness Directives (ADs) and Service Bulletins (SBs) across the fleet.

**Kind filter** — toggle between All, AD only, SB only.

**Table columns:** Reference, Authority (EASA/FAA/OEM), Subject, Classification (Mandatory/Recommended/Optional), Effective Date, Status, Fleet Compliance %.

**Mandatory ADs** are highlighted. The compliance % bar shows how much of the applicable fleet has complied.

**Exports:** CSV (all directives with compliance) and PDF (formatted compliance report).

---

### 7.10 MEL (Minimum Equipment List)

**File:** `src/modules/TableModules.tsx` — `MelModule` export  
**Route:** `/mel`  
**Access:** `mel` view permission

The active MEL dispatch board — shows all open defects that carry a MEL category.

**Category KPI cards** — count of Category A (immediate), B (3 days), C (10 days), D (120 days) active items.

**Active MEL table:** MEL Ref, ATA, Description, Category badge, Aircraft, Reported By, Rectify By date (red if overdue).

**Rectify button** (requires `mel` edit permission) — closes the defect, updates aircraft defectsOpen count, and clears AOG if it was the last Category A item.

This module is the primary dispatch reference — before releasing an aircraft for flight, the dispatcher checks here to ensure no Category A items are open.

**Exports:** CSV and PDF with all active MEL items, due dates, and aircraft.

---

### 7.11 Reliability

**File:** `src/modules/ReliabilityModule.tsx`  
**Route:** `/reliability`  
**Access:** `reliability` view permission

Reliability analysis computed from actual logged flight and defect data.

**KPI cards:** Dispatch Reliability %, Total Defects, Critical Defects, Tracked Components.

**Defects by ATA Chapter** — bar chart showing which systems generate the most defects. Drives the maintenance programme review.

**Defect trend** — weekly defect rate over the last 12 weeks. Rising trend triggers a programme review recommendation.

**MTBUR by component family** — Mean Time Between Unscheduled Removals per component category, computed from the flight log and defect records.

**Important:** The more flights and defects are logged in AirSENS, the sharper and more accurate the reliability data becomes. It is a living database, not a static report.

**Exports:** CSV (full dataset — ATA breakdown, MTBUR, trend) and PDF (formatted reliability report with Karib Aerospace letterhead, suitable for authority submission).

---

### 7.12 Configuration

**File:** `src/modules/EngineeringModules.tsx` — `ConfigurationModule` export  
**Route:** `/configuration`  
**Access:** `configuration` view permission

Tracks the configuration lifecycle of an individual aircraft from As-Designed to As-Maintained.

**Aircraft selector** — choose which aircraft's configuration history to view.

**Configuration timeline** — a visual step-by-step timeline showing:
- As-Designed (OEM baseline, locked)
- As-Built (customer options applied, locked)
- Modifications applied (SBs, STCs, mods — each with date and description)
- As-Maintained (current effective configuration, live)

This is the configuration audit trail. In a real production deployment this will pull from engineering orders and approved modification records.

---

### 7.13 Work Orders

**File:** `src/modules/WorkOrdersModule.tsx`  
**Route:** `/work-orders`  
**Access:** `work-orders` view permission

A Kanban board for managing maintenance execution.

**Five columns:** Backlog → Planned → In Progress → QA / Sign-Off → Closed

**Kanban cards** show: WO number (e.g. WO-26-1004), title, aircraft registration and model, priority badge (Low/Med/High/AOG), assignee, zone, estimated vs actual man-hours, task completion progress bar.

**Drag and drop** — drag any card between columns to update its state. The move is persisted to the store immediately (not just local state). Drag is disabled for users without write permission.

**New Work Order button** — opens a form drawer: Aircraft, Title, Type (Scheduled/Unscheduled/AD-SB/Modification), Priority, Estimated Man-Hours, Due Date, Assignee, Zone. New WOs go straight to Backlog.

**Exports:** CSV (all open WOs with full detail) and PDF (formatted work order list).

---

### 7.14 Inventory

**File:** `src/modules/TableModules.tsx` — `InventoryModule` export  
**Route:** `/inventory`  
**Access:** `inventory` view permission

Parts and materials stock management.

**KPI cards:** Total Parts, Low Stock Items, Total Stock Value (USD).

**Low stock highlighted** — any part below its minimum quantity is flagged in the table.

**Table columns:** P/N, Description, Category, Quantity, Min Qty, Location, Unit Cost, Shelf Life, Reorder status.

**Exports:** CSV (full inventory with reorder flags) and PDF (stock report with value calculation and low-stock summary).

---

### 7.15 Tools & Manuals

**File:** `src/modules/TableModules.tsx` — `ToolsModule` export  
**Route:** `/tools-manuals`  
**Access:** `tools-manuals` view permission

Reference library for tooling and technical documentation. Currently shows the seeded reference catalog. Full document upload and management is planned for the backend phase.

---

### 7.16 Sales & Invoice

**File:** `src/modules/TableModules.tsx` — `SalesModule` export  
**Route:** `/sales`  
**Access:** `sales` view permission

Sales and quotation management for MRO services. Currently shows seeded quotation data. Full quotation builder and invoice generation is planned for the backend phase.

---

### 7.17 Amplification Factor

**File:** `src/modules/AmplificationModule.tsx`  
**Route:** `/amplification`  
**Access:** `amplification` view permission

The **Amplification Factor (AF) engine** is one of AirSENS's most unique and proprietary features. No competitor has anything equivalent.

**What it does:** Models how operational loading choices amplify structural fatigue, inspection frequency, and total maintenance cost over the aircraft's life. It translates five operational parameters into a single multiplier that drives maintenance interval and cost predictions.

**Input sliders:**
1. **Payload Ratio** (0–120% of max structural payload) — higher payload = cubic stress increase
2. **Cycles per Day** (landings/day) — more cycles = more pressurisation and landing fatigue
3. **Load Factor** (% capacity utilisation) — commercial pressure to fill seats
4. **Environment Severity** (1–5: benign inland to harsh coastal/arctic) — drives corrosion
5. **Avg Sector Length** (hours) — short sectors = more cycles per flight hour

**Output panel:**
- **AF Value** — the amplification multiplier (1.0 = baseline, 2.6 = severe)
- **Fatigue Index** — composite 0–100 score
- **Interval Tightening** — how much to reduce inspection intervals (%)
- **Cost Multiplier** — lifecycle maintenance cost vs baseline
- **Driver bar chart** — which factor contributes the most to amplification
- **Recommendation** — plain-English action summary (Optimal / Elevated / High / Severe)

**10-year cost projection chart** — shows cumulative maintenance cost: baseline (flat 4% escalation) vs projected (with AF amplification compounding year over year). The gap between the lines is the cost of the operating choices.

**Structural modifier integration** — if a structural fatigue index has been computed in the Structural module, its `structuralAFModifier` (1.0–2.0×) is applied to the AF result, linking structural condition directly to maintenance cost.

**Mathematical basis:**
```
payloadTerm  = payloadRatio ^ 2.4      (super-linear, stress concentration proxy)
cycleTerm    = 0.6 + 0.9 × (cycleDensity / ref)
loadTerm     = 0.7 + 0.6 × loadFactor
envTerm      = 1 + (severity - 1) × 0.14
raw          = payloadTerm × cycleTerm × loadTerm × envTerm
AF           = (1 + log₂(raw/baseline) × 0.62) × structuralModifier
```

---

### 7.18 Structural (DTE/DTI)

**File:** `src/modules/EngineeringModules.tsx` — `StructuralModule` export  
**Route:** `/structural`  
**Access:** `structural` view permission

The **Structural Fatigue Index (SFI) engine** — Promise Benebo's proprietary engineering model, implemented as a live interactive system.

This is the most technically sophisticated module in AirSENS and a major differentiator from every competitor.

**What it does:** Computes a live structural fatigue index (0–100) for any aircraft based on real engineering inputs. The index drives inspection interval derivation and feeds into the Amplification Factor engine.

**Input controls:**
- Aircraft selector
- Environment Severity slider (1–5)
- Hard Landing Events counter

**Load Path Classification** — every structural repair must be classified as:
- **Primary Load Path** (weight: 3.0×) — main structural load bearing, most critical. Per Promise: "Primary load paths are critical." Each repair acts as a potential stress raiser.
- **Secondary Load Path** (weight: 1.5×) — supporting structure, significant
- **Tertiary Load Path** (weight: 0.5×) — minor/fairing structure, lowest criticality

**Fatigue Index Drivers** (per Promise's model):
1. **Takeoff/Landing Cycles** — normalised to 20,000 cycle reference life
2. **Pressurisation Cycles** — approximately equal to landing cycles for pressurised aircraft
3. **Environment / Corrosion** — coastal salt, tropical heat, dust — all accelerate fatigue
4. **Hard Landings** — each hard landing event adds directly to the index
5. **Repair Accumulation** — weighted by load path and DTI category. This is the most important driver. Per Promise: "The more repairs you have, they start to now act as stress raisers... they start to increase stress, local increase in stress. And then these repairs in various places can link up and break the entire thing up."

**WFD (Widespread Fatigue Damage) Monitoring:**
- 4+ primary repairs: monitoring begins
- 6+ primary repairs: WFD threshold crossed — warning banner appears
- 9+ primary repairs: elevated risk — enhanced NDT mandatory
- 12+ primary repairs: critical — immediate DTE review required
- 200+ primary repairs: catastrophic threshold (per Promise: "if you have more than 200 repairs in your primary load path, the fatigue index starts to increase significantly")

**Log Repair drawer** — each repair logged with: Location, ATA Zone, Repair Type (Doubler/Crack stop/Bushing replace/Splice/Patch/Modification/Corrosion blend), Load Path (visual selector with descriptions), DTI Category (A/B/C), Corrosion flag, Hard Landing flag.

**Four tabs:**
1. **Overview** — load path bar charts, engineering summary KPIs
2. **Repairs** — full repair log table with delete
3. **Inspection Intervals** — derived intervals per repair: base interval reduced proportional to load path weight × DTI severity × current SFI. Red = critical interval (< 4,000 FH), amber = tightened, green = standard
4. **Fatigue Drivers** — bar chart breakdown of what's causing the fatigue index

**Structural AF Modifier output** — the SFI score generates a multiplier (1.0–2.0×) that is applied directly to the Amplification Factor engine, linking structural condition to maintenance cost modelling.

**Mathematical basis:**
```
cycleTerm       = (totalCycles / 20,000) × 25        capped at 25
pressTerm       = (pressureCycles / 20,000) × 10      capped at 10
envTerm         = (severity-1 × 3) + (corrosionRepairs × 0.8)
hardLandingTerm = hardLandings × 1.5                  capped at 10
repairTerm      = Σ (loadPathWeight × dtiSeverity × 0.8) per repair
wfdAmplifier    = 1 + log₂(primaryExcess + 1) × 0.6  if primary ≥ 6
SFI             = min(100, round((cycleTerm + pressTerm + envTerm + hardLandingTerm + repairTerm) × wfdAmplifier))
```

---

### 7.19 Ageing Aircraft

**File:** `src/modules/EngineeringModules.tsx` — `AgeingModule` export  
**Route:** `/ageing`  
**Access:** `ageing` view permission

Age-related deterioration compliance per AMC 20-20 and ICAO requirements.

**KPI cards:** Oldest Airframe (years), Average Fleet Age, Aircraft over 15 years (requiring enhanced programmes), Active Programmes count.

**Fleet by Age chart** — each aircraft as a horizontal bar. Green under 12 years, amber 12–18, red over 18. Age is computed from the current year dynamically.

**Ageing Programmes table:** Lists the four core ageing programmes every operator must maintain:
- Corrosion Prevention & Control (CPCP) — AMC 20-20
- Structural Significant Items (SSI) — ICAO Annex 8
- Widespread Fatigue Damage (WFD) — AMC 20-20
- Repair Assessment Program (RAP) — FAA AC 91-56

Shows how many aircraft in the fleet currently require each programme.

---

## 8. Administration Layer

### 8.1 Admin Panel

**File:** `src/modules/AdminPanel.tsx`  
**Route:** `/admin`  
**Access:** Org-Admin and Super Admin only

The org-level administration panel. Visible to both org-admins and superadmins, but org-admins can only see their own organisation's users.

**Three tabs:**

**Users & Access:** Full user table with name, title, email, role badge, license number, active status. Click any user to open the edit drawer. Delete button available for engineers and viewers (not for admins — safety guard). The "Add Engineer" button is disabled and shows a quota tooltip if the org has reached its user limit set by the platform owners.

**User quota indicator** (top right of header): shows `X/Y users · X/Y admins` — live count vs the quota set by Rilwan/Promise in the Control Tower.

**Add/Edit User Drawer:** Name, title, email, password, role, license number, active toggle. For engineers and viewers: a full **permission matrix** — a grid of every module (18 modules) × every permission level (view/read/write/edit). Toggle buttons: when write or edit is granted, read and view are automatically enabled. When read is granted, view is automatically enabled. Admins bypass the matrix (they have full access by definition).

**Audit Log:** Every action taken in the system is logged here: timestamp, user name, action type, detail. Includes a "Reset Demo Data" button (superadmins only) that wipes localStorage and reloads the seed.

**Organization tab:** Displays the organisation's name, ICAO prefix, approval reference, user count.

---

### 8.2 Control Tower

**File:** `src/modules/ControlTower.tsx`  
**Route:** `/control-tower`  
**Access:** Super Admin only (Rilwan & Promise)

The platform-owner command centre. **Completely invisible to all other users** — it doesn't appear in the sidebar for anyone except superadmins.

**Platform KPI cards:** Total Organisations, Total Users (all orgs), Active Orgs, Audit Events.

**Four tabs:**

**Organisations:** Each client organisation as an expandable card. Collapsed view shows name, plan badge (Starter/Professional/Enterprise), status badge (Active/Pending/Suspended), and live user/admin quota usage numbers. Expanded view shows:
- Quota bars (Admins used/max, Users used/max) with red indicator if at limit
- Full member list with role badges
- Action buttons: Edit Quotas, Activate/Suspend toggle, Send Invite (opens email client pre-filled with onboarding email to karib.aerospace@outlook.com), Remove (with confirmation)
- Internal notes (not visible to the org)

**Add/Edit Organisation Drawer:** Organisation name, ICAO prefix, contact email, country, approval reference, plan selection, **user quotas** (max admins, max users, max aircraft — set by you, enforced automatically on their Admin Panel).

**All Users:** Every single user across every organisation on the platform in one table. Name, title, organisation, role, email, status.

**Analytics:** Plan distribution bars (Starter/Professional/Enterprise), user breakdown by role (Superadmin/Org-Admin/Engineer/Viewer), org capacity table showing quota utilisation per organisation.

**Audit Trail:** Full platform-wide audit log — every action by every user in every organisation.

---

## 9. SENS AI Assistant

**File:** `src/modules/AIAssistant.tsx`  
**Mounted:** Always visible (bottom-right floating button) when logged in

A floating AI assistant named SENS. The cyan chat button is always available in the bottom-right corner.

**What SENS knows:**
- Live fleet data (AOG count, fleet size, open defects, work orders, due-soon checks)
- How every module works and how to use it
- MEL categories and the rectification window rules
- The Amplification Factor engine and how to interpret results
- How flight logging works and what it affects
- Permission and role management
- Component life tracking
- AD/SB compliance
- Reliability analysis
- How to reset demo data

**Example questions SENS can answer:**
- "How many aircraft are AOG?" → reads live store, gives exact answer
- "What are the MEL categories?" → explains A/B/C/D with intervals
- "How do I log a flight?" → step-by-step instructions
- "Explain the Amplification Factor" → technical explanation
- "What's due soon?" → reads fleet and lists aircraft

**Escalation:** When SENS cannot answer, it offers a one-tap "Email support" button that opens your email client pre-addressed to `karib.aerospace@outlook.com` with the question pre-filled in the email body.

**Current implementation:** Rule-based (no API call needed, works offline). The Claude API hook is documented in the code for when a backend proxy is ready — API keys must never be exposed in a frontend application.

---

## 10. Core Libraries & Engines

### 10.1 Amplification Factor Engine

**File:** `src/lib/amplification.ts`

```typescript
computeAF(inputs: AFInputs): AFResult
projectCostCurve(af: number, years: number, baseAnnual: number)
```

Takes five operational parameters and returns: AF value, fatigue index (0-100), interval adjustment %, cost multiplier, driver attribution, recommendation text, and band (optimal/elevated/high/severe).

The `projectCostCurve` function generates a 10-year array of cumulative cost: baseline (standard escalation) vs projected (with AF compounding). Used to render the cost chart in the Amplification module.

The `structuralFatigueModifier` optional input accepts the SFI engine's output modifier, linking structural condition directly to the AF result.

### 10.2 Structural Fatigue Index Engine

**File:** `src/lib/structural.ts`

```typescript
computeSFI(inputs: SFIInputs): SFIResult
demoRepairs: StructuralRepair[]   // seed data for demo
```

Takes aircraft cycles, flight hours, repair list, environment severity, hard landing count, and pressure cycles. Returns: fatigue index (0–100), band, WFD risk level, per-repair inspection intervals, driver attribution, recommendation, and the structural AF modifier.

Key types exported: `LoadPath`, `DTICategory`, `RepairType`, `StructuralRepair`, `SFIInputs`, `SFIResult`.

### 10.3 Export Utilities

**File:** `src/lib/exports.ts`

```typescript
downloadCsv(rows: (string|number|null|undefined)[][], filename: string): void
printPdf(title: string, sections: { heading: string; html: string }[]): void
```

`downloadCsv` creates a CSV blob with UTF-8 BOM (for Excel compatibility) and triggers a browser download.

`printPdf` opens a styled print window with Karib Aerospace branding — proper letterhead, coloured DTI badges, KPI grids, formatted tables, "Confidential — Internal Use Only" footer, and a "Print / Save as PDF" button. The browser handles the actual PDF generation natively, so no external library is needed.

Used in: Reliability, Work Orders, MEL, Logbook, Inventory, AD/SB.

---

## 11. State Management & Store

**File:** `src/context/store.tsx`

The store is the single most important file in AirSENS. It holds all mutable state, persists it to localStorage, and exposes all actions. It is the **sole swap point** for moving to a real backend — replace `load()` and the `useEffect` that calls `localStorage.setItem` with API calls, and the rest of the application is unchanged.

**State shape:**
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

**Actions exposed:**
| Action | What it does |
|---|---|
| `login(email, password)` | Validates credentials, sets currentUser in sessionStorage |
| `logout()` | Clears currentUser and session |
| `can(module, permission)` | Returns true/false — used by every guard and button |
| `logFlight(entry)` | Rolls hours into aircraft + engines + components, recomputes status |
| `raiseDefect(defect)` | Creates defect, sets MEL category, optionally AOGs aircraft |
| `closeDefect(id)` | Closes defect, decrements count, clears AOG if last Cat-A |
| `createWorkOrder(wo)` | Creates WO in Backlog with sequential WO number |
| `moveWorkOrder(id, state)` | Moves WO between Kanban columns, persisted |
| `addUser(user)` | Creates user with generated ID |
| `updateUser(id, patch)` | Partial update to any user field |
| `removeUser(id)` | Removes user (guard prevents removing yourself) |
| `addOrganization(org)` | Creates new client org |
| `updateOrganization(id, patch)` | Updates org (quotas, status, etc.) |
| `removeOrganization(id)` | Removes org (ORG1 is protected) |
| `resetData()` | Wipes localStorage, reloads from seed |

**Seed version system:** `SEED_VERSION` constant (currently `v5`). If the saved version in localStorage doesn't match, the state is cleared and fresh seed data loads. This means you never need to manually clear browsers when seed data changes — just bump the version constant.

**Org scoping:** The store exposes `scopedUsers` — superadmins get all users, org-admins get only their org's users. This is applied before the value is exposed via context, making it impossible for org-admins to access cross-org data even programmatically.

---

## 12. UI Component System

**File:** `src/components/ui.tsx`  
**Design system:** `src/styles/global.css`

### Shared Components

**`PageHeader`** — consistent page title area with eyebrow text (e.g. "CAMO · Fleet"), main title, subtitle, and optional action buttons slot.

**`KpiCard`** — metric card with label, large value, subtitle, accent colour, icon, and staggered fade-up animation via `delay` prop.

**`StatusBadge`** — coloured badge for aircraft/component status (Airworthy = green dot, Due Soon = amber, Overdue = red, AOG = pulsing red). Optional custom label.

**`Bar`** — horizontal progress bar. Colour, value, max props. Used for maintenance countdown bars, quota bars, component life bars, fatigue index breakdown.

**`PanelHead`** — consistent panel title row with icon, title, and optional right-side content (badges, buttons).

### Design System Variables (`global.css`)

The entire visual language is defined as CSS custom properties:

```css
--bg-void       #03050b    /* deepest background */
--bg-deep       #05070d    /* sidebar, page background */
--bg-panel      #080b14    /* cards and panels */
--bg-elevated   #0d1220    /* raised elements */
--cyan          #2fe6e0    /* primary accent — AirSENS brand colour */
--amber         #ffb02e    /* warnings */
--red           #ff4d5e    /* alerts, AOG */
--green         #3ad27a    /* airworthy, success */
--blue          #4d8fff    /* info */
--violet        #8b5cf6    /* user avatars */
--font-sans     'Sora', sans-serif
--font-mono     'JetBrains Mono', monospace
```

### Responsive Grid Utilities

Defined in `global.css`, stacking to single column at ≤700px:
- `.grid-2col` — two equal columns
- `.grid-3col` — three equal columns
- `.grid-chart` — 2fr + 1fr (chart + sidebar)
- `.grid-chart-alt` — 1.4fr + 1fr

### Toast System (`src/components/Toast.tsx`)

Global notification system. `ToastProvider` wraps the app. `useToast()` hook available anywhere. Call `toast.push('message', 'success')` or `toast.push('message')` (defaults to info). Toasts auto-dismiss after 3.6 seconds.

---

## 13. Deployment & Infrastructure

**Repository:** `https://github.com/airsens/airsens-karib` (public)  
**Hosting:** Vercel (Hobby plan, auto-deploy)  
**Live URL:** `https://airsens-karib-l8n2.vercel.app`  
**SPA Routing:** `vercel.json` rewrites all paths to `index.html`

### Deploy Workflow

```powershell
git add .
git commit -m "description of change"
git push
```

Vercel detects the push, runs `vite build`, deploys in ~45 seconds. No manual steps.

### Local Development

```powershell
cd C:\Users\rilon\Documents\airsens_karib\airsens_karib_pkg
npm install     # first time only
npm run dev     # starts at http://localhost:5173
```

### Sharing via Cloudflare Tunnel (for demos)

```powershell
# Terminal 1 — app running
npm run dev

# Terminal 2 — tunnel
cloudflared tunnel --url http://localhost:5173
```

Gives a public `https://xxxx.trycloudflare.com` URL that anyone can access while the tunnel is running.

### Vite Config (`vite.config.ts`)

```typescript
server: {
  port: 5173,
  host: '0.0.0.0',           // accept connections from all interfaces
  allowedHosts: ['all', '.trycloudflare.com'],  // allow Cloudflare tunnel URLs
  cors: true,
}
```

---

## 14. Demo Accounts

All accounts use `karib-aerospace.com` domain.

| Name | Email | Password | Role | Access |
|---|---|---|---|---|
| Rilwan Olowu | rilwan.olowu@karib-aerospace.com | admin | Super Admin | Everything including Control Tower |
| Promise Benebo | promise.benebo@karib-aerospace.com | admin | Org Admin | Everything including Control Tower |
| M. Okafor | m.okafor@karib-aerospace.com | engineer | Engineer | Aircraft, Logbook (write), Work Orders (write), MEL (write), Components, all read |
| S. Rampersad | s.rampersad@karib-aerospace.com | engineer | Engineer | Logbook (write), Work Orders (write), MEL (write), all read |
| L. Persaud | l.persaud@karib-aerospace.com | viewer | Viewer | All modules read-only |

**Note:** These passwords are plaintext in the frontend for demo purposes only. In production, authentication will be server-side with hashed passwords (bcrypt/argon2) and JWT tokens. The swap point is the `login()` action in `src/context/store.tsx`.

---

## 15. Competitive Positioning

| Feature | AirSENS | SAM (ASA) | Blue Eye (MRX) | OASES | Traxxall |
|---|---|---|---|---|---|
| Modern web UI | ✅ | ❌ (legacy) | ❌ (Windows app) | ❌ (legacy) | Partial |
| Mobile responsive | ✅ | ❌ | ❌ | ❌ | Partial |
| AI assistant | ✅ SENS | ❌ | ❌ | Basic (2024) | ❌ |
| Amplification Factor engine | ✅ Unique | ❌ | ❌ | ❌ | ❌ |
| Structural Fatigue Index | ✅ SFI engine | ❌ | ❌ | ❌ | ❌ |
| Real-time flight rollup | ✅ | ✅ | ✅ | ✅ | ✅ |
| MEL dispatch | ✅ Live | ✅ | ✅ | ✅ | ✅ |
| Multi-org platform | ✅ Control Tower | ❌ (single org) | ❌ | Partial | ❌ |
| Transparent pricing | ✅ (planned) | ❌ | ❌ | ❌ | ❌ |
| Caribbean/African market focus | ✅ | ❌ | ❌ | ❌ | ❌ |
| Self-onboarding | ✅ (planned) | ❌ | ❌ | ❌ | ❌ |

---

## 16. Roadmap — Backend & Production

### Phase 1 — Current (Complete)
- ✅ Full frontend application with all 18 modules
- ✅ LocalStorage persistence
- ✅ Authentication and role-based access control
- ✅ Two-tier admin (Control Tower + Admin Panel)
- ✅ Amplification Factor engine
- ✅ Structural Fatigue Index engine (Promise's model)
- ✅ Mobile responsive
- ✅ Live on Vercel with auto-deploy
- ✅ CSV and PDF exports

### Phase 2 — Backend (Next)
**What to build:**
- Node.js / Express API (or Supabase for faster start)
- PostgreSQL database (Turso for edge deployment)
- Real authentication: bcrypt password hashing, JWT tokens
- Resend for transactional email (user invites, password reset, MEL alerts)

**Swap point — `src/context/store.tsx`:**
```typescript
// Replace this:
function load(): State { return JSON.parse(localStorage.getItem(KEY)) }
useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)) }, [state])

// With this:
async function load(): State { return await api.get('/state') }
// and dispatch API calls in each action
```

Everything else in the application stays unchanged.

### Phase 3 — Production Features
- Real Claude API for SENS (server-side proxy — API key never in frontend)
- Domain connection (airsens.io or airsens.app via Namecheap → Vercel)
- Real user invitations via Resend email
- Damage tolerance calculation input (Promise's model — to be defined)
- Real aircraft data for Karib Aerospace fleet
- iOS/Android app via Capacitor (wraps existing React app — no rewrite)
- Stripe billing integration for plan management
- Real-time collaboration (multiple users see updates live)

### Phase 4 — Scale
- Multi-region deployment
- Offline mode (service worker + sync on reconnect)
- API for third-party integrations (CAMP, AMOS data feeds)
- White-label capability for larger operators

---

*This document was generated on June 3, 2026 and reflects AirSENS v1.0 as deployed at `https://airsens-karib-l8n2.vercel.app`.*

*Karib Aerospace Ltd — Confidential and Proprietary*
