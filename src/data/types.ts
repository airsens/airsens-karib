// ============================================================
// AirSENS domain model — typed entities
// ============================================================

export type Status = 'airworthy' | 'due-soon' | 'overdue' | 'aog';

// ---- Access control ----
export type Role = 'superadmin' | 'org-admin' | 'engineer' | 'viewer';
export type Permission = 'view' | 'read' | 'write' | 'edit';

// modules that can be permission-gated
export type ModuleKey =
  | 'dashboard' | 'aircraft' | 'components' | 'fleet-planning' | 'logbook'
  | 'amp' | 'adsb' | 'mel' | 'reliability' | 'configuration'
  | 'work-orders' | 'inventory' | 'tools-manuals' | 'sales'
  | 'amplification' | 'structural' | 'ageing' | 'admin';

export interface User {
  id: string;
  name: string;
  title: string;          // e.g. "B1 Licensed Engineer"
  email: string;
  password: string;       // demo only — hashed/served by backend in production
  role: Role;
  orgId: string;
  licenseNo?: string;
  active: boolean;
  createdAt: string;
  // per-module permission grants (org-admin manages these for engineers)
  permissions: Record<string, Permission[]>;
}

export interface Organization {
  id: string;
  name: string;
  icaoPrefix: string;
  approvalRef: string;    // e.g. "EASA Part-CAMO / Part-145 ref"
}

export interface Engine {
  id: string;
  aircraftId: string;
  position: number;       // 1, 2 ...
  model: string;
  sn: string;
  hours: number;
  cycles: number;
  tbo: number;            // hrs between overhaul
  sinceOverhaul: number;
}

export interface AuditEntry {
  id: string;
  ts: string;
  userId: string;
  userName: string;
  action: string;
  detail: string;
}

export interface Aircraft {
  id: string;
  registration: string;
  model: string;
  variant: string;
  msn: string;            // manufacturer serial number
  owner: string;
  base: string;          // ICAO
  status: Status;
  totalHours: number;
  totalCycles: number;
  lastFlight: string;
  nextCheck: { type: string; dueDate: string; dueHours: number };
  utilizationDaily: number; // avg hrs/day
  yearOfMfg: number;
  engines: number;
  defectsOpen: number;
  melActive: number;
  // maintenance program: recurring checks by hours/cycles/calendar
  maintProgram?: MaintTask[];
}

// A scheduled maintenance task threshold (5000h, 1000h, 100h, daily, etc.)
export interface MaintTask {
  id: string;
  code: string;          // e.g. "A-CHECK", "100HR", "DAILY"
  label: string;
  intervalType: 'hours' | 'cycles' | 'days';
  interval: number;      // every N hours/cycles/days
  lastDoneHours: number; // airframe hours at last completion
  lastDoneCycles: number;
  lastDoneDate: string;
}

export interface Component {
  id: string;
  pn: string;
  sn: string;
  name: string;
  category: 'rotable' | 'fixed' | 'consumable';
  aircraftId: string | null;
  parentId: string | null;
  position: string;
  status: Status;
  installedHours: number;
  tbo: number;            // time between overhaul
  sinceOverhaul: number;
  lifeLimit: number | null;
  sinceNew: number;
}

export interface WorkOrder {
  id: string;
  wo: string;
  title: string;
  aircraftId: string;
  type: 'scheduled' | 'unscheduled' | 'ad-sb' | 'mod';
  priority: 'low' | 'med' | 'high' | 'aog';
  state: 'backlog' | 'planned' | 'in-progress' | 'qa' | 'closed';
  manHoursEst: number;
  manHoursActual: number;
  assignee: string;
  zone: string;
  openedDate: string;
  dueDate: string;
  tasks: number;
  tasksDone: number;
}

export interface ADSB {
  id: string;
  ref: string;
  kind: 'AD' | 'SB';
  subject: string;
  authority: 'EASA' | 'FAA' | 'OEM';
  classification: 'mandatory' | 'recommended' | 'optional';
  issueDate: string;
  effectiveDate: string;
  revision: string;
  applicableModels: string[];
  status: 'open' | 'in-work' | 'complied' | 'n/a';
  compliance: number; // 0-100 across fleet
}

export interface MELItem {
  id: string;
  ref: string;
  system: string;
  ata: string;
  description: string;
  category: 'A' | 'B' | 'C' | 'D';
  rectificationDays: number;
  aircraftId: string | null;
  active: boolean;
  raisedDate: string;
}

export interface InventoryItem {
  id: string;
  pn: string;
  description: string;
  qty: number;
  minQty: number;
  location: string;
  unitCost: number;
  shelfLifeDate: string | null;
  category: string;
}

export interface FlightLog {
  id: string;
  date: string;
  aircraftId: string;
  from: string;
  to: string;
  blockHours: number;
  cycles: number;        // landings this entry
  engineHours?: number;  // hrs added to engines (usually = blockHours)
  engineCycles?: number; // cycles added to engines
  payloadKg: number;
  loadFactor: number; // 0-1
  loggedBy?: string;     // user name
}

export interface Defect {
  id: string;
  aircraftId: string;
  ata: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  safetyCritical: boolean;       // drives MEL category
  melCategory: 'A' | 'B' | 'C' | 'D' | null;
  raisedDate: string;
  dueDate: string | null;        // raised + rectification window
  status: 'open' | 'deferred' | 'closed';
  melRef: string | null;
  reportedBy?: string;
  closedDate?: string | null;
}
