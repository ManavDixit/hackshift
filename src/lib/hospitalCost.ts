export interface ChargeItem {
  id: string;
  appliesTo: string;
  category: string;
  item: string;
  priceLow: number;
  priceHigh: number;
}

export interface HospitalService {
  service: string;
  status: 'verified' | 'reported' | 'unknown';
  updatedHoursAgo: number;
}

export type VerificationStatus = 'verified' | 'reported' | 'unknown';

export interface RoomCategory {
  id: string;
  category: string;
  rateLow: number;
  rateHigh: number;
  availabilityStatus: 'verified' | 'reported' | 'unknown';
  bedsReported: number | null;
  updatedHoursAgo: number;
}

export interface DbHospital {
  id: string;
  slug: string;
  name: string;
  location: string;
  type: string;
  source: string;
  dataStatus: string;
  updatedHoursAgo: number;
  facilityStatus: 'government' | 'private';
  address: string | null;
  phone: string | null;
  distanceKm: number | null;
  networkStatus: 'verified_in_network' | 'reported' | 'unknown';
  networkVerifiedHoursAgo: number | null;
  wheelchairStatus: VerificationStatus;
  services: HospitalService[];
  charges: ChargeItem[];
  rooms: RoomCategory[];
}

export const PROCEDURES = [
  { slug: 'angioplasty', label: 'Angioplasty (with one stent)' },
  { slug: 'general-admission', label: 'General admission (2-day stay)' },
] as const;

export type ProcedureSlug = (typeof PROCEDURES)[number]['slug'];

export interface Estimate {
  totalLow: number;
  totalHigh: number;
  categories: {
    category: string;
    low: number;
    high: number;
    items: ChargeItem[];
  }[];
}

export interface Comparison {
  hospital: DbHospital;
  estimate: Estimate;
}

export const ADMISSION_CHECKLIST = [
  'Carry a government photo ID and any referral letter',
  'Bring all current medicines (or photos of the packaging)',
  'Ask which room category the estimate assumes and confirm the rate',
  'Ask whether pre-procedure tests are billed separately',
  'Ask for the expected length of stay and what happens if it changes',
  'Note the insurance/scheme desk contact on admission day',
  'Request the itemized final bill before discharge payment',
];

export function estimateFor(hospital: DbHospital, procedure: ProcedureSlug): Estimate | null {
  const items = hospital.charges.filter((c) => c.appliesTo === procedure);
  if (items.length === 0) return null;
  const categories: Estimate['categories'] = [];
  for (const item of items) {
    let bucket = categories.find((c) => c.category === item.category);
    if (!bucket) {
      bucket = { category: item.category, low: 0, high: 0, items: [] };
      categories.push(bucket);
    }
    bucket.low += item.priceLow;
    bucket.high += item.priceHigh;
    bucket.items.push(item);
  }
  const totalLow = categories.reduce((sum, c) => sum + c.low, 0);
  const totalHigh = categories.reduce((sum, c) => sum + c.high, 0);
  return { totalLow, totalHigh, categories };
}

export function compareEstimates(
  hospitals: DbHospital[],
  procedure: ProcedureSlug
): Comparison[] {
  return hospitals
    .map((hospital) => ({ hospital, estimate: estimateFor(hospital, procedure) }))
    .filter((c): c is Comparison => c.estimate !== null)
    .sort((a, b) => a.estimate.totalLow - b.estimate.totalLow);
}

export function freshnessLabel(hoursAgo: number): string {
  if (hoursAgo < 24) return `updated ${hoursAgo}h ago`;
  const days = Math.round(hoursAgo / 24);
  return `updated ${days} day${days === 1 ? '' : 's'} ago`;
}
