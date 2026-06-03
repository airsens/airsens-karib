// ============================================================
// AirSENS — Structural Fatigue Index (SFI) Engine
// Based on Promise Benebo's engineering model:
//
// Fatigue index drivers:
//   1. Takeoff/landing cycles
//   2. Pressurisation cycles
//   3. Turbulence / environment (corrosion)
//   4. Accumulated repairs on primary, secondary, tertiary load paths
//   5. Widespread Fatigue Damage (WFD) threshold: >6 repairs on primary
//   6. Hard landings
//
// Load path hierarchy:
//   Primary   — main structural load bearing; most critical
//   Secondary — supporting structure; significant
//   Tertiary  — minor/fairing structure; least critical
//
// The SFI feeds directly into the Amplification Factor engine.
// ============================================================

export type LoadPath = 'primary' | 'secondary' | 'tertiary';
export type DTICategory = 'A' | 'B' | 'C';
export type RepairType = 'Doubler' | 'Crack stop' | 'Bushing replace' | 'Splice' | 'Patch' | 'Modification' | 'Corrosion blend';

export interface StructuralRepair {
  id: string;
  location: string;
  ataZone: string;
  repairType: RepairType;
  loadPath: LoadPath;
  dtiCategory: DTICategory;
  cyclesAtRepair: number;    // airframe cycles when repair was made
  corrosionInvolved: boolean;
  hardLandingRelated: boolean;
  dateLogged: string;
}

export interface SFIInputs {
  totalCycles: number;          // airframe landings to date
  totalFlightHours: number;
  repairs: StructuralRepair[];
  envSeverity: number;          // 1=benign..5=harsh (coastal salt, tropics, desert)
  hardLandingCount: number;     // number of hard landing events recorded
  pressureCycles: number;       // usually ≈ totalCycles for pressurised aircraft
}

export interface SFIResult {
  fatigueIndex: number;         // 0–100 composite score
  band: 'safe' | 'elevated' | 'high' | 'critical';
  bandColor: string;

  // load path breakdown
  primaryRepairs: number;
  secondaryRepairs: number;
  tertiaryRepairs: number;

  // derived inspection intervals per repair
  repairIntervals: { repairId: string; intervalFH: number; intervalFC: number; rationale: string }[];

  // WFD assessment
  wfdRisk: 'none' | 'emerging' | 'elevated' | 'critical';
  wfdMessage: string;

  // driver contributions (% of fatigue index)
  drivers: { label: string; value: number; pct: number }[];

  recommendation: string;

  // structural AF modifier (feeds into main AF engine)
  structuralAFModifier: number; // multiplier applied to AF result
}

// Load path weights — primary is 3× as significant as tertiary
const LOAD_PATH_WEIGHT: Record<LoadPath, number> = {
  primary: 3.0,
  secondary: 1.5,
  tertiary: 0.5,
};

// DTI category severity
const DTI_SEVERITY: Record<DTICategory, number> = {
  A: 2.5,   // Cat A — most critical, immediate action territory
  B: 1.5,   // Cat B — significant
  C: 1.0,   // Cat C — standard
};

