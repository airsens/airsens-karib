import React, { useState } from 'react';
import { Radar, LogIn, AlertCircle, ChevronRight } from 'lucide-react';
import { useStore } from '../context/store';

export const Login: React.FC = () => {
  const { login, users } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    const r = login(email, password);
    if (!r.ok) setErr(r.error ?? 'Login failed');
  };

  const quick = (e: string, p: string) => { setEmail(e); setPassword(p); setErr(''); };

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr', position: 'relative', zIndex: 1 }} className="login-split">
      {/* Left: brand panel */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRight: '1px solid var(--line)',
        background: 'linear-gradient(160deg, var(--bg-panel), var(--bg-void))', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="login-brand">
        {/* radar sweep deco */}
        <div style={{ position: 'absolute', width: 620, height: 620, borderRadius: '50%', right: -240, top: '50%', transform: 'translateY(-50%)',
          border: '1px solid var(--line)', boxShadow: '0 0 0 80px rgba(47,230,224,.02), 0 0 0 160px rgba(47,230,224,.015)' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 0deg, transparent 0deg, var(--cyan-glow) 40deg, transparent 80deg)', animation: 'sweep 6s linear infinite' }} />
        </div>
        <div className="row gap-12" style={{ position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, display: 'grid', placeItems: 'center',
            background: 'linear-gradient(135deg, var(--cyan), var(--cyan-dim))', boxShadow: '0 0 22px var(--cyan-glow)' }}>
            <Radar size={24} color="#04181a" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-hi)' }}>Air<span className="tcyan">SENS</span></div>
            <div className="eyebrow" style={{ fontSize: 9 }}>Karib Aerospace</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="eyebrow" style={{ color: 'var(--cyan-dim)' }}>Aviation Maintenance &amp; Sustainment</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-hi)', lineHeight: 1.1, marginTop: 14, letterSpacing: '-0.02em' }}>
            Airworthiness,<br />engineered to a<br /><span className="tcyan">single source of truth.</span>
          </h1>
          <p className="muted" style={{ fontSize: 15, marginTop: 18, maxWidth: 440, lineHeight: 1.6 }}>
            CAMO, MRO and engineering analytics unified — fleet tracking, maintenance
            programs, MEL dispatch and the Amplification Factor engine in one cockpit.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="row gap-24 muted" style={{ fontSize: 12, marginBottom: 16 }}>
            <span>Part-CAMO</span><span>·</span><span>Part-145</span><span>·</span><span>EASA / FAA aligned</span>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-hi)', textTransform: 'uppercase', marginBottom: 6 }}>
              Karib Aerospace Ltd
            </div>
            <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.7 }}>
              Aircraft Sourcing &nbsp;·&nbsp; Asset Trading &nbsp;·&nbsp; Aviation Solutions &nbsp;·&nbsp; Airworthiness &amp; Technical Support
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.8 }}>
              <span>4 Preston Road, Brighton, England BN1 4QF</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
              <a href="mailto:karib.aerospace@outlook.com" style={{ color: 'var(--cyan-dim)', textDecoration: 'none' }}>karib.aerospace@outlook.com</a>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
              <span>UK: +44 7512 549 068</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
              <span>US: +1 217 848 2193</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
              <span>Co. No. 14231476</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="fade-up">
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-hi)' }}>Sign in</h2>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>Access your organization's maintenance system.</p>

          <div style={{ marginTop: 28 }}>
            <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Email</label>
            <input className="input" type="email" placeholder="you@karib-aerospace.com" value={email}
              onChange={e => { setEmail(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>

          {err && (
            <div className="row gap-8" style={{ marginTop: 14, color: 'var(--red)', fontSize: 12.5 }}>
              <AlertCircle size={15} />{err}
            </div>
          )}

          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 22, padding: 12 }} onClick={submit}>
            <LogIn size={16} /> Sign in
          </button>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Demo accounts — tap to fill</div>
            <div className="col gap-8">
              {[
                { label: 'Super Admin · Rilwan Olowu (COO)', email: 'rilwan.olowu@karib-aerospace.com', pw: 'admin' },
                { label: 'Org Admin · Promise Benebo (Founder)', email: 'promise.benebo@karib-aerospace.com', pw: 'admin' },
                { label: 'Engineer · M. Okafor', email: 'm.okafor@karib-aerospace.com', pw: 'engineer' },
                { label: 'Viewer · L. Persaud', email: 'l.persaud@karib-aerospace.com', pw: 'viewer' },
              ].map(a => (
                <button key={a.email} onClick={() => quick(a.email, a.pw)}
                  className="row between" style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-panel)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12.5, color: 'var(--text)' }}>
                  <span>{a.label}</span><ChevronRight size={14} className="muted" />
                </button>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 11, marginTop: 12, lineHeight: 1.5 }}>
              {users.length} accounts in this org. Passwords shown are local demo credentials only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
