import { getSupabase } from './supabase';

export type ExtractionStatus = 'pending' | 'extracted' | 'reviewed' | 'failed';
export type EntryType = 'condition' | 'medication' | 'allergy' | 'procedure' | 'test' | 'visit';
export type EntryOrigin = 'patient-reported' | 'document-extracted' | 'clinician-confirmed';
export type Approval = 'pending_review' | 'approved';

export interface HealthDocument {
  id: string;
  title: string;
  category: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Other';
  fileName: string | null;
  fileType: string | null;
  pages: number;
  extractionStatus: ExtractionStatus;
  createdAt: string;
}

export interface TimelineEntry {
  id: string;
  documentId: string | null;
  entryType: EntryType;
  title: string;
  detail: string | null;
  entryDate: string | null;
  origin: EntryOrigin;
  approval: Approval;
  shareWithProvider: boolean;
  sourceLabel: string | null;
}

export interface InsuranceProfile {
  id: string;
  insurer: string;
  policyName: string;
  policyType: string;
  coverageAmount: number | null;
  remainingLimit: number | null;
  deductible: number;
  copayPercent: number;
  roomRentLimit: number | null;
  exclusions: string[];
  networkStatus: string;
  preauthRequired: boolean;
  validUntil: string | null;
  confirmed: boolean;
}

export interface CareTask {
  id: string;
  title: string;
  category: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'done';
  notes: string | null;
}

interface DocRowDb {
  id: string; title: string; category: HealthDocument['category']; file_name: string | null;
  file_type: string | null; pages: number; extraction_status: ExtractionStatus; created_at: string;
}
interface EntryRowDb {
  id: string; document_id: string | null; entry_type: EntryType; title: string; detail: string | null;
  entry_date: string | null; origin: EntryOrigin; approval: Approval; share_with_provider: boolean;
  source_label: string | null;
}
interface InsuranceRowDb {
  id: string; insurer: string; policy_name: string; policy_type: string;
  coverage_amount: number | null; remaining_limit: number | null; deductible: number;
  copay_percent: number; room_rent_limit: number | null; exclusions: string[];
  network_status: string; preauth_required: boolean; valid_until: string | null; confirmed: boolean;
}
interface TaskRowDb {
  id: string; title: string; category: string; due_date: string | null;
  priority: CareTask['priority']; status: CareTask['status']; notes: string | null;
}

export async function loadHealthDocuments(): Promise<HealthDocument[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('health_documents').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return ((data ?? []) as DocRowDb[]).map((d) => ({
    id: d.id, title: d.title, category: d.category, fileName: d.file_name,
    fileType: d.file_type, pages: d.pages, extractionStatus: d.extraction_status, createdAt: d.created_at,
  }));
}

export async function loadTimeline(): Promise<TimelineEntry[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('timeline_entries').select('*').order('entry_date', { ascending: false, nullsFirst: false });
  if (error) return [];
  return ((data ?? []) as EntryRowDb[]).map((e) => ({
    id: e.id, documentId: e.document_id, entryType: e.entry_type, title: e.title, detail: e.detail,
    entryDate: e.entry_date, origin: e.origin, approval: e.approval,
    shareWithProvider: e.share_with_provider, sourceLabel: e.source_label,
  }));
}

export async function insertTimelineEntry(entry: {
  entryType: EntryType; title: string; detail: string | null; entryDate: string | null;
  origin: EntryOrigin; documentId?: string | null; sourceLabel?: string | null;
}): Promise<TimelineEntry | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('timeline_entries')
    .insert({
      document_id: entry.documentId ?? null,
      entry_type: entry.entryType,
      title: entry.title,
      detail: entry.detail,
      entry_date: entry.entryDate,
      origin: entry.origin,
      approval: entry.origin === 'patient-reported' ? 'approved' : 'pending_review',
      source_label: entry.sourceLabel ?? (entry.origin === 'patient-reported' ? 'Added by you · patient-reported' : 'Extracted from uploaded document'),
    })
    .select()
    .maybeSingle();
  if (error || !data) return null;
  const d = data as EntryRowDb;
  return {
    id: d.id, documentId: d.document_id, entryType: d.entry_type, title: d.title, detail: d.detail,
    entryDate: d.entry_date, origin: d.origin, approval: d.approval,
    shareWithProvider: d.share_with_provider, sourceLabel: d.source_label,
  };
}

export async function updateTimelineEntry(id: string, patch: {
  title?: string; detail?: string | null; approval?: Approval; shareWithProvider?: boolean;
}): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('timeline_entries').update({
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.detail !== undefined ? { detail: patch.detail } : {}),
    ...(patch.approval !== undefined ? { approval: patch.approval } : {}),
    ...(patch.shareWithProvider !== undefined ? { share_with_provider: patch.shareWithProvider } : {}),
  }).eq('id', id);
  return !error;
}

export async function deleteTimelineEntry(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('timeline_entries').delete().eq('id', id);
  return !error;
}

export async function loadInsuranceProfile(): Promise<InsuranceProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('insurance_profile').select('*').limit(1).maybeSingle();
  if (error || !data) return null;
  const d = data as InsuranceRowDb;
  return {
    id: d.id, insurer: d.insurer, policyName: d.policy_name, policyType: d.policy_type,
    coverageAmount: d.coverage_amount, remainingLimit: d.remaining_limit, deductible: d.deductible,
    copayPercent: d.copay_percent, roomRentLimit: d.room_rent_limit, exclusions: d.exclusions ?? [],
    networkStatus: d.network_status, preauthRequired: d.preauth_required,
    validUntil: d.valid_until, confirmed: d.confirmed,
  };
}

