import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Plane, Boxes, CalendarRange, BookOpen, ClipboardList,
  FileWarning, ListChecks, Activity, GitBranch, Wrench, Package, FileText,
  Receipt, Gauge, ShieldCheck, History, Search, Bell, ChevronRight, Radar,
  LogOut, Users, AlertTriangle, X, Clock, PackageX, CornerDownLeft,
} from 'lucide-react';
import { useStore } from '../context/store';
import type { ModuleKey } from '../data/types';
import { inventory as seedInventory } from '../data/seed';

const NAV: { group: string; items: { to: string; label: string; icon: React.ReactNode; mod: ModuleKey }[] }[] = [
  { group: 'Overview', items: [
    { to: '/', label: 'Command Deck', icon: <LayoutDashboard size={17} />, mod: 'dashboard' },
  ]},
  { group: 'CAMO · Airworthiness', items: [
    { to: '/aircraft',      label: 'Aircraft',          icon: <Plane size={17} />,        mod: 'aircraft' },
    { to: '/components',    label: 'Components',         icon: <Boxes size={17} />,        mod: 'components' },
    { to: '/fleet-planning',label: 'Fleet Planning',     icon: <CalendarRange size={17} />,mod: 'fleet-planning' },
    { to: '/logbook',       label: 'Logbook & Ops',      icon: <BookOpen size={17} />,     mod: 'logbook' },
    { to: '/amp',           label: 'Maint. Program',     icon: <ClipboardList size={17} />,mod: 'amp' },
    { to: '/adsb',          label: 'AD / SB Tracking',   icon: <FileWarning size={17} />,  mod: 'adsb' },
    { to: '/mel',           label: 'MEL',                icon: <ListChecks size={17} />,   mod: 'mel' },
    { to: '/reliability',   label: 'Reliability',        icon: <Activity size={17} />,     mod: 'reliability' },
    { to: '/configuration', label: 'Configuration',      icon: <GitBranch size={17} />,    mod: 'configuration' },
  ]},
  { group: 'MRO · Execution', items: [
    { to: '/work-orders',   label: 'Work Orders',        icon: <Wrench size={17} />,       mod: 'work-orders' },
    { to: '/inventory',     label: 'Inventory',          icon: <Package size={17} />,      mod: 'inventory' },
    { to: '/tools-manuals', label: 'Tools & Manuals',    icon: <FileText size={17} />,     mod: 'tools-manuals' },
    { to: '/sales',         label: 'Sales & Invoice',    icon: <Receipt size={17} />,      mod: 'sales' },
  ]},
  { group: 'Engineering', items: [
    { to: '/amplification', label: 'Amplification Factor',  icon: <Gauge size={17} />,      mod: 'amplification' },
    { to: '/structural',    label: 'Structural (DTE/DTI)',   icon: <ShieldCheck size={17} />,mod: 'structural' },
    { to: '/ageing',        label: 'Ageing Aircraft',        icon: <History size={17} />,    mod: 'ageing' },
  ]},
];

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Super Admin', 'org-admin': 'Org Admin', engineer: 'Engineer', viewer: 'Viewer',
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loc      = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, can, aircraft, workOrders, components, defects } = useStore();
  const isAdmin  = currentUser?.role === 'superadmin' || currentUser?.role === 'org-admin';

  const allItems = [...NAV.flatMap(g => g.items), { to: '/admin', label: 'Admin Panel', mod: 'admin' as ModuleKey }];
  const crumb    = allItems.find(i => i.to === loc.pathname)?.label ?? 'Overview';

  const aogCount = aircraft.filter(a => a.status === 'aog').length;
  const dueCount = aircraft.filter(a => a.status === 'due-soon').length;
  const okCount  = aircraft.filter(a => a.status === 'airworthy').length;

  const initials = (currentUser?.name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('');

  // ── global search ──────────────────────────────────────────
  const [query,      setQuery]      = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchBtnRef = useRef<HTMLDivElement>(null);
  const [searchPos, setSearchPos] = useState({ top: 0, left: 0 });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as { type: string; label: string; sub: string; to: string }[];
    const out: { type: string; label: string; sub: string; to: string }[] = [];
    aircraft.forEach(a => {
      if (a.registration.toLowerCase().includes(q) || a.model.toLowerCase().includes(q) || a.msn.includes(q))
        out.push({ type: 'Aircraft', label: a.registration, sub: `${a.model} ${a.variant} · ${a.status}`, to: '/aircraft' });
    });
    workOrders.forEach(w => {
      if (w.wo.toLowerCase().includes(q) || w.title.toLowerCase().includes(q))
        out.push({ type: 'Work Order', label: w.wo, sub: w.title, to: '/work-orders' });
    });
    components.forEach(c => {
      if (c.pn.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sn.toLowerCase().includes(q))
        out.push({ type: 'Component', label: c.name, sub: `P/N ${c.pn} · S/N ${c.sn}`, to: '/components' });
    });
    defects.forEach(d => {
      if (d.description.toLowerCase().includes(q) || d.ata.includes(q) || (d.melRef ?? '').toLowerCase().includes(q))
        out.push({ type: 'Defect', label: d.description, sub: `ATA ${d.ata}${d.melCategory ? ` · MEL ${d.melCategory}` : ''}`, to: '/mel' });
    });
    seedInventory.forEach(i => {
      if (i.pn.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
        out.push({ type: 'Part', label: i.description, sub: `P/N ${i.pn} · qty ${i.qty}`, to: '/inventory' });
    });
    return out.slice(0, 8);
  }, [query, aircraft, workOrders, components, defects]);

  const openSearch = () => {
    if (searchBtnRef.current) {
      const r = searchBtnRef.current.getBoundingClientRect();
      setSearchPos({ top: r.bottom + 8, left: r.left });
    }
    setSearchOpen(true);
  };

  const goTo = (to: string) => { setQuery(''); setSearchOpen(false); navigate(to); };

  // ── notifications ──────────────────────────────────────────
  const notifications = useMemo(() => {
    const list: { icon: React.ReactNode; title: string; sub: string; to: string; tone: string }[] = [];
    aircraft.filter(a => a.status === 'aog').forEach(a =>
      list.push({ icon: <AlertTriangle size={14} />, title: `${a.registration} is AOG`, sub: 'Review blocking defects', to: '/aircraft', tone: 'var(--red)' }));
    defects.filter(d => d.status !== 'closed' && d.dueDate && new Date(d.dueDate).getTime() < Date.now()).forEach(d =>
      list.push({ icon: <ListChecks size={14} />, title: `MEL ${d.melCategory ?? ''} overdue`, sub: `${d.description} · ATA ${d.ata}`, to: '/mel', tone: 'var(--red)' }));
    aircraft.filter(a => a.status === 'due-soon').forEach(a =>
      list.push({ icon: <Clock size={14} />, title: `${a.registration} check due soon`, sub: `${a.nextCheck.type} · ${a.nextCheck.dueDate}`, to: '/fleet-planning', tone: 'var(--amber)' }));
    seedInventory.filter(i => i.qty < i.minQty).forEach(i =>
      list.push({ icon: <PackageX size={14} />, title: `Low stock: ${i.description}`, sub: `${i.qty} on hand · min ${i.minQty}`, to: '/inventory', tone: 'var(--amber)' }));
    return list;
  }, [aircraft, defects]);

  const [bellOpen, setBellOpen] = useState(false);
  const bellBtnRef = useRef<HTMLButtonElement>(null);
  const [bellPos,  setBellPos]  = useState({ top: 0, right: 0 });

  const openBell = () => {
    if (bellBtnRef.current) {
      const r = bellBtnRef.current.getBoundingClientRect();
      setBellPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setBellOpen(o => !o);
  };

  // close both popovers on outside click or Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t) &&
          searchBtnRef.current && !searchBtnRef.current.contains(t)) setSearchOpen(false);
      if (bellBtnRef.current && !bellBtnRef.current.contains(t)) setBellOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setBellOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 1 }}>

      {/* ── sidebar ── */}
      <aside style={{ width: 'var(--sidebar-w)', flexShrink: 0, background: 'var(--bg-deep)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="row gap-12" style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, var(--cyan), var(--cyan-dim))', boxShadow: '0 0 18px var(--cyan-glow)', flexShrink: 0 }}>
            <Radar size={20} color="#04181a" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-hi)', letterSpacing: '.02em' }}>Air<span className="tcyan">SENS</span></div>
            <div className="eyebrow" style={{ fontSize: 9 }}>Karib Aerospace</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {NAV.map((g) => {
            const visible = g.items.filter(it => can(it.mod, 'view'));
            if (!visible.length) return null;
            return (
              <div key={g.group} style={{ marginBottom: 16 }}>
                <div className="eyebrow" style={{ padding: '4px 10px 8px', fontSize: 9 }}>{g.group}</div>
                {visible.map((it) => (
                  <NavLink key={it.to} to={it.to} end={it.to === '/'}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 11, padding: '8.5px 11px', borderRadius: 8,
                      fontSize: 13, fontWeight: 500, marginBottom: 2,
                      color: isActive ? 'var(--text-hi)' : 'var(--text-dim)',
                      background: isActive ? 'var(--bg-elevated)' : 'transparent',
                      boxShadow: isActive ? 'inset 2px 0 0 var(--cyan)' : 'none', transition: 'all .12s',
                    })}>
                    {it.icon}<span>{it.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
          {isAdmin && (
            <div style={{ marginBottom: 16 }}>
              <div className="eyebrow" style={{ padding: '4px 10px 8px', fontSize: 9 }}>Administration</div>
              <NavLink to="/admin" style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11, padding: '8.5px 11px', borderRadius: 8,
                fontSize: 13, fontWeight: 500, marginBottom: 2,
                color: isActive ? 'var(--text-hi)' : 'var(--text-dim)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                boxShadow: isActive ? 'inset 2px 0 0 var(--amber)' : 'none',
              })}>
                <Users size={17} /><span>Admin Panel</span>
              </NavLink>
            </div>
          )}
        </nav>

        <div style={{ padding: 14, borderTop: '1px solid var(--line)' }}>
          <div className="panel panel-pad" style={{ padding: 13 }}>
            <div className="row between">
              <span className="eyebrow" style={{ fontSize: 9 }}>Fleet Status</span>
              <span className="badge ok" style={{ fontSize: 9 }}><span className="dot pulse" />LIVE</span>
            </div>
            <div className="row gap-12" style={{ marginTop: 10 }}>
              <div><div className="num tgreen" style={{ fontSize: 20, fontWeight: 700 }}>{okCount}</div><div className="eyebrow" style={{ fontSize: 8 }}>Ready</div></div>
              <div><div className="num tamber" style={{ fontSize: 20, fontWeight: 700 }}>{dueCount}</div><div className="eyebrow" style={{ fontSize: 8 }}>Due</div></div>
              <div><div className="num tred"   style={{ fontSize: 20, fontWeight: 700 }}>{aogCount}</div><div className="eyebrow" style={{ fontSize: 8 }}>AOG</div></div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* topbar — no backdropFilter so popovers don't get trapped in its stacking context */}
        <header style={{ height: 'var(--topbar-h)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(8,11,20,.95)', flexShrink: 0 }}>
          <div className="row gap-8 muted" style={{ fontSize: 13 }}>
            <span>AirSENS</span><ChevronRight size={14} /><span className="hi" style={{ fontWeight: 600 }}>{crumb}</span>
          </div>

          <div className="row gap-12">
            {/* search box */}
            <div ref={searchBtnRef} style={{ position: 'relative' }}>
              <div className="row gap-8" style={{ background: 'var(--bg-panel)', border: `1px solid ${searchOpen ? 'var(--cyan-dim)' : 'var(--line)'}`, borderRadius: 8, padding: '7px 12px', width: 260, transition: 'border-color .12s' }}>
                <Search size={15} className="muted" />
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); openSearch(); }}
                  onFocus={openSearch}
                  onKeyDown={e => { if (e.key === 'Enter' && results[0]) goTo(results[0].to); }}
                  placeholder="Search reg, P/N, WO, defect…"
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-hi)', fontSize: 13, width: '100%' }} />
                {query && <button onClick={() => { setQuery(''); setSearchOpen(false); }} className="muted" style={{ display: 'flex' }}><X size={14} /></button>}
              </div>
            </div>

            {/* bell */}
            <div style={{ position: 'relative' }}>
              <button ref={bellBtnRef} className="btn ghost sm" style={{ position: 'relative', padding: 9 }} onClick={openBell}>
                <Bell size={16} />
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, padding: '0 4px', background: 'var(--red)', borderRadius: 8, fontSize: 9.5, fontWeight: 700, color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 0 6px var(--red)' }}>{notifications.length}</span>
                )}
              </button>
            </div>

            {/* user widget */}
            <div className="row gap-8" style={{ paddingLeft: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--violet),var(--blue))', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{currentUser?.name}</div>
                <div className="eyebrow" style={{ fontSize: 8 }}>{ROLE_LABEL[currentUser?.role ?? 'viewer']}</div>
              </div>
            </div>
            <button className="btn ghost sm" style={{ padding: 9 }} onClick={logout} title="Sign out"><LogOut size={16} /></button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '26px 28px' }}>{children}</main>
      </div>

      {/* ── search dropdown — portal, always on top ── */}
      {searchOpen && query && createPortal(
        <div ref={searchRef} className="fade-up" style={{
          position: 'fixed',
          top: searchPos.top,
          left: searchPos.left,
          width: 320,
          maxHeight: 360,
          overflowY: 'auto',
          background: 'var(--bg-panel)',
          border: '1px solid var(--line-bright)',
          borderRadius: 12,
          boxShadow: '0 24px 60px rgba(0,0,0,.8)',
          zIndex: 9999,
          padding: 6,
        }}>
          {results.length === 0
            ? <div className="muted" style={{ padding: 16, textAlign: 'center', fontSize: 12.5 }}>No matches for "{query}".</div>
            : results.map((r, i) => (
              <button key={i} onClick={() => goTo(r.to)} className="row between" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ minWidth: 0 }}>
                  <div className="hi" style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
                  <div className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</div>
                </div>
                <span className="badge muted" style={{ fontSize: 9, flexShrink: 0, marginLeft: 8 }}>{r.type}</span>
              </button>
            ))}
          {results.length > 0 && (
            <div className="row gap-6 muted" style={{ padding: '6px 10px 4px', fontSize: 10, borderTop: '1px solid var(--line)', marginTop: 4 }}>
              <CornerDownLeft size={11} /> Enter to jump to first result
            </div>
          )}
        </div>,
        document.body
      )}

      {/* ── notifications dropdown — portal, always on top ── */}
      {bellOpen && createPortal(
        <div className="fade-up" style={{
          position: 'fixed',
          top: bellPos.top,
          right: bellPos.right,
          width: 300,
          maxHeight: 400,
          overflowY: 'auto',
          background: 'var(--bg-panel)',
          border: '1px solid var(--line-bright)',
          borderRadius: 12,
          boxShadow: '0 24px 60px rgba(0,0,0,.8)',
          zIndex: 9999,
        }}>
          {/* sticky header */}
          <div className="row between" style={{ padding: '11px 14px', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 1 }}>
            <span className="hi" style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
            <div className="row gap-8">
              <span className="badge warn" style={{ fontSize: 9 }}>{notifications.length} active</span>
              <button className="muted" style={{ display: 'flex' }} onClick={() => setBellOpen(false)}><X size={14} /></button>
            </div>
          </div>
          {notifications.length === 0
            ? <div className="muted" style={{ padding: 24, textAlign: 'center', fontSize: 12.5 }}>All clear — no active alerts.</div>
            : notifications.map((n, i) => (
              <button key={i} onClick={() => { setBellOpen(false); navigate(n.to); }}
                className="row gap-10"
                style={{ width: '100%', padding: '10px 14px', borderBottom: '1px solid var(--line)', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ color: n.tone, flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="hi" style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{n.title}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.sub}</div>
                </div>
              </button>
            ))}
        </div>,
        document.body
      )}

    </div>
  );
};
