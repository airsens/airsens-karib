import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend,
} from 'recharts';
import { Activity, Download, TrendingDown, Gauge } from 'lucide-react';
import { PageHeader, PanelHead, KpiCard } from '../components/ui';
import { useStore } from '../context/store';
import { useToast } from '../components/Toast';
import { downloadCsv, printPdf } from '../lib/exports';

const tooltipStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--line-bright)',
  borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-hi)',
};

export const ReliabilityModule: React.FC = () => {
  const { defects, components, flightLogs } = useStore();
  const toast = useToast();
  // defects by ATA
  const byAta: Record<string, number> = {};
  defects.forEach(d => { byAta[d.ata] = (byAta[d.ata] || 0) + 1; });
  const ataData = Object.entries(byAta).map(([ata, count]) => ({ ata: `ATA ${ata}`, count })).sort((a, b) => b.count - a.count);

  // MTBUR proxy per component family
  const fam: Record<string, { hrs: number; removals: number }> = {};
  components.forEach(c => {
    fam[c.name] = fam[c.name] || { hrs: 0, removals: 0 };
    fam[c.name].hrs += c.sinceOverhaul;
    fam[c.name].removals += 1;
  });
  const mtbur = Object.entries(fam).map(([name, v]) => ({
    name: name.length > 16 ? name.slice(0, 15) + '…' : name,
    mtbur: Math.round(v.hrs / Math.max(v.removals, 1)),
  })).sort((a, b) => b.mtbur - a.mtbur).slice(0, 8);

  // defect trend over weeks
  const weeks: Record<string, number> = {};
  defects.forEach(d => {
    const wk = `W${Math.ceil((new Date(d.raisedDate).getDate()) / 7)}`;
    weeks[wk] = (weeks[wk] || 0) + 1;
  });
  const trend = ['W1', 'W2', 'W3', 'W4', 'W5'].map(w => ({ week: w, defects: weeks[w] || 0 }));

  const dispatchRel = (1 - defects.filter(d => d.severity === 'critical').length / Math.max(flightLogs.length, 1)).toFixed(3);

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['AirSENS Reliability Report', new Date().toISOString().slice(0, 10)],
      ['Karib Aerospace Ltd'],
      [],
      ['Dispatch Reliability', `${(+dispatchRel * 100).toFixed(1)}%`],
      ['Open Defects', defects.filter(d => d.status !== 'closed').length],
      ['Critical Defects', defects.filter(d => d.severity === 'critical' && d.status !== 'closed').length],
      ['Tracked Components', components.length],
      [],
      ['DEFECTS BY ATA CHAPTER'],
      ['ATA', 'Count'],
      ...ataData.map(d => [d.ata, d.count]),
      [],
      ['MTBUR BY COMPONENT FAMILY (hrs)'],
      ['Component', 'MTBUR (hrs)'],
      ...mtbur.map(m => [m.name, m.mtbur]),
      [],
      ['DEFECT TREND'],
      ['Week', 'Defects'],
      ...trend.map(t => [t.week, t.defects]),
    ];
    downloadCsv(rows, 'airsens-reliability');
    toast.push('Reliability exported as CSV — open in Excel.', 'success');
  };

  const exportPdf = () => {
    const tableRows = (headers: string[], rows: (string | number)[][]) =>
      `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
        rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')
      }</tbody></table>`;

    printPdf('Reliability Analysis', [
      {
        heading: 'Key Performance Indicators',
        html: `<div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${(+dispatchRel * 100).toFixed(1)}%</div><div class="kpi-lbl">Dispatch Reliability</div></div>
          <div class="kpi"><div class="kpi-val">${defects.filter(d => d.status !== 'closed').length}</div><div class="kpi-lbl">Open Defects</div></div>
          <div class="kpi"><div class="kpi-val">${defects.filter(d => d.severity === 'critical' && d.status !== 'closed').length}</div><div class="kpi-lbl">Critical Defects</div></div>
          <div class="kpi"><div class="kpi-val">${components.length}</div><div class="kpi-lbl">Tracked Components</div></div>
        </div>`,
      },
      {
        heading: 'Defects by ATA Chapter',
        html: tableRows(['ATA Chapter', 'Defect Count'], ataData.map(d => [d.ata, d.count])),
      },
      {
        heading: 'MTBUR by Component Family',
        html: tableRows(['Component', 'MTBUR (hrs)'], mtbur.map(m => [m.name, m.mtbur])),
      },
      {
        heading: 'Defect Trend by Week',
        html: tableRows(['Week', 'Defects'], trend.map(t => [t.week, t.defects])),
      },
    ]);
  };

  return (
    <div>
      <PageHeader eyebrow="CAMO · Analytics" title="Reliability Analysis"
        sub="Fleet reliability KPIs computed from historical logs and defect data."
        actions={<><button className="btn ghost" onClick={exportCsv}><Download size={15} /> Excel (CSV)</button><button className="btn primary" onClick={exportPdf}><Download size={15} /> PDF Report</button></>} />

      <div className="grid kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard label="Dispatch Reliability" value={`${(+dispatchRel * 100).toFixed(1)}%`} sub="Rolling 90 days" accent="var(--green)" icon={<Gauge size={18} />} />
        <KpiCard label="Open Defects" value={defects.filter(d => d.status !== 'closed').length} sub="Across fleet" accent="var(--amber)" icon={<Activity size={18} />} delay={60} />
        <KpiCard label="Critical Defects" value={defects.filter(d => d.severity === 'critical' && d.status !== 'closed').length} sub="Require action" accent="var(--red)" icon={<TrendingDown size={18} />} delay={120} />
        <KpiCard label="Tracked Components" value={components.length} sub="With life data" accent="var(--cyan)" icon={<Gauge size={18} />} delay={180} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
        <div className="panel fade-up">
          <PanelHead title="Defects by ATA Chapter" icon={<Activity size={15} className="tamber" />} />
          <div style={{ padding: '16px 12px 8px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ataData}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="ata" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="count" fill="var(--amber)" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel fade-up" style={{ animationDelay: '80ms' }}>
          <PanelHead title="Defect Trend" icon={<TrendingDown size={15} className="tcyan" />} />
          <div style={{ padding: '16px 12px 8px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="defects" stroke="var(--cyan)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--cyan)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel fade-up" style={{ animationDelay: '120ms' }}>
        <PanelHead title="MTBUR by Component Family (hours)" icon={<Gauge size={15} className="tgreen" />} />
        <div style={{ padding: '16px 12px 8px' }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mtbur} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid stroke="var(--line)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
              <Bar dataKey="mtbur" fill="var(--green)" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