export async function saveInsuranceProfile(profile: Omit<InsuranceProfile, 'id'>): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const payload = {
    insurer: profile.insurer, policy_name: profile.policyName, policy_type: profile.policyType,
    coverage_amount: profile.coverageAmount, remaining_limit: profile.remainingLimit,
    deductible: profile.deductible, copay_percent: profile.copayPercent,
    room_rent_limit: profile.roomRentLimit, exclusions: profile.exclusions,
    network_status: profile.networkStatus, preauth_required: profile.preauthRequired,
    valid_until: profile.validUntil, confirmed: profile.confirmed,
    updated_at: new Date().toISOString(),
  };
  const existing = await loadInsuranceProfile();
  if (existing) {
    const { error } = await sb.from('insurance_profile').update(payload).eq('id', existing.id);
    return !error;
  }
  const { error } = await sb.from('insurance_profile').insert(payload);
  return !error;
}

export async function loadCareTasks(): Promise<CareTask[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('care_tasks').select('*').order('due_date', { ascending: true, nullsFirst: true });
  if (error) return [];
  return ((data ?? []) as TaskRowDb[]).map((d) => ({
    id: d.id, title: d.title, category: d.category, dueDate: d.due_date,
    priority: d.priority, status: d.status, notes: d.notes,
  }));
}

export async function insertCareTask(task: Omit<CareTask, 'id'>): Promise<CareTask | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('care_tasks').insert({
    title: task.title, category: task.category, due_date: task.dueDate,
    priority: task.priority, status: task.status, notes: task.notes,
  }).select().maybeSingle();
  if (error || !data) return null;
  const d = data as TaskRowDb;
  return {
    id: d.id, title: d.title, category: d.category, dueDate: d.due_date,
    priority: d.priority, status: d.status, notes: d.notes,
  };
}

export async function updateCareTask(id: string, patch: { status?: 'todo' | 'done'; dueDate?: string | null; priority?: 'low' | 'medium' | 'high' }): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const payload: Record<string, unknown> = {};
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.dueDate !== undefined) payload.due_date = patch.dueDate;
  if (patch.priority !== undefined) payload.priority = patch.priority;
  const { error } = await sb.from('care_tasks').update(payload).eq('id', id);
  return !error;
}

export async function deleteCareTask(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('care_tasks').delete().eq('id', id);
  return !error;
}

export async function insertHealthDocument(doc: {
  title: string; category: HealthDocument['category']; fileName: string | null;
  fileType: string | null; pages: number;
}): Promise<HealthDocument | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('health_documents').insert({
    title: doc.title, category: doc.category, file_name: doc.fileName,
    file_type: doc.fileType, pages: doc.pages,
    extraction_status: 'pending',
  }).select().maybeSingle();
  if (error || !data) return null;
  const d = data as DocRowDb;
  return {
    id: d.id, title: d.title, category: d.category, fileName: d.file_name,
    fileType: d.file_type, pages: d.pages, extractionStatus: d.extraction_status, createdAt: d.created_at,
  };
}

export async function updateDocumentExtraction(id: string, status: ExtractionStatus): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('health_documents').update({ extraction_status: status }).eq('id', id);
  return !error;
}

export interface GovFacility {
  id: string;
  name: string;
  facilityType: string;
  state: string | null;
  district: string | null;
  city: string | null;
  locality: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  specialties: string[];
  sourceName: string;
  sourceUrl: string | null;
  sourceRecordId: string | null;
  importDate: string;
  lastVerifiedAt: string | null;
  verificationStatus: 'VERIFIED' | 'REPORTED' | 'ESTIMATED' | 'DEMO' | 'STALE' | 'UNKNOWN';
}

export interface GovScheme {
  id: string;
  name: string;
  description: string;
  benefits: string | null;
  eligibilityNote: string;
  officialUrl: string | null;
  sourceName: string;
  verificationStatus: GovFacility['verificationStatus'];
}

export async function loadGovFacilities(): Promise<GovFacility[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('gov_facilities').select('*').order('name');
  if (error) return [];
  return ((data ?? []) as Array<Record<string, unknown>>).map((d) => ({
    id: String(d.id), name: String(d.name), facilityType: String(d.facility_type),
    state: (d.state as string) ?? null, district: (d.district as string) ?? null,
    city: (d.city as string) ?? null, locality: (d.locality as string) ?? null,
    address: (d.address as string) ?? null, phone: (d.phone as string) ?? null,
    website: (d.website as string) ?? null, specialties: (d.specialties as string[]) ?? [],
    sourceName: String(d.source_name), sourceUrl: (d.source_url as string) ?? null,
    sourceRecordId: (d.source_record_id as string) ?? null, importDate: String(d.import_date),
    lastVerifiedAt: (d.last_verified_at as string) ?? null,
    verificationStatus: d.verification_status as GovFacility['verificationStatus'],
  }));
}

export async function loadGovSchemes(): Promise<GovScheme[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('gov_schemes').select('*').order('name');
  if (error) return [];
  return ((data ?? []) as Array<Record<string, unknown>>).map((d) => ({
    id: String(d.id), name: String(d.name), description: String(d.description),
    benefits: (d.benefits as string) ?? null, eligibilityNote: String(d.eligibility_note),
    officialUrl: (d.official_url as string) ?? null, sourceName: String(d.source_name),
    verificationStatus: d.verification_status as GovScheme['verificationStatus'],
  }));
}
