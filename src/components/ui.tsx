import React from 'react';
import type { Status } from '../data/types';

export const StatusBadge: React.FC<{ status: Status; label?: string }> = ({ status, label }) => {
  const map: Record<Status, { cls: string; txt: string }> = {
    airworthy: { cls: 'ok', txt: 'Airworthy' },
    'due-soon': { cls: 'warn', txt: 'Due Soon' },
    overdue: { cls: 'crit', txt: 'Overdue' },
    aog: { cls: 'aog', txt: 'AOG' },
  };
  const m = map[status];
  return <span className={`badge ${m.cls}`}><span className="dot" />{label ?? m.txt}</span>;
};

export const KpiCard: React.FC<{
  label: string; value: React.ReactNode; sub?: string;
  accent?: string; icon?: React.ReactNode; delay?: number;
}> = ({ label, value, sub, accent = 'var(--cyan)', icon, delay = 0 }) => (
  <div className="panel panel-pad ticks fade-up" style={{ animationDelay: `${delay}ms`, overflow: 'hidden' }}>
    <div className="row between" style={{ alignItems: 'flex-start' }}>
      <div className="eyebrow">{label}</div>
      {icon && <div style={{ color: accent, opacity: .8 }}>{icon}</div>}
    </div>
    <div className="num" style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-hi)', marginTop: 10, lineHeight: 1 }}>
      {value}
    </div>
    {sub && <div className="muted" style={{ fontSize: 12, marginTop: 7 }}>{sub}</div>}
    <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: '100%',
      background: `linear-gradient(90deg, ${accent}, transparent)` }} />
  </div>
);

export const PanelHead: React.FC<{ title: string; icon?: React.ReactNode; right?: React.ReactNode }> =
  ({ title, icon, right }) => (
  <div className="panel-head">
    <h3>{icon}{title}</h3>
    {right}
  </div>
);

export const PageHeader: React.FC<{ eyebrow: string; title: string; sub?: string; actions?: React.ReactNode }> =
  ({ eyebrow, title, sub, actions }) => (
  <div className="row between wrap gap-16" style={{ marginBottom: 22 }}>
    <div className="fade-up">
      <div className="eyebrow" style={{ color: 'var(--cyan-dim)' }}>{eyebrow}</div>
      <h1 className="page-title" style={{ marginTop: 6 }}>{title}</h1>
      {sub && <div className="page-sub">{sub}</div>}
    </div>
    {actions && <div className="row gap-8">{actions}</div>}
  </div>
);

export const Bar: React.FC<{ value: number; max?: number; color?: string }> =
  ({ value, max = 100, color = 'var(--cyan)' }) => (
  <div style={{ height: 6, background: 'var(--bg-deep)', borderRadius: 100, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`,
      background: color, borderRadius: 100, transition: 'width .6s' }} />
  </div>
);