export function computeSFI(inputs: SFIInputs): SFIResult {
  const { totalCycles, totalFlightHours, repairs, envSeverity, hardLandingCount, pressureCycles } = inputs;

  const primaryRepairs   = repairs.filter(r => r.loadPath === 'primary');
  const secondaryRepairs = repairs.filter(r => r.loadPath === 'secondary');
  const tertiaryRepairs  = repairs.filter(r => r.loadPath === 'tertiary');

  // ── 1. Cycle fatigue term ────────────────────────────────────────────────
  // Normalised to a 20,000 cycle reference life
  const CYCLE_REF = 20000;
  const cycleTerm = Math.min((totalCycles / CYCLE_REF) * 25, 25);

  // ── 2. Pressurisation term ───────────────────────────────────────────────
  const PRESS_REF = 20000;
  const pressTerm = Math.min((pressureCycles / PRESS_REF) * 10, 10);

  // ── 3. Environment / corrosion term ─────────────────────────────────────
  // envSeverity 1-5; coastal/tropical = 4-5, temperate = 2, desert = 3
  const corrosionRepairs = repairs.filter(r => r.corrosionInvolved).length;
  const envTerm = ((envSeverity - 1) * 3) + (corrosionRepairs * 0.8);

  // ── 4. Hard landings ────────────────────────────────────────────────────
  const hardLandingTerm = Math.min(hardLandingCount * 1.5, 10);

  // ── 5. Repair accumulation on load paths ────────────────────────────────
  // Core of Promise's model: each repair adds fatigue proportional to its
  // load path weight and DTI category. Stress-raiser effect compounds.
  let repairTerm = 0;
  repairs.forEach(r => {
    const pathWeight = LOAD_PATH_WEIGHT[r.loadPath];
    const dtiWeight  = DTI_SEVERITY[r.dtiCategory];
    // base contribution per repair
    repairTerm += pathWeight * dtiWeight * 0.8;
  });

  // ── 6. WFD amplifier: >6 primary repairs triggers non-linear escalation ──
  // Promise: "once you have six to seven damage and repair on primary load part,
  // there is a problem" — the repairs start acting as stress raisers and can coalesce
  const PRIMARY_THRESHOLD = 6;
  let wfdAmplifier = 1.0;
  let wfdRisk: SFIResult['wfdRisk'] = 'none';
  let wfdMessage = 'No widespread fatigue damage risk identified.';

  if (primaryRepairs.length >= PRIMARY_THRESHOLD) {
    // exponential escalation above threshold
    const excess = primaryRepairs.length - PRIMARY_THRESHOLD + 1;
    wfdAmplifier = 1 + Math.log2(excess + 1) * 0.6;
    wfdRisk = primaryRepairs.length >= 12 ? 'critical' : primaryRepairs.length >= 9 ? 'elevated' : 'emerging';
    wfdMessage = primaryRepairs.length >= 12
      ? `CRITICAL: ${primaryRepairs.length} primary load path repairs recorded. Widespread Fatigue Damage coalescence risk is HIGH. Immediate DTE review required.`
      : primaryRepairs.length >= 9
      ? `ELEVATED: ${primaryRepairs.length} primary load path repairs. Repairs acting as stress raisers — enhanced NDT regime and reduced inspection intervals mandatory.`
      : `EMERGING: ${primaryRepairs.length} primary load path repairs approaching WFD threshold (6+). Begin enhanced monitoring and flag for DTE assessment.`;
  } else if (primaryRepairs.length >= 4) {
    wfdRisk = 'emerging';
    wfdMessage = `${primaryRepairs.length} primary load path repairs logged. Approaching threshold (6) for WFD monitoring. Continue standard programme.`;
  }

  // ── 7. 200+ primary repairs (Promise: "if you have more than 200 repairs...") ──
  if (primaryRepairs.length >= 200) {
    wfdAmplifier *= 2.5;
    wfdRisk = 'critical';
    wfdMessage = `CRITICAL: ${primaryRepairs.length} primary repairs exceeds the 200-repair WFD threshold. Structural integrity programme mandatory review.`;
  }

  // ── Composite SFI ────────────────────────────────────────────────────────
  const rawSFI = (cycleTerm + pressTerm + envTerm + hardLandingTerm + repairTerm) * wfdAmplifier;
  const fatigueIndex = Math.min(100, Math.round(rawSFI));

  // ── Band classification ───────────────────────────────────────────────────
  let band: SFIResult['band'];
  let bandColor: string;
  let recommendation: string;

  if (fatigueIndex < 25) {
    band = 'safe'; bandColor = 'var(--green)';
    recommendation = 'Structural fatigue within normal operating envelope. Maintain standard DTI schedule.';
  } else if (fatigueIndex < 50) {
    band = 'elevated'; bandColor = 'var(--cyan)';
    recommendation = 'Elevated fatigue accrual. Review primary load path repairs at next scheduled inspection. Tighten NDT sampling by 15%.';
  } else if (fatigueIndex < 75) {
    band = 'high'; bandColor = 'var(--amber)';
    recommendation = 'High fatigue index. Reduce inspection intervals on primary structure by 20-30%. Conduct WFD assessment. Environmental controls review recommended.';
  } else {
    band = 'critical'; bandColor = 'var(--red)';
    recommendation = 'CRITICAL structural fatigue index. Immediate DTE review required. Restrict operations pending engineering assessment. Primary load path repairs must be evaluated for coalescence risk.';
  }

  // ── Derived inspection intervals per repair ───────────────────────────────
  // Base interval reduced proportional to load path severity and DTI category
  const BASE_INTERVAL_FH = 12000;
  const BASE_INTERVAL_FC = 8000;
  const repairIntervals = repairs.map(r => {
    const reduction = LOAD_PATH_WEIGHT[r.loadPath] * DTI_SEVERITY[r.dtiCategory] * (0.15 + (fatigueIndex / 100) * 0.25);
    const fh = Math.round(BASE_INTERVAL_FH * (1 - Math.min(reduction, 0.7)));
    const fc = Math.round(BASE_INTERVAL_FC * (1 - Math.min(reduction, 0.7)));
    const rationale = `${r.loadPath === 'primary' ? 'Primary LP — highest priority' : r.loadPath === 'secondary' ? 'Secondary LP — significant' : 'Tertiary LP — standard'} · DTI Cat ${r.dtiCategory}${r.corrosionInvolved ? ' · Corrosion involved' : ''}`;
    return { repairId: r.id, intervalFH: fh, intervalFC: fc, rationale };
  });

  // ── Driver attribution ────────────────────────────────────────────────────
  const total = cycleTerm + pressTerm + envTerm + hardLandingTerm + repairTerm || 1;
  const drivers = [
    { label: 'Cycles (T/O & Ldg)', value: +cycleTerm.toFixed(1), pct: +((cycleTerm / total) * 100).toFixed(0) },
    { label: 'Pressurisation cycles', value: +pressTerm.toFixed(1), pct: +((pressTerm / total) * 100).toFixed(0) },
    { label: 'Environment / Corrosion', value: +envTerm.toFixed(1), pct: +((envTerm / total) * 100).toFixed(0) },
    { label: 'Hard landings', value: +hardLandingTerm.toFixed(1), pct: +((hardLandingTerm / total) * 100).toFixed(0) },
    { label: 'Repair accumulation', value: +repairTerm.toFixed(1), pct: +((repairTerm / total) * 100).toFixed(0) },
  ].sort((a, b) => b.value - a.value);

  // ── Structural AF modifier (feeds into main AF engine) ───────────────────
  // SFI 0-25 → 1.0x modifier; 50 → 1.2x; 75 → 1.5x; 100 → 2.0x
  const structuralAFModifier = +(1 + (fatigueIndex / 100) * 1.0).toFixed(3);

  return {
    fatigueIndex, band, bandColor,
    primaryRepairs: primaryRepairs.length,
    secondaryRepairs: secondaryRepairs.length,
    tertiaryRepairs: tertiaryRepairs.length,
    repairIntervals, wfdRisk, wfdMessage, drivers,
    recommendation, structuralAFModifier,
  };
}

