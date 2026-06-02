import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Radar, Mail, Sparkles } from 'lucide-react';
import { useStore } from '../context/store';

const SUPPORT_EMAIL = 'karib.aerospace@outlook.com';

interface Msg { role: 'user' | 'bot'; text: string; escalate?: boolean; }

// ---- AirSENS knowledge base: rule-based answers + live data lookups ----
function answer(q: string, store: ReturnType<typeof useStore>): { text: string; escalate?: boolean } {
  const t = q.toLowerCase().trim();
  const { aircraft, defects, workOrders, mel, currentUser } = store;

  const has = (...k: string[]) => k.some(x => t.includes(x));

  // greetings
  if (has('hello', 'hi ', 'hey', 'good morning', 'good afternoon') || t === 'hi') {
    return { text: `Hi${currentUser ? ' ' + currentUser.name.split(' ')[0] : ''}! I'm SENS, your AirSENS assistant. Ask me about logging flights, MEL categories, the Amplification Factor, your fleet status, or how any module works.` };
  }

  // ---- live fleet data ----
  if (has('aog', 'grounded', 'on ground')) {
    const aogs = aircraft.filter(a => a.status === 'aog');
    return { text: aogs.length ? `${aogs.length} aircraft currently AOG: ${aogs.map(a => a.registration).join(', ')}. Open their profile to see blocking defects.` : 'No aircraft are currently AOG — the whole fleet is dispatchable.' };
  }
  if (has('how many aircraft', 'fleet size', 'total aircraft')) {
    return { text: `Your fleet has ${aircraft.length} aircraft: ${aircraft.filter(a => a.status === 'airworthy').length} airworthy, ${aircraft.filter(a => a.status === 'due-soon').length} due soon, ${aircraft.filter(a => a.status === 'aog').length} AOG.` };
  }
  if (has('open defect', 'how many defect', 'defects')) {
    const open = defects.filter(d => d.status !== 'closed');
    const catA = open.filter(d => d.melCategory === 'A').length;
    return { text: `${open.length} open defects across the fleet${catA ? `, including ${catA} Category-A (grounding) items` : ''}. Raise or close defects from an aircraft's profile.` };
  }
  if (has('open work order', 'work orders', 'how many wo')) {
    return { text: `${workOrders.filter(w => w.state !== 'closed').length} open work orders. The Work Orders board lets you drag jobs across backlog → planned → in-progress → QA → closed.` };
  }
  if (has('due soon', 'next check', 'upcoming maintenance')) {
    const soon = aircraft.filter(a => a.status === 'due-soon');
    return { text: soon.length ? `${soon.length} aircraft due soon: ${soon.map(a => `${a.registration} (${a.nextCheck.type})`).join(', ')}. See Fleet Planning for the forecast timeline.` : 'Nothing critically due in the near term. Check Fleet Planning for the 30/60/90-day view.' };
  }

  // ---- how-to / concepts ----
  if (has('log', 'flight hour', 'add hours', 'record flight') && !has('logbook module')) {
    return { text: 'To log a flight: open Aircraft → click an aircraft → "Log Flight / Hours". Enter block hours, landings/cycles, payload and load factor. AirSENS rolls those into airframe hours, engine hours/cycles and every installed component, advancing all maintenance-program countdowns automatically.' };
  }
  if (has('mel', 'minimum equipment')) {
    return { text: 'MEL categories by rectification window: A = immediate (safety-critical, grounds the aircraft); B = 3 days; C = 10 days; D = 120 days. When you raise a defect, AirSENS auto-classifies it: tick "safety-critical" for Category A, otherwise severity drives B/C/D.' };
  }
  if (has('amplification', 'fatigue', 'af engine')) {
    return { text: 'The Amplification Factor engine (Engineering → Amplification Factor) models how operational load amplifies fatigue. Drag the sliders for payload, cycles/day, sector length, load factor and environment; it outputs an AF value, fatigue index, recommended interval tightening, a cost multiplier and a 10-year cost projection.' };
  }
  if (has('permission', 'access', 'role', 'add engineer', 'add user', 'manage user')) {
    return { text: currentUser?.role === 'engineer' || currentUser?.role === 'viewer'
      ? 'User and permission management is admin-only. Ask your org admin to adjust your module access (view / read / write / edit).'
      : 'Open the Admin panel → Add Engineer. Set their name, title, email, role and license, then use the permission matrix to grant view / read / write / edit per module. Write/edit automatically include read and view.' };
  }
  if (has('component', 'tbo', 'overhaul', 'life limit')) {
    return { text: 'Components (CAMO → Components) show a hierarchical tree per aircraft with time-since-overhaul and life-limit bars. Logged flight hours accrue to installed components automatically, so their remaining life updates as you fly.' };
  }
  if (has('ad', 'sb', 'airworthiness directive', 'service bulletin')) {
    return { text: 'AD/SB Tracking lists directives with authority (EASA/FAA/OEM), classification and fleet-wide compliance %. Mandatory ADs are highlighted; compliance bars show how much of the fleet is done.' };
  }
  if (has('reliability', 'mtbur', 'dispatch reliability')) {
    return { text: 'Reliability Analysis computes dispatch reliability, defects by ATA chapter, defect trends and MTBUR by component family from your logged data — so the more you log, the sharper it gets.' };
  }
  if (has('reset', 'clear data', 'start over')) {
    return { text: 'Admins can reset all demo data from Admin → Audit Log → "Reset demo data". This restores the seeded fleet and clears flights/defects/users you added.' };
  }
  if (has('who are you', 'what are you', 'what can you do', 'help')) {
    return { text: 'I\'m SENS — I know how every AirSENS module works and can read your live fleet data. Try: "how do I log a flight?", "what are the MEL categories?", "how many aircraft are AOG?", or "explain the Amplification Factor".' };
  }
  if (has('thank', 'thanks', 'cheers')) {
    return { text: 'Anytime. Safe ops! ✈️' };
  }

  // ---- fallback → escalate ----
  return {
    text: `I'm not certain about that one. I can connect you to the AirSENS support team — tap below to email ${SUPPORT_EMAIL} and I'll include your question.`,
    escalate: true,
  };
}

