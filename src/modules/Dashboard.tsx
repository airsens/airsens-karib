import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { Plane, Wrench, AlertTriangle, Package, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { KpiCard, PageHeader, StatusBadge, PanelHead } from '../components/ui';
import { useStore } from '../context/store';
import { inventory as seedInventory, adsb as seedAdsb } from '../data/seed';

const tooltipStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--line-bright)',
  borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-hi)',
};

export const Dashboard: React.FC = () => {
  const nav = useNavigate();
  const { aircraft, workOrders, flightLogs, defects } = useStore();

  const KPI = {
    fleetSize: aircraft.length,
    airworthy: aircraft.filter(a => a.status === 'airworthy').length,
    aog: aircraft.filter(a => a.status === 'aog').length,
    dueSoon: aircraft.filter(a => a.status === 'due-soon').length,
    openWO: workOrders.filter(w => w.state !== 'closed').length,
    openDefects: defects.filter(d => d.status !== 'closed').length,
    lowStock: seedInventory.filter(i => i.qty < i.minQty).length,
    adsbOpen: seedAdsb.filter(a => a.status !== 'complied' && a.status !== 'n/a').length,
  };

  // 30-day utilization series
  const byDate: Record<string, number> = {};
  flightLogs.forEach(f => { byDate[f.date] = (byDate[f.date] || 0) + f.blockHours; });
  const util = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).slice(-30).map(([date, hrs]) => ({
    date: date.slice(5), hrs: +hrs.toFixed(1),
  }));

  const statusData = [
    { name: 'Airworthy', value: KPI.airworthy, color: 'var(--green)' },
    { name: 'Due Soon', value: KPI.dueSoon, color: 'var(--amber)' },
    { name: 'AOG', value: KPI.aog, color: 'var(--red)' },
  ].filter(d => d.value > 0);

  const woByState = ['backlog', 'planned', 'in-progress', 'qa', 'closed'].map(s => ({
    state: s, count: workOrders.filter(w => w.state === s).length,
  }));

  const priorityAircraft = [...aircraft]
    .sort((a, b) => (a.status === 'aog' ? -2 : 0) + new Date(a.nextCheck.dueDate).getTime() / 1e12
      - ((b.status === 'aog' ? -2 : 0) + new Date(b.nextCheck.dueDate).getTime() / 1e12))
    .slice(0, 6);

  return (
    <div>
      <PageHeader eyebrow="Operations · Live" title="Command Deck"
        sub="Fleet airworthiness, maintenance load and reliability at a glance." />

      <div className="grid kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard label="Fleet Size" value={KPI.fleetSize} sub={`${KPI.airworthy} airworthy now`} icon={<Plane size={18} />} delay={0} />
        <KpiCard label="Aircraft on Ground" value={KPI.aog} sub="Immediate attention" accent="var(--red)" icon={<AlertTriangle size={18} />} delay={60} />
        <KpiCard label="Open Work Orders" value={KPI.openWO} sub={`${workOrders.filter(w=>w.priority==='aog').length} critical`} accent="var(--amber)" icon={<Wrench size={18} />} delay={120} />
        <KpiCard label="Open Defects" value={KPI.openDefects} sub={`${defects.filter(d=>d.severity==='critical'&&d.status!=='closed').length} critical`} accent="var(--violet)" icon={<Activity size={18} />} delay={180} />
        <KpiCard label="Low Stock Items" value={KPI.lowStock} sub="Below minimum" accent="var(--blue)" icon={<Package size={18} />} delay={240} />
        <KpiCard label="AD/SB Open" value={KPI.adsbOpen} sub="Compliance pending" accent="var(--cyan)" icon={<TrendingUp size={18} />} delay={300} />
      </div>

      <div className="grid-chart" style={{ marginBottom: 16 }}>
        <div className="panel fade-up" style={{ animationDelay: '120ms' }}>
          <PanelHead title="Fleet Utilization — 30 days" icon={<Activity size={15} className="tcyan" />}
            right={<span className="badge muted">block hours / day</span>} />
          <div style={{ padding: '16px 12px 8px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={util}>
                <defs>
                  <linearGradient id="gUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }} interval={4} />
                <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="hrs" stroke="var(--cyan)" strokeWidth={2} fill="url(#gUtil)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel fade-up" style={{ animationDelay: '180ms' }}>
          <PanelHead title="Fleet Status" icon={<Plane size={15} className="tgreen" />} />
          <div style={{ padding: 16 }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={statusData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} stroke="none">
                  {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="col gap-8" style={{ marginTop: 8 }}>
              {statusData.map(d => (
                <div key={d.name} className="row between" style={{ fontSize: 12.5 }}>
                  <span className="row gap-8"><span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} />{d.name}</span>
                  <span className="num hi">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-chart-alt" style={{ marginBottom: 16 }}>
        <div className="panel fade-up" style={{ animationDelay: '220ms' }}>
          <PanelHead title="Priority Aircraft" icon={<AlertTriangle size={15} className="tamber" />}
            right={<button className="btn ghost sm" onClick={() => nav('/aircraft')}>View all <ArrowUpRight size={14} /></button>} />
          <table className="tbl">
            <thead><tr><th>Reg</th><th>Model</th><th>Next Check</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {priorityAircraft.map(a => (
                <tr key={a.id} onClick={() => nav('/aircraft')}>
                  <td className="num hi" style={{ fontWeight: 600 }}>{a.registration}</td>
                  <td>{a.model} <span className="muted">{a.variant}</span></td>
                  <td>{a.nextCheck.type}</td>
                  <td className="num muted">{a.nextCheck.dueDate}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel fade-up" style={{ animationDelay: '260ms' }}>
          <PanelHead title="Work Order Pipeline" icon={<Wrench size={15} className="tcyan" />} />
          <div style={{ padding: '16px 12px 8px' }}>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={woByState} layout="vertical" margin={{ left: 18 }}>
                <CartesianGrid stroke="var(--line)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                <YAxis type="category" dataKey="state" width={70}
                  tick={{ fill: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="count" fill="var(--cyan)" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