// Seed repair data for demo
export const demoRepairs: StructuralRepair[] = [
  { id: 'RPR-001', location: 'Wing lower skin STA 540', ataZone: '57', repairType: 'Doubler', loadPath: 'primary', dtiCategory: 'B', cyclesAtRepair: 12400, corrosionInvolved: false, hardLandingRelated: false, dateLogged: '2024-03-15' },
  { id: 'RPR-002', location: 'Fuselage frame FR42', ataZone: '53', repairType: 'Crack stop', loadPath: 'primary', dtiCategory: 'C', cyclesAtRepair: 14200, corrosionInvolved: false, hardLandingRelated: true, dateLogged: '2024-06-20' },
  { id: 'RPR-003', location: 'Stabilizer attach lug', ataZone: '55', repairType: 'Bushing replace', loadPath: 'primary', dtiCategory: 'A', cyclesAtRepair: 15800, corrosionInvolved: false, hardLandingRelated: false, dateLogged: '2024-09-10' },
  { id: 'RPR-004', location: 'Wing-fuselage fairing', ataZone: '57', repairType: 'Patch', loadPath: 'secondary', dtiCategory: 'C', cyclesAtRepair: 13100, corrosionInvolved: true, hardLandingRelated: false, dateLogged: '2024-04-22' },
  { id: 'RPR-005', location: 'Belly skin STA 620-640', ataZone: '53', repairType: 'Corrosion blend', loadPath: 'secondary', dtiCategory: 'C', cyclesAtRepair: 16200, corrosionInvolved: true, hardLandingRelated: false, dateLogged: '2025-01-08' },
  { id: 'RPR-006', location: 'Flap track fairing', ataZone: '57', repairType: 'Doubler', loadPath: 'tertiary', dtiCategory: 'C', cyclesAtRepair: 17000, corrosionInvolved: false, hardLandingRelated: false, dateLogged: '2025-03-14' },
];
