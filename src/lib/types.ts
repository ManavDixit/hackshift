export type Role = 'patient' | 'worker';
export type Lang = 'en' | 'hi';

export interface Profile {
  id: string;
  name: string;
  role: Role;
  lang: Lang;
  email: string;
  phone: string;
  city: string;
}

export interface CareTask {
  id: string;
  title: string;
  status: 'completed' | 'upcoming' | 'pending' | 'attention';
  owner: string;
  due?: string;
  next?: string;
  stage: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  specialty: string;
  type: string;
  consultLow: number;
  consultHigh: number;
  procedureLow: number;
  procedureHigh: number;
  room: string;
  included: string[];
  exclusions: string[];
  availability: 'sample: likely available' | 'sample: unknown';
  updated: string;
  source: string;
}

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  facility: string;
  location: string;
  distanceKm: number;
  modes: string[];
  fee: number;
  rating: number;
  reviews: number;
  photo: string;
}

export interface MedicineRow {
  id: string;
  brand: string;
  ingredient: string;
  strength: string;
  form: string;
  pack: string;
  manufacturer: string;
  price: number;
  pharmacy: string;
  verifiedComparable: boolean;
  updated: string;
}

export interface BloodBankRow {
  id: string;
  name: string;
  location: string;
  contact: string;
  group: string;
  stock: 'sample: units reported' | 'sample: unverified';
  units: number;
  updated: string;
  verified: boolean;
}

export interface LabRow {
  id: string;
  name: string;
  location: string;
  test: string;
  category: string;
  price: number;
  collection: string;
  verified: boolean;
  contact: string;
}

export interface DocRow {
  id: string;
  title: string;
  category: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Referral' | 'Other';
  date: string;
  status: 'ready' | 'processing' | 'failed';
  source: string;
  pages: number;
  excerpt?: string;
}

export interface WorkQueueRow {
  id: string;
  patient: string;
  action: string;
  due: string;
  owner: string;
  status: 'On track' | 'Due soon' | 'Overdue';
  lastUpdate: string;
  next: string;
}
