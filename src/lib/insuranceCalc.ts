import type { InsuranceProfile } from './healthData';

export interface CostBasis {
  estimateLow: number;
  estimateHigh: number;
  roomCategoryRate?: { low: number; high: number } | null;
  nights?: number;
}

export interface InsuranceEstimate {
  status: 'calculated' | 'needs-confirmation' | 'cannot-calculate';
  reason: string;
  total: { low: number; high: number };
  insurerPayable: { low: number; high: number } | null;
  outOfPocket: { low: number; high: number } | null;
  lines: {
    label: string;
    detail: string;
    low: number;
    high: number;
    kind: 'total' | 'deduction' | 'insurance' | 'patient' | 'info';
  }[];
  assumptions: string[];
  confirmationsNeeded: string[];
}

function roundRupee(n: number): number {
  return Math.round(n);
}

export function estimateOutOfPocket(basis: CostBasis, profile: InsuranceProfile | null): InsuranceEstimate {
  const lines: InsuranceEstimate['lines'] = [];
  const assumptions: string[] = [];
  const confirmationsNeeded: string[] = [];
  const total = { low: basis.estimateLow, high: basis.estimateHigh };

  lines.push({
    label: 'Estimated total treatment expense',
    detail: 'Sum of the hospital\u2019s itemized charge ranges',
    low: total.low,
    high: total.high,
    kind: 'total',
  });

  if (!profile) {
    return {
      status: 'cannot-calculate',
      reason: 'No insurance profile has been added yet, so the insurance share cannot be estimated.',
      total,
      insurerPayable: null,
      outOfPocket: null,
      lines: [
        ...lines,
        {
          label: 'Insurance share',
          detail: 'Cannot be calculated without policy details',
          low: 0,
          high: 0,
          kind: 'info',
        },
      ],
      assumptions,
      confirmationsNeeded: ['Add and confirm your policy details on the Insurance page'],
    };
  }

  if (!profile.confirmed) {
    return {
      status: 'needs-confirmation',
      reason: 'Policy details have been filled in but not yet confirmed by you. Calculations are held until you review them.',
      total,
      insurerPayable: null,
      outOfPocket: null,
      lines: [
        ...lines,
        {
          label: 'Insurance share',
          detail: 'Waiting for your confirmation of policy details',
          low: 0,
          high: 0,
          kind: 'info',
        },
      ],
      assumptions,
      confirmationsNeeded: ['Review and confirm the extracted policy details'],
    };
  }

  assumptions.push('All arithmetic uses the confirmed policy fields only, rounded to whole rupees.');
  assumptions.push('This is a preliminary estimate, not a promise of coverage or a final bill.');

  if (profile.roomRentLimit !== null) {
    assumptions.push(`A room-rent sublimit of ₹${profile.roomRentLimit.toLocaleString('en-IN')}/day is applied where the policy defines one; actual room rates may differ.`);
    confirmationsNeeded.push('Confirm your intended room category and its daily rate with the hospital');
  }
  if (profile.preauthRequired) {
    confirmationsNeeded.push('This policy requires preauthorization — start it before admission to avoid claim delays');
  }
  if (profile.networkStatus !== 'verified_in_network') {
    confirmationsNeeded.push('Confirm with your insurer whether this hospital is in your network — network status is not verified');
  }
  if (profile.remainingLimit === null) {
    confirmationsNeeded.push('Ask your insurer for your remaining coverage limit; the estimate assumes the full sum insured is available');
  }

  const availableLow = Math.min(profile.remainingLimit ?? profile.coverageAmount ?? 0, total.low);
  const availableHigh = Math.min(profile.remainingLimit ?? profile.coverageAmount ?? 0, total.high);

  lines.push({
    label: 'Deductible (paid by you first)',
    detail: profile.deductible > 0 ? 'Fixed amount per claim as per policy' : 'No deductible recorded',
    low: Math.min(profile.deductible, total.low),
    high: Math.min(profile.deductible, total.high),
    kind: 'deduction',
  });

  const eligibleLow = Math.max(0, total.low - profile.deductible);
  const eligibleHigh = Math.max(0, total.high - profile.deductible);

  const copayLow = roundRupee((eligibleLow * profile.copayPercent) / 100);
  const copayHigh = roundRupee((eligibleHigh * profile.copayPercent) / 100);
  if (profile.copayPercent > 0) {
    lines.push({
      label: `Co-payment (${profile.copayPercent}%)`,
      detail: 'Your share of eligible expenses as per policy',
      low: copayLow,
      high: copayHigh,
      kind: 'deduction',
    });
  }

  const insurerLow = Math.max(0, Math.min(availableLow, eligibleLow - copayLow));
  const insurerHigh = Math.max(0, Math.min(availableHigh, eligibleHigh - copayHigh));

  lines.push({
    label: 'Potentially payable by insurance',
    detail: 'Eligible expenses after deductible and co-pay, capped by remaining coverage',
    low: insurerLow,
    high: insurerHigh,
    kind: 'insurance',
  });

  const oopLow = Math.max(0, total.low - insurerLow);
  const oopHigh = Math.max(0, total.high - insurerHigh);

  lines.push({
    label: 'Estimated out-of-pocket (you)',
    detail: 'Total minus the insurance share; includes deductible, co-pay and any non-payables',
    low: oopLow,
    high: oopHigh,
    kind: 'patient',
  });

  for (const ex of profile.exclusions) {
    lines.push({
      label: 'Policy exclusion',
      detail: `${ex} — if this applies to your treatment, it will add to your out-of-pocket cost`,
      low: 0,
      high: 0,
      kind: 'info',
    });
  }

  return {
    status: 'calculated',
    reason: 'Calculated from confirmed policy fields using fixed rules.',
    total,
    insurerPayable: { low: insurerLow, high: insurerHigh },
    outOfPocket: { low: oopLow, high: oopHigh },
    lines,
    assumptions,
    confirmationsNeeded,
  };
}