export const AIAssistant: React.FC = () => {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'bot', text: `Hi${store.currentUser ? ' ' + store.currentUser.name.split(' ')[0] : ''}! I'm SENS, your AirSENS assistant. Ask me anything about the system or your fleet.` },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    const a = answer(q, store);
    setMsgs(m => [...m, { role: 'user', text: q }, { role: 'bot', text: a.text, escalate: a.escalate }]);
    setInput('');
  };

  const emailSupport = (question: string) => {
    const subject = encodeURIComponent('AirSENS support question');
    const body = encodeURIComponent(`Question: ${question}\n\nFrom: ${store.currentUser?.name ?? ''} (${store.currentUser?.email ?? ''})`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const suggestions = ['How do I log a flight?', 'What are the MEL categories?', 'How many aircraft are AOG?', 'Explain the Amplification Factor'];

  return (
    <>
      {/* floating button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: 26, right: 26, zIndex: 60,
        width: 58, height: 58, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--cyan), var(--cyan-dim))',
        boxShadow: '0 8px 30px var(--cyan-glow)', display: 'grid', placeItems: 'center',
        transition: 'transform .2s',
      }} onMouseDown={e => (e.currentTarget.style.transform = 'scale(.92)')} onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
        {open ? <X size={24} color="#04181a" /> : <MessageSquare size={24} color="#04181a" />}
      </button>

      {open && (
        <div className="fade-up" style={{
          position: 'fixed', bottom: 96, right: 26, zIndex: 60,
          width: 'min(380px, calc(100vw - 52px))', height: 520,
          background: 'var(--bg-panel)', border: '1px solid var(--line-bright)',
          borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* header */}
          <div className="row gap-12" style={{ padding: '15px 18px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, var(--bg-panel-2), var(--bg-panel))' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, var(--cyan), var(--cyan-dim))', display: 'grid', placeItems: 'center', boxShadow: '0 0 16px var(--cyan-glow)' }}>
              <Radar size={19} color="#04181a" />
            </div>
            <div>
              <div className="row gap-8"><span className="hi" style={{ fontWeight: 700, fontSize: 14 }}>SENS Assistant</span><Sparkles size={13} className="tcyan" /></div>
              <div className="eyebrow" style={{ fontSize: 8.5 }}>AirSENS AI · always on</div>
            </div>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 13px', borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                  background: m.role === 'user' ? 'linear-gradient(135deg, var(--cyan), var(--cyan-dim))' : 'var(--bg-elevated)',
                  color: m.role === 'user' ? '#04181a' : 'var(--text-hi)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--line)',
                  borderBottomRightRadius: m.role === 'user' ? 3 : 12,
                  borderBottomLeftRadius: m.role === 'user' ? 12 : 3,
                }}>
                  {m.text}
                </div>
                {m.escalate && (
                  <button className="btn sm" style={{ marginTop: 8 }} onClick={() => emailSupport(msgs[i - 1]?.text ?? '')}>
                    <Mail size={13} /> Email support
                  </button>
                )}
              </div>
            ))}
            {/* suggestions only at start */}
            {msgs.length <= 1 && (
              <div className="col gap-8" style={{ marginTop: 4 }}>
                {suggestions.map(s => (
                  <button key={s} onClick={() => send(s)} className="row" style={{ padding: '8px 12px', background: 'var(--bg-deep)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12.5, color: 'var(--text)', textAlign: 'left' }}>{s}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* input */}
          <div className="row gap-8" style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
            <input className="input" placeholder="Ask SENS…" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="btn primary" style={{ padding: 10 }} onClick={() => send()}><Send size={16} /></button>
          </div>
        </div>
      )}
    </>
  );
};
