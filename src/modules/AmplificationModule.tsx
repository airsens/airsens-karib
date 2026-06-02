import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import { Gauge, Cpu, TrendingUp, AlertTriangle, Sliders } from 'lucide-react';
import { PageHeader, PanelHead } from '../components/ui';
import { computeAF, projectCostCurve, type AFInputs } from '../lib/amplification';

const tooltipStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--line-bright)',
  borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-hi)',
};

const BAND_COLOR: Record<string, string> = {
  optimal: 'var(--green)', elevated: 'var(--cyan)', high: 'var(--amber)', severe: 'var(--red)',
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }> =
  ({ label, value, min, max, step, unit, onChange }) => (
  <div style={{ marginBottom: 18 }}>
    <div className="row between" style={{ marginBottom: 8 }}>
      <span className="eyebrow" style={{ color: 'var(--text)' }}>{label}</span>
      <span className="num tcyan" style={{ fontSize: 14, fontWeight: 600 }}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(+e.target.value)}
      style={{ width: '100%', accentColor: 'var(--cyan)', cursor: 'pointer' }} />
  </div>
);

export const AmplificationModule: React.FC = () => {
  const [inp, setInp] = useState<AFInputs>({
    payloadRatio: 0.85, cyclesPerDay: 6, loadFactor: 0.78, envSeverity: 3, avgSectorHrs: 1.4,
  });
  const set = (k: keyof AFInputs) => (v: number) => setInp(p => ({ ...p, [k]: v }));

  const res = useMemo(() => computeAF(inp), [inp]);
  const curve = useMemo(() => projectCostCurve(res.af, 10), [res.af]);
  const totalExtra = curve.length ? curve[curve.length - 1].projected - curve[curve.length - 1].baseline : 0;

  const gaugeData = [{ name: 'AF', value: Math.min(res.fatigueIndex, 100), fill: BAND_COLOR[res.band] }];

  return (
    <div>
      <PageHeader eyebrow="Engineering · Analytical" title="Amplification Factor Engine"
        sub="Translate operational load into fatigue amplification and projected maintenance cost." />

      <div className="grid" style={{ gridTemplateColumns: '340px 1fr', alignItems: 'start' }}>
        {/* Inputs */}
        <div className="panel fade-up">
          <PanelHead title="Operational Inputs" icon={<Sliders size={15} className="tcyan" />} />
          <div style={{ padding: 20 }}>
            <Slider label="Payload Ratio" value={inp.payloadRatio} min={0.3} max={1.2} step={0.01} onChange={set('payloadRatio')} />
            <Slider label="Cycles / Day" value={inp.cyclesPerDay} min={1} max={14} step={1} onChange={set('cyclesPerDay')} />
            <Slider label="Avg Sector" value={inp.avgSectorHrs} min={0.4} max={6} step={0.1} unit=" h" onChange={set('avgSectorHrs')} />
            <Slider label="Load Factor" value={inp.loadFactor} min={0.3} max={1} step={0.01} onChange={set('loadFactor')} />
            <Slider label="Env. Severity" value={inp.envSeverity} min={1} max={5} step={1} onChange={set('envSeverity')} />
            <div className="muted" style={{ fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>
              Environment 1 = temperate hangar ops · 5 = coastal salt, high heat & dust exposure.
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="col gap-16">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="panel panel-pad ticks fade-up" style={{ animationDelay: '80ms' }}>
              <div className="eyebrow row gap-8"><Gauge size={13} />Amplification</div>
              <div className="num" style={{ fontSize: 40, fontWeight: 800, color: BAND_COLOR[res.band], marginTop: 8, lineHeight: 1 }}>
                {res.af.toFixed(2)}<span style={{ fontSize: 16, color: 'var(--text-dim)' }}>×</span>
              </div>
              <div className={`badge ${res.band === 'optimal' ? 'ok' : res.band === 'severe' ? 'aog' : res.band === 'high' ? 'warn' : 'info'}`} style={{ marginTop: 10, textTransform: 'capitalize' }}>
                <span className="dot" />{res.band}
              </div>
            </div>
            <div className="panel panel-pad ticks fade-up" style={{ animationDelay: '140ms' }}>
              <div className="eyebrow row gap-8"><TrendingUp size={13} />Cost Multiplier</div>
              <div className="num" style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-hi)', marginTop: 8, lineHeight: 1 }}>
                {res.costMultiplier}<span style={{ fontSize: 16, color: 'var(--text-dim)' }}>×</span>
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 12 }}>vs baseline lifecycle</div>
            </div>
            <div className="panel panel-pad ticks fade-up" style={{ animationDelay: '200ms' }}>
              <div className="eyebrow row gap-8"><AlertTriangle size={13} />Interval Adjust</div>
              <div className="num" style={{ fontSize: 40, fontWeight: 800, color: res.intervalAdjustPct > 0 ? 'var(--amber)' : 'var(--green)', marginTop: 8, lineHeight: 1 }}>
                {res.intervalAdjustPct > 0 ? '−' : ''}{Math.abs(res.intervalAdjustPct)}%
              </div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 12 }}>inspection tightening</div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="panel fade-up" style={{ animationDelay: '160ms' }}>
              <PanelHead title="Fatigue Index" icon={<Cpu size={15} className="tcyan" />} />
              <div style={{ padding: 12, position: 'relative' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <RadialBarChart innerRadius="68%" outerRadius="100%" data={gaugeData} startAngle={220} endAngle={-40}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'var(--bg-deep)' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', top: 8 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="num" style={{ fontSize: 36, fontWeight: 800, color: BAND_COLOR[res.band] }}>{res.fatigueIndex}</div>
                    <div className="eyebrow" style={{ fontSize: 9 }}>/ 100 index</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel fade-up" style={{ animationDelay: '200ms' }}>
              <PanelHead title="AF Drivers" icon={<Sliders size={15} className="tamber" />} />
              <div style={{ padding: 18 }}>
                {res.drivers.map(d => (
                  <div key={d.label} style={{ marginBottom: 14 }}>
                    <div className="row between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                      <span>{d.label}</span><span className="num hi">{d.contribution}%</span>
                    </div>
                    <div style={{ height: 7, background: 'var(--bg-deep)', borderRadius: 100 }}>
                      <div style={{ height: '100%', width: `${d.contribution}%`, borderRadius: 100,
                        background: 'linear-gradient(90deg, var(--cyan), var(--cyan-dim))', transition: 'width .5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel fade-up" style={{ animationDelay: '240ms' }}>
            <PanelHead title="10-Year Maintenance Cost Projection" icon={<TrendingUp size={15} className="tcyan" />}
              right={<span className="badge warn">+{totalExtra.toLocaleString()} units extra</span>} />
            <div style={{ padding: '16px 12px 8px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={curve}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--text-faint)', fontSize: 10 }} tickFormatter={y => `Y${y}`} />
                  <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                  <Line type="monotone" dataKey="baseline" stroke="var(--text-faint)" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Baseline" />
                  <Line type="monotone" dataKey="projected" stroke={BAND_COLOR[res.band]} strokeWidth={2.5} dot={false} name="Projected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel panel-pad fade-up" style={{ animationDelay: '280ms', borderLeft: `3px solid ${BAND_COLOR[res.band]}` }}>
            <div className="eyebrow row gap-8" style={{ color: BAND_COLOR[res.band] }}><AlertTriangle size={14} />Engineering Recommendation</div>
            <p style={{ marginTop: 8, fontSize: 13.5, color: 'var(--text-hi)', lineHeight: 1.55 }}>{res.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
