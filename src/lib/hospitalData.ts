import { getSupabase } from './supabase';
import {
  compareEstimates,
  estimateFor,
  freshnessLabel,
  ADMISSION_CHECKLIST,
  PROCEDURES,
  type Comparison,
  type DbHospital,
  type Estimate,
  type ProcedureSlug,
} from './hospitalCost';

export {
  compareEstimates,
  estimateFor,
  freshnessLabel,
  ADMISSION_CHECKLIST,
  PROCEDURES,
};
export type { Comparison, DbHospital, Estimate, ProcedureSlug };

interface HospitalRow {
  id: string;
  slug: string;
  name: string;
  location: string;
  type: string;
  source: string;
  data_status: string;
  updated_hours_ago: number;
  facility_status: 'government' | 'private';
  address: string | null;
  phone: string | null;
  distance_km: number | null;
  network_status: 'verified_in_network' | 'reported' | 'unknown';
  network_verified_hours_ago: number | null;
  wheelchair_status: 'verified' | 'reported' | 'unknown';
}

interface ServiceRow {
  id: string;
  hospital_id: string;
  service: string;
  status: 'verified' | 'reported' | 'unknown';
  updated_hours_ago: number;
}

interface ChargeRow {
  id: string;
  hospital_id: string;
  applies_to: string;
  category: string;
  item: string;
  price_low: number;
  price_high: number;
}

interface RoomRow {
  id: string;
  hospital_id: string;
  category: string;
  rate_low: number;
  rate_high: number;
  availability_status: 'verified' | 'reported' | 'unknown';
  beds_reported: number | null;
  updated_hours_ago: number;
}

export async function loadHospitals(): Promise<
  { hospitals: DbHospital[]; offline: boolean }
> {
  const supabase = getSupabase();
  if (!supabase) return { hospitals: [], offline: true };
  const [hospitalsRes, chargesRes, roomsRes, servicesRes] = await Promise.all([
    supabase.from('hospitals').select('*'),
    supabase.from('hospital_charge_items').select('*'),
    supabase.from('hospital_rooms').select('*'),
    supabase.from('hospital_services').select('*'),
  ]);
  if (hospitalsRes.error || chargesRes.error || roomsRes.error || servicesRes.error) {
    return { hospitals: [], offline: true };
  }
  const hRows = (hospitalsRes.data ?? []) as HospitalRow[];
  const cRows = (chargesRes.data ?? []) as ChargeRow[];
  const rRows = (roomsRes.data ?? []) as RoomRow[];
  const sRows = (servicesRes.data ?? []) as ServiceRow[];
  const hospitals: DbHospital[] = hRows.map((h) => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    location: h.location,
    type: h.type,
    source: h.source,
    dataStatus: h.data_status,
    updatedHoursAgo: h.updated_hours_ago,
    facilityStatus: h.facility_status,
    address: h.address,
    phone: h.phone,
    distanceKm: h.distance_km,
    networkStatus: h.network_status,
    networkVerifiedHoursAgo: h.network_verified_hours_ago,
    wheelchairStatus: h.wheelchair_status,
    services: sRows
      .filter((sv) => sv.hospital_id === h.id)
      .map((sv) => ({
        service: sv.service,
        status: sv.status,
        updatedHoursAgo: sv.updated_hours_ago,
      })),
    charges: cRows
      .filter((c) => c.hospital_id === h.id)
      .map((c) => ({
        id: c.id,
        appliesTo: c.applies_to,
        category: c.category,
        item: c.item,
        priceLow: c.price_low,
        priceHigh: c.price_high,
      })),
    rooms: rRows
      .filter((r) => r.hospital_id === h.id)
      .map((r) => ({
        id: r.id,
        category: r.category,
        rateLow: r.rate_low,
        rateHigh: r.rate_high,
        availabilityStatus: r.availability_status,
        bedsReported: r.beds_reported,
        updatedHoursAgo: r.updated_hours_ago,
      })),
  }));
  return { hospitals, offline: false };
}
