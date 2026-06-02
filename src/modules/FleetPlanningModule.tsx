import React, { useState } from 'react';
import { CalendarRange, Plane } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { useStore } from '../context/store';

const HORIZONS = [30, 60, 90] as const;

export const FleetPlanningModule: React.FC = () => {
  const { aircraft } = useStore();
  const [horizon, setHorizon] = useState<number>(90);
  const today = new Date('2026-06-01').getTime();

  const rows = aircraft.map(a => {
    const due = new Date(a.nextCheck.dueDate).getTime();
    const offset = Math.round((due - today) / 864e5);
    return { ...a, offset };
  }).filter(r => r.offset <= horizon).sort((a, b) => a.offset - b.offset);

  const ticks = Array.from({ length: horizon / 15 + 1 }, (_, i) => i * 15);

  return (
    <div>
      <PageHeader eyebrow="CAMO · Forecast" title="Fleet Planning"
        sub="Predictive maintenance forecast across the fleet, driven by utilization & intervals."
        actions={HORIZONS.map(h => (
          <button key={h} className={`btn sm ${horizon === h ? 'primary' : 'ghost'}`} onClick={() => setHorizon(h)}>{h} days</button>
        ))} />

      <div className="panel fade-up">
        <div className="panel-head"><h3><CalendarRange size={15} className="tcyan" />Maintenance Forecast — next {horizon} days</h3>
          <span className="badge muted">{rows.length} events</span></div>

        <div style={{ padding: 18, overflowX: 'auto' }}>
          {/* timeline header */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12, marginBottom: 10 }}>
            <div className="eyebrow">Aircraft</div>
            <div style={{ position: 'relative', height: 18 }}>
              {ticks.map(t => (
                <div key={t} className="num muted" style={{ position: 'absolute', left: `${(t / horizon) * 100}%`, fontSize: 10 }}>
                  +{t}d
                </div>
              ))}
            </div>
          </div>

          {rows.map((r, i) => {
            const left = Math.max(0, (r.offset / horizon) * 100);
            const overdue = r.offset < 0;
            const soon = r.offset <= 14;
            const color = r.status === 'aog' ? 'var(--red)' : overdue ? 'var(--red)' : soon ? 'var(--amber)' : 'var(--cyan)';
            return (
              <div key={r.id} className="fade-up" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12, alignItems: 'center', padding: '7px 0', borderTop: '1px solid var(--line)', animationDelay: `${i * 25}ms` }}>
                <div className="row gap-8">
                  <Plane size={14} className="muted" />
                  <span className="num hi" style={{ fontWeight: 600, fontSize: 12.5 }}>{r.registration}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{r.model}</span>
                </div>
                <div style={{ position: 'relative', height: 30, background: 'var(--bg-deep)', borderRadius: 6 }}>
                  {ticks.map(t => <div key={t} style={{ position: 'absolute', left: `${(t / horizon) * 100}%`, top: 0, bottom: 0, width: 1, background: 'var(--line)' }} />)}
                  <div style={{
                    position: 'absolute', left: `${left}%`, top: 4, bottom: 4,
                    minWidth: 90, padding: '0 10px', borderRadius: 5,
                    background: `linear-gradient(90deg, ${color}, transparent 180%)`,
                    border: `1px solid ${color}`, display: 'flex', alignItems: 'center',
                    fontSize: 11, fontWeight: 600, color: 'var(--text-hi)', whiteSpace: 'nowrap',
                    boxShadow: `0 0 14px ${color}40`,
                  }}>
                    {r.nextCheck.type} · {overdue ? `${Math.abs(r.offset)}d overdue` : `+${r.offset}d`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
