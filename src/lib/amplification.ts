// ============================================================
// AirSENS — Amplification Factor (AF) Engine
// Translates operational load → fatigue amplification → maintenance
// cost/interval impact. A defensible, transparent analytical model.
// ============================================================

export interface AFInputs {
  payloadRatio: number;   // 0..1.2  actual payload / max structural payload
  cyclesPerDay: number;   // landings per day
  loadFactor: number;     // 0..1   avg seat/cargo load
  envSeverity: number;    // 1=benign .. 5=harsh (coastal salt, heat, dust)
  avgSectorHrs: number;   // hours per cycle (short sectors = more cycles/hr)
}

export interface AFResult {
  af: number;                 // amplification factor (1.0 = baseline)
  fatigueIndex: number;       // composite 0..100
  intervalAdjustPct: number;  // recommend tighten inspection interval by %
  costMultiplier: number;     // lifecycle maintenance cost vs baseline
  drivers: { label: string; contribution: number }[]; // % share of AF excess
  recommendation: string;
  band: 'optimal' | 'elevated' | 'high' | 'severe';
}

/**
 * Model rationale:
 *  - Structural fatigue scales super-linearly with payload (stress^3 ~ Miner's rule proxy).
 *  - Short sectors → more pressurization/landing cycles per flight hour → higher GAG cycle damage.
 *  - Environmental severity multiplies corrosion-driven inspection demand.
 */
export function computeAF(i: AFInputs): AFResult {
  // payload term: cubic-ish above 0.8 ratio (stress concentration)
  const payloadTerm = Math.pow(Math.max(i.payloadRatio, 0.1), 2.4);

  // cycle density: cycles per flight hour relative to a 1.5h baseline sector
  const cycleDensity = 1 / Math.max(i.avgSectorHrs, 0.4);
  const cycleTerm = 0.6 + 0.9 * (cycleDensity / (1 / 1.5));

  // load factor: linear contribution
  const loadTerm = 0.7 + 0.6 * i.loadFactor;

  // environment: each step adds corrosion/erosion demand
  const envTerm = 1 + (i.envSeverity - 1) * 0.14;

  // composite amplification, normalized so a benign baseline ≈ 1.0
  const raw = payloadTerm * cycleTerm * loadTerm * envTerm;
  const baseline = Math.pow(0.75, 2.4) * (0.6 + 0.9) * (0.7 + 0.6 * 0.7) * 1;
  const ratio = raw / baseline;
  // apply diminishing-returns compression so realistic ops stay ~1.0–2.6×
  const af = +(1 + Math.log2(Math.max(ratio, 1)) * 0.62).toFixed(3);

  // driver attribution (share of excess over 1.0)
  const excess = Math.max(af - 1, 0.0001);
  const contrib = {
    Payload: (payloadTerm / Math.pow(0.75, 2.4) - 1),
    'Cycle density': (cycleTerm / 1.5 - 1),
    'Load factor': (loadTerm / (0.7 + 0.6 * 0.7) - 1),
    Environment: (envTerm - 1),
  };
  const total = Object.values(contrib).reduce((s, v) => s + Math.max(v, 0), 0) || 1;
  const drivers = Object.entries(contrib).map(([label, v]) => ({
    label, contribution: +(Math.max(v, 0) / total * 100).toFixed(0),
  })).sort((a, b) => b.contribution - a.contribution);

  const fatigueIndex = Math.min(100, +(af * 38).toFixed(0));
  const intervalAdjustPct = +((af - 1) * 55).toFixed(0); // tighten intervals
  const costMultiplier = +(1 + (af - 1) * 0.85).toFixed(2);

  let band: AFResult['band'] = 'optimal';
  let recommendation = 'Operating within baseline envelope. Maintain standard MPD intervals.';
  if (af >= 1.15 && af < 1.4) { band = 'elevated'; recommendation = 'Slightly elevated fatigue accrual. Monitor SB advisories; no interval change required yet.'; }
  if (af >= 1.4 && af < 1.8) { band = 'high'; recommendation = `Tighten structural inspection intervals ~${Math.round(intervalAdjustPct)}% and increase NDT sampling on primary load paths.`; }
  if (af >= 1.8) { band = 'severe'; recommendation = `Severe accrual. Escalate to DTE review, reduce payload/sector duty, and apply ${Math.round(intervalAdjustPct)}% interval reduction immediately.`; }
  excess; // silence

  return { af, fatigueIndex, intervalAdjustPct, costMultiplier, drivers, recommendation, band };
}

// project cumulative maintenance cost over N years for charting
export function projectCostCurve(af: number, years = 10, baseAnnual = 100) {
  const out: { year: number; baseline: number; projected: number }[] = [];
  let bAcc = 0, pAcc = 0;
  for (let y = 1; y <= years; y++) {
    // cost escalates with cumulative fatigue (compounding wear)
    bAcc += baseAnnual * Math.pow(1.04, y - 1);
    pAcc += baseAnnual * (1 + (af - 1) * 0.85) * Math.pow(1.04 + (af - 1) * 0.02, y - 1);
    out.push({ year: y, baseline: Math.round(bAcc), projected: Math.round(pAcc) });
  }
  return out;
}
