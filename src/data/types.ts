// ============================================================
// AirSENS domain model — typed entities
// ============================================================

export type Status = 'airworthy' | 'due-soon' | 'overdue' | 'aog';

// ---- Access control ----
export type Role = 'superadmin' | 'org-admin' | 'engineer' | 'pilot' | 'viewer';
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
  title: string;
  email: string;
  password: string;       // demo only — hashed server-side in production
  role: Role;
  orgId: string;
  licenseNo?: string;
  // Phase 1 — licence & rating tracking
  licenceType?: 'B1' | 'B2' | 'B1+B2' | 'C' | 'D' | 'ATPL' | 'CPL' | 'PPL';
  typeRatings?: string[];       // e.g. ['A320', 'B737', 'ATR72']
  licenceExpiry?: string;       // ISO date string
  medicalExpiry?: string;       // ISO date string
  active: boolean;
  createdAt: string;
  permissions: Record<string, Permission[]>;
}

export interface Organization {
  id: string;
  name: string;
  icaoPrefix: string;
  approvalRef: string;
  country: string;
  contactEmail: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  // quotas set by platform owners (Rilwan & Promise)
  maxAdmins: number;        // how many org-admins allowed
  maxUsers: number;         // total users allowed in org
  maxAircraft: number;      // fleet size limit
  // onboarding (mailto invite for now, real email when backend ready)
  inviteSentAt?: string;
  activatedAt?: string;
  notes?: string;           // internal notes from Control Tower
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
  cycles: number;
  engineHours?: number;
  engineCycles?: number;
  payloadKg: number;
  loadFactor: number;
  loggedBy?: string;
  // Phase 1 — Electronic Tech Log (ETL)
  captainSignature?: string;    // base64 or PIN hash
  engineerSignature?: string;   // base64 or PIN hash
  captainName?: string;
  engineerName?: string;
  isLocked?: boolean;           // true after both signatures — immutable
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
