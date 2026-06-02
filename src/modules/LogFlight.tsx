import React, { useState } from 'react';
import { X, BookOpen, Plane, ArrowRight, Check } from 'lucide-react';
import { useStore } from '../context/store';

const BASES = ['TNCM', 'TJSJ', 'MKJP', 'TBPB', 'TTPP', 'MDPC'];

export const LogFlightDrawer: React.FC<{ aircraftId: string; onClose: () => void }> = ({ aircraftId, onClose }) => {
  const { aircraft, engines, logFlight } = useStore();
  const ac = aircraft.find(a => a.id === aircraftId)!;
  const engs = engines.filter(e => e.aircraftId === aircraftId);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState(ac.base);
  const [to, setTo] = useState('TJSJ');
  const [blockHours, setBlockHours] = useState('1.5');
  const [cycles, setCycles] = useState('1');
  const [payloadKg, setPayloadKg] = useState('8000');
  const [loadFactor, setLoadFactor] = useState('80');
  const [done, setDone] = useState(false);

  const bh = parseFloat(blockHours) || 0;
  const cy = parseInt(cycles) || 0;

  const submit = () => {
    if (bh <= 0) { alert('Block hours must be greater than zero.'); return; }
    logFlight({
      aircraftId, date, from, to,
      blockHours: bh, cycles: cy,
      payloadKg: parseInt(payloadKg) || 0,
      loadFactor: (parseInt(loadFactor) || 0) / 100,
    });
    setDone(true);
    setTimeout(onClose, 900);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, backdropFilter: 'blur(3px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(480px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 51, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.6)' }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div className="row gap-12">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}><BookOpen size={20} className="tcyan" /></div>
            <div><div className="hi" style={{ fontSize: 17, fontWeight: 700 }}>Log Flight</div><div className="muted num" style={{ fontSize: 12.5 }}>{ac.registration} · {ac.model}</div></div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>

        {done ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(58,210,122,.15)', border: '1px solid var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
              <Check size={32} className="tgreen" />
            </div>
            <div className="hi" style={{ fontSize: 18, fontWeight: 700 }}>Flight Logged</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>Airframe, engines and components updated.</div>
          </div>
        ) : (
          <div style={{ padding: 22 }}>
            <Field label="Date"><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
            <div className="grid" style={{ gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'end' }}>
              <Field label="From"><select className="select" value={from} onChange={e => setFrom(e.target.value)}>{BASES.map(b => <option key={b}>{b}</option>)}</select></Field>
              <ArrowRight size={16} className="muted" style={{ marginBottom: 11 }} />
              <Field label="To"><select className="select" value={to} onChange={e => setTo(e.target.value)}>{BASES.map(b => <option key={b}>{b}</option>)}</select></Field>
            </div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Block Hours"><input className="input num" type="number" step="0.1" value={blockHours} onChange={e => setBlockHours(e.target.value)} /></Field>
              <Field label="Landings / Cycles"><input className="input num" type="number" value={cycles} onChange={e => setCycles(e.target.value)} /></Field>
              <Field label="Payload (kg)"><input className="input num" type="number" value={payloadKg} onChange={e => setPayloadKg(e.target.value)} /></Field>
              <Field label="Load Factor (%)"><input className="input num" type="number" value={loadFactor} onChange={e => setLoadFactor(e.target.value)} /></Field>
            </div>

            {/* live rollup preview */}
            <div className="panel panel-pad" style={{ background: 'var(--bg-deep)', marginTop: 6 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>After this entry</div>
              <Row l="Airframe Hours" a={ac.totalHours} b={+(ac.totalHours + bh).toFixed(1)} />
              <Row l="Airframe Cycles" a={ac.totalCycles} b={ac.totalCycles + cy} />
              {engs.map(e => (
                <Row key={e.id} l={`Engine #${e.position} Hrs`} a={e.hours} b={+(e.hours + bh).toFixed(1)} />
              ))}
              <div className="muted" style={{ fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
                Hours also accrue to all installed components, advancing their service life and maintenance-program countdowns.
              </div>
            </div>

            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: 12 }} onClick={submit}>
              <Plane size={16} /> Log Flight &amp; Update
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

const Row: React.FC<{ l: string; a: number; b: number }> = ({ l, a, b }) => (
  <div className="row between" style={{ fontSize: 12.5, padding: '5px 0' }}>
    <span className="muted">{l}</span>
    <span className="num"><span className="muted">{a.toLocaleString()}</span> <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} className="muted" /> <span className="tcyan" style={{ fontWeight: 600 }}>{b.toLocaleString()}</span></span>
  </div>
);
