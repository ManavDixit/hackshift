import type { DbHospital, ProcedureSlug } from './hospitalCost';

export type Urgency = 'planned' | 'emergency';

export interface MatchingRequirements {
  procedure: ProcedureSlug;
  urgency: Urgency;
  governmentOnly: boolean;
  wheelchairRequired: boolean;
  requireInNetwork: boolean;
  maxDistanceKm: number | null;
  maxBudgetLow: number | null;
}

export const DEFAULT_REQUIREMENTS: MatchingRequirements = {
  procedure: 'angioplasty',
  urgency: 'planned',
  governmentOnly: false,
  wheelchairRequired: false,
  requireInNetwork: false,
  maxDistanceKm: null,
  maxBudgetLow: null,
};

export type WeightKey = 'cost' | 'distance' | 'network';

export type EligibilityReason =
  | { code: 'service-missing'; service: string }
  | { code: 'service-unverified'; service: string }
  | { code: 'government-only'; facilityStatus: string }
  | { code: 'wheelchair-unverified' }
  | { code: 'network-unverified' }
  | { code: 'distance-unknown' }
  | { code: 'too-far'; distanceKm: number }
  | { code: 'over-budget'; estimateLow: number };

export type MatchWarning =
  | { code: 'service-reported'; service: string; hoursAgo: number }
  | { code: 'network-reported'; hoursAgo: number }
  | { code: 'wheelchair-reported' }
  | { code: 'estimate-stale'; hoursAgo: number }
  | { code: 'network-freshness-unknown' };

export interface RankedHospital {
  hospital: DbHospital;
  estimateLow: number;
  estimateHigh: number;
  warnings: MatchWarning[];
  score: number;
  factors: string[];
}

export interface MatchResult {
  eligible: RankedHospital[];
  excluded: { hospital: DbHospital; reason: EligibilityReason }[];
}

const SERVICE_LABELS: Record<string, string> = {
  cardiology: 'Cardiology',
  'general-medicine': 'General medicine',
  emergency: 'Emergency care',
  diagnostics: 'Diagnostics',
  pediatrics: 'Pediatrics',
  orthopedics: 'Orthopedics',
};

export function serviceLabel(service: string): string {
  return SERVICE_LABELS[service] ?? service;
}

export function procedureService(procedure: ProcedureSlug): string {
  return procedure === 'angioplasty' ? 'cardiology' : 'general-medicine';
}

export function serviceStatus(hospital: DbHospital, service: string) {
  return hospital.services.find((s) => s.service === service) ?? null;
}

