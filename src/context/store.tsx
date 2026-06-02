// ============================================================
// AirSENS central store — single source of truth.
// Persists to localStorage now; swap `persist`/`load` for API
// calls later and the rest of the app is unchanged.
// ============================================================
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  Aircraft, Engine, FlightLog, Defect, MELItem, User, WorkOrder,
  Component, AuditEntry, Organization,
} from '../data/types';
import {
  aircraft as seedAircraft, engines as seedEngines, flightLogs as seedFlights,
  defects as seedDefects, mel as seedMel, workOrders as seedWO,
  components as seedComponents, seedUsers, organizations as seedOrgs,
} from '../data/seed';

const KEY = 'airsens.state.v1';
const SESSION = 'airsens.session.v1';

interface State {
  aircraft: Aircraft[];
  engines: Engine[];
  flightLogs: FlightLog[];
  defects: Defect[];
  mel: MELItem[];
  workOrders: WorkOrder[];
  components: Component[];
  users: User[];
  organizations: Organization[];
  audit: AuditEntry[];
}

function freshState(): State {
  return {
    aircraft: structuredClone(seedAircraft),
    engines: structuredClone(seedEngines),
    flightLogs: structuredClone(seedFlights),
    defects: structuredClone(seedDefects),
    mel: structuredClone(seedMel),
    workOrders: structuredClone(seedWO),
    components: structuredClone(seedComponents),
    users: structuredClone(seedUsers),
    organizations: structuredClone(seedOrgs),
    audit: [],
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const fresh = freshState();
      // merge: keep saved data but fill in any missing fields from fresh state
      // this handles localStorage from older app versions missing new fields
      return { ...fresh, ...parsed, organizations: parsed.organizations ?? fresh.organizations };
    }
  } catch { /* ignore */ }
  return freshState();
}

const MEL_DAYS = { A: 0, B: 3, C: 10, D: 120 } as const;
function melCatFor(severity: Defect['severity'], safetyCritical: boolean): Defect['melCategory'] {
  if (safetyCritical) return 'A';
  if (severity === 'critical') return 'B';
  if (severity === 'major') return 'C';
  return 'D';
}

// ---- flight rollup: add hours/cycles to airframe, engines, components ----
export interface FlightEntry {
  aircraftId: string; date: string; from: string; to: string;
  blockHours: number; cycles: number; payloadKg: number; loadFactor: number;
}

interface Store extends State {
  currentUser: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  can: (module: string, perm: 'view' | 'read' | 'write' | 'edit') => boolean;
  logFlight: (e: FlightEntry) => void;
  raiseDefect: (d: Partial<Defect> & { aircraftId: string; description: string; severity: Defect['severity']; safetyCritical: boolean; ata: string }) => void;
  closeDefect: (id: string) => void;
  createWorkOrder: (wo: { aircraftId: string; title: string; type: WorkOrder['type']; priority: WorkOrder['priority']; manHoursEst: number; assignee: string; zone: string; dueDate: string }) => void;
  moveWorkOrder: (id: string, to: WorkOrder['state']) => void;
  addUser: (u: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;
  addOrganization: (o: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrganization: (id: string, patch: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  resetData: () => void;
}

const Ctx = createContext<Store | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<State>(load);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { const s = sessionStorage.getItem(SESSION); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ } }, [state]);

  // audit helper — uses ref so it's never stale without re-creating actions
  const currentUserRef = React.useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const audit = useCallback((action: string, detail: string) => {
    const u = currentUserRef.current;
    setState(s => ({ ...s, audit: [{
      id: `AUD${Date.now()}`, ts: new Date().toISOString(),
      userId: u?.id ?? 'anon', userName: u?.name ?? 'Anonymous',
      action, detail,
    }, ...s.audit].slice(0, 500) }));
  }, []); // stable — uses ref internally

  const login: Store['login'] = (email, password) => {
    const u = state.users.find(x => x.email.toLowerCase() === email.toLowerCase().trim());
    if (!u) return { ok: false, error: 'No account found for that email.' };
    if (!u.active) return { ok: false, error: 'This account is deactivated. Contact your admin.' };
    if (u.password !== password) return { ok: false, error: 'Incorrect password.' };
    setCurrentUser(u);
    sessionStorage.setItem(SESSION, JSON.stringify(u));
    return { ok: true };
  };

  const logout = () => { setCurrentUser(null); sessionStorage.removeItem(SESSION); };

