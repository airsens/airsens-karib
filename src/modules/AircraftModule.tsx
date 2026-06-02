import React, { useState } from 'react';
import { Plane, X, Gauge, Clock, RotateCw, Wrench, AlertTriangle, BookOpen, Activity } from 'lucide-react';
import { PageHeader, StatusBadge, Bar } from '../components/ui';
import { useStore } from '../context/store';
import { LogFlightDrawer } from './LogFlight';
import { RaiseDefectDrawer } from './RaiseDefect';
import type { Aircraft } from '../data/types';

export const AircraftModule: React.FC = () => {
  const { aircraft, can } = useStore();
  const [sel, setSel] = useState<Aircraft | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const list = aircraft.filter(a => filter === 'all' || a.status === filter);

  return (
    <div>
      <PageHeader eyebrow="CAMO · Fleet" title="Aircraft Management"
        sub="Core register of airframes, hours, cycles and airworthiness status." />

      <div className="row gap-8 wrap" style={{ marginBottom: 16 }}>
        {['all', 'airworthy', 'due-soon', 'overdue', 'aog'].map(f => (
          <button key={f} className={`btn sm ${filter === f ? 'primary' : 'ghost'}`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f.replace('-', ' ')}</button>
        ))}
      </div>

      <div className="panel fade-up">
        <table className="tbl">
          <thead><tr>
            <th>Registration</th><th>Model</th><th>Owner</th><th>Base</th>
            <th>Total Hrs</th><th>Cycles</th><th>Next Check</th><th>Status</th>
          </tr></thead>
          <tbody>
            {list.map(a => (
              <tr key={a.id} onClick={() => setSel(a)}>
                <td className="num hi" style={{ fontWeight: 600 }}>{a.registration}</td>
                <td>{a.model} <span className="muted">{a.variant}</span></td>
                <td>{a.owner}</td>
                <td className="num muted">{a.base}</td>
                <td className="num">{a.totalHours.toLocaleString()}</td>
                <td className="num">{a.totalCycles.toLocaleString()}</td>
                <td>{a.nextCheck.type} <span className="muted num">· {a.nextCheck.dueDate}</span></td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && <AircraftDrawer acId={sel.id} onClose={() => setSel(null)} canWrite={can('logbook', 'write')} canDefect={can('mel', 'write') || can('aircraft', 'write')} />}
    </div>
  );
};

const AircraftDrawer: React.FC<{ acId: string; onClose: () => void; canWrite: boolean; canDefect: boolean }> = ({ acId, onClose, canWrite, canDefect }) => {
  const { aircraft, engines, components, workOrders, defects } = useStore();
  const [logging, setLogging] = useState(false);
  const [defecting, setDefecting] = useState(false);

  const ac = aircraft.find(a => a.id === acId)!;
  const engs = engines.filter(e => e.aircraftId === acId);
  const comps = components.filter(c => c.aircraftId === acId);
  const wos = workOrders.filter(w => w.aircraftId === acId && w.state !== 'closed');
  const defs = defects.filter(d => d.aircraftId === acId && d.status !== 'closed');

  // maintenance program countdowns
  const tasks = (ac.maintProgram ?? []).map(t => {
    let remaining: number, unit: string, pct: number;
    if (t.intervalType === 'hours') { remaining = (t.lastDoneHours + t.interval) - ac.totalHours; unit = 'h'; pct = Math.max(0, Math.min(100, (remaining / t.interval) * 100)); }
    else if (t.intervalType === 'cycles') { remaining = (t.lastDoneCycles + t.interval) - ac.totalCycles; unit = 'cyc'; pct = Math.max(0, Math.min(100, (remaining / t.interval) * 100)); }
    else { const n = new Date(t.lastDoneDate); n.setDate(n.getDate() + t.interval); remaining = Math.round((n.getTime() - Date.now()) / 864e5); unit = 'days'; pct = Math.max(0, Math.min(100, (remaining / t.interval) * 100)); }
    return { ...t, remaining: Math.round(remaining), unit, pct };
  }).sort((a, b) => a.pct - b.pct);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(600px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 41, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.5)' }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 2 }}>
          <div className="row gap-12">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}><Plane size={22} className="tcyan" /></div>
            <div><div className="num hi" style={{ fontSize: 20, fontWeight: 700 }}>{ac.registration}</div><div className="muted" style={{ fontSize: 12.5 }}>{ac.model} {ac.variant} · MSN {ac.msn}</div></div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>

        <div style={{ padding: 22 }}>
          <div className="row between" style={{ marginBottom: 16 }}>
            <StatusBadge status={ac.status} />
            <span className="muted" style={{ fontSize: 12.5 }}>{ac.owner} · {ac.base} · MFG {ac.yearOfMfg}</span>
          </div>

          {/* Action buttons */}
          <div className="row gap-8" style={{ marginBottom: 20 }}>
            <button className="btn primary" style={{ flex: 1, justifyContent: 'center' }} disabled={!canWrite}
              onClick={() => setLogging(true)} title={canWrite ? '' : 'You lack write access to Logbook'}>
              <BookOpen size={16} /> Log Flight / Hours
            </button>
            <button className="btn" style={{ flex: 1, justifyContent: 'center' }} disabled={!canDefect}
              onClick={() => setDefecting(true)} title={canDefect ? '' : 'You lack write access'}>
              <AlertTriangle size={16} /> Raise Defect
            </button>
          </div>

          <div className="grid-2col" style={{ gap: 12, marginBottom: 20 }}>
            {[
              { l: 'Airframe Hours', v: ac.totalHours.toLocaleString(), i: <Clock size={15} /> },
              { l: 'Airframe Cycles', v: ac.totalCycles.toLocaleString(), i: <RotateCw size={15} /> },
              { l: 'Daily Utilization', v: `${ac.utilizationDaily} h`, i: <Gauge size={15} /> },
              { l: 'Last Flight', v: ac.lastFlight, i: <Activity size={15} /> },
            ].map(s => (
              <div key={s.l} className="panel panel-pad" style={{ padding: 14 }}>
                <div className="row gap-8 muted eyebrow" style={{ fontSize: 9 }}>{s.i}{s.l}</div>
                <div className="num hi" style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Engines */}
          <Section title="Engines" icon={<Gauge size={14} />} count={engs.length}>
            {engs.map(e => (
              <div key={e.id} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                <div><span className="hi">#{e.position} {e.model}</span> <span className="muted num">· {e.sn}</span></div>
                <span className="num muted">{e.hours.toLocaleString()}h / {e.cycles.toLocaleString()}c</span>
              </div>
            ))}
          </Section>

          {/* Maintenance program countdown */}
          <Section title="Maintenance Program — Next Due" icon={<Wrench size={14} />} count={tasks.length}>
            {tasks.map(t => (
              <div key={t.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div className="row between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                  <span className="hi">{t.label}</span>
                  <span className={`num ${t.remaining < 0 ? 'tred' : t.pct < 15 ? 'tamber' : 'muted'}`}>
                    {t.remaining < 0 ? `${Math.abs(t.remaining)} ${t.unit} OVERDUE` : `${t.remaining.toLocaleString()} ${t.unit} remaining`}
                  </span>
                </div>
                <Bar value={t.pct} color={t.remaining < 0 ? 'var(--red)' : t.pct < 15 ? 'var(--amber)' : 'var(--cyan)'} />
              </div>
            ))}
          </Section>

          <Section title="Open Work Orders" icon={<Wrench size={14} />} count={wos.length}>
            {wos.length ? wos.map(w => (
              <div key={w.id} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                <div><span className="num tcyan">{w.wo}</span> <span className="muted">{w.title}</span></div>
                <span className={`badge ${w.priority === 'aog' ? 'aog' : w.priority === 'high' ? 'crit' : 'muted'}`}>{w.priority}</span>
              </div>
            )) : <Empty text="No open work orders" />}
          </Section>

          <Section title="Open Defects" icon={<AlertTriangle size={14} />} count={defs.length}>
            {defs.length ? defs.map(d => (
              <div key={d.id} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                <div><span className="num muted">ATA {d.ata}</span> {d.description}</div>
                <span className={`badge ${d.melCategory === 'A' ? 'aog' : d.severity === 'critical' ? 'crit' : d.severity === 'major' ? 'warn' : 'muted'}`}>{d.melCategory ? `MEL ${d.melCategory}` : d.severity}</span>
              </div>
            )) : <Empty text="No open defects" />}
          </Section>

          <Section title="Installed Components" icon={<Gauge size={14} />} count={comps.length}>
            {comps.slice(0, 6).map(c => (
              <div key={c.id} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                <div>{c.name} <span className="muted num">· {c.pn}</span></div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </Section>
        </div>
      </div>

      {logging && <LogFlightDrawer aircraftId={acId} onClose={() => setLogging(false)} />}
      {defecting && <RaiseDefectDrawer aircraftId={acId} onClose={() => setDefecting(false)} />}
    </>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; count: number; children: React.ReactNode }> = ({ title, icon, count, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div className="row gap-8" style={{ marginBottom: 6 }}>
      <span className="eyebrow row gap-8" style={{ color: 'var(--text)' }}>{icon}{title}</span>
      <span className="badge muted" style={{ fontSize: 9 }}>{count}</span>
    </div>
    <div>{children}</div>
  </div>
);
const Empty: React.FC<{ text: string }> = ({ text }) => (
  <div className="muted" style={{ fontSize: 12.5, padding: '10px 0', fontStyle: 'italic' }}>{text}</div>
);
