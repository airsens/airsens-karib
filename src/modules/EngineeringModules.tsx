import React, { useState, useMemo } from 'react';
import { GitBranch, ShieldCheck, History, Upload, Plus, AlertTriangle, X, Check, Zap } from 'lucide-react';
import { PageHeader, PanelHead, StatusBadge, Bar, KpiCard } from '../components/ui';
import { useStore } from '../context/store';
import { useToast } from '../components/Toast';
import { computeSFI, demoRepairs } from '../lib/structural';
import type { StructuralRepair, LoadPath, DTICategory, RepairType } from '../lib/structural';

/* ---------------- CONFIGURATION MANAGEMENT ---------------- */
export const ConfigurationModule: React.FC = () => {
  const { aircraft } = useStore();
  const [acId, setAcId] = useState(() => aircraft[0]?.id ?? '');
  const ac = aircraft.find(a => a.id === acId) ?? aircraft[0];
  const timeline = [
    { phase: 'As-Designed', date: '2014-03-01', desc: 'OEM baseline configuration delivered', state: 'locked' },
    { phase: 'As-Built', date: '2014-06-18', desc: 'Final assembly + customer options (winglets, IFE)', state: 'locked' },
    { phase: 'Mod SB-737-118', date: '2018-09-22', desc: 'Fuel tank flammability reduction installed', state: 'applied' },
    { phase: 'Mod STC-21442', date: '2021-02-10', desc: 'ADS-B Out upgrade, GPS sensor swap', state: 'applied' },
    { phase: 'As-Maintained', date: '2026-05-30', desc: `Current effective configuration — ${ac?.registration ?? ''}`, state: 'current' },
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
        <PanelHead title={`Configuration Evolution — ${ac?.registration ?? ''}`} icon={<GitBranch size={15} className="tcyan" />} />
        <div style={{ padding: 20 }}>
          {timeline.map((t, i) => (
            <div key={t.phase} className="row gap-16" style={{ marginBottom: i < timeline.length - 1 ? 0 : 0 }}>
              <div className="col" style={{ alignItems: 'center', width: 24 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: t.state === 'current' ? 'var(--cyan)' : t.state === 'applied' ? 'var(--green)' : 'var(--text-faint)', boxShadow: t.state === 'current' ? '0 0 12px var(--cyan-glow)' : 'none' }} />
                {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 32, background: 'var(--line)', marginTop: 2 }} />}
              </div>
              <div style={{ paddingBottom: 24, flex: 1 }}>
                <div className="row gap-12" style={{ marginBottom: 4 }}>
                  <span className="hi" style={{ fontWeight: 600, fontSize: 14 }}>{t.phase}</span>
                  <span className="num muted" style={{ fontSize: 11.5 }}>{t.date}</span>
                  <span className={`badge ${t.state === 'current' ? 'ok' : t.state === 'applied' ? 'info' : 'muted'}`} style={{ fontSize: 9 }}>{t.state}</span>
                </div>
                <div className="muted" style={{ fontSize: 13 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------- STRUCTURAL FATIGUE INDEX (DTE/DTI) ---------------- */
const LOAD_PATH_COLORS: Record<LoadPath, string> = { primary: 'var(--red)', secondary: 'var(--amber)', tertiary: 'var(--cyan)' };
const LOAD_PATH_LABELS: Record<LoadPath, string> = { primary: 'Primary Load Path', secondary: 'Secondary Load Path', tertiary: 'Tertiary Load Path' };
const REPAIR_TYPES: RepairType[] = ['Doubler', 'Crack stop', 'Bushing replace', 'Splice', 'Patch', 'Modification', 'Corrosion blend'];
const ATA_ZONES = ['51 - Standard Practices', '52 - Doors', '53 - Fuselage', '54 - Nacelles/Pylons', '55 - Stabilizers', '56 - Windows', '57 - Wings'];
const WFD_COLORS = { none: 'var(--green)', emerging: 'var(--cyan)', elevated: 'var(--amber)', critical: 'var(--red)' };

export const StructuralModule: React.FC = () => {
  const { aircraft } = useStore();
  const toast = useToast();
  const [acId, setAcId] = useState(() => aircraft[0]?.id ?? '');
  const ac = aircraft.find(a => a.id === acId) ?? aircraft[0];

  const [repairs, setRepairs] = useState<StructuralRepair[]>(demoRepairs);
  const [envSeverity, setEnvSeverity] = useState(2);
  const [hardLandings, setHardLandings] = useState(3);
  const [showAddRepair, setShowAddRepair] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'repairs' | 'intervals' | 'drivers'>('overview');

  const sfi = useMemo(() => computeSFI({
    totalCycles: ac?.totalCycles ?? 15000,
    totalFlightHours: ac?.totalHours ?? 22000,
    repairs,
    envSeverity,
    hardLandingCount: hardLandings,
    pressureCycles: ac?.totalCycles ?? 15000,
  }), [ac, repairs, envSeverity, hardLandings]);

  const ENV_LABELS = ['', 'Benign (temperate, inland)', 'Moderate (temperate coastal)', 'Significant (tropical / dusty)', 'Harsh (coastal salt / desert)', 'Severe (arctic / industrial)'];

  return (
    <div>
      <PageHeader eyebrow="Engineering · Structures" title="Structural Fatigue Index (DTE/DTI)"
        sub="Live structural fatigue assessment — load path classification, WFD monitoring and inspection interval derivation."
        actions={<button className="btn primary" onClick={() => setShowAddRepair(true)}><Plus size={15} /> Log Repair</button>} />

      {/* Aircraft + environment controls */}
      <div className="panel panel-pad fade-up" style={{ marginBottom: 16 }}>
        <div className="grid-2col" style={{ gap: 20 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Aircraft</div>
            <select className="select" value={acId} onChange={e => setAcId(e.target.value)}>
              {aircraft.map(a => <option key={a.id} value={a.id}>{a.registration} — {a.model} {a.variant}</option>)}
            </select>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
              {(ac?.totalCycles ?? 0).toLocaleString()} cycles · {(ac?.totalHours ?? 0).toLocaleString()} FH · MFG {ac?.yearOfMfg}
            </div>
          </div>
          <div>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Environment Severity</span>
              <span className="num tcyan" style={{ fontSize: 13, fontWeight: 600 }}>{envSeverity}/5</span>
            </div>
            <input type="range" min={1} max={5} value={envSeverity} onChange={e => setEnvSeverity(+e.target.value)} style={{ width: '100%', accentColor: 'var(--cyan)' }} />
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{ENV_LABELS[envSeverity]}</div>
          </div>
        </div>
        <div className="grid-3col" style={{ gap: 16, marginTop: 16 }}>
          <div>
            <div className="row between" style={{ marginBottom: 8 }}>
              <span className="eyebrow">Hard Landing Events</span>
              <span className="num tamber" style={{ fontSize: 13, fontWeight: 600 }}>{hardLandings}</span>
            </div>
            <input type="range" min={0} max={20} value={hardLandings} onChange={e => setHardLandings(+e.target.value)} style={{ width: '100%', accentColor: 'var(--amber)' }} />
          </div>
          <div className="panel panel-pad" style={{ padding: 12, borderLeft: `3px solid ${sfi.bandColor}` }}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>Structural AF Modifier</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 800, color: sfi.bandColor }}>{sfi.structuralAFModifier.toFixed(2)}×</div>
            <div className="muted" style={{ fontSize: 10.5 }}>Applied to Amplification Factor</div>
          </div>
          <div className="panel panel-pad" style={{ padding: 12, borderLeft: `3px solid ${WFD_COLORS[sfi.wfdRisk]}` }}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>WFD Risk</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 700, color: WFD_COLORS[sfi.wfdRisk], textTransform: 'capitalize' }}>{sfi.wfdRisk}</div>
            <div className="muted" style={{ fontSize: 10.5 }}>Widespread Fatigue Damage</div>
          </div>
        </div>
      </div>

      {/* SFI gauge */}
      <div className="grid-chart fade-up" style={{ gap: 14, marginBottom: 14 }}>
        <div className="panel panel-pad" style={{ borderLeft: `4px solid ${sfi.bandColor}` }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Structural Fatigue Index</div>
              <div className="num" style={{ fontSize: 52, fontWeight: 800, color: sfi.bandColor, lineHeight: 1 }}>{sfi.fatigueIndex}</div>
              <div className="muted" style={{ fontSize: 11 }}>out of 100</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge" style={{ fontSize: 11, padding: '6px 14px', color: sfi.bandColor, border: `1px solid ${sfi.bandColor}`, background: 'transparent', textTransform: 'capitalize' }}>{sfi.band}</span>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 10, maxWidth: 260, lineHeight: 1.5, textAlign: 'left' }}>{sfi.recommendation}</div>
            </div>
          </div>
          <Bar value={sfi.fatigueIndex} max={100} color={sfi.bandColor} />
          <div className="row gap-0" style={{ marginTop: 6 }}>
            {[['0', '25', 'safe'], ['25', '50', 'elevated'], ['50', '75', 'high'], ['75', '100', 'critical']].map(([from, , label]) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-faint)', textTransform: 'capitalize' }}>{from} {label}</div>
            ))}
          </div>
        </div>

        <div className="col gap-12">
          {[
            { label: 'Primary Load Path Repairs', value: sfi.primaryRepairs, color: LOAD_PATH_COLORS.primary, warn: sfi.primaryRepairs >= 6 },
            { label: 'Secondary Load Path Repairs', value: sfi.secondaryRepairs, color: LOAD_PATH_COLORS.secondary, warn: false },
            { label: 'Tertiary Load Path Repairs', value: sfi.tertiaryRepairs, color: LOAD_PATH_COLORS.tertiary, warn: false },
          ].map(s => (
            <div key={s.label} className="panel panel-pad" style={{ padding: 14, borderLeft: `3px solid ${s.color}` }}>
              <div className="row between">
                <div>
                  <div className="eyebrow" style={{ fontSize: 9 }}>{s.label}</div>
                  <div className="num" style={{ fontSize: 26, fontWeight: 800, color: s.warn ? 'var(--red)' : s.color, marginTop: 2 }}>{s.value}</div>
                </div>
                {s.warn && <AlertTriangle size={20} className="tred" />}
              </div>
              {s.warn && s.value >= 6 && <div className="tred" style={{ fontSize: 10.5, marginTop: 4 }}>⚠ WFD threshold ({s.value >= 200 ? '200+' : '6+'}) exceeded</div>}
            </div>
          ))}
        </div>
      </div>

      {/* WFD warning banner */}
      {sfi.wfdRisk !== 'none' && (
        <div className="panel panel-pad fade-up" style={{ marginBottom: 14, borderLeft: `4px solid ${WFD_COLORS[sfi.wfdRisk]}`, background: 'var(--bg-deep)' }}>
          <div className="row gap-12">
            <AlertTriangle size={18} style={{ color: WFD_COLORS[sfi.wfdRisk], flexShrink: 0 }} />
            <div>
              <div className="hi" style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Widespread Fatigue Damage Assessment</div>
              <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.6 }}>{sfi.wfdMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="row gap-8" style={{ marginBottom: 14 }}>
        {(['overview', 'repairs', 'intervals', 'drivers'] as const).map(t => (
          <button key={t} className={`btn sm ${activeTab === t ? 'primary' : 'ghost'}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t === 'intervals' ? 'Inspection Intervals' : t === 'drivers' ? 'Fatigue Drivers' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="grid-2col fade-up" style={{ gap: 14 }}>
          <div className="panel">
            <PanelHead title="Load Path Summary" icon={<ShieldCheck size={15} className="tcyan" />} />
            <div style={{ padding: 18 }}>
              {(['primary', 'secondary', 'tertiary'] as LoadPath[]).map(lp => {
                const lpRepairs = repairs.filter(r => r.loadPath === lp);
                const max = lp === 'primary' ? 10 : 20;
                return (
                  <div key={lp} style={{ marginBottom: 16 }}>
                    <div className="row between" style={{ marginBottom: 6 }}>
                      <span className="hi" style={{ fontSize: 13 }}>{LOAD_PATH_LABELS[lp]}</span>
                      <span className="num" style={{ fontSize: 13, color: LOAD_PATH_COLORS[lp] }}>{lpRepairs.length} repair{lpRepairs.length !== 1 ? 's' : ''}</span>
                    </div>
                    <Bar value={lpRepairs.length} max={max} color={LOAD_PATH_COLORS[lp]} />
                    <div className="muted" style={{ fontSize: 10.5, marginTop: 4 }}>
                      {lp === 'primary' ? `Threshold: 6 repairs (WFD monitoring), 200 (critical)` : lp === 'secondary' ? 'Supporting structure — significant impact' : 'Minor/fairing — lowest criticality'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="panel">
            <PanelHead title="Engineering Summary" icon={<Zap size={15} className="tamber" />} />
            <div style={{ padding: 18 }}>
              {[
                { label: 'Total Repairs Logged', val: repairs.length },
                { label: 'Corrosion-related Repairs', val: repairs.filter(r => r.corrosionInvolved).length },
                { label: 'Hard Landing Related', val: repairs.filter(r => r.hardLandingRelated).length },
                { label: 'Category A Repairs', val: repairs.filter(r => r.dtiCategory === 'A').length },
                { label: 'Structural AF Modifier', val: `${sfi.structuralAFModifier.toFixed(2)}×` },
              ].map(s => (
                <div key={s.label} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="muted" style={{ fontSize: 13 }}>{s.label}</span>
                  <span className="num hi" style={{ fontSize: 14, fontWeight: 600 }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Repairs tab */}
      {activeTab === 'repairs' && (
        <div className="panel fade-up">
          <PanelHead title={`Logged Repairs (${repairs.length})`} icon={<AlertTriangle size={15} className="tamber" />}
            right={<button className="btn ghost sm" onClick={() => setShowAddRepair(true)}><Plus size={14} /> Add</button>} />
          <table className="tbl">
            <thead><tr><th>ID</th><th>Location</th><th>ATA</th><th>Type</th><th>Load Path</th><th>DTI Cat</th><th>Corrosion</th><th>Hard Ldg</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {repairs.map(r => (
                <tr key={r.id}>
                  <td className="num hi">{r.id}</td>
                  <td>{r.location}</td>
                  <td className="num muted">{r.ataZone}</td>
                  <td className="muted">{r.repairType}</td>
                  <td><span className="badge" style={{ color: LOAD_PATH_COLORS[r.loadPath], border: `1px solid ${LOAD_PATH_COLORS[r.loadPath]}`, background: 'transparent', fontSize: 9, textTransform: 'capitalize' }}>{r.loadPath}</span></td>
                  <td><span className={`badge ${r.dtiCategory === 'A' ? 'aog' : r.dtiCategory === 'B' ? 'warn' : 'muted'}`}>Cat {r.dtiCategory}</span></td>
                  <td>{r.corrosionInvolved ? <span className="tamber" style={{ fontSize: 12 }}>Yes</span> : <span className="muted" style={{ fontSize: 12 }}>—</span>}</td>
                  <td>{r.hardLandingRelated ? <span className="tred" style={{ fontSize: 12 }}>Yes</span> : <span className="muted" style={{ fontSize: 12 }}>—</span>}</td>
                  <td className="num muted" style={{ fontSize: 11.5 }}>{r.dateLogged}</td>
                  <td><button className="btn ghost sm" style={{ padding: 6, color: 'var(--red)' }} onClick={() => setRepairs(prev => prev.filter(x => x.id !== r.id))}><X size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Intervals tab */}
      {activeTab === 'intervals' && (
        <div className="panel fade-up">
          <PanelHead title="Derived Inspection Intervals" icon={<ShieldCheck size={15} className="tcyan" />}
            right={<span className="muted" style={{ fontSize: 11.5 }}>Intervals reduced by load path severity × DTI category × SFI</span>} />
          <table className="tbl">
            <thead><tr><th>Repair ID</th><th>Location</th><th>Interval (FH)</th><th>Interval (FC)</th><th>Rationale</th></tr></thead>
            <tbody>
              {sfi.repairIntervals.map(ri => {
                const repair = repairs.find(r => r.id === ri.repairId);
                return (
                  <tr key={ri.repairId}>
                    <td className="num hi">{ri.repairId}</td>
                    <td className="muted">{repair?.location}</td>
                    <td className="num"><span style={{ color: ri.intervalFH < 4000 ? 'var(--red)' : ri.intervalFH < 7000 ? 'var(--amber)' : 'var(--green)', fontWeight: 700 }}>{ri.intervalFH.toLocaleString()} FH</span></td>
                    <td className="num"><span style={{ color: ri.intervalFC < 3000 ? 'var(--red)' : ri.intervalFC < 5000 ? 'var(--amber)' : 'var(--green)', fontWeight: 700 }}>{ri.intervalFC.toLocaleString()} FC</span></td>
                    <td className="muted" style={{ fontSize: 11.5 }}>{ri.rationale}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drivers tab */}
      {activeTab === 'drivers' && (
        <div className="panel fade-up">
          <PanelHead title="Fatigue Index Drivers" icon={<Zap size={15} className="tamber" />} />
          <div style={{ padding: 20 }}>
            {sfi.drivers.map((d, i) => (
              <div key={d.label} style={{ marginBottom: 18 }}>
                <div className="row between" style={{ marginBottom: 8 }}>
                  <span className="hi" style={{ fontSize: 13 }}>{d.label}</span>
                  <span className="row gap-12">
                    <span className="num muted" style={{ fontSize: 12 }}>Score: {d.value}</span>
                    <span className="num tcyan" style={{ fontSize: 13, fontWeight: 700 }}>{d.pct}%</span>
                  </span>
                </div>
                <Bar value={d.pct} max={100} color={i === 0 ? 'var(--red)' : i === 1 ? 'var(--amber)' : i === 2 ? 'var(--cyan)' : 'var(--blue)'} />
              </div>
            ))}
            <div className="panel panel-pad" style={{ marginTop: 20, background: 'var(--bg-deep)', borderLeft: '3px solid var(--cyan)' }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Model Basis</div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.7 }}>
                Structural Fatigue Index computed per Promise Benebo's engineering model: takeoff/landing cycles, pressurisation cycles, environment and corrosion, hard landings, and accumulated repairs weighted by load path (Primary 3×, Secondary 1.5×, Tertiary 0.5×) and DTI category. WFD threshold per AMC 20-20 and FAA AC 91-56. Damage tolerance intervals derived from stress-raiser coalescence risk above 6 primary load path repairs.
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddRepair && <AddRepairDrawer onClose={() => setShowAddRepair(false)} onSave={r => { setRepairs(p => [...p, r]); setShowAddRepair(false); toast.push('Repair logged. Fatigue index updated.', 'success'); }} />}
    </div>
  );
};

/* ---- Add Repair Drawer ---- */
const AddRepairDrawer: React.FC<{ onClose: () => void; onSave: (r: StructuralRepair) => void }> = ({ onClose, onSave }) => {
  const [id] = useState(() => `RPR-${String(Math.floor(Math.random() * 9000 + 1000))}`);
  const [location, setLocation] = useState('');
  const [ataZone, setAtaZone] = useState('53 - Fuselage');
  const [repairType, setRepairType] = useState<RepairType>('Doubler');
  const [loadPath, setLoadPath] = useState<LoadPath>('primary');
  const [dtiCategory, setDtiCategory] = useState<DTICategory>('C');
  const [corrosion, setCorrosion] = useState(false);
  const [hardLanding, setHardLanding] = useState(false);

  const save = () => {
    if (!location.trim()) { alert('Please enter the repair location.'); return; }
    onSave({ id, location: location.trim(), ataZone: ataZone.split(' - ')[0], repairType, loadPath, dtiCategory, cyclesAtRepair: 0, corrosionInvolved: corrosion, hardLandingRelated: hardLanding, dateLogged: new Date().toISOString().slice(0, 10) });
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, backdropFilter: 'blur(3px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(500px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 51, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.6)' }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div className="row gap-12">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}><ShieldCheck size={20} className="tcyan" /></div>
            <div><div className="hi" style={{ fontSize: 17, fontWeight: 700 }}>Log Structural Repair</div><div className="muted num" style={{ fontSize: 12 }}>{id}</div></div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>
        <div style={{ padding: 22 }}>
          <F label="Location / Description"><input className="input" placeholder="e.g. Wing lower skin STA 540" value={location} onChange={e => setLocation(e.target.value)} /></F>
          <div className="grid-2col" style={{ gap: 12 }}>
            <F label="ATA Zone"><select className="select" value={ataZone} onChange={e => setAtaZone(e.target.value)}>{ATA_ZONES.map(z => <option key={z}>{z}</option>)}</select></F>
            <F label="Repair Type"><select className="select" value={repairType} onChange={e => setRepairType(e.target.value as RepairType)}>{REPAIR_TYPES.map(t => <option key={t}>{t}</option>)}</select></F>
          </div>
          <F label="Load Path Classification">
            <div className="col gap-8">
              {(['primary', 'secondary', 'tertiary'] as LoadPath[]).map(lp => (
                <button key={lp} className="row gap-12" onClick={() => setLoadPath(lp)}
                  style={{ padding: '10px 14px', background: loadPath === lp ? 'var(--bg-elevated)' : 'var(--bg-deep)', border: `1px solid ${loadPath === lp ? LOAD_PATH_COLORS[lp] : 'var(--line)'}`, borderRadius: 8, textAlign: 'left' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: LOAD_PATH_COLORS[lp], flexShrink: 0 }} />
                  <div>
                    <div className="hi" style={{ fontSize: 13, fontWeight: 600 }}>{LOAD_PATH_LABELS[lp]}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{lp === 'primary' ? 'Main structural load bearing — most critical, highest fatigue impact' : lp === 'secondary' ? 'Supporting structure — significant contribution to fatigue index' : 'Minor/fairing structure — lowest criticality'}</div>
                  </div>
                  {loadPath === lp && <Check size={16} style={{ color: LOAD_PATH_COLORS[lp], marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </F>
          <F label="DTI Category">
            <div className="row gap-8">
              {(['A', 'B', 'C'] as DTICategory[]).map(c => (
                <button key={c} className={`btn sm ${dtiCategory === c ? 'primary' : 'ghost'}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDtiCategory(c)}>
                  Cat {c} {c === 'A' ? '— Critical' : c === 'B' ? '— Significant' : '— Standard'}
                </button>
              ))}
            </div>
          </F>
          <div className="col gap-8" style={{ margin: '4px 0 16px' }}>
            {[['corrosion', corrosion, setCorrosion, 'Corrosion involved in this repair'], ['hardLanding', hardLanding, setHardLanding, 'Associated with a hard landing event']].map(([key, val, setter, label]) => (
              <label key={key as string} className="row gap-8" style={{ cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={val as boolean} onChange={e => (setter as Function)(e.target.checked)} style={{ accentColor: 'var(--cyan)', width: 16, height: 16 }} />
                {label as string}
              </label>
            ))}
          </div>
          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={save}><Check size={16} /> Log Repair &amp; Update Index</button>
        </div>
      </div>
    </>
  );
};
const F: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}><div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>{children}</div>
);

/* ---------------- AGEING AIRCRAFT ---------------- */
export const AgeingModule: React.FC = () => {
  const { aircraft } = useStore();
  const toast = useToast();
  const aged = aircraft.map(a => ({ ...a, age: new Date().getFullYear() - a.yearOfMfg })).sort((a, b) => b.age - a.age);
  const programs = [
    {
      name: 'Supplemental Structural Inspection Document (SSID)',
      ref: 'JAR 25.571 / FAR 25.571',
      due: aged.filter(a => a.age > 12).length,
      desc: 'Inspection programme derived from fatigue & damage tolerance evaluation. Required for ageing aircraft to find and correct all forms of fatigue damage before they become critical.',
      status: 'active',
    },
    {
      name: 'Aircraft Structural Integrity Programme (ASIP)',
      ref: 'EASA Part-26 / CS-26',
      due: aged.filter(a => a.age > 10).length,
      desc: 'Overarching programme managing the entire structural health of each airframe across its service life — integrating fatigue tracking, damage tolerance, repair assessment and inspection regimes.',
      status: 'active',
    },
    {
      name: 'Corrosion Prevention & Control Programme (CPCP)',
      ref: 'AMC 20-20 / AMC4 CAMO.A.305(g)',
      due: aged.filter(a => a.age > 8).length,
      desc: 'Systematic approach to prevent and control corrosion in primary structure. Limits direct corrosion deterioration and prevents fatigue failures initiated by corrosion. Baseline CPCP established by type certificate holder.',
      status: 'active',
    },
    {
      name: 'FAR 26 / EASA Part-26 Compliance',
      ref: 'Regulation (EU) 2015/640 / 14 CFR Part 26',
      due: aircraft.length,
      desc: 'Additional airworthiness specifications for operations. Mandates operators to revise their AMP to incorporate CPCP, WFD assessment, damage tolerance inspections and structural life limits. CAMO is directly responsible.',
      status: 'mandatory',
    },
    {
      name: 'Widespread Fatigue Damage (WFD) Assessment',
      ref: 'AMC 20-20 / CS 26.370',
      due: aged.filter(a => a.age > 15).length,
      desc: 'Assessment for simultaneous presence of cracks at multiple structural locations. WFD risk increases with repairs on primary load paths (see Structural module). Must demonstrate structure meets fail-safe and residual strength requirements.',
      status: aged.filter(a => a.age > 15).length > 0 ? 'attention' : 'active',
    },
    {
      name: 'Repair Assessment Programme (RAP)',
      ref: 'FAA AC 91-56 / EASA Part-26',
      due: aged.filter(a => a.age > 10).length,
      desc: 'Evaluation of all significant structural repairs for fatigue and damage tolerance compliance. Works in conjunction with the Structural module SFI engine to flag repairs requiring formal DTE/DTI.',
      status: 'active',
    },
  ];
  const statusColor: Record<string, string> = { active: 'var(--green)', mandatory: 'var(--amber)', attention: 'var(--red)' };
  const statusLabel: Record<string, string> = { active: 'Active', mandatory: 'Mandatory', attention: 'Attention Required' };
  return (
    <div>
      <PageHeader eyebrow="Engineering · Compliance" title="Ageing Aircraft & Structural Integrity"
        sub="SSID · ASIP · CPCP · FAR 26 / EASA Part-26 compliance per AMC 20-20 & ICAO requirements."
        actions={<button className="btn primary" onClick={() => toast.push('Ageing-inspection scheduling is coming soon. Create a Work Order to track it now.')}><Plus size={15} /> Schedule Inspection</button>} />
      <div className="grid kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard label="Oldest Airframe" value={`${aged[0]?.age ?? 0} yrs`} sub={aged[0]?.registration} accent="var(--amber)" icon={<History size={18} />} />
        <KpiCard label="Avg Fleet Age" value={`${aged.length ? (aged.reduce((s, a) => s + a.age, 0) / aged.length).toFixed(1) : 0} yrs`} sub="Across fleet" accent="var(--cyan)" icon={<History size={18} />} delay={60} />
        <KpiCard label="Over 15 yrs" value={aged.filter(a => a.age > 15).length} sub="Enhanced WFD programme" accent="var(--red)" icon={<AlertTriangle size={18} />} delay={120} />
        <KpiCard label="Active Programmes" value={programs.length} sub="Structural compliance" accent="var(--green)" icon={<ShieldCheck size={18} />} delay={180} />
      </div>

      {/* Compliance programmes — full detail */}
      <div className="panel fade-up" style={{ marginBottom: 14 }}>
        <PanelHead title="Structural Integrity & Ageing Programmes" icon={<ShieldCheck size={15} className="tgreen" />}
          right={<span className="muted" style={{ fontSize: 11 }}>Per EASA Part-26, AMC 20-20, FAA FAR 26</span>} />
        <div className="col" style={{ padding: '0 0 8px' }}>
          {programs.map((p, i) => (
            <div key={p.name} style={{ padding: '14px 20px', borderBottom: i < programs.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <div className="row gap-10">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[p.status], flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${statusColor[p.status]}` }} />
                  <span className="hi" style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                </div>
                <div className="row gap-10">
                  <span className="badge muted" style={{ fontSize: 9 }}>{p.ref}</span>
                  <span className="badge" style={{ fontSize: 9, color: statusColor[p.status], borderColor: statusColor[p.status], background: 'transparent' }}>{statusLabel[p.status]}</span>
                  <span className="num" style={{ fontSize: 12, color: p.due > 0 ? statusColor[p.status] : 'var(--text-faint)' }}>{p.due} aircraft</span>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.6, paddingLeft: 18 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        <div className="panel fade-up">
          <PanelHead title="Fleet by Age" icon={<History size={15} className="tamber" />} />
          <div style={{ padding: 18 }}>
            {aged.slice(0, 8).map(a => (
              <div key={a.id} style={{ marginBottom: 13 }}>
                <div className="row between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                  <span className="num hi">{a.registration} <span className="muted">{a.model}</span></span>
                  <div className="row gap-8">
                    {a.age > 15 && <span className="badge aog" style={{ fontSize: 8 }}>WFD review</span>}
                    {a.age > 12 && a.age <= 15 && <span className="badge warn" style={{ fontSize: 8 }}>SSID required</span>}
                    <span className="num">{a.age} yrs</span>
                  </div>
                </div>
                <Bar value={a.age} max={25} color={a.age > 18 ? 'var(--red)' : a.age > 12 ? 'var(--amber)' : 'var(--cyan)'} />
              </div>
            ))}
          </div>
        </div>
        <div className="panel fade-up" style={{ animationDelay: '80ms' }}>
          <PanelHead title="Programme Requirements by Age" icon={<ShieldCheck size={15} className="tgreen" />} />
          <div style={{ padding: 18 }}>
            {[
              { label: '8+ years', prog: 'CPCP baseline required', color: 'var(--cyan)' },
              { label: '10+ years', prog: 'ASIP + RAP initiated', color: 'var(--blue)' },
              { label: '12+ years', prog: 'SSID full compliance', color: 'var(--amber)' },
              { label: '15+ years', prog: 'WFD assessment mandatory', color: 'var(--red)' },
              { label: '20+ years', prog: 'Enhanced structural audit', color: 'var(--red)' },
            ].map(r => (
              <div key={r.label} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 12.5 }}>
                <span className="num" style={{ color: r.color, fontWeight: 600, minWidth: 80 }}>{r.label}</span>
                <span className="muted">{r.prog}</span>
                <span className="num" style={{ color: r.color }}>
                  {aged.filter(a => {
                    const age = a.age;
                    if (r.label === '8+ years') return age >= 8;
                    if (r.label === '10+ years') return age >= 10;
                    if (r.label === '12+ years') return age >= 12;
                    if (r.label === '15+ years') return age >= 15;
                    return age >= 20;
                  }).length} AC
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
