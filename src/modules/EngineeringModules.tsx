import React, { useState } from 'react';
import { GitBranch, ShieldCheck, History, Upload, Plus, FileCheck, AlertTriangle } from 'lucide-react';
import { PageHeader, PanelHead, StatusBadge, Bar, KpiCard } from '../components/ui';
import { useStore } from '../context/store';
import { useToast } from '../components/Toast';

/* ---------------- CONFIGURATION MANAGEMENT ---------------- */
export const ConfigurationModule: React.FC = () => {
  const { aircraft } = useStore();
  const [acId, setAcId] = useState(aircraft[0].id);
  const ac = aircraft.find(a => a.id === acId)!;
  const timeline = [
    { phase: 'As-Designed', date: '2014-03-01', desc: 'OEM baseline configuration delivered', state: 'locked' },
    { phase: 'As-Built', date: '2014-06-18', desc: 'Final assembly + customer options (winglets, IFE)', state: 'locked' },
    { phase: 'Mod SB-737-118', date: '2018-09-22', desc: 'Fuel tank flammability reduction installed', state: 'applied' },
    { phase: 'Mod STC-21442', date: '2021-02-10', desc: 'ADS-B Out upgrade, GPS sensor swap', state: 'applied' },
    { phase: 'As-Maintained', date: '2026-05-30', desc: `Current effective configuration — ${ac.registration}`, state: 'current' },
  ];
  return (
    <div>
      <PageHeader eyebrow="CAMO · Lifecycle" title="Configuration Management"
        sub="As-Designed → As-Built → As-Maintained lifecycle with deviation tracking." />
      <div className="row gap-8 wrap" style={{ marginBottom: 18 }}>
        <span className="eyebrow" style={{ alignSelf: 'center' }}>Aircraft</span>
        <select className="select" style={{ width: 260 }} value={acId} onChange={e => setAcId(e.target.value)}>
          {aircraft.map(a => <option key={a.id} value={a.id}>{a.registration} — {a.model} {a.variant}</option>)}
        </select>
      </div>
      <div className="panel fade-up">
        <PanelHead title={`Configuration Evolution — ${ac.registration}`} icon={<GitBranch size={15} className="tcyan" />} />
        <div style={{ padding: '24px 28px' }}>
          {timeline.map((t, i) => (
            <div key={i} className="fade-up" style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 16, animationDelay: `${i * 70}ms` }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  background: t.state === 'current' ? 'var(--cyan)' : 'var(--bg-elevated)',
                  border: `2px solid ${t.state === 'current' ? 'var(--cyan)' : 'var(--line-bright)'}`,
                  boxShadow: t.state === 'current' ? '0 0 12px var(--cyan-glow)' : 'none', marginTop: 4,
                }} />
                {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--line)', minHeight: 40 }} />}
              </div>
              <div style={{ paddingBottom: 22 }}>
                <div className="row gap-8 wrap">
                  <span className="hi" style={{ fontWeight: 600, fontSize: 14 }}>{t.phase}</span>
                  <span className={`badge ${t.state === 'current' ? 'info' : t.state === 'applied' ? 'ok' : 'muted'}`} style={{ textTransform: 'capitalize' }}>{t.state}</span>
                  <span className="num muted" style={{ fontSize: 11.5 }}>{t.date}</span>
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------- STRUCTURAL DTE / DTI ---------------- */
export const StructuralModule: React.FC = () => {
  const toast = useToast();
  const [load, setLoad] = useState(62);
  // damage tolerance: inspection interval shrinks as stress rises
  const interval = Math.round(12000 * Math.pow(0.5, (load - 40) / 30));
  const repairs = [
    { id: 'RPR-2201', loc: 'Wing lower skin STA 540', type: 'Doubler', dti: 'Cat B', status: 'airworthy' as const },
    { id: 'RPR-2202', loc: 'Fuselage frame FR42', type: 'Crack stop', dti: 'Cat C', status: 'due-soon' as const },
    { id: 'RPR-2203', loc: 'Stabilizer attach lug', type: 'Bushing replace', dti: 'Cat A', status: 'overdue' as const },
  ];
  return (
    <div>
      <PageHeader eyebrow="Engineering · Structures" title="Structural Repair Evaluation (DTE/DTI)"
        sub="Damage tolerance evaluation, fatigue assessment and inspection interval derivation."
        actions={<button className="btn primary" onClick={() => toast.push('Drawing upload is coming soon.')}><Upload size={15} /> Upload Drawing</button>} />
      <div className="grid" style={{ gridTemplateColumns: '360px 1fr', alignItems: 'start' }}>
        <div className="panel fade-up">
          <PanelHead title="Damage Tolerance Calculator" icon={<ShieldCheck size={15} className="tcyan" />} />
          <div style={{ padding: 20 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="eyebrow" style={{ color: 'var(--text)' }}>Stress Level (% limit)</span>
              <span className="num tcyan" style={{ fontSize: 14, fontWeight: 600 }}>{load}%</span>
            </div>
            <input type="range" min={40} max={95} value={load} onChange={e => setLoad(+e.target.value)} style={{ width: '100%', accentColor: 'var(--cyan)' }} />
            <div className="panel panel-pad" style={{ marginTop: 20, background: 'var(--bg-deep)' }}>
              <div className="eyebrow row gap-8"><FileCheck size={13} />Derived Inspection Interval</div>
              <div className="num" style={{ fontSize: 34, fontWeight: 800, color: interval < 2000 ? 'var(--red)' : interval < 5000 ? 'var(--amber)' : 'var(--green)', marginTop: 8 }}>
                {interval.toLocaleString()}<span style={{ fontSize: 14, color: 'var(--text-dim)' }}> FH</span>
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
                {load > 80 ? 'High stress — frequent NDT required' : load > 60 ? 'Moderate — standard sampling' : 'Low — extended interval acceptable'}
              </div>
            </div>
          </div>
        </div>
        <div className="panel fade-up" style={{ animationDelay: '80ms' }}>
          <PanelHead title="Logged Repairs" icon={<AlertTriangle size={15} className="tamber" />} />
          <table className="tbl">
            <thead><tr><th>Repair ID</th><th>Location</th><th>Type</th><th>DTI Cat</th><th>Status</th></tr></thead>
            <tbody>
              {repairs.map(r => (
                <tr key={r.id}>
                  <td className="num hi">{r.id}</td><td>{r.loc}</td><td>{r.type}</td>
                  <td><span className="badge muted">{r.dti}</span></td>
                  <td><StatusBadge status={r.status} label={r.status === 'airworthy' ? 'Within Limits' : r.status === 'due-soon' ? 'Inspect Soon' : 'Action Reqd'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------------- AGEING AIRCRAFT ---------------- */
export const AgeingModule: React.FC = () => {
  const { aircraft } = useStore();
  const toast = useToast();
  const aged = aircraft.map(a => ({ ...a, age: 2026 - a.yearOfMfg })).sort((a, b) => b.age - a.age);
  const programs = [
    { name: 'Corrosion Prevention & Control (CPCP)', ref: 'AMC 20-20', due: 8 },
    { name: 'Structural Significant Items (SSI)', ref: 'ICAO Annex 8', due: 3 },
    { name: 'Widespread Fatigue Damage (WFD)', ref: 'AMC 20-20', due: 5 },
    { name: 'Repair Assessment Program (RAP)', ref: 'FAA AC 91-56', due: 2 },
  ];
  return (
    <div>
      <PageHeader eyebrow="Engineering · Compliance" title="Ageing Aircraft Audit"
        sub="Age-related deterioration programs per AMC 20-20 & ICAO requirements."
        actions={<button className="btn primary" onClick={() => toast.push('Ageing-inspection scheduling is coming soon. Create a Work Order to track it now.')}><Plus size={15} /> Schedule Inspection</button>} />
      <div className="grid kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard label="Oldest Airframe" value={`${aged[0].age} yrs`} sub={aged[0].registration} accent="var(--amber)" icon={<History size={18} />} />
        <KpiCard label="Avg Fleet Age" value={`${(aged.reduce((s, a) => s + a.age, 0) / aged.length).toFixed(1)} yrs`} sub="Across fleet" accent="var(--cyan)" icon={<History size={18} />} delay={60} />
        <KpiCard label="Over 15 yrs" value={aged.filter(a => a.age > 15).length} sub="Enhanced programs" accent="var(--red)" icon={<AlertTriangle size={18} />} delay={120} />
        <KpiCard label="Active Programs" value={programs.length} sub="Ageing compliance" accent="var(--green)" icon={<ShieldCheck size={18} />} delay={180} />
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel fade-up">
          <PanelHead title="Fleet by Age" icon={<History size={15} className="tamber" />} />
          <div style={{ padding: 18 }}>
            {aged.slice(0, 8).map(a => (
              <div key={a.id} style={{ marginBottom: 13 }}>
                <div className="row between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                  <span className="num hi">{a.registration} <span className="muted">{a.model}</span></span>
                  <span className="num">{a.age} yrs</span>
                </div>
                <Bar value={a.age} max={25} color={a.age > 18 ? 'var(--red)' : a.age > 12 ? 'var(--amber)' : 'var(--cyan)'} />
              </div>
            ))}
          </div>
        </div>
        <div className="panel fade-up" style={{ animationDelay: '80ms' }}>
          <PanelHead title="Ageing Programs" icon={<ShieldCheck size={15} className="tgreen" />} />
          <table className="tbl">
            <thead><tr><th>Program</th><th>Reference</th><th>Due (aircraft)</th></tr></thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.name}>
                  <td className="hi">{p.name}</td>
                  <td><span className="badge muted">{p.ref}</span></td>
                  <td><span className={`badge ${p.due > 5 ? 'warn' : 'info'}`}>{p.due}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
