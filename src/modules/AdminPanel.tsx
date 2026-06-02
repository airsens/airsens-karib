import React, { useState } from 'react';
import {
  ShieldCheck, UserPlus, X, Check, Users, ScrollText, Building2, Trash2, RotateCcw,
} from 'lucide-react';
import { PageHeader, PanelHead, KpiCard } from '../components/ui';
import { useStore } from '../context/store';
import { allModules, organizations } from '../data/seed';
import type { User, Permission, Role } from '../data/types';

const PERMS: Permission[] = ['view', 'read', 'write', 'edit'];
const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Command Deck', aircraft: 'Aircraft', components: 'Components',
  'fleet-planning': 'Fleet Planning', logbook: 'Logbook', amp: 'Maint. Program',
  adsb: 'AD / SB', mel: 'MEL', reliability: 'Reliability', configuration: 'Configuration',
  'work-orders': 'Work Orders', inventory: 'Inventory', 'tools-manuals': 'Tools & Manuals',
  sales: 'Sales', amplification: 'Amplification', structural: 'Structural', ageing: 'Ageing',
};

export const AdminPanel: React.FC = () => {
  const { users, currentUser, addUser, updateUser, removeUser, audit, resetData } = useStore();
  const [tab, setTab] = useState<'users' | 'audit' | 'org'>('users');
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  const engineers = users.filter(u => u.role === 'engineer' || u.role === 'viewer');
  const admins = users.filter(u => u.role === 'superadmin' || u.role === 'org-admin');

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Admin Control Panel"
        sub="Manage engineers, roles and per-module access for your organization."
        actions={<button className="btn primary" onClick={() => setCreating(true)}><UserPlus size={15} /> Add Engineer</button>} />

      <div className="grid kpi-grid" style={{ marginBottom: 18 }}>
        <KpiCard label="Total Users" value={users.length} sub={`${admins.length} admins`} icon={<Users size={18} />} />
        <KpiCard label="Engineers" value={users.filter(u => u.role === 'engineer').length} sub="Licensed staff" accent="var(--green)" icon={<ShieldCheck size={18} />} delay={60} />
        <KpiCard label="Viewers" value={users.filter(u => u.role === 'viewer').length} sub="Read-only" accent="var(--blue)" icon={<Users size={18} />} delay={120} />
        <KpiCard label="Audit Events" value={audit.length} sub="This session" accent="var(--amber)" icon={<ScrollText size={18} />} delay={180} />
      </div>

      <div className="row gap-8" style={{ marginBottom: 16 }}>
        {([['users', 'Users & Access'], ['audit', 'Audit Log'], ['org', 'Organization']] as const).map(([k, l]) => (
          <button key={k} className={`btn sm ${tab === k ? 'primary' : 'ghost'}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="panel fade-up">
          <PanelHead title="Users" icon={<Users size={15} className="tcyan" />} right={<span className="badge muted">{users.length}</span>} />
          <table className="tbl">
            <thead><tr><th>Name</th><th>Title</th><th>Email</th><th>Role</th><th>License</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} onClick={() => setEditing(u)}>
                  <td className="hi" style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="muted">{u.title}</td>
                  <td className="num muted" style={{ fontSize: 12 }}>{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="num muted">{u.licenseNo ?? '—'}</td>
                  <td>{u.active ? <span className="badge ok"><span className="dot" />Active</span> : <span className="badge muted">Disabled</span>}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {u.id !== currentUser?.id && (u.role === 'engineer' || u.role === 'viewer') && (
                      <button className="btn ghost sm" style={{ padding: 6 }} onClick={() => { if (confirm(`Remove ${u.name}?`)) removeUser(u.id); }}><Trash2 size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className="panel fade-up">
          <PanelHead title="Audit Trail" icon={<ScrollText size={15} className="tamber" />}
            right={<button className="btn ghost sm" onClick={() => { if (confirm('Reset all demo data to seed state? This clears logged flights, defects and users you added.')) resetData(); }}><RotateCcw size={14} /> Reset demo data</button>} />
          {audit.length === 0
            ? <div className="muted" style={{ padding: 30, textAlign: 'center', fontStyle: 'italic' }}>No actions recorded yet this session. Log a flight or raise a defect to see entries here.</div>
            : <table className="tbl">
                <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Detail</th></tr></thead>
                <tbody>
                  {audit.map(a => (
                    <tr key={a.id}>
                      <td className="num muted" style={{ fontSize: 11.5 }}>{new Date(a.ts).toLocaleString()}</td>
                      <td className="hi">{a.userName}</td>
                      <td><span className="badge info">{a.action}</span></td>
                      <td className="muted">{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      )}

      {tab === 'org' && (
        <div className="panel fade-up" style={{ maxWidth: 600 }}>
          <PanelHead title="Organization" icon={<Building2 size={15} className="tcyan" />} />
          <div style={{ padding: 22 }}>
            {organizations.map(o => (
              <div key={o.id} className="col gap-16">
                <Field label="Organization Name" value={o.name} />
                <Field label="ICAO / Registration Prefix" value={o.icaoPrefix} />
                <Field label="Approval Reference" value={o.approvalRef} />
                <Field label="Users in Organization" value={`${users.length}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {(editing || creating) && (
        <UserDrawer
          user={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(data) => {
            if (editing) updateUser(editing.id, data);
            else addUser({ ...data, orgId: 'ORG1', active: true } as Omit<User, 'id' | 'createdAt'>);
            setEditing(null); setCreating(false);
          }}
        />
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
    <div className="hi num" style={{ fontSize: 14 }}>{value}</div>
  </div>
);

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const map: Record<Role, string> = { superadmin: 'aog', 'org-admin': 'warn', engineer: 'ok', viewer: 'info' };
  const lbl: Record<Role, string> = { superadmin: 'Super Admin', 'org-admin': 'Org Admin', engineer: 'Engineer', viewer: 'Viewer' };
  return <span className={`badge ${map[role]}`}>{lbl[role]}</span>;
};

// ---- create / edit drawer with permission matrix ----
const UserDrawer: React.FC<{ user: User | null; onClose: () => void; onSave: (u: any) => void }> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user?.name ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState(user?.password ?? 'engineer');
  const [role, setRole] = useState<Role>(user?.role ?? 'engineer');
  const [licenseNo, setLicenseNo] = useState(user?.licenseNo ?? '');
  const [active, setActive] = useState(user?.active ?? true);
  const [perms, setPerms] = useState<Record<string, Permission[]>>(
    user?.permissions ?? Object.fromEntries(allModules.map(m => [m, ['view', 'read'] as Permission[]]))
  );
  const isAdmin = role === 'superadmin' || role === 'org-admin';

  const toggle = (mod: string, p: Permission) => setPerms(prev => {
    const cur = prev[mod] ?? [];
    const has = cur.includes(p);
    let next = has ? cur.filter(x => x !== p) : [...cur, p];
    // logical dependency: write/edit imply read+view; view is base
    if (!has) { if (p === 'edit' || p === 'write') next = Array.from(new Set([...next, 'view', 'read'])); if (p === 'read') next = Array.from(new Set([...next, 'view'])); }
    return { ...prev, [mod]: next };
  });

  const save = () => {
    if (!name || !email) { alert('Name and email are required.'); return; }
    onSave({ name, title, email, password, role, licenseNo: licenseNo || undefined, active, permissions: perms });
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(620px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 41, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.5)' }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, background: 'var(--bg-panel)', zIndex: 2 }}>
          <div className="row gap-12">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}><ShieldCheck size={20} className="tcyan" /></div>
            <div><div className="hi" style={{ fontSize: 17, fontWeight: 700 }}>{user ? 'Edit User' : 'Add Engineer'}</div><div className="muted" style={{ fontSize: 12 }}>{user ? user.email : 'Create a new team member'}</div></div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>

        <div style={{ padding: 22 }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="Full Name" value={name} onChange={setName} placeholder="e.g. John Adeyemi" />
            <Input label="Title" value={title} onChange={setTitle} placeholder="B1 Licensed Engineer" />
            <Input label="Email" value={email} onChange={setEmail} placeholder="john@karibaerospace.com" />
            <Input label="Password" value={password} onChange={setPassword} />
            <Input label="License No. (optional)" value={licenseNo} onChange={setLicenseNo} placeholder="EASA-66-B1-…" />
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Role</div>
              <select className="select" value={role} onChange={e => setRole(e.target.value as Role)}>
                <option value="engineer">Engineer</option>
                <option value="viewer">Viewer</option>
                <option value="org-admin">Org Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          <label className="row gap-8" style={{ marginTop: 16, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ accentColor: 'var(--cyan)', width: 16, height: 16 }} />
            Account active (can sign in)
          </label>

          <div style={{ marginTop: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Module Access</div>
            {isAdmin
              ? <div className="panel panel-pad" style={{ marginTop: 10, borderLeft: '3px solid var(--amber)' }}>
                  <div className="row gap-8" style={{ fontSize: 13, color: 'var(--text-hi)' }}><ShieldCheck size={15} className="tamber" /> Admins have full access to every module, including this panel.</div>
                </div>
              : <div className="panel" style={{ marginTop: 10, overflow: 'hidden' }}>
                  <table className="tbl">
                    <thead><tr><th>Module</th>{PERMS.map(p => <th key={p} style={{ textAlign: 'center', textTransform: 'capitalize' }}>{p}</th>)}</tr></thead>
                    <tbody>
                      {allModules.map(mod => (
                        <tr key={mod} style={{ cursor: 'default' }}>
                          <td className="hi">{MODULE_LABELS[mod] ?? mod}</td>
                          {PERMS.map(p => {
                            const on = perms[mod]?.includes(p);
                            return (
                              <td key={p} style={{ textAlign: 'center' }}>
                                <button onClick={() => toggle(mod, p)} style={{
                                  width: 26, height: 26, borderRadius: 6, display: 'grid', placeItems: 'center',
                                  background: on ? 'var(--cyan)' : 'var(--bg-deep)', border: `1px solid ${on ? 'var(--cyan)' : 'var(--line-bright)'}`,
                                  color: on ? '#04181a' : 'transparent', transition: 'all .12s',
                                }}>
                                  <Check size={15} />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
          </div>

          <div className="row gap-8" style={{ marginTop: 24 }}>
            <button className="btn primary" style={{ flex: 1, justifyContent: 'center' }} onClick={save}><Check size={16} /> {user ? 'Save Changes' : 'Create User'}</button>
            <button className="btn ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div>
    <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
    <input className="input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);