  const can: Store['can'] = (module, perm) => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin' || currentUser.role === 'org-admin') return true;
    return currentUser.permissions[module]?.includes(perm) ?? false;
  };

  const recomputeStatus = (ac: Aircraft): Aircraft => {
    // derive status from nearest maintenance threshold
    let minMarginPct = 100;
    (ac.maintProgram ?? []).forEach(t => {
      let remaining = Infinity, span = 1;
      if (t.intervalType === 'hours') { remaining = (t.lastDoneHours + t.interval) - ac.totalHours; span = t.interval; }
      else if (t.intervalType === 'cycles') { remaining = (t.lastDoneCycles + t.interval) - ac.totalCycles; span = t.interval; }
      else {
        const next = new Date(t.lastDoneDate); next.setDate(next.getDate() + t.interval);
        remaining = (next.getTime() - Date.now()) / 864e5; span = t.interval;
      }
      minMarginPct = Math.min(minMarginPct, (remaining / span) * 100);
    });
    let status: Aircraft['status'] = 'airworthy';
    if (minMarginPct < 0) status = 'overdue';
    else if (minMarginPct < 15) status = 'due-soon';
    if (ac.status === 'aog') status = 'aog'; // AOG sticks until cleared elsewhere
    return { ...ac, status };
  };

  const logFlight: Store['logFlight'] = (e) => {
    setState(s => {
      const flightLogs: FlightLog[] = [{
        id: `FL${Date.now()}`,
        date: e.date, aircraftId: e.aircraftId, from: e.from, to: e.to,
        blockHours: e.blockHours, cycles: e.cycles,
        engineHours: e.blockHours, engineCycles: e.cycles,
        payloadKg: e.payloadKg, loadFactor: e.loadFactor,
        loggedBy: currentUser?.name ?? 'Unknown',
      }, ...s.flightLogs];

      const aircraft = s.aircraft.map(a => a.id === e.aircraftId
        ? recomputeStatus({ ...a, totalHours: +(a.totalHours + e.blockHours).toFixed(1), totalCycles: a.totalCycles + e.cycles, lastFlight: e.date })
        : a);

      const engines = s.engines.map(en => en.aircraftId === e.aircraftId
        ? { ...en, hours: +(en.hours + e.blockHours).toFixed(1), cycles: en.cycles + e.cycles, sinceOverhaul: +(en.sinceOverhaul + e.blockHours).toFixed(1) }
        : en);

      // roll hours into installed components' time-in-service
      const components = s.components.map(c => c.aircraftId === e.aircraftId
        ? { ...c, sinceOverhaul: +(c.sinceOverhaul + e.blockHours).toFixed(1), sinceNew: +(c.sinceNew + e.blockHours).toFixed(1), installedHours: +(c.installedHours + e.blockHours).toFixed(1) }
        : c);

      return { ...s, flightLogs, aircraft, engines, components };
    });
    audit('Logged flight', `${e.aircraftId} · ${e.from}→${e.to} · ${e.blockHours}h / ${e.cycles}c`);
  };

  const raiseDefect: Store['raiseDefect'] = (d) => {
    const cat = melCatFor(d.severity, d.safetyCritical);
    const raised = d.raisedDate ?? new Date().toISOString().slice(0, 10);
    const due = new Date(raised); due.setDate(due.getDate() + MEL_DAYS[cat!]);
    const defect: Defect = {
      id: `DEF${Date.now()}`, aircraftId: d.aircraftId, ata: d.ata,
      description: d.description, severity: d.severity, safetyCritical: d.safetyCritical,
      melCategory: cat, raisedDate: raised, dueDate: due.toISOString().slice(0, 10),
      status: 'open', melRef: cat ? `MEL-${d.ata}-${Math.floor(Math.random() * 90 + 10)}` : null,
      reportedBy: currentUser?.name ?? 'Unknown', closedDate: null,
    };
    setState(s => {
      // safety-critical (Cat A) grounds the aircraft; always increment defectsOpen
      const aircraft = s.aircraft.map(a => {
        if (a.id !== d.aircraftId) return a;
        return { ...a, defectsOpen: a.defectsOpen + 1, ...(d.safetyCritical ? { status: 'aog' as const } : {}) };
      });
      return { ...s, defects: [defect, ...s.defects], aircraft };
    });
    audit('Raised defect', `${d.aircraftId} · ATA ${d.ata} · ${d.severity}${d.safetyCritical ? ' (MEL A — AOG)' : ` (MEL ${cat})`}`);
  };

  const closeDefect: Store['closeDefect'] = (id) => {
    setState(s => {
      const defect = s.defects.find(x => x.id === id);
      if (!defect) return s;
      const defects = s.defects.map(x => x.id === id
        ? { ...x, status: 'closed' as const, closedDate: new Date().toISOString().slice(0, 10) }
        : x);
      // recalculate aircraft defectsOpen and clear AOG if no remaining Cat-A open defects
      const aircraft = s.aircraft.map(a => {
        if (a.id !== defect.aircraftId) return a;
        const openCount = defects.filter(d => d.aircraftId === a.id && d.status !== 'closed').length;
        const hasAog = defects.some(d => d.aircraftId === a.id && d.status !== 'closed' && d.melCategory === 'A');
        return { ...a, defectsOpen: openCount, ...(a.status === 'aog' && !hasAog ? { status: 'airworthy' as const } : {}) };
      });
      return { ...s, defects, aircraft };
    });
    audit('Closed defect', id);
  };

  const createWorkOrder: Store['createWorkOrder'] = (w) => {
    setState(s => {
      const seq = s.workOrders.length + 1;
      const wo: WorkOrder = {
        id: `WO${Date.now()}`,
        wo: `WO-26-${String(1000 + seq)}`,
        title: w.title, aircraftId: w.aircraftId, type: w.type, priority: w.priority,
        state: 'backlog', manHoursEst: w.manHoursEst, manHoursActual: 0,
        assignee: w.assignee || 'Unassigned', zone: w.zone || '—',
        openedDate: new Date().toISOString().slice(0, 10), dueDate: w.dueDate,
        tasks: 1, tasksDone: 0,
      };
      return { ...s, workOrders: [wo, ...s.workOrders] };
    });
    audit('Created work order', `${w.title} · ${w.aircraftId} · ${w.priority}`);
  };

  const moveWorkOrder: Store['moveWorkOrder'] = (id, to) => {
    setState(s => ({ ...s, workOrders: s.workOrders.map(w => {
      if (w.id !== id) return w;
      // closing marks all tasks done; reopening from closed resets actuals sensibly
      const tasksDone = to === 'closed' ? w.tasks : Math.min(w.tasksDone, w.tasks);
      return { ...w, state: to, tasksDone };
    }) }));
  };

  const addUser: Store['addUser'] = (u) => {
    const user: User = { ...u, id: `U-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
    setState(s => ({ ...s, users: [...s.users, user] }));
    audit('Created user', `${u.name} · ${u.role}`);
  };
  const updateUser: Store['updateUser'] = (id, patch) => {
    setState(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, ...patch } : u) }));
    audit('Updated user', id);
  };
  const removeUser: Store['removeUser'] = (id) => {
    setState(s => ({ ...s, users: s.users.filter(u => u.id !== id) }));
    audit('Removed user', id);
  };

  const addOrganization: Store['addOrganization'] = (o) => {
    const org: Organization = { ...o, id: `ORG${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
    setState(s => ({ ...s, organizations: [...s.organizations, org] }));
    audit('Created organisation', `${o.name} · ${o.plan}`);
  };
  const updateOrganization: Store['updateOrganization'] = (id, patch) => {
    setState(s => ({ ...s, organizations: s.organizations.map(o => o.id === id ? { ...o, ...patch } : o) }));
    audit('Updated organisation', id);
  };
  const removeOrganization: Store['removeOrganization'] = (id) => {
    setState(s => ({ ...s, organizations: s.organizations.filter(o => o.id !== id) }));
    audit('Removed organisation', id);
  };

  const resetData = () => { setState(freshState()); audit('Reset demo data', 'full reset'); };

  // org-scoped user list: superadmins see all, org-admins see only their org
  const scopedUsers = (currentUser?.role === 'superadmin')
    ? state.users
    : state.users.filter(u => u.orgId === currentUser?.orgId);

  const value: Store = {
    ...state,
    users: scopedUsers,   // org-scoped — superadmins see all, org-admins see own org only
    currentUser, login, logout, can,
    logFlight, raiseDefect, closeDefect, createWorkOrder, moveWorkOrder,
    addUser, updateUser, removeUser,
    addOrganization, updateOrganization, removeOrganization,
    resetData,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore must be used inside StoreProvider');
  return c;
};