export function matchHospitals(
  hospitals: DbHospital[],
  req: MatchingRequirements,
  weights: Record<WeightKey, number>
): MatchResult {
  const required = procedureService(req.procedure);
  const eligible: RankedHospital[] = [];
  const excluded: MatchResult['excluded'] = [];

  for (const hospital of hospitals) {
    // --- Mandatory eligibility filters (fail = excluded, never ranked) ---
    const svc = serviceStatus(hospital, required);
    if (!svc) {
      excluded.push({ hospital, reason: { code: 'service-missing', service: required } });
      continue;
    }
    if (svc.status === 'unknown') {
      excluded.push({ hospital, reason: { code: 'service-unverified', service: required } });
      continue;
    }
    if (req.governmentOnly && hospital.facilityStatus !== 'government') {
      excluded.push({ hospital, reason: { code: 'government-only', facilityStatus: hospital.facilityStatus } });
      continue;
    }
    if (req.wheelchairRequired && hospital.wheelchairStatus !== 'verified') {
      excluded.push({ hospital, reason: { code: 'wheelchair-unverified' } });
      continue;
    }
    if (req.requireInNetwork && hospital.networkStatus !== 'verified_in_network') {
      excluded.push({ hospital, reason: { code: 'network-unverified' } });
      continue;
    }
    if (req.maxDistanceKm !== null) {
      if (hospital.distanceKm === null) {
        excluded.push({ hospital, reason: { code: 'distance-unknown' } });
        continue;
      }
      if (hospital.distanceKm > req.maxDistanceKm) {
        excluded.push({ hospital, reason: { code: 'too-far', distanceKm: hospital.distanceKm } });
        continue;
      }
    }

    // --- Preference-based ranking (only after eligibility) ---
    const warnings: MatchWarning[] = [];
    if (svc.status === 'reported') {
      warnings.push({ code: 'service-reported', service: required, hoursAgo: svc.updatedHoursAgo });
    }
    if (hospital.networkStatus === 'reported') {
      warnings.push({ code: 'network-reported', hoursAgo: hospital.networkVerifiedHoursAgo ?? 0 });
    }
    if (req.requireInNetwork === false && hospital.networkStatus === 'unknown') {
      warnings.push({ code: 'network-freshness-unknown' });
    }
    if (req.wheelchairRequired === false && hospital.wheelchairStatus === 'reported') {
      warnings.push({ code: 'wheelchair-reported' });
    }
    if (hospital.updatedHoursAgo > 120) {
      warnings.push({ code: 'estimate-stale', hoursAgo: hospital.updatedHoursAgo });
    }

    let estimateLow = 0;
    let estimateHigh = 0;
    let hasEstimate = false;
    for (const c of hospital.charges) {
      if (c.appliesTo !== req.procedure) continue;
      hasEstimate = true;
      estimateLow += c.priceLow;
      estimateHigh += c.priceHigh;
    }
    if (!hasEstimate) {
      excluded.push({ hospital, reason: { code: 'service-missing', service: required } });
      continue;
    }
    if (req.maxBudgetLow !== null && estimateLow > req.maxBudgetLow) {
      excluded.push({ hospital, reason: { code: 'over-budget', estimateLow } });
      continue;
    }

    // Lower is better for both; normalize cost against the eligible set later is
    // unnecessary — a simple weighted min-max within this call keeps it transparent.
    const costScore = estimateLow;
    const distanceScore = hospital.distanceKm ?? 25;
    const networkPenalty =
      hospital.networkStatus === 'verified_in_network' ? 0
      : hospital.networkStatus === 'reported' ? 50 : 100;
    const score =
      weights.cost * costScore +
      weights.distance * distanceScore +
      weights.network * networkPenalty;

    const factors: string[] = [];
    factors.push(
      svc.status === 'verified'
        ? `${serviceLabel(required)} service verified`
        : `${serviceLabel(required)} service reported (not confirmed)`
    );
    if (hospital.distanceKm !== null) factors.push(`~${hospital.distanceKm} km away (sample distance)`);
    else factors.push('Distance unknown');
    factors.push(
      hospital.networkStatus === 'verified_in_network'
        ? 'Insurance network status verified'
        : hospital.networkStatus === 'reported'
          ? 'Insurance network reported, not confirmed'
          : 'Insurance network status unknown'
    );
    factors.push(
      `Estimated total ${formatInr(estimateLow)} – ${formatInr(estimateHigh)} (sum of listed charges)`
    );

    eligible.push({ hospital, estimateLow, estimateHigh, warnings, score, factors });
  }

  eligible.sort((a, b) => a.score - b.score);
  return { eligible, excluded };
}

export function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function reasonLabel(reason: EligibilityReason): string {
  switch (reason.code) {
    case 'service-missing':
      return `No reliable record that this hospital offers ${serviceLabel(reason.service)}`;
    case 'service-unverified':
      return `${serviceLabel(reason.service)} service is not verified for this hospital`;
    case 'government-only':
      return 'You asked for government facilities only, and this is a private hospital';
    case 'wheelchair-unverified':
      return 'Wheelchair accessibility is not verified for this hospital';
    case 'network-unverified':
      return 'In-network insurance status is not verified for this hospital';
    case 'distance-unknown':
      return 'Distance is unknown, so it cannot be confirmed within your travel limit';
    case 'too-far':
      return `~${reason.distanceKm} km away — outside your preferred travel distance`;
    case 'over-budget':
      return `Lowest estimated total ${formatInr(reason.estimateLow)} is above your budget`;
  }
}

export function warningLabel(warning: MatchWarning): string {
  switch (warning.code) {
    case 'service-reported':
      return `${serviceLabel(warning.service)} reported by an indirect source ${warning.hoursAgo}h ago — confirm with the hospital`;
    case 'network-reported':
      return 'Insurance network status reported, not confirmed with the insurer';
    case 'wheelchair-reported':
      return 'Wheelchair accessibility reported but not independently verified';
    case 'estimate-stale':
      return `Price information last updated ${Math.round(warning.hoursAgo / 24)} day(s) ago — confirm current rates`;
    case 'network-freshness-unknown':
      return 'Insurance network status unknown — ask the hospital or your insurer';
  }
}
