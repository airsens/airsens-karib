import React, { useState } from 'react';
import { Wrench, Plus, Clock, User, MapPin, X, Check, Download } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { useStore } from '../context/store';
import { useToast } from '../components/Toast';
import { downloadCsv, printPdf } from '../lib/exports';
import type { WorkOrder } from '../data/types';

const COLS: { key: WorkOrder['state']; label: string; color: string }[] = [
  { key: 'backlog', label: 'Backlog', color: 'var(--text-faint)' },
  { key: 'planned', label: 'Planned', color: 'var(--blue)' },
  { key: 'in-progress', label: 'In Progress', color: 'var(--cyan)' },
  { key: 'qa', label: 'QA / Sign-off', color: 'var(--amber)' },
  { key: 'closed', label: 'Closed', color: 'var(--green)' },
];

export const WorkOrdersModule: React.FC = () => {
  const { workOrders, aircraft, moveWorkOrder, can } = useStore();
  const aircraftById = (id: string) => aircraft.find(a => a.id === id);
  const [drag, setDrag] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const canWrite = can('work-orders', 'write');

  const exportWoCsv = () => {
    const open = workOrders.filter(w => w.state !== 'closed');
    const rows: (string | number)[][] = [
      ['AirSENS Work Orders Export', new Date().toISOString().slice(0, 10)],
      ['Karib Aerospace Ltd'],
      [],
      ['WO Number', 'Title', 'Aircraft', 'Type', 'Priority', 'State', 'Assignee', 'Zone', 'Est. Hrs', 'Actual Hrs', 'Tasks Done', 'Tasks Total', 'Due Date'],
      ...open.map(w => [
        w.wo, w.title, aircraftById(w.aircraftId)?.registration ?? w.aircraftId,
        w.type, w.priority, w.state, w.assignee, w.zone,
        w.manHoursEst, w.manHoursActual, w.tasksDone, w.tasks, w.dueDate,
      ]),
    ];
    downloadCsv(rows, 'airsens-work-orders');
    toast.push(`${open.length} open work orders exported as CSV.`, 'success');
  };

  const exportWoPdf = () => {
    const open = workOrders.filter(w => w.state !== 'closed');
    printPdf('Work Orders', [{
      heading: `Open Work Orders (${open.length})`,
      html: `<table><thead><tr>
        <th>WO No.</th><th>Title</th><th>Aircraft</th><th>Priority</th><th>State</th><th>Assignee</th><th>Est. Hrs</th><th>Due</th>
      </tr></thead><tbody>
        ${open.map(w => `<tr>
          <td>${w.wo}</td><td>${w.title}</td>
          <td>${aircraftById(w.aircraftId)?.registration ?? w.aircraftId}</td>
          <td><span class="badge badge-${w.priority === 'aog' || w.priority === 'high' ? 'red' : w.priority === 'med' ? 'amber' : 'blue'}">${w.priority}</span></td>
          <td>${w.state}</td><td>${w.assignee}</td><td>${w.manHoursEst}h</td><td>${w.dueDate}</td>
        </tr>`).join('')}
      </tbody></table>`,
    }]);
  };

  return (
    <div>
      <PageHeader eyebrow="MRO · Execution" title="Work Orders"
        sub="Drag jobs across the board to update execution state."
        actions={<>
          <button className="btn ghost" onClick={exportWoCsv}><Download size={15} /> CSV</button>
          <button className="btn ghost" onClick={exportWoPdf}><Download size={15} /> PDF</button>
          <button className="btn primary" disabled={!canWrite} title={canWrite ? '' : 'You lack write access to Work Orders'} onClick={() => setCreating(true)}><Plus size={15} /> New Work Order</button>
        </>} />

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS.length}, 1fr)`, gap: 14, alignItems: 'start' }}>
        {COLS.map(col => {
          const items = workOrders.filter(w => w.state === col.key);
          return (
            <div key={col.key}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (drag && canWrite) moveWorkOrder(drag, col.key); setDrag(null); }}
              style={{ background: 'var(--bg-deep)', border: `1px solid ${drag ? 'var(--line-bright)' : 'var(--line)'}`, borderRadius: 'var(--radius)', minHeight: 200, transition: 'border-color .12s' }}>
              <div className="row between" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
                <span className="row gap-8" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: col.color }} />{col.label}
                </span>
                <span className="badge muted" style={{ fontSize: 9 }}>{items.length}</span>
              </div>
              <div className="col gap-8" style={{ padding: 10 }}>
                {items.map(w => {
                  const ac = aircraftById(w.aircraftId);
                  const pct = w.tasks ? Math.round((w.tasksDone / w.tasks) * 100) : 0;
                  return (
                    <div key={w.id} draggable={canWrite}
                      onDragStart={() => setDrag(w.id)}
                      className="panel" style={{ padding: 12, cursor: canWrite ? 'grab' : 'default', background: 'var(--bg-panel-2)' }}>
                      <div className="row between" style={{ marginBottom: 8 }}>
                        <span className="num tcyan" style={{ fontSize: 11.5, fontWeight: 600 }}>{w.wo}</span>
                        <span className={`badge ${w.priority === 'aog' ? 'aog' : w.priority === 'high' ? 'crit' : w.priority === 'med' ? 'warn' : 'muted'}`} style={{ fontSize: 8.5 }}>{w.priority}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-hi)', fontWeight: 500, marginBottom: 8, lineHeight: 1.35 }}>{w.title}</div>
                      <div className="num muted" style={{ fontSize: 11, marginBottom: 10 }}>{ac?.registration} · {ac?.model}</div>
                      <div style={{ height: 5, background: 'var(--bg-deep)', borderRadius: 100, marginBottom: 8 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: col.color, borderRadius: 100 }} />
                      </div>
                      <div className="row between muted" style={{ fontSize: 10.5 }}>
                        <span className="row gap-8" style={{ gap: 5 }}><User size={11} />{w.assignee}</span>
                        <span className="row gap-8" style={{ gap: 5 }}><MapPin size={11} />{w.zone}</span>
                      </div>
                      <div className="row between muted" style={{ fontSize: 10.5, marginTop: 5 }}>
                        <span className="row gap-8" style={{ gap: 5 }}><Clock size={11} />{w.manHoursActual}/{w.manHoursEst}h</span>
                        <span>{w.tasksDone}/{w.tasks} tasks</span>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="muted" style={{ fontSize: 11, textAlign: 'center', padding: '14px 0', fontStyle: 'italic' }}>Empty</div>}
              </div>
            </div>
          );
        })}
      </div>

      {creating && <NewWorkOrderDrawer onClose={() => setCreating(false)} />}
    </div>
  );
};

const NewWorkOrderDrawer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { aircraft, createWorkOrder } = useStore();
  const toast = useToast();
  const [aircraftId, setAircraftId] = useState(() => aircraft[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WorkOrder['type']>('scheduled');
  const [priority, setPriority] = useState<WorkOrder['priority']>('med');
  const [manHoursEst, setManHoursEst] = useState('8');
  const [assignee, setAssignee] = useState('');
  const [zone, setZone] = useState('');
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10); });

  const save = () => {
    if (!title.trim()) { alert('Please enter a work order title.'); return; }
    createWorkOrder({ aircraftId, title: title.trim(), type, priority, manHoursEst: parseFloat(manHoursEst) || 0, assignee, zone, dueDate });
    toast.push('Work order created in Backlog.', 'success');
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, backdropFilter: 'blur(3px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(480px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 51, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.6)' }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div className="row gap-12">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}><Wrench size={20} className="tcyan" /></div>
            <div><div className="hi" style={{ fontSize: 17, fontWeight: 700 }}>New Work Order</div><div className="muted" style={{ fontSize: 12.5 }}>Opens in Backlog</div></div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>
        <div style={{ padding: 22 }}>
          <Field label="Aircraft">
            <select className="select" value={aircraftId} onChange={e => setAircraftId(e.target.value)}>
              {aircraft.map(a => <option key={a.id} value={a.id}>{a.registration} — {a.model} {a.variant}</option>)}
            </select>
          </Field>
          <Field label="Title"><input className="input" placeholder="e.g. Replace No.2 hydraulic pump" value={title} onChange={e => setTitle(e.target.value)} /></Field>
          <div className="grid-2col" style={{ gap: 12 }}>
            <Field label="Type">
              <select className="select" value={type} onChange={e => setType(e.target.value as WorkOrder['type'])}>
                <option value="scheduled">Scheduled</option><option value="unscheduled">Unscheduled</option>
                <option value="ad-sb">AD / SB</option><option value="mod">Modification</option>
              </select>
            </Field>
            <Field label="Priority">
              <select className="select" value={priority} onChange={e => setPriority(e.target.value as WorkOrder['priority'])}>
                <option value="low">Low</option><option value="med">Medium</option>
                <option value="high">High</option><option value="aog">AOG</option>
              </select>
            </Field>
            <Field label="Est. Man-Hours"><input className="input num" type="number" value={manHoursEst} onChange={e => setManHoursEst(e.target.value)} /></Field>
            <Field label="Due Date"><input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></Field>
            <Field label="Assignee"><input className="input" placeholder="Engineer name" value={assignee} onChange={e => setAssignee(e.target.value)} /></Field>
            <Field label="Zone"><input className="input" placeholder="e.g. ENG-2" value={zone} onChange={e => setZone(e.target.value)} /></Field>
          </div>
          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: 12 }} onClick={save}><Check size={16} /> Create Work Order</button>
        </div>
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
