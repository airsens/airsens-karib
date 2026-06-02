import React, { useState } from 'react';
import {
  Radar, Building2, Users, Activity, ShieldCheck, Plus, X, Check,
  Mail, Globe, Plane, AlertTriangle, BarChart3, Settings, Trash2,
  Eye, Lock, Unlock, Send, ChevronRight,
} from 'lucide-react';
import { PageHeader, KpiCard, PanelHead } from '../components/ui';
import { useStore } from '../context/store';
import { useToast } from '../components/Toast';
import type { Organization, User } from '../data/types';

const PLAN_COLORS = { starter: 'var(--blue)', professional: 'var(--cyan)', enterprise: 'var(--amber)' };
const STATUS_COLORS = { active: 'var(--green)', suspended: 'var(--red)', pending: 'var(--amber)' };

export const ControlTower: React.FC = () => {
  const { organizations, users, audit, addOrganization, updateOrganization, removeOrganization, resetData } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState<'orgs' | 'users' | 'analytics' | 'audit'>('orgs');
  const [orgDrawer, setOrgDrawer] = useState<Organization | null | 'new'>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const totalUsers = users.length;
  const activeOrgs = organizations.filter(o => o.status === 'active').length;
  const pendingOrgs = organizations.filter(o => o.status === 'pending').length;
  const allUsers = users; // superadmin sees all via scoped store

  // users grouped by org
  const orgUsers = (orgId: string) => allUsers.filter(u => u.orgId === orgId);
  const orgAdmins = (orgId: string) => orgUsers(orgId).filter(u => u.role === 'org-admin' || u.role === 'superadmin');

  return (
    <div>
      <PageHeader
        eyebrow="AirSENS Platform"
        title="Control Tower"
        sub="Platform-wide organisation management, user oversight and analytics. Visible only to Rilwan & Promise."
        actions={tab === 'orgs' ? <button className="btn primary" onClick={() => setOrgDrawer('new')}><Plus size={15} /> Add Organisation</button> : undefined}
      />

      {/* Platform KPIs */}
      <div className="grid kpi-grid" style={{ marginBottom: 18 }}>
        <KpiCard label="Organisations" value={organizations.length} sub={`${activeOrgs} active · ${pendingOrgs} pending`} icon={<Building2 size={18} />} accent="var(--cyan)" />
        <KpiCard label="Total Users" value={totalUsers} sub="Across all orgs" icon={<Users size={18} />} accent="var(--violet)" delay={60} />
        <KpiCard label="Active Orgs" value={activeOrgs} sub="Fully onboarded" icon={<ShieldCheck size={18} />} accent="var(--green)" delay={120} />
        <KpiCard label="Audit Events" value={audit.length} sub="This session" icon={<Activity size={18} />} accent="var(--amber)" delay={180} />
      </div>

      {/* Tab bar */}
      <div className="row gap-8" style={{ marginBottom: 16 }}>
        {([['orgs', 'Organisations', Building2], ['users', 'All Users', Users], ['analytics', 'Analytics', BarChart3], ['audit', 'Audit Trail', Activity]] as const).map(([k, l, Icon]) => (
          <button key={k} className={`btn sm ${tab === k ? 'primary' : 'ghost'}`} onClick={() => setTab(k)}>
            <Icon size={14} />{l}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn ghost sm" style={{ color: 'var(--red)', borderColor: 'rgba(255,77,94,.3)' }}
            onClick={() => { if (confirm('Reset ALL demo data? This cannot be undone.')) { resetData(); toast.push('Demo data reset.', 'success'); } }}>
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* ORGANISATIONS TAB */}
      {tab === 'orgs' && (
        <div className="col gap-14 fade-up">
          {organizations.map(org => {
            const members = orgUsers(org.id);
            const admins = orgAdmins(org.id);
            const adminUsed = admins.length;
            const usersUsed = members.length;
            const expanded = selectedOrg === org.id;
            return (
              <div key={org.id} className="panel">
                <div className="row between" style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setSelectedOrg(expanded ? null : org.id)}>
                  <div className="row gap-16">
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center', border: '1px solid var(--line-bright)' }}>
                      <Building2 size={20} style={{ color: PLAN_COLORS[org.plan] }} />
                    </div>
                    <div>
                      <div className="row gap-10">
                        <span className="hi" style={{ fontWeight: 700, fontSize: 15 }}>{org.name}</span>
                        <span className="badge" style={{ color: PLAN_COLORS[org.plan], border: `1px solid ${PLAN_COLORS[org.plan]}`, background: 'transparent', fontSize: 9 }}>{org.plan}</span>
                        <span className="badge" style={{ color: STATUS_COLORS[org.status], border: `1px solid ${STATUS_COLORS[org.status]}`, background: 'transparent', fontSize: 9 }}>{org.status}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                        {org.icaoPrefix} · {org.country} · {org.contactEmail}
                      </div>
                    </div>
                  </div>
                  <div className="row gap-24">
                    <div style={{ textAlign: 'center' }}>
                      <div className="num hi" style={{ fontSize: 18, fontWeight: 700 }}>{usersUsed}/{org.maxUsers}</div>
                      <div className="eyebrow" style={{ fontSize: 8 }}>Users</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="num hi" style={{ fontSize: 18, fontWeight: 700 }}>{adminUsed}/{org.maxAdmins}</div>
                      <div className="eyebrow" style={{ fontSize: 8 }}>Admins</div>
                    </div>
                    <ChevronRight size={16} className="muted" style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                  </div>
                </div>

                {expanded && (
                  <div style={{ borderTop: '1px solid var(--line)', padding: '18px 20px' }} className="fade-up">
                    <div className="grid" className="grid-2col" style={{ gap: 16, marginBottom: 16 }} data-x="ct1">
                      <QuotaBar label="Admins" used={adminUsed} max={org.maxAdmins} color="var(--amber)" />
                      <QuotaBar label="Users" used={usersUsed} max={org.maxUsers} color="var(--cyan)" />
                    </div>

                    {/* Users in this org */}
                    {members.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div className="eyebrow" style={{ marginBottom: 10 }}>Members</div>
                        <div className="col gap-6">
                          {members.map(u => (
                            <div key={u.id} className="row between panel panel-pad" style={{ padding: '9px 14px' }}>
                              <div className="row gap-10">
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--violet),var(--blue))', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                                  {u.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                  <div className="hi" style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                                  <div className="muted" style={{ fontSize: 11 }}>{u.title} · {u.email}</div>
                                </div>
                              </div>
                              <RolePill role={u.role} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="row gap-8 wrap">
                      <button className="btn sm ghost" onClick={() => setOrgDrawer(org)}>
                        <Settings size={14} /> Edit Quotas
                      </button>
                      {org.status === 'active'
                        ? <button className="btn sm ghost" style={{ color: 'var(--amber)' }} onClick={() => { updateOrganization(org.id, { status: 'suspended' }); toast.push(`${org.name} suspended.`); }}>
                            <Lock size={14} /> Suspend
                          </button>
                        : <button className="btn sm ghost" style={{ color: 'var(--green)' }} onClick={() => { updateOrganization(org.id, { status: 'active', activatedAt: new Date().toISOString().slice(0, 10) }); toast.push(`${org.name} activated.`, 'success'); }}>
                            <Unlock size={14} /> Activate
                          </button>}
                      <button className="btn sm ghost" onClick={() => {
                        const subject = encodeURIComponent(`Welcome to AirSENS — ${org.name}`);
                        const body = encodeURIComponent(`Dear ${org.name} team,\n\nYour AirSENS account is ready.\n\nLogin URL: https://airsens-karib-l8n2.vercel.app\nOrganisation: ${org.name}\n\nYour admin will send you your credentials.\n\nBest regards,\nRilwan Olowu\nKarib Aerospace · AirSENS`);
                        window.location.href = `mailto:${org.contactEmail}?subject=${subject}&body=${body}`;
                        updateOrganization(org.id, { inviteSentAt: new Date().toISOString().slice(0, 10) });
                        toast.push(`Invite email opened for ${org.name}.`, 'success');
                      }}>
                        <Send size={14} /> Send Invite
                      </button>
                      {org.id !== 'ORG1' && (
                        <button className="btn sm ghost" style={{ color: 'var(--red)', marginLeft: 'auto' }}
                          onClick={() => { if (confirm(`Remove ${org.name}? This cannot be undone.`)) { removeOrganization(org.id); toast.push(`${org.name} removed.`); } }}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    {org.notes && (
                      <div className="muted" style={{ marginTop: 12, fontSize: 12, fontStyle: 'italic', padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 6, borderLeft: '2px solid var(--line-bright)' }}>
                        📝 {org.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ALL USERS TAB */}
      {tab === 'users' && (
        <div className="panel fade-up">
          <PanelHead title="All Users — Platform Wide" icon={<Users size={15} className="tcyan" />}
            right={<span className="badge muted">{allUsers.length} total</span>} />
          <table className="tbl">
            <thead><tr><th>Name</th><th>Title</th><th>Organisation</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id}>
                  <td className="hi" style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="muted">{u.title}</td>
                  <td><span className="badge info" style={{ fontSize: 9 }}>{organizations.find(o => o.id === u.orgId)?.name ?? u.orgId}</span></td>
                  <td><RolePill role={u.role} /></td>
                  <td className="num muted" style={{ fontSize: 11.5 }}>{u.email}</td>
                  <td>{u.active ? <span className="badge ok"><span className="dot" />Active</span> : <span className="badge muted">Disabled</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && (
        <div className="col gap-14 fade-up">
          <div className="grid" className="grid-2col" style={{ gap: 14 }}>
            <div className="panel panel-pad">
              <PanelHead title="Organisations by Plan" icon={<BarChart3 size={15} className="tcyan" />} />
              <div style={{ padding: 16 }}>
                {(['starter', 'professional', 'enterprise'] as const).map(plan => {
                  const count = organizations.filter(o => o.plan === plan).length;
                  const pct = organizations.length ? (count / organizations.length) * 100 : 0;
                  return (
                    <div key={plan} style={{ marginBottom: 14 }}>
                      <div className="row between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                        <span className="hi" style={{ textTransform: 'capitalize' }}>{plan}</span>
                        <span className="num muted">{count} org{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--bg-deep)', borderRadius: 100 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: PLAN_COLORS[plan], borderRadius: 100, transition: 'width .6s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="panel panel-pad">
              <PanelHead title="Users by Role" icon={<Users size={15} className="tcyan" />} />
              <div style={{ padding: 16 }}>
                {(['superadmin', 'org-admin', 'engineer', 'viewer'] as const).map(role => {
                  const count = allUsers.filter(u => u.role === role).length;
                  const pct = allUsers.length ? (count / allUsers.length) * 100 : 0;
                  const color = role === 'superadmin' ? 'var(--red)' : role === 'org-admin' ? 'var(--amber)' : role === 'engineer' ? 'var(--cyan)' : 'var(--blue)';
                  return (
                    <div key={role} style={{ marginBottom: 14 }}>
                      <div className="row between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                        <span className="hi" style={{ textTransform: 'capitalize' }}>{role.replace('-', ' ')}</span>
                        <span className="num muted">{count} user{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--bg-deep)', borderRadius: 100 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width .6s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="panel">
            <PanelHead title="Organisation Capacity" icon={<Globe size={15} className="tcyan" />} />
            <table className="tbl">
              <thead><tr><th>Organisation</th><th>Plan</th><th>Users Used</th><th>Admins Used</th><th>Aircraft Limit</th><th>Status</th></tr></thead>
              <tbody>
                {organizations.map(org => (
                  <tr key={org.id}>
                    <td className="hi" style={{ fontWeight: 600 }}>{org.name}</td>
                    <td><span className="badge" style={{ color: PLAN_COLORS[org.plan], borderColor: PLAN_COLORS[org.plan], background: 'transparent', fontSize: 9, textTransform: 'capitalize' }}>{org.plan}</span></td>
                    <td className="num">{orgUsers(org.id).length} / {org.maxUsers}</td>
                    <td className="num">{orgAdmins(org.id).length} / {org.maxAdmins}</td>
                    <td className="num">{org.maxAircraft}</td>
                    <td><span className="badge" style={{ color: STATUS_COLORS[org.status], borderColor: STATUS_COLORS[org.status], background: 'transparent', fontSize: 9, textTransform: 'capitalize' }}>{org.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL TAB */}
      {tab === 'audit' && (
        <div className="panel fade-up">
          <PanelHead title="Platform Audit Trail" icon={<Activity size={15} className="tamber" />}
            right={<span className="badge muted">{audit.length} events</span>} />
          {audit.length === 0
            ? <div className="muted" style={{ padding: 40, textAlign: 'center', fontStyle: 'italic' }}>No audit events yet this session.</div>
            : <table className="tbl">
                <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Detail</th></tr></thead>
                <tbody>
                  {audit.map(a => (
                    <tr key={a.id}>
                      <td className="num muted" style={{ fontSize: 11 }}>{new Date(a.ts).toLocaleString()}</td>
                      <td className="hi">{a.userName}</td>
                      <td><span className="badge info" style={{ fontSize: 9 }}>{a.action}</span></td>
                      <td className="muted" style={{ fontSize: 12 }}>{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      )}

      {/* ADD / EDIT ORG DRAWER */}
      {orgDrawer && (
        <OrgDrawer
          org={orgDrawer === 'new' ? null : orgDrawer}
          onClose={() => setOrgDrawer(null)}
          onSave={(data) => {
            if (orgDrawer === 'new') addOrganization(data as Omit<Organization, 'id' | 'createdAt'>);
            else updateOrganization((orgDrawer as Organization).id, data);
            setOrgDrawer(null);
            toast.push(orgDrawer === 'new' ? 'Organisation created.' : 'Organisation updated.', 'success');
          }}
        />
      )}
    </div>
  );
};

// ---- Quota bar ----
const QuotaBar: React.FC<{ label: string; used: number; max: number; color: string }> = ({ label, used, max, color }) => {
  const pct = max ? Math.min(100, (used / max) * 100) : 0;
  const overLimit = used >= max;
  return (
    <div className="panel panel-pad" style={{ padding: 14 }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="eyebrow" style={{ fontSize: 9 }}>{label}</span>
        <span className="num" style={{ fontSize: 13, fontWeight: 700, color: overLimit ? 'var(--red)' : 'var(--text-hi)' }}>{used} / {max}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg-deep)', borderRadius: 100 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: overLimit ? 'var(--red)' : color, borderRadius: 100, transition: 'width .6s' }} />
      </div>
      {overLimit && <div className="tred" style={{ fontSize: 10.5, marginTop: 6 }}>⚠ Limit reached</div>}
    </div>
  );
};

// ---- Role pill ----
const RolePill: React.FC<{ role: User['role'] }> = ({ role }) => {
  const map = { superadmin: 'aog', 'org-admin': 'warn', engineer: 'ok', viewer: 'info' } as const;
  const lbl = { superadmin: 'Super Admin', 'org-admin': 'Org Admin', engineer: 'Engineer', viewer: 'Viewer' };
  return <span className={`badge ${map[role]}`} style={{ fontSize: 9 }}>{lbl[role]}</span>;
};

// ---- Add/Edit Org Drawer ----
const OrgDrawer: React.FC<{ org: Organization | null; onClose: () => void; onSave: (d: Partial<Organization>) => void }> = ({ org, onClose, onSave }) => {
  const [name, setName] = useState(org?.name ?? '');
  const [icao, setIcao] = useState(org?.icaoPrefix ?? '');
  const [approvalRef, setApprovalRef] = useState(org?.approvalRef ?? '');
  const [country, setCountry] = useState(org?.country ?? '');
  const [email, setEmail] = useState(org?.contactEmail ?? '');
  const [plan, setPlan] = useState<Organization['plan']>(org?.plan ?? 'starter');
  const [maxAdmins, setMaxAdmins] = useState(String(org?.maxAdmins ?? 2));
  const [maxUsers, setMaxUsers] = useState(String(org?.maxUsers ?? 10));
  const [maxAircraft, setMaxAircraft] = useState(String(org?.maxAircraft ?? 10));
  const [notes, setNotes] = useState(org?.notes ?? '');

  const save = () => {
    if (!name.trim() || !email.trim()) { alert('Name and contact email are required.'); return; }
    onSave({ name, icaoPrefix: icao, approvalRef, country, contactEmail: email, plan, maxAdmins: +maxAdmins, maxUsers: +maxUsers, maxAircraft: +maxAircraft, notes, status: org?.status ?? 'pending' });
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 50, backdropFilter: 'blur(3px)' }} />
      <div className="fade-up" style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(520px,94vw)', background: 'var(--bg-panel)', borderLeft: '1px solid var(--line-bright)', zIndex: 51, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,.6)' }}>
        <div className="row between" style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div className="row gap-12">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'grid', placeItems: 'center' }}>
              <Building2 size={20} className="tcyan" />
            </div>
            <div>
              <div className="hi" style={{ fontSize: 17, fontWeight: 700 }}>{org ? 'Edit Organisation' : 'Add Organisation'}</div>
              <div className="muted" style={{ fontSize: 12 }}>{org ? org.name : 'New client onboarding'}</div>
            </div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ padding: 8 }}><X size={16} /></button>
        </div>
        <div style={{ padding: 22 }}>
          <div className="grid-2col" style={{ gap: 12 }}>
            <Field label="Organisation Name"><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Caribbean Wings Ltd" /></Field>
            <Field label="ICAO Prefix"><input className="input" value={icao} onChange={e => setIcao(e.target.value)} placeholder="e.g. 9Y" /></Field>
            <Field label="Contact Email"><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ops@example.com" /></Field>
            <Field label="Country"><input className="input" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Trinidad & Tobago" /></Field>
          </div>
          <Field label="Approval Reference"><input className="input" value={approvalRef} onChange={e => setApprovalRef(e.target.value)} placeholder="e.g. TTCAA Part-CAMO · XX-2026" /></Field>
          <Field label="Plan">
            <div className="row gap-8">
              {(['starter', 'professional', 'enterprise'] as const).map(p => (
                <button key={p} className={`btn sm ${plan === p ? 'primary' : 'ghost'}`} style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }} onClick={() => setPlan(p)}>{p}</button>
              ))}
            </div>
          </Field>

          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: 12, color: 'var(--amber)' }}>User Quotas — set by you</div>
            <div className="grid-3col" style={{ gap: 12 }}>
              <Field label="Max Admins"><input className="input num" type="number" min="1" max="10" value={maxAdmins} onChange={e => setMaxAdmins(e.target.value)} /></Field>
              <Field label="Max Users"><input className="input num" type="number" min="1" value={maxUsers} onChange={e => setMaxUsers(e.target.value)} /></Field>
              <Field label="Max Aircraft"><input className="input num" type="number" min="1" value={maxAircraft} onChange={e => setMaxAircraft(e.target.value)} /></Field>
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 8, lineHeight: 1.6 }}>
              Org admins can add users up to these limits. They cannot exceed them. You can change these at any time.
            </div>
          </div>

          <Field label="Internal Notes (not visible to org)">
            <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Referred by John Smith, 3-month trial" style={{ resize: 'vertical' }} />
          </Field>

          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: 12 }} onClick={save}>
            <Check size={16} /> {org ? 'Save Changes' : 'Create Organisation'}
          </button>
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
