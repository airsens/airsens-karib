import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  FileWarning, ListChecks, Package, BookOpen, ClipboardList, FileText, Receipt,
  Download, Plus, AlertTriangle, CheckCircle2, Calendar,
} from 'lucide-react';
import { PageHeader, PanelHead, StatusBadge, Bar, KpiCard } from '../components/ui';
import { adsb, inventory } from '../data/seed';
import { useStore } from '../context/store';
import { useToast } from '../components/Toast';
import { downloadCsv, printPdf } from '../lib/exports';

const tooltipStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--line-bright)',
  borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-hi)',
};

/* ---------------- AD / SB ---------------- */
export const AdSbModule: React.FC = () => {
  const toast = useToast();
  const [k, setK] = useState<'all' | 'AD' | 'SB'>('all');
  const list = adsb.filter(a => k === 'all' || a.kind === k);

  const exportAdsbCsv = () => {
    downloadCsv([
      ['AirSENS AD/SB Compliance Export', new Date().toISOString().slice(0, 10)],
      ['Karib Aerospace Ltd'], [],
      ['Ref', 'Type', 'Subject', 'Authority', 'Classification', 'Effective Date', 'Status', 'Fleet Compliance %'],
      ...list.map(a => [a.ref, a.kind, a.subject, a.authority, a.classification, a.effectiveDate, a.status, `${a.compliance}%`]),
    ], 'airsens-adsb');
    toast.push('AD/SB list exported as CSV.', 'success');
  };

  const exportAdsbPdf = () => {
    printPdf('AD / SB Compliance', [{
      heading: `Directives & Bulletins (${list.length})`,
      html: `<table><thead><tr><th>Ref</th><th>Type</th><th>Subject</th><th>Authority</th><th>Classification</th><th>Status</th><th>Compliance</th></tr></thead><tbody>
        ${list.map(a => `<tr><td>${a.ref}</td><td>${a.kind}</td><td>${a.subject}</td><td>${a.authority}</td><td>${a.classification}</td>
        <td><span class="badge badge-${a.status === 'complied' ? 'green' : a.status === 'open' ? 'red' : 'amber'}">${a.status}</span></td>
        <td>${a.compliance}%</td></tr>`).join('')}
      </tbody></table>`,
    }]);
  };
  return (
    <div>
      <PageHeader eyebrow="CAMO · Compliance" title="AD / SB Tracking"
        sub="Airworthiness Directives & Service Bulletins with fleet compliance status."
        actions={<><button className="btn ghost" onClick={exportAdsbCsv}><Download size={15} /> CSV</button><button className="btn ghost" onClick={exportAdsbPdf}><Download size={15} /> PDF</button><button className="btn primary" onClick={() => toast.push('Adding AD/SB directives will be available when the regulatory data feed is connected.')}><Plus size={15} /> Add Directive</button></>} />
      <div className="row gap-8" style={{ marginBottom: 16 }}>
        {(['all', 'AD', 'SB'] as const).map(f => (
          <button key={f} className={`btn sm ${k === f ? 'primary' : 'ghost'}`} onClick={() => setK(f)}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>
      <div className="panel fade-up">
        <table className="tbl">
          <thead><tr><th>Reference</th><th>Subject</th><th>Authority</th><th>Class</th><th>Issued</th><th>Rev</th><th>Compliance</th><th>Status</th></tr></thead>
          <tbody>
            {list.map(a => (
              <tr key={a.id}>
                <td><span className={`badge ${a.kind === 'AD' ? 'crit' : 'info'}`} style={{ fontSize: 9, marginRight: 8 }}>{a.kind}</span><span className="num hi">{a.ref}</span></td>
                <td>{a.subject}</td>
                <td><span className="badge muted">{a.authority}</span></td>
                <td style={{ textTransform: 'capitalize' }} className={a.classification === 'mandatory' ? 'tred' : 'muted'}>{a.classification}</td>
                <td className="num muted">{a.issueDate}</td>
                <td className="num muted">{a.revision}</td>
                <td style={{ width: 140 }}><Bar value={a.compliance} color={a.compliance === 100 ? 'var(--green)' : a.compliance > 60 ? 'var(--amber)' : 'var(--red)'} /><span className="num muted" style={{ fontSize: 10.5 }}>{a.compliance}%</span></td>
                <td><span className={`badge ${a.status === 'complied' ? 'ok' : a.status === 'in-work' ? 'warn' : 'crit'}`} style={{ textTransform: 'capitalize' }}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- MEL ---------------- */
export const MelModule: React.FC = () => {
  const { defects, aircraft, closeDefect, can } = useStore();
  const toast = useToast();
  const aircraftById = (id: string) => aircraft.find(a => a.id === id);
  const active = defects.filter(d => d.status !== 'closed' && d.melCategory);
  const catDays = { A: 'Immediate', B: '3 days', C: '10 days', D: '120 days' };

  const exportMelCsv = () => {
    downloadCsv([
      ['AirSENS MEL Active Items Export', new Date().toISOString().slice(0, 10)],
      ['Karib Aerospace Ltd'], [],
      ['MEL Ref', 'ATA', 'Description', 'Category', 'Rectify By', 'Aircraft', 'Severity', 'Safety Critical', 'Reported By'],
      ...active.map(d => [
        d.melRef ?? '—', d.ata, d.description,
        `Cat ${d.melCategory} (${catDays[d.melCategory!]})`,
        d.melCategory === 'A' ? 'IMMEDIATE' : d.dueDate ?? '—',
        aircraftById(d.aircraftId)?.registration ?? d.aircraftId,
        d.severity, d.safetyCritical ? 'YES' : 'No', d.reportedBy ?? '—',
      ]),
    ], 'airsens-mel');
    toast.push(`${active.length} MEL items exported as CSV.`, 'success');
  };

  const exportMelPdf = () => {
    printPdf('Minimum Equipment List', [{
      heading: `Active MEL Items (${active.length})`,
      html: `<table><thead><tr><th>Ref</th><th>ATA</th><th>Description</th><th>Category</th><th>Aircraft</th><th>Rectify By</th></tr></thead><tbody>
        ${active.map(d => `<tr>
          <td>${d.melRef ?? '—'}</td><td>${d.ata}</td><td>${d.description}</td>
          <td><span class="badge badge-${d.melCategory === 'A' ? 'red' : d.melCategory === 'B' ? 'red' : d.melCategory === 'C' ? 'amber' : 'blue'}">Cat ${d.melCategory}</span></td>
          <td>${aircraftById(d.aircraftId)?.registration ?? d.aircraftId}</td>
          <td>${d.melCategory === 'A' ? 'IMMEDIATE' : d.dueDate ?? '—'}</td>
        </tr>`).join('')}
      </tbody></table>`,
    }]);
  };
  return (
    <div>
      <PageHeader eyebrow="CAMO · Dispatch" title="Minimum Equipment List"
        sub="Open defects classified by safety-criticality into MEL categories A–D."
        actions={<><button className="btn ghost" onClick={exportMelCsv}><Download size={15} /> CSV</button><button className="btn ghost" onClick={exportMelPdf}><Download size={15} /> PDF</button></>} />
      <div className="grid kpi-grid" style={{ marginBottom: 16 }}>
        {(['A', 'B', 'C', 'D'] as const).map((cat, i) => (
          <KpiCard key={cat} label={`Category ${cat}`} value={active.filter(m => m.melCategory === cat).length}
            sub={`${catDays[cat]} limit`}
            accent={cat === 'A' ? 'var(--red)' : cat === 'B' ? 'var(--amber)' : 'var(--cyan)'} delay={i * 60} />
        ))}
      </div>
      <div className="panel fade-up">
        <PanelHead title="Active MEL Items" icon={<ListChecks size={15} className="tamber" />} right={<span className="badge warn">{active.length} active</span>} />
        {active.length === 0
          ? <div className="muted" style={{ padding: 30, textAlign: 'center', fontStyle: 'italic' }}>No active MEL items. Raise a defect from an aircraft profile to populate this list.</div>
          : <table className="tbl">
              <thead><tr><th>Ref</th><th>ATA</th><th>Description</th><th>Cat</th><th>Aircraft</th><th>Reported By</th><th>Rectify By</th><th></th></tr></thead>
              <tbody>
                {active.map(d => {
                  const overdue = d.dueDate && new Date(d.dueDate).getTime() < Date.now();
                  return (
                    <tr key={d.id}>
                      <td className="num hi">{d.melRef ?? '—'}</td>
                      <td className="num muted">{d.ata}</td>
                      <td>{d.description}</td>
                      <td><span className={`badge ${d.melCategory === 'A' ? 'aog' : d.melCategory === 'B' ? 'crit' : d.melCategory === 'C' ? 'warn' : 'info'}`}>{d.melCategory}</span></td>
                      <td className="num">{aircraftById(d.aircraftId)?.registration}</td>
                      <td className="muted">{d.reportedBy}</td>
                      <td className={`num ${overdue ? 'tred' : 'muted'}`}>{d.melCategory === 'A' ? 'Immediate' : d.dueDate}</td>
                      <td onClick={e => e.stopPropagation()}>
                        {can('mel', 'edit') && <button className="btn ghost sm" onClick={() => closeDefect(d.id)}>Rectify</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>}
      </div>
    </div>
  );
};

/* ---------------- INVENTORY ---------------- */
export const InventoryModule: React.FC = () => {
  const toast = useToast();
  const low = inventory.filter(i => i.qty < i.minQty);

  const exportInvCsv = () => {
    downloadCsv([
      ['AirSENS Inventory Export', new Date().toISOString().slice(0, 10)],
      ['Karib Aerospace Ltd'], [],
      ['P/N', 'Description', 'Category', 'Qty', 'Min Qty', 'Location', 'Unit Cost (USD)', 'Shelf Life', 'Status'],
      ...inventory.map(i => [
        i.pn, i.description, i.category, i.qty, i.minQty, i.location,
        i.unitCost, i.shelfLifeDate ?? 'N/A', i.qty < i.minQty ? 'REORDER' : 'OK',
      ]),
    ], 'airsens-inventory');
    toast.push('Inventory exported as CSV.', 'success');
  };

  const exportInvPdf = () => {
    printPdf('Inventory Report', [
      {
        heading: `Stock Summary — ${low.length} items require reorder`,
        html: `<div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${inventory.length}</div><div class="kpi-lbl">Total Parts</div></div>
          <div class="kpi"><div class="kpi-val" style="color:#cc1a2e">${low.length}</div><div class="kpi-lbl">Reorder Required</div></div>
          <div class="kpi"><div class="kpi-val">$${inventory.reduce((s,i)=>s+i.qty*i.unitCost,0).toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="kpi-lbl">Stock Value</div></div>
        </div>`,
      },
      {
        heading: 'Full Inventory',
        html: `<table><thead><tr><th>P/N</th><th>Description</th><th>Qty</th><th>Min</th><th>Location</th><th>Status</th></tr></thead><tbody>
          ${inventory.map(i => `<tr>
            <td>${i.pn}</td><td>${i.description}</td><td>${i.qty}</td><td>${i.minQty}</td><td>${i.location}</td>
            <td><span class="badge badge-${i.qty < i.minQty ? 'red' : 'green'}">${i.qty < i.minQty ? 'Reorder' : 'OK'}</span></td>
          </tr>`).join('')}
        </tbody></table>`,
      },
    ]);
  };
  return (
    <div>
      <PageHeader eyebrow="MRO · Supply Chain" title="Inventory Management"
        sub="Parts, tools and consumables with stock and shelf-life alerts."
        actions={<><button className="btn ghost" onClick={exportInvCsv}><Download size={15} /> CSV</button><button className="btn ghost" onClick={exportInvPdf}><Download size={15} /> PDF</button><button className="btn primary" onClick={() => toast.push('Parts intake form is coming soon. Stock levels currently sync from the seed catalog.')}><Plus size={15} /> Add Part</button></>} />
      {low.length > 0 && (
        <div className="panel panel-pad fade-up" style={{ borderLeft: '3px solid var(--red)', marginBottom: 16 }}>
          <div className="row gap-8 tred eyebrow"><AlertTriangle size={14} />{low.length} items below minimum stock</div>
        </div>
      )}
      <div className="panel fade-up">
        <table className="tbl">
          <thead><tr><th>Part No.</th><th>Description</th><th>Category</th><th>Location</th><th>Qty</th><th>Min</th><th>Unit Cost</th><th>Shelf Life</th><th>Status</th></tr></thead>
          <tbody>
            {inventory.map(i => {
              const lowStock = i.qty < i.minQty;
              const expSoon = i.shelfLifeDate && new Date(i.shelfLifeDate).getTime() - Date.now() < 30 * 864e5;
              return (
                <tr key={i.id}>
                  <td className="num hi">{i.pn}</td><td>{i.description}</td>
                  <td><span className="badge muted">{i.category}</span></td>
                  <td className="num muted">{i.location}</td>
                  <td className={`num ${lowStock ? 'tred' : ''}`} style={{ fontWeight: 600 }}>{i.qty}</td>
                  <td className="num muted">{i.minQty}</td>
                  <td className="num">${i.unitCost.toLocaleString()}</td>
                  <td className={`num ${expSoon ? 'tamber' : 'muted'}`}>{i.shelfLifeDate ?? '—'}</td>
                  <td>{lowStock ? <span className="badge crit">Reorder</span> : <span className="badge ok"><CheckCircle2 size={11} />In Stock</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- LOGBOOK ---------------- */
export const LogbookModule: React.FC = () => {
  const { flightLogs, aircraft } = useStore();
  const toast = useToast();
  const aircraftById = (id: string) => aircraft.find(a => a.id === id);
  const recent = [...flightLogs].slice(0, 40);
  const byDate: Record<string, { hrs: number; payload: number; n: number }> = {};
  flightLogs.forEach(f => {
    byDate[f.date] = byDate[f.date] || { hrs: 0, payload: 0, n: 0 };
    byDate[f.date].hrs += f.blockHours; byDate[f.date].payload += f.payloadKg; byDate[f.date].n += 1;
  });
  const trend = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).slice(-30).map(([date, v]) => ({ date: date.slice(5), hrs: +v.hrs.toFixed(1), lf: +(v.payload / v.n / 18000 * 100).toFixed(0) }));

  const exportLogCsv = () => {
    downloadCsv([
      ['AirSENS Flight Logbook Export', new Date().toISOString().slice(0, 10)],
      ['Karib Aerospace Ltd'], [],
      ['Date', 'Aircraft', 'From', 'To', 'Block Hours', 'Cycles', 'Engine Hours', 'Engine Cycles', 'Payload (kg)', 'Load Factor %', 'Logged By'],
      ...flightLogs.map(f => [
        f.date, aircraftById(f.aircraftId)?.registration ?? f.aircraftId,
        f.from, f.to, f.blockHours, f.cycles,
        f.engineHours ?? f.blockHours, f.engineCycles ?? f.cycles,
        f.payloadKg, `${Math.round((f.loadFactor ?? 0) * 100)}%`, f.loggedBy ?? '—',
      ]),
    ], 'airsens-logbook');
    toast.push(`${flightLogs.length} flight records exported as CSV.`, 'success');
  };

  const exportLogPdf = () => {
    const totalHrs = flightLogs.reduce((s, f) => s + f.blockHours, 0);
    const totalCyc = flightLogs.reduce((s, f) => s + f.cycles, 0);
    printPdf('Flight Logbook', [
      {
        heading: 'Summary',
        html: `<div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${flightLogs.length}</div><div class="kpi-lbl">Total Flights</div></div>
          <div class="kpi"><div class="kpi-val">${totalHrs.toFixed(1)}</div><div class="kpi-lbl">Total Block Hours</div></div>
          <div class="kpi"><div class="kpi-val">${totalCyc}</div><div class="kpi-lbl">Total Cycles</div></div>
          <div class="kpi"><div class="kpi-val">${aircraft.length}</div><div class="kpi-lbl">Aircraft Logged</div></div>
        </div>`,
      },
      {
        heading: `Recent Flights (last ${recent.length})`,
        html: `<table><thead><tr><th>Date</th><th>Aircraft</th><th>Route</th><th>Block Hrs</th><th>Cycles</th><th>Payload (kg)</th><th>Logged By</th></tr></thead><tbody>
          ${recent.map(f => `<tr>
            <td>${f.date}</td>
            <td>${aircraftById(f.aircraftId)?.registration ?? f.aircraftId}</td>
            <td>${f.from} → ${f.to}</td>
            <td>${f.blockHours}</td><td>${f.cycles}</td><td>${f.payloadKg.toLocaleString()}</td>
            <td>${f.loggedBy ?? '—'}</td>
          </tr>`).join('')}
        </tbody></table>`,
      },
    ]);
  };
  return (
    <div>
      <PageHeader eyebrow="CAMO · Operations" title="Logbook & Production"
        sub="Flight logs feeding reliability, fatigue and Amplification Factor models."
        actions={<><button className="btn ghost" onClick={exportLogCsv}><Download size={15} /> CSV</button><button className="btn ghost" onClick={exportLogPdf}><Download size={15} /> PDF</button></>} />
      <div className="panel panel-pad fade-up" style={{ marginBottom: 16, borderLeft: '3px solid var(--cyan)' }}>
        <div className="muted" style={{ fontSize: 12.5 }}>To add a flight, open <span className="hi">Aircraft</span> → select an aircraft → <span className="hi">Log Flight / Hours</span>. Entries roll up here and across the system instantly.</div>
      </div>
      <div className="panel fade-up" style={{ marginBottom: 16 }}>
        <PanelHead title="Flight Hours & Load Trend — 30 days" icon={<BookOpen size={15} className="tcyan" />} />
        <div style={{ padding: '16px 12px 8px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs><linearGradient id="gLog" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cyan)" stopOpacity={.4} /><stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }} interval={4} />
              <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="hrs" stroke="var(--cyan)" strokeWidth={2} fill="url(#gLog)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel fade-up" style={{ animationDelay: '80ms' }}>
        <PanelHead title="Recent Flights" icon={<Calendar size={15} className="tcyan" />} />
        <table className="tbl">
          <thead><tr><th>Date</th><th>Aircraft</th><th>Route</th><th>Block Hrs</th><th>Cycles</th><th>Payload</th><th>Load Factor</th></tr></thead>
          <tbody>
            {recent.map((f, i) => (
              <tr key={i}>
                <td className="num muted">{f.date}</td>
                <td className="num hi">{aircraftById(f.aircraftId)?.registration}</td>
                <td className="num">{f.from} → {f.to}</td>
                <td className="num">{f.blockHours}</td>
                <td className="num">{f.cycles}</td>
                <td className="num muted">{f.payloadKg.toLocaleString()} kg</td>
                <td style={{ width: 130 }}><Bar value={f.loadFactor * 100} color="var(--cyan)" /><span className="num muted" style={{ fontSize: 10.5 }}>{(f.loadFactor * 100).toFixed(0)}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- AMP (Maintenance Program) ---------------- */
export const AmpModule: React.FC = () => {
  const toast = useToast();
  const tasks = [
    { ref: '32-10-01', task: 'MLG detailed inspection', interval: '7,500 FH', rev: 'MPD Rev 18', status: 'current', compliance: 96 },
    { ref: '27-50-04', task: 'Flap track lubrication', interval: '600 FH', rev: 'MPD Rev 18', status: 'current', compliance: 88 },
    { ref: '71-00-02', task: 'Engine borescope', interval: '1,200 FC', rev: 'MPD Rev 17', status: 'superseded', compliance: 100 },
    { ref: '52-30-01', task: 'Cargo door rigging check', interval: '24 MO', rev: 'MPD Rev 18', status: 'current', compliance: 72 },
    { ref: '29-10-03', task: 'Hydraulic filter replace', interval: '3,000 FH', rev: 'MPD Rev 18', status: 'current', compliance: 91 },
    { ref: '21-31-02', task: 'Pressurization test', interval: '12 MO', rev: 'MPD Rev 18', status: 'current', compliance: 84 },
  ];
  return (
    <div>
      <PageHeader eyebrow="CAMO · Engineering" title="Aircraft Maintenance Program"
        sub="OEM Maintenance Planning Document tasks, revisions and compliance."
        actions={<><button className="btn ghost" onClick={() => toast.push('Revision comparison is coming soon.')}><Download size={15} /> Compare Rev</button><button className="btn primary" onClick={() => toast.push('Task assignment from the maintenance program is coming soon. Create a Work Order in the meantime.')}><Plus size={15} /> Assign Task</button></>} />
      <div className="panel fade-up">
        <PanelHead title="MPD Tasks" icon={<ClipboardList size={15} className="tcyan" />} right={<span className="badge info">MPD Rev 18 active</span>} />
        <table className="tbl">
          <thead><tr><th>Task Ref</th><th>Description</th><th>Interval</th><th>Revision</th><th>Fleet Compliance</th><th>Status</th></tr></thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.ref}>
                <td className="num hi">{t.ref}</td><td>{t.task}</td><td className="num">{t.interval}</td>
                <td className="num muted">{t.rev}</td>
                <td style={{ width: 160 }}><Bar value={t.compliance} color={t.compliance > 90 ? 'var(--green)' : t.compliance > 75 ? 'var(--amber)' : 'var(--red)'} /><span className="num muted" style={{ fontSize: 10.5 }}>{t.compliance}%</span></td>
                <td><span className={`badge ${t.status === 'current' ? 'ok' : 'muted'}`} style={{ textTransform: 'capitalize' }}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- TOOLS & MANUALS ---------------- */
export const ToolsModule: React.FC = () => {
  const toast = useToast();
  const tools = [
    { id: 'TL-001', name: 'Torque wrench 3/4"', cal: '2026-08-12', status: 'airworthy' as const, type: 'Tool' },
    { id: 'TL-002', name: 'Borescope kit XL', cal: '2026-06-20', status: 'due-soon' as const, type: 'Tool' },
    { id: 'TL-003', name: 'Hydraulic test rig', cal: '2026-05-28', status: 'overdue' as const, type: 'GSE' },
    { id: 'MN-101', name: 'AMM Rev 42 — B737', cal: '—', status: 'airworthy' as const, type: 'Manual' },
    { id: 'MN-102', name: 'IPC Rev 38 — A320', cal: '—', status: 'airworthy' as const, type: 'Manual' },
    { id: 'TL-004', name: 'Jacking set 40T', cal: '2026-07-01', status: 'due-soon' as const, type: 'GSE' },
  ];
  return (
    <div>
      <PageHeader eyebrow="MRO · Resources" title="Tools & Manuals"
        sub="Calibration tracking, manuals and document control linked to job templates."
        actions={<button className="btn primary" onClick={() => toast.push('Adding tools & manuals is coming soon.')}><Plus size={15} /> Add Resource</button>} />
      <div className="panel fade-up">
        <table className="tbl">
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Calibration Due</th><th>Status</th></tr></thead>
          <tbody>
            {tools.map(t => (
              <tr key={t.id}>
                <td className="num hi">{t.id}</td><td>{t.name}</td>
                <td><span className="badge muted"><FileText size={11} />{t.type}</span></td>
                <td className="num muted">{t.cal}</td>
                <td><StatusBadge status={t.status} label={t.status === 'airworthy' ? 'Serviceable' : t.status === 'due-soon' ? 'Cal Due' : 'Out of Cal'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- SALES & INVOICE ---------------- */
export const SalesModule: React.FC = () => {
  const toast = useToast();
  const invoices = [
    { no: 'INV-26-0412', client: 'IslandHopper', amount: 48250, cur: 'USD', status: 'paid', date: '2026-05-20' },
    { no: 'INV-26-0413', client: 'Tropic Wings', amount: 12900, cur: 'EUR', status: 'sent', date: '2026-05-24' },
    { no: 'QUO-26-0088', client: 'Leeward Charter', amount: 76400, cur: 'USD', status: 'quote', date: '2026-05-28' },
    { no: 'INV-26-0414', client: 'Caribbean Cargo', amount: 33100, cur: 'USD', status: 'overdue', date: '2026-04-30' },
    { no: 'INV-26-0415', client: 'Antilles Gov', amount: 154000, cur: 'USD', status: 'paid', date: '2026-05-12' },
  ];
  const total = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  return (
    <div>
      <PageHeader eyebrow="MRO · Commercial" title="Sales & Invoice"
        sub="Quotations, part sales and billing with multi-currency support."
        actions={<button className="btn primary" onClick={() => toast.push('Quotation builder is coming soon.')}><Plus size={15} /> New Quotation</button>} />
      <div className="grid kpi-grid" style={{ marginBottom: 16 }}>
        <KpiCard label="Revenue (Paid)" value={`$${(total / 1000).toFixed(1)}k`} sub="This period" accent="var(--green)" icon={<Receipt size={18} />} />
        <KpiCard label="Outstanding" value={`$${(outstanding / 1000).toFixed(1)}k`} sub="Awaiting payment" accent="var(--amber)" icon={<Receipt size={18} />} delay={60} />
        <KpiCard label="Open Quotes" value={invoices.filter(i => i.status === 'quote').length} sub="In pipeline" accent="var(--cyan)" icon={<FileText size={18} />} delay={120} />
      </div>
      <div className="panel fade-up">
        <table className="tbl">
          <thead><tr><th>Document</th><th>Client</th><th>Date</th><th>Amount</th><th>Currency</th><th>Status</th></tr></thead>
          <tbody>
            {invoices.map(i => (
              <tr key={i.no}>
                <td className="num hi">{i.no}</td><td>{i.client}</td><td className="num muted">{i.date}</td>
                <td className="num" style={{ fontWeight: 600 }}>{i.amount.toLocaleString()}</td>
                <td><span className="badge muted">{i.cur}</span></td>
                <td><span className={`badge ${i.status === 'paid' ? 'ok' : i.status === 'overdue' ? 'crit' : i.status === 'quote' ? 'info' : 'warn'}`} style={{ textTransform: 'capitalize' }}>{i.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
