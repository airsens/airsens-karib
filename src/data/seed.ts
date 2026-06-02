import type {
  Aircraft, Component, WorkOrder, ADSB, MELItem,
  InventoryItem, FlightLog, Defect, Status,
  Engine, MaintTask, User, Organization,
} from './types';

// ---- deterministic PRNG so data is stable across reloads ----
let _seed = 20260601;
const rnd = () => { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; };
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const int = (lo: number, hi: number) => Math.floor(lo + rnd() * (hi - lo + 1));
const flt = (lo: number, hi: number, d = 1) => +(lo + rnd() * (hi - lo)).toFixed(d);
const daysFrom = (n: number) => {
  const d = new Date('2026-06-01'); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const MODELS = [
  { model: 'Boeing 737', variant: '800', eng: 2 },
  { model: 'Airbus A320', variant: 'neo', eng: 2 },
  { model: 'ATR 72', variant: '600', eng: 2 },
  { model: 'Bombardier Q400', variant: 'NextGen', eng: 2 },
  { model: 'Cessna Caravan', variant: '208B', eng: 1 },
  { model: 'Bell 412', variant: 'EPI', eng: 2 },
  { model: 'Embraer E190', variant: 'E2', eng: 2 },
];
const OWNERS = ['Karib Air', 'Caribbean Cargo', 'IslandHopper', 'Tropic Wings', 'Leeward Charter', 'Antilles Gov'];
const BASES = ['TNCM', 'TJSJ', 'MKJP', 'TBPB', 'TTPP', 'MDPC'];
const NAMES = ['M. Okafor', 'S. Rampersad', 'J. Beauchamp', 'L. Persaud', 'A. Mensah', 'R. Castillo', 'T. Williams', 'N. Dubois'];

function statusFromMargin(m: number): Status {
  if (m < 0) return 'overdue';
  if (m < 30) return 'due-soon';
  return 'airworthy';
}

// standard maintenance program thresholds (hours/cycles/calendar based)
function makeMaintProgram(totalHours: number, totalCycles: number): MaintTask[] {
  const defs = [
    { code: 'DAILY', label: 'Daily / Pre-flight Inspection', type: 'days' as const, interval: 1 },
    { code: 'WEEKLY', label: 'Weekly Check', type: 'days' as const, interval: 7 },
    { code: '100HR', label: '100-Hour Inspection', type: 'hours' as const, interval: 100 },
    { code: '500HR', label: '500-Hour Inspection', type: 'hours' as const, interval: 500 },
    { code: '1000HR', label: '1,000-Hour / A-Check', type: 'hours' as const, interval: 1000 },
    { code: '5000HR', label: '5,000-Hour / C-Check', type: 'hours' as const, interval: 5000 },
    { code: '2000FC', label: '2,000-Cycle Structural', type: 'cycles' as const, interval: 2000 },
  ];
  return defs.map((d, i) => {
    // last done somewhere within the last interval so "remaining" varies
    const lastHours = d.type === 'hours' ? totalHours - int(0, d.interval) : totalHours - int(0, 200);
    const lastCycles = d.type === 'cycles' ? totalCycles - int(0, d.interval) : totalCycles - int(0, 80);
    const lastDays = d.type === 'days' ? -int(0, d.interval) : -int(0, 60);
    return {
      id: `MT-${i}`,
      code: d.code, label: d.label,
      intervalType: d.type, interval: d.interval,
      lastDoneHours: Math.max(0, lastHours),
      lastDoneCycles: Math.max(0, lastCycles),
      lastDoneDate: daysFrom(lastDays),
    };
  });
}

// ---------------- AIRCRAFT ----------------
export const aircraft: Aircraft[] = Array.from({ length: 14 }).map((_, i) => {
  const m = MODELS[i % MODELS.length];
  const reg = `J7-${String.fromCharCode(65 + i)}${String.fromCharCode(65 + (i * 3) % 26)}${String.fromCharCode(67 + i % 20)}`;
  const util = flt(3, 9, 1);
  const dueInDays = int(-4, 120);
  const checks = ['A-Check', 'C-Check', 'Weekly', '100hr', 'Phase 3'];
  let status = statusFromMargin(dueInDays);
  const aog = i === 4 || i === 9;
  if (aog) status = 'aog';
  const totalHours = int(8000, 58000);
  const totalCycles = int(4000, 39000);
  return {
    id: `AC${i + 1}`,
    registration: reg,
    model: m.model,
    variant: m.variant,
    msn: `${int(20000, 64000)}`,
    owner: pick(OWNERS),
    base: pick(BASES),
    status,
    totalHours,
    totalCycles,
    lastFlight: daysFrom(-int(0, 6)),
    nextCheck: { type: pick(checks), dueDate: daysFrom(dueInDays), dueHours: int(20, 600) },
    utilizationDaily: util,
    yearOfMfg: int(2004, 2022),
    engines: m.eng,
    defectsOpen: aog ? int(3, 6) : int(0, 4),
    melActive: aog ? int(2, 4) : int(0, 3),
    maintProgram: makeMaintProgram(totalHours, totalCycles),
  };
});

// ---------------- ENGINES ----------------
const ENGINE_MODELS = ['CFM56-7B', 'PW1100G', 'PW127M', 'PT6A-114', 'PW150A', 'CF34-10E'];
export const engines: Engine[] = [];
aircraft.forEach((ac, ai) => {
  for (let p = 1; p <= ac.engines; p++) {
    const hrs = Math.round(ac.totalHours * flt(0.7, 1, 2));
    engines.push({
      id: `ENG-${ai}-${p}`,
      aircraftId: ac.id,
      position: p,
      model: ENGINE_MODELS[ai % ENGINE_MODELS.length],
      sn: `ESN${int(500000, 999999)}`,
      hours: hrs,
      cycles: Math.round(ac.totalCycles * flt(0.7, 1, 2)),
      tbo: 20000,
      sinceOverhaul: int(2000, 18000),
    });
  }
});

// ---------------- COMPONENTS ----------------
const COMP_DEFS = [
  { name: 'CFM56 Engine', cat: 'rotable', tbo: 20000, life: null, pos: 'ENG' },
  { name: 'HP Compressor', cat: 'rotable', tbo: 12000, life: 30000, pos: 'ENG-1-CMP' },
  { name: 'Turbine Blade Set', cat: 'rotable', tbo: 8000, life: 20000, pos: 'ENG-1-TRB' },
  { name: 'Main Landing Gear', cat: 'rotable', tbo: 0, life: 60000, pos: 'MLG' },
  { name: 'Nose Gear Actuator', cat: 'rotable', tbo: 9000, life: null, pos: 'NLG-ACT' },
  { name: 'APU GTCP131', cat: 'rotable', tbo: 15000, life: null, pos: 'APU' },
  { name: 'Hydraulic Pump', cat: 'rotable', tbo: 6000, life: null, pos: 'HYD-A' },
  { name: 'IDG Generator', cat: 'rotable', tbo: 11000, life: null, pos: 'ELEC-1' },
  { name: 'Brake Assembly', cat: 'rotable', tbo: 0, life: 5000, pos: 'WHL' },
  { name: 'Fuel Boost Pump', cat: 'fixed', tbo: 7000, life: null, pos: 'FUEL' },
];
export const components: Component[] = [];
aircraft.forEach((ac, ai) => {
  COMP_DEFS.forEach((c, ci) => {
    if (rnd() > 0.72) return; // not all installed everywhere
    const since = c.tbo ? int(0, c.tbo) : int(0, c.life || 40000);
    const remaining = c.tbo ? c.tbo - since : (c.life || 40000) - since;
    const margin = (remaining / (c.tbo || c.life || 40000)) * 100;
    components.push({
      id: `CMP-${ai}-${ci}`,
      pn: `${int(100, 999)}-${int(1000, 9999)}-${int(10, 99)}`,
      sn: `SN${int(100000, 999999)}`,
      name: c.name,
      category: c.cat as Component['category'],
      aircraftId: ac.id,
      parentId: ci > 0 && ci < 3 ? `CMP-${ai}-0` : null,
      position: c.pos,
      status: statusFromMargin(margin),
      installedHours: since,
      tbo: c.tbo,
      sinceOverhaul: since,
      lifeLimit: c.life,
      sinceNew: since + int(0, 5000),
    });
  });
});

// ---------------- WORK ORDERS ----------------
const WO_TITLES = [
  'Scheduled A-Check package', 'Engine borescope inspection', 'Landing gear lubrication',
  'AD 2024-12-08 compliance', 'Cabin pressurization fault', 'Hydraulic leak rectification',
  'Avionics software update', 'Brake wear replacement', 'Wing inspection — DTI',
  'APU oil system service', 'Fuel quantity probe swap', 'Flight control rigging',
];
const STATES: WorkOrder['state'][] = ['backlog', 'planned', 'in-progress', 'qa', 'closed'];
export const workOrders: WorkOrder[] = Array.from({ length: 32 }).map((_, i) => {
  const ac = pick(aircraft);
  const est = int(4, 120);
  const state = pick(STATES);
  const done = state === 'closed' ? 1 : flt(0, 0.9, 2);
  const tasks = int(3, 24);
  const pr = ac.status === 'aog' ? 'aog' : pick(['low', 'med', 'high', 'med', 'high'] as const);
  return {
    id: `WO${i + 1}`,
    wo: `WO-26-${String(1000 + i)}`,
    title: pick(WO_TITLES),
    aircraftId: ac.id,
    type: pick(['scheduled', 'unscheduled', 'ad-sb', 'mod'] as const),
    priority: pr as WorkOrder['priority'],
    state,
    manHoursEst: est,
    manHoursActual: state === 'closed' ? +(est * flt(0.8, 1.3, 2)).toFixed(1) : +(est * done).toFixed(1),
    assignee: pick(NAMES),
    zone: `Z${int(100, 800)}`,
    openedDate: daysFrom(-int(1, 40)),
    dueDate: daysFrom(int(-3, 45)),
    tasks,
    tasksDone: Math.round(tasks * done),
  };
});

// ---------------- AD / SB ----------------
const SUBJECTS = [
  'Fuel tank flammability reduction', 'Rudder control module inspection',
  'Engine fan blade ultrasonic check', 'Wing spar corrosion survey',
  'Cargo door latch reinforcement', 'Pitot heat system update',
  'Flap track wear limits', 'Battery thermal runaway mitigation',
];
export const adsb: ADSB[] = Array.from({ length: 16 }).map((_, i) => {
  const kind = rnd() > 0.45 ? 'AD' : 'SB';
  const comp = int(0, 100);
  return {
    id: `ADSB${i + 1}`,
    ref: kind === 'AD' ? `AD-2026-${String(int(1, 28)).padStart(2, '0')}-${int(1, 19)}` : `SB-${int(700, 799)}-${int(10, 89)}`,
    kind: kind as ADSB['kind'],
    subject: pick(SUBJECTS),
    authority: pick(['EASA', 'FAA', 'OEM'] as const),
    classification: kind === 'AD' ? 'mandatory' : pick(['recommended', 'optional'] as const),
    issueDate: daysFrom(-int(30, 700)),
    effectiveDate: daysFrom(-int(0, 200)),
    revision: `Rev ${pick(['—', 'A', 'B', 'C'])}`,
    applicableModels: [pick(MODELS).model, pick(MODELS).model],
    status: comp === 100 ? 'complied' : comp > 60 ? 'in-work' : pick(['open', 'in-work'] as const),
    compliance: comp,
  };
});

// ---------------- MEL ----------------
const MEL_DEFS = [
  { sys: 'Anti-ice', ata: '30', d: 'Wing anti-ice valve inoperative' },
  { sys: 'Lighting', ata: '33', d: 'Landing light No.2 unserviceable' },
  { sys: 'Hydraulics', ata: '29', d: 'Hydraulic system B low pressure indication' },
  { sys: 'Avionics', ata: '34', d: 'Weather radar tilt control fault' },
  { sys: 'Air cond', ata: '21', d: 'Pack 1 flow control degraded' },
  { sys: 'Doors', ata: '52', d: 'Cargo door warning intermittent' },
];
const CAT_DAYS = { A: 1, B: 3, C: 10, D: 120 };
export const mel: MELItem[] = Array.from({ length: 18 }).map((_, i) => {
  const def = pick(MEL_DEFS);
  const cat = pick(['A', 'B', 'C', 'C', 'D'] as const);
  const active = rnd() > 0.35;
  return {
    id: `MEL${i + 1}`,
    ref: `MEL-${def.ata}-${int(10, 99)}`,
    system: def.sys, ata: def.ata, description: def.d,
    category: cat, rectificationDays: CAT_DAYS[cat],
    aircraftId: active ? pick(aircraft).id : null,
    active, raisedDate: daysFrom(-int(0, 20)),
  };
});

// ---------------- INVENTORY ----------------
const PARTS = [
  'Brake pad set', 'O-ring kit', 'Hydraulic fluid 5606', 'Oil filter element',
  'Fan blade', 'Tire 49x18', 'Igniter plug', 'Fuel nozzle', 'Bleed valve',
  'Landing light', 'Battery NiCd', 'Actuator seal kit', 'Sealant PR1440', 'Rivet pack',
];
export const inventory: InventoryItem[] = PARTS.map((p, i) => {
  const min = int(2, 12);
  return {
    id: `INV${i + 1}`,
    pn: `${int(10, 99)}-${int(10000, 99999)}`,
    description: p,
    qty: int(0, 30),
    minQty: min,
    location: `${pick(['A', 'B', 'C'])}-${int(1, 9)}-${int(10, 40)}`,
    unitCost: flt(15, 8500, 2),
    shelfLifeDate: rnd() > 0.5 ? daysFrom(int(-10, 300)) : null,
    category: pick(['Consumable', 'Rotable', 'Tooling', 'Chemical']),
  };
});

// ---------------- FLIGHT LOGS (90 days) ----------------
export const flightLogs: FlightLog[] = [];
let _fl = 0;
for (let d = 90; d >= 0; d--) {
  aircraft.forEach((ac) => {
    if (ac.status === 'aog' && d < 8) return;
    if (rnd() > 0.62) return;
    const bh = +(ac.utilizationDaily * flt(0.6, 1.4, 2)).toFixed(1);
    const cyc = int(1, 4);
    flightLogs.push({
      id: `FL${++_fl}`,
      date: daysFrom(-d),
      aircraftId: ac.id,
      from: pick(BASES), to: pick(BASES),
      blockHours: bh,
      cycles: cyc,
      engineHours: bh,
      engineCycles: cyc,
      payloadKg: int(2000, 18000),
      loadFactor: flt(0.45, 0.98, 2),
      loggedBy: 'System Import',
    });
  });
}

// ---------------- DEFECTS ----------------
const DEF_DESCS = [
  'Cabin door seal worn', 'Nav light flicker', 'Brake temp sensor erratic',
  'Galley power intermittent', 'Tire pressure low', 'Cockpit window delamination',
  'Engine oil consumption elevated', 'Flap asymmetry warning',
];
const MEL_DAYS = { A: 0, B: 3, C: 10, D: 120 };
// map severity + safety-criticality -> MEL category
function melCatFor(severity: Defect['severity'], safetyCritical: boolean): Defect['melCategory'] {
  if (safetyCritical) return 'A';
  if (severity === 'critical') return 'B';
  if (severity === 'major') return 'C';
  return 'D';
}
export const defects: Defect[] = Array.from({ length: 26 }).map((_, i) => {
  const severity = pick(['minor', 'minor', 'major', 'critical'] as const);
  const safetyCritical = severity === 'critical' && rnd() > 0.5;
  const cat = melCatFor(severity, safetyCritical);
  const raised = daysFrom(-int(0, 30));
  const due = new Date(raised); due.setDate(due.getDate() + MEL_DAYS[cat!]);
  const status = pick(['open', 'open', 'deferred', 'closed'] as const);
  return {
    id: `DEF${i + 1}`,
    aircraftId: pick(aircraft).id,
    ata: pick(['21', '24', '27', '32', '49', '52', '71', '72']),
    description: pick(DEF_DESCS),
    severity,
    safetyCritical,
    melCategory: cat,
    raisedDate: raised,
    dueDate: due.toISOString().slice(0, 10),
    status,
    melRef: rnd() > 0.6 ? pick(mel).ref : null,
    reportedBy: pick(NAMES),
    closedDate: status === 'closed' ? daysFrom(-int(0, 5)) : null,
  };
});

export const KPI = {
  fleetSize: aircraft.length,
  airworthy: aircraft.filter(a => a.status === 'airworthy').length,
  aog: aircraft.filter(a => a.status === 'aog').length,
  dueSoon: aircraft.filter(a => a.status === 'due-soon').length,
  openWO: workOrders.filter(w => w.state !== 'closed').length,
  openDefects: defects.filter(d => d.status !== 'closed').length,
  lowStock: inventory.filter(i => i.qty < i.minQty).length,
  adsbOpen: adsb.filter(a => a.status !== 'complied' && a.status !== 'n/a').length,
};

export const aircraftById = (id: string) => aircraft.find(a => a.id === id);
export const enginesFor = (aircraftId: string) => engines.filter(e => e.aircraftId === aircraftId);

// ---------------- ORGANIZATIONS ----------------
export const organizations: Organization[] = [
  {
    id: 'ORG1',
    name: 'Karib Aerospace',
    icaoPrefix: 'J7',
    approvalRef: 'EASA Part-CAMO / Part-145 · KA-2026',
    country: 'United Kingdom',
    contactEmail: 'karib.aerospace@outlook.com',
    plan: 'enterprise',
    status: 'active',
    createdAt: daysFrom(-200),
    maxAdmins: 3,
    maxUsers: 20,
    maxAircraft: 30,
    activatedAt: daysFrom(-200),
    notes: 'Founding client — Karib Aerospace Ltd',
  },
  {
    id: 'ORG2',
    name: 'Caribbean Wings Ltd',
    icaoPrefix: '9Y',
    approvalRef: 'TTCAA Part-CAMO · CW-2026',
    country: 'Trinidad & Tobago',
    contactEmail: 'ops@caribbeanwings.tt',
    plan: 'professional',
    status: 'pending',
    createdAt: daysFrom(-5),
    maxAdmins: 2,
    maxUsers: 10,
    maxAircraft: 10,
    notes: 'Demo org — awaiting activation',
  },
];

// full permission set helper
const ALL: ('view' | 'read' | 'write' | 'edit')[] = ['view', 'read', 'write', 'edit'];
const allModules = [
  'dashboard', 'aircraft', 'components', 'fleet-planning', 'logbook', 'amp',
  'adsb', 'mel', 'reliability', 'configuration', 'work-orders', 'inventory',
  'tools-manuals', 'sales', 'amplification', 'structural', 'ageing',
];
const fullPerms = () => Object.fromEntries(allModules.map(m => [m, [...ALL]]));
const viewPerms = () => Object.fromEntries(allModules.map(m => [m, ['view', 'read'] as ('view' | 'read')[]]));

// ---------------- USERS (seed) ----------------
// NOTE: passwords are plain here for local demo only. In production these live
// server-side, hashed (bcrypt/argon2), and auth returns a token — never shipped to client.
export const seedUsers: User[] = [
  {
    id: 'U-SUPER', name: 'Rilwan Olowu', title: 'COO',
    email: 'rilwan.olowu@karib-aerospace.com', password: 'admin', role: 'superadmin',
    orgId: 'ORG1', active: true, createdAt: daysFrom(-200),
    permissions: { ...fullPerms(), admin: [...ALL] },
  },
  {
    id: 'U-ADMIN2', name: 'Promise Benebo', title: 'Founder / CEO',
    email: 'promise.benebo@karib-aerospace.com', password: 'admin', role: 'org-admin',
    orgId: 'ORG1', active: true, createdAt: daysFrom(-200),
    permissions: { ...fullPerms(), admin: [...ALL] },
  },
  {
    id: 'U-ENG1', name: 'M. Okafor', title: 'B1 Licensed Engineer',
    email: 'm.okafor@karib-aerospace.com', password: 'engineer', role: 'engineer',
    orgId: 'ORG1', licenseNo: 'EASA-66-B1-44821', active: true, createdAt: daysFrom(-90),
    permissions: {
      ...viewPerms(),
      aircraft: ['view', 'read', 'write', 'edit'], logbook: ['view', 'read', 'write', 'edit'],
      'work-orders': ['view', 'read', 'write', 'edit'], mel: ['view', 'read', 'write'],
      components: ['view', 'read', 'write'],
    },
  },
  {
    id: 'U-ENG2', name: 'S. Rampersad', title: 'B2 Avionics Engineer',
    email: 's.rampersad@karib-aerospace.com', password: 'engineer', role: 'engineer',
    orgId: 'ORG1', licenseNo: 'EASA-66-B2-30192', active: true, createdAt: daysFrom(-60),
    permissions: {
      ...viewPerms(),
      logbook: ['view', 'read', 'write'], 'work-orders': ['view', 'read', 'write', 'edit'],
      mel: ['view', 'read', 'write'],
    },
  },
  {
    id: 'U-VIEW1', name: 'L. Persaud', title: 'Quality Auditor',
    email: 'l.persaud@karib-aerospace.com', password: 'viewer', role: 'viewer',
    orgId: 'ORG1', active: true, createdAt: daysFrom(-30),
    permissions: viewPerms(),
  },
];

export { allModules };

