import React, { useState } from 'react';
import { Boxes, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { PageHeader, StatusBadge, Bar } from '../components/ui';
import { useStore } from '../context/store';
import { useToast } from '../components/Toast';
import type { Component } from '../data/types';

export const ComponentsModule: React.FC = () => {
  const { components, aircraft } = useStore();
  const toast = useToast();
  const [acId, setAcId] = useState(aircraft[0].id);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const list = components.filter(c => c.aircraftId === acId);
  const roots = list.filter(c => !c.parentId);
  const children = (id: string) => list.filter(c => c.parentId === id);

  const Row: React.FC<{ c: Component; depth: number }> = ({ c, depth }) => {
    const kids = children(c.id);
    const life = c.lifeLimit ?? c.tbo ?? 0;
    const used = c.lifeLimit ? c.sinceNew : c.sinceOverhaul;
    const pct = life ? (used / life) * 100 : 0;
    return (
      <>
        <tr onClick={() => kids.length && setOpen(o => ({ ...o, [c.id]: !o[c.id] }))}>
          <td>
            <div className="row gap-8" style={{ paddingLeft: depth * 22 }}>
              {kids.length ? (open[c.id] ? <ChevronDown size={15} className="muted" /> : <ChevronRight size={15} className="muted" />) : <span style={{ width: 15 }} />}
              <Boxes size={15} className={depth === 0 ? 'tcyan' : 'muted'} />
              <span className="hi" style={{ fontWeight: depth === 0 ? 600 : 400 }}>{c.name}</span>
            </div>
          </td>
          <td className="num muted">{c.pn}</td>
          <td className="num muted">{c.sn}</td>
          <td className="num">{c.position}</td>
          <td style={{ width: 160 }}>
            <Bar value={pct} color={pct > 85 ? 'var(--red)' : pct > 65 ? 'var(--amber)' : 'var(--cyan)'} />
            <div className="num muted" style={{ fontSize: 10.5, marginTop: 4 }}>{used.toLocaleString()} / {life ? life.toLocaleString() : '∞'} h</div>
          </td>
          <td><StatusBadge status={c.status} /></td>
        </tr>
        {open[c.id] && kids.map(k => <Row key={k.id} c={k} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div>
      <PageHeader eyebrow="CAMO · Airworthiness" title="Component Management"
        sub="Hierarchical assembly tree with service-life and overhaul tracking."
        actions={<button className="btn primary" onClick={() => toast.push('Component install/removal tracking is coming soon. Hours already roll into installed components automatically when you log flights.')}><Plus size={15} /> Install Component</button>} />

      <div className="row gap-8 wrap" style={{ marginBottom: 16 }}>
        <span className="eyebrow" style={{ alignSelf: 'center' }}>Aircraft</span>
        <select className="select" style={{ width: 260 }} value={acId} onChange={e => { setAcId(e.target.value); setOpen({}); }}>
          {aircraft.map(a => <option key={a.id} value={a.id}>{a.registration} — {a.model} {a.variant}</option>)}
        </select>
      </div>

      <div className="panel fade-up">
        <table className="tbl">
          <thead><tr><th>Component</th><th>Part No.</th><th>Serial</th><th>Position</th><th>Life / Overhaul</th><th>Status</th></tr></thead>
          <tbody>
            {roots.length ? roots.map(c => <Row key={c.id} c={c} depth={0} />)
              : <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 30 }}>No components installed on this aircraft.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
