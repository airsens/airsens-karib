import React, { useState } from 'react';
import { X, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/store';

const ATA_CHAPTERS = [
  ['21', 'Air Conditioning'], ['24', 'Electrical Power'], ['27', 'Flight Controls'],
  ['28', 'Fuel'], ['29', 'Hydraulic Power'], ['32', 'Landing Gear'], ['34', 'Navigation'],
  ['49', 'APU'], ['52', 'Doors'], ['71', 'Power Plant'], ['72', 'Engine'],
];

const MEL_INFO = {
  A: { days: 'Immediate', color: 'var(--red)', desc: 'No interval — aircraft grounded until rectified (safety-critical).' },
  B: { days: '3 days', color: 'var(--amber)', desc: 'Rectify within 3 calendar days.' },
  C: { days: '10 days', color: 'var(--cyan)', desc: 'Rectify within 10 calendar days.' },
  D: { days: '120 days', color: 'var(--blue)', desc: 'Rectify within 120 calendar days.' },
};

function predictCat(severity: string, safetyCritical: boolean): 'A' | 'B' | 'C' | 'D' {
  if (safetyCritical) return 'A';
  if (severity === 'critical') return 'B';
  if (severity === 'major') return 'C';
  return 'D';
}

export const RaiseDefectDrawer: React.FC<{ aircraftId: string; onClose: () => void }> = ({ aircraftId, onClose }) => {
  const { aircraft, raiseDefect } = useStore();
  const ac = aircraft.find(a => a.id === aircraftId)!;

  const [ata, setAta] = useState('21');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('minor');
  const [safetyCritical, setSafetyCritical] = useState(false);
  const [done, setDone] = useState(false);

  const cat = predictCat(severity, safetyCritical);
  const info = MEL_INFO[cat];

  const submit = () => {
    if (!description.trim()) { alert('Please describe the defect.'); return; }
    raiseDefect({ aircraftId, ata, description: description.trim(), severity, safetyCritical });
    setDone(true);
    setTimeout(onClose, 1000);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, backdropFilter: 'blur(3px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(480px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 51, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.6)' }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div className="row gap-12">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}><AlertTriangle size={20} className="tamber" /></div>
            <div><div className="hi" style={{ fontSize: 17, fontWeight: 700 }}>Raise Defect</div><div className="muted num" style={{ fontSize: 12.5 }}>{ac.registration} · {ac.model}</div></div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>

        {done ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(58,210,122,.15)', border: '1px solid var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}><Check size={32} className="tgreen" /></div>
            <div className="hi" style={{ fontSize: 18, fontWeight: 700 }}>Defect Raised</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>Logged as MEL Category {cat}{cat === 'A' ? ' — aircraft set to AOG.' : '.'}</div>
          </div>
        ) : (
          <div style={{ padding: 22 }}>
            <Field label="ATA Chapter">
              <select className="select" value={ata} onChange={e => setAta(e.target.value)}>
                {ATA_CHAPTERS.map(([n, name]) => <option key={n} value={n}>ATA {n} — {name}</option>)}
              </select>
            </Field>
            <Field label="Description">
              <textarea className="input" rows={3} placeholder="Describe the defect…" value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
            </Field>
            <Field label="Severity">
              <div className="row gap-8">
                {(['minor', 'major', 'critical'] as const).map(s => (
                  <button key={s} className={`btn sm ${severity === s ? 'primary' : 'ghost'}`} style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }} onClick={() => setSeverity(s)}>{s}</button>
                ))}
              </div>
            </Field>

            <label className="row gap-8" style={{ margin: '4px 0 16px', cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={safetyCritical} onChange={e => setSafetyCritical(e.target.checked)} style={{ accentColor: 'var(--red)', width: 16, height: 16 }} />
              <ShieldAlert size={15} className="tred" /> Safety-critical system (grounds aircraft)
            </label>

            {/* live MEL classification */}
            <div className="panel panel-pad" style={{ background: 'var(--bg-deep)', borderLeft: `3px solid ${info.color}` }}>
              <div className="row between">
                <span className="eyebrow">Auto-classified as</span>
                <span className="badge" style={{ color: info.color, border: `1px solid ${info.color}`, background: 'transparent' }}>MEL Category {cat}</span>
              </div>
              <div className="hi" style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>Rectify: {info.days}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{info.desc}</div>
            </div>

            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: 12 }} onClick={submit}>
              <AlertTriangle size={16} /> Raise Defect
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
    {children}
  </div>
);
