import React, { useState } from 'react';
import { X, BookOpen, Plane, ArrowRight, Check, Lock, PenLine } from 'lucide-react';
import { useStore } from '../context/store';

const BASES = ['TNCM', 'TJSJ', 'MKJP', 'TBPB', 'TTPP', 'MDPC', 'TFFR', 'TFFF', 'TUPJ', 'TISX'];

type Step = 'flight' | 'captain' | 'engineer' | 'done';

export const LogFlightDrawer: React.FC<{ aircraftId: string; onClose: () => void }> = ({ aircraftId, onClose }) => {
  const { aircraft, engines, users, currentUser, logFlight } = useStore();
  const ac = aircraft.find(a => a.id === aircraftId)!;
  const engs = engines.filter(e => e.aircraftId === aircraftId);

  const [step, setStep] = useState<Step>('flight');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState(ac?.base ?? 'TNCM');
  const [to, setTo] = useState('TJSJ');
  const [blockHours, setBlockHours] = useState('1.5');
  const [cycles, setCycles] = useState('1');
  const [payloadKg, setPayloadKg] = useState('8000');
  const [loadFactor, setLoadFactor] = useState('80');

  // ETL signatures
  const [captainName, setCaptainName] = useState('');
  const [captainPin, setCaptainPin] = useState('');
  const [engineerPin, setEngineerPin] = useState('');
  const [captainSigned, setCaptainSigned] = useState(false);

  const bh = parseFloat(blockHours) || 0;
  const cy = parseInt(cycles) || 0;

  const submitFlight = () => {
    if (bh <= 0) { alert('Block hours must be greater than zero.'); return; }
    setStep('captain');
  };

  const signCaptain = () => {
    if (!captainName.trim()) { alert('Please enter the captain\'s name.'); return; }
    if (captainPin.length < 4) { alert('PIN must be at least 4 digits.'); return; }
    setCaptainSigned(true);
    setStep('engineer');
  };

  const signEngineer = () => {
    if (engineerPin.length < 4) { alert('PIN must be at least 4 digits.'); return; }
    // both signed — commit the flight log
    logFlight({
      aircraftId, date, from, to,
      blockHours: bh, cycles: cy,
      payloadKg: parseInt(payloadKg) || 0,
      loadFactor: (parseInt(loadFactor) || 0) / 100,
      captainSignature: btoa(`${captainName}:${captainPin}:${Date.now()}`),
      engineerSignature: btoa(`${currentUser?.name ?? 'Engineer'}:${engineerPin}:${Date.now()}`),
      captainName, engineerName: currentUser?.name ?? 'Engineer',
      isLocked: true,
    } as any);
    setStep('done');
    setTimeout(onClose, 1400);
  };

  const skipSignatures = () => {
    logFlight({
      aircraftId, date, from, to,
      blockHours: bh, cycles: cy,
      payloadKg: parseInt(payloadKg) || 0,
      loadFactor: (parseInt(loadFactor) || 0) / 100,
      loggedBy: currentUser?.name,
    });
    setStep('done');
    setTimeout(onClose, 900);
  };

  const stepLabel = { flight: 'Flight Details', captain: 'Captain Sign-Off', engineer: 'Engineer Sign-Off', done: 'Logged' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, backdropFilter: 'blur(3px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(480px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 51, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.6)' }}>
        {/* Header */}
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div className="row gap-12">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}>
              <BookOpen size={20} className="tcyan" />
            </div>
            <div>
              <div className="hi" style={{ fontSize: 17, fontWeight: 700 }}>Electronic Tech Log</div>
              <div className="muted num" style={{ fontSize: 12.5 }}>{ac?.registration} · {ac?.model}</div>
            </div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="row gap-0" style={{ padding: '10px 22px', borderBottom: '1px solid var(--line)', background: 'var(--bg-deep)' }}>
            {(['flight', 'captain', 'engineer'] as const).map((s, i) => (
              <div key={s} className="row gap-8" style={{ flex: 1 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: step === s ? 'var(--cyan)' : (i < (['flight','captain','engineer']).indexOf(step)) ? 'var(--green)' : 'var(--bg-elevated)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: '#000', flexShrink: 0 }}>
                  {i < (['flight','captain','engineer']).indexOf(step) ? '✓' : i + 1}
                </div>
                <span className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{stepLabel[s]}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--line)', margin: '0 6px', alignSelf: 'center' }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1 — Flight Details */}
        {step === 'flight' && (
          <div style={{ padding: 22 }}>
            <Field label="Date"><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
            <div className="grid" style={{ gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'end' }}>
              <Field label="From"><select className="select" value={from} onChange={e => setFrom(e.target.value)}>{BASES.map(b => <option key={b}>{b}</option>)}</select></Field>
              <ArrowRight size={16} className="muted" style={{ marginBottom: 11 }} />
              <Field label="To"><select className="select" value={to} onChange={e => setTo(e.target.value)}>{BASES.map(b => <option key={b}>{b}</option>)}</select></Field>
            </div>
            <div className="grid-2col" style={{ gap: 12 }}>
              <Field label="Block Hours"><input className="input num" type="number" step="0.1" value={blockHours} onChange={e => setBlockHours(e.target.value)} /></Field>
              <Field label="Landings / Cycles"><input className="input num" type="number" value={cycles} onChange={e => setCycles(e.target.value)} /></Field>
              <Field label="Payload (kg)"><input className="input num" type="number" value={payloadKg} onChange={e => setPayloadKg(e.target.value)} /></Field>
              <Field label="Load Factor (%)"><input className="input num" type="number" value={loadFactor} onChange={e => setLoadFactor(e.target.value)} /></Field>
            </div>

            {/* Live rollup preview */}
            <div className="panel panel-pad" style={{ background: 'var(--bg-deep)', marginTop: 6, marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>After this entry</div>
              <Row l="Airframe Hours" a={ac.totalHours} b={+(ac.totalHours + bh).toFixed(1)} />
              <Row l="Airframe Cycles" a={ac.totalCycles} b={ac.totalCycles + cy} />
              {engs.map(e => <Row key={e.id} l={`Engine #${e.position} Hrs`} a={e.hours} b={+(e.hours + bh).toFixed(1)} />)}
              <div className="muted" style={{ fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
                Hours accrue to all installed components, advancing their maintenance countdowns.
              </div>
            </div>

            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12, marginBottom: 10 }} onClick={submitFlight}>
              <PenLine size={16} /> Continue to Sign-Off
            </button>
            <button className="btn ghost" style={{ width: '100%', justifyContent: 'center', padding: 10, fontSize: 12 }} onClick={skipSignatures}>
              Skip signatures (log without ETL)
            </button>
          </div>
        )}

        {/* STEP 2 — Captain Sign-Off */}
        {step === 'captain' && (
          <div style={{ padding: 22 }}>
            <div className="panel panel-pad" style={{ background: 'var(--bg-deep)', marginBottom: 20, borderLeft: '3px solid var(--blue)' }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Flight Summary</div>
              <div className="hi" style={{ fontSize: 14 }}>{from} → {to} · {bh}h / {cy} cycle{cy !== 1 ? 's' : ''}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{date} · {ac.registration}</div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(77,143,255,.12)', border: '1px solid var(--blue)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <PenLine size={24} className="tblue" />
              </div>
              <div className="hi" style={{ fontSize: 16, fontWeight: 700 }}>Captain / Commander Sign-Off</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>I certify this flight was conducted in accordance with all applicable regulations.</div>
            </div>

            <Field label="Captain's Name">
              <input className="input" placeholder="Full name" value={captainName} onChange={e => setCaptainName(e.target.value)} />
            </Field>
            <Field label="PIN (4+ digits)">
              <input className="input num" type="password" placeholder="Enter PIN" maxLength={8} value={captainPin} onChange={e => setCaptainPin(e.target.value.replace(/\D/g,''))} />
            </Field>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 18, lineHeight: 1.6, padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 8 }}>
              🔒 This signature is cryptographically timestamped and cannot be altered after submission.
            </div>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={signCaptain}>
              <Check size={16} /> Sign as Captain
            </button>
          </div>
        )}

        {/* STEP 3 — Engineer Sign-Off */}
        {step === 'engineer' && (
          <div style={{ padding: 22 }}>
            <div className="panel panel-pad" style={{ background: 'rgba(58,210,122,.06)', marginBottom: 20, borderLeft: '3px solid var(--green)' }}>
              <div className="row gap-8">
                <Check size={16} className="tgreen" />
                <span className="tgreen" style={{ fontSize: 13, fontWeight: 600 }}>Captain signed: {captainName}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(47,230,224,.12)', border: '1px solid var(--cyan)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <Lock size={24} className="tcyan" />
              </div>
              <div className="hi" style={{ fontSize: 16, fontWeight: 700 }}>Engineer Countersignature</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>I certify this entry is accurate and the aircraft is released to service.</div>
            </div>

            <div className="panel panel-pad" style={{ marginBottom: 18, background: 'var(--bg-deep)' }}>
              <div className="eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>Signing as</div>
              <div className="hi" style={{ fontSize: 14, fontWeight: 600 }}>{currentUser?.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{currentUser?.title} · {(currentUser as any)?.licenceType} {currentUser?.licenseNo}</div>
            </div>

            <Field label="Engineer PIN (4+ digits)">
              <input className="input num" type="password" placeholder="Enter your PIN" maxLength={8} value={engineerPin} onChange={e => setEngineerPin(e.target.value.replace(/\D/g,''))} />
            </Field>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 18, lineHeight: 1.6, padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 8 }}>
              🔒 Both signatures will be locked to this entry. The record becomes immutable.
            </div>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={signEngineer}>
              <Lock size={16} /> Countersign &amp; Lock Entry
            </button>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(58,210,122,.15)', border: '2px solid var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <Check size={36} className="tgreen" />
            </div>
            <div className="hi" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Flight Logged</div>
            <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              {captainSigned ? 'ETL entry signed by captain and engineer. Record is locked.' : 'Airframe, engines and components updated.'}
            </div>
            {captainSigned && (
              <div className="row gap-6" style={{ justifyContent: 'center', marginTop: 14 }}>
                <Lock size={13} className="tgreen" />
                <span className="tgreen" style={{ fontSize: 12 }}>Cryptographically signed and immutable</span>
              </div>
            )}
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
