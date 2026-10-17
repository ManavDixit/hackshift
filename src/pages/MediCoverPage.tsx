import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  Heart,
  IndianRupee,
  Info,
  Pill,
  Plus,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Stethoscope,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import {
  PROCEDURES,
  compareEstimates,
  loadHospitals,
  type DbHospital,
  type ProcedureSlug,
} from '@/lib/hospitalData';
import {
  loadInsuranceProfile,
  saveInsuranceProfile,
  type InsuranceProfile,
} from '@/lib/healthData';
import { estimateOutOfPocket } from '@/lib/insuranceCalc';

/* ─── helpers ─────────────────────────────────────── */
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

type Tab = 'insurance' | 'records' | 'estimator' | 'verify';

type Draft = Omit<InsuranceProfile, 'id'>;

const EMPTY_DRAFT: Draft = {
  insurer: '',
  policyName: '',
  policyType: 'Individual floater',
  coverageAmount: null,
  remainingLimit: null,
  deductible: 0,
  copayPercent: 0,
  roomRentLimit: null,
  exclusions: [],
  networkStatus: 'unknown',
  preauthRequired: false,
  validUntil: null,
  confirmed: false,
};

/* ─── demo medical records (client-side only) ──────── */
interface MedRecord {
  id: string;
  title: string;
  category: 'Allergy' | 'Condition' | 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Bill';
  date: string;
  detail: string;
  source: 'patient-reported' | 'uploaded';
}

const DEMO_RECORDS: MedRecord[] = [
  { id: 'r1', title: 'Penicillin allergy', category: 'Allergy', date: '2019-03', detail: 'Severe reaction noted — avoid all beta-lactam antibiotics.', source: 'patient-reported' },
  { id: 'r2', title: 'Hypertension (Stage 1)', category: 'Condition', date: '2022-08', detail: 'Managed with Amlodipine 5 mg once daily.', source: 'patient-reported' },
  { id: 'r3', title: 'Amlodipine 5 mg', category: 'Prescription', date: '2024-01', detail: '1 tablet daily — Dr. Mehra, Fortis Hospital', source: 'uploaded' },
  { id: 'r4', title: 'Lipid profile', category: 'Lab Report', date: '2024-03', detail: 'LDL 148 mg/dL, HDL 42 mg/dL. Follow-up in 6 months.', source: 'uploaded' },
  { id: 'r5', title: 'Apollo Discharge Summary', category: 'Discharge Summary', date: '2023-11', detail: 'Angioplasty procedure — 3 days stay, stent placed. Discharged without complications.', source: 'uploaded' },
];

const CATEGORY_ICONS: Record<MedRecord['category'], React.ElementType> = {
  Allergy: ShieldAlert,
  Condition: Heart,
  Prescription: Pill,
  'Lab Report': FlaskConical,
  'Discharge Summary': FileText,
  Bill: IndianRupee,
};

const CATEGORY_TONES: Record<MedRecord['category'], string> = {
  Allergy: 'bg-peach text-coral-500',
  Condition: 'bg-lavender text-violet-500',
  Prescription: 'bg-mint text-teal-600',
  'Lab Report': 'bg-sky text-primary-500',
  'Discharge Summary': 'bg-canvas text-ink-soft border border-line',
  Bill: 'bg-yellow-50 text-amber-600',
};

/* ─── demo bill-verify data ─────────────────────────── */
interface BillItem {
  id: string;
  label: string;
  category: string;
  estimateLow: number;
  estimateHigh: number;
  quotedAmount: number | null;
  status: 'ok' | 'flag' | 'info';
  note: string;
}

const DEMO_BILL_ITEMS: BillItem[] = [
  { id: 'b1', label: 'Specialist consultation', category: 'Consultation', estimateLow: 1500, estimateHigh: 3000, quotedAmount: 2500, status: 'ok', note: 'Within expected range.' },
  { id: 'b2', label: 'ICU bed charges (2 nights)', category: 'Room', estimateLow: 8000, estimateHigh: 12000, quotedAmount: 18000, status: 'flag', note: 'Quoted amount exceeds the estimated high. Verify room category and rate card with the hospital.' },
  { id: 'b3', label: 'Cardiac stent (DES)', category: 'Procedure', estimateLow: 30000, estimateHigh: 45000, quotedAmount: 42000, status: 'ok', note: 'Matches itemized range for this procedure.' },
  { id: 'b4', label: 'Nursing charges', category: 'Nursing', estimateLow: 2000, estimateHigh: 4000, quotedAmount: 3800, status: 'ok', note: 'Within expected range.' },
  { id: 'b5', label: 'Diagnostic tests — ECG, Echo', category: 'Diagnostics', estimateLow: 1200, estimateHigh: 2500, quotedAmount: 6000, status: 'flag', note: 'Quoted amount significantly higher. Check if tests were performed twice or if additional tests were added without prior notice.' },
  { id: 'b6', label: 'Medicines & consumables', category: 'Pharmacy', estimateLow: 3000, estimateHigh: 6000, quotedAmount: null, status: 'info', note: 'Final bill not received yet. Request an itemized pharmacy breakdown before discharge.' },
];

/* ════════════════════════════════════════════════════ */
/*  TAB: Insurance Profile                             */
/* ════════════════════════════════════════════════════ */
function InsuranceTab({
  profile, draft, setDraft, exclusionText, setExclusionText, saving, onSave, offline,
}: {
  profile: InsuranceProfile | null;
  draft: Draft;
  setDraft: (d: Draft) => void;
  exclusionText: string;
  setExclusionText: (s: string) => void;
  saving: boolean;
  onSave: (confirm: boolean) => void;
  offline: boolean;
}) {
  return (
    <div className="space-y-5">
      {offline && (
        <Notice kind="warn">Database not reachable — edits will not persist until connectivity is restored.</Notice>
      )}

      {/* status banner */}
      <div className={`flex items-start gap-3 rounded-2xl p-4 ${
        profile?.confirmed ? 'bg-mint/40 border border-teal-200'
          : profile ? 'bg-peach/40 border border-coral-200'
          : 'bg-sky/40 border border-primary-100'
      }`}>
        <span className="mt-0.5 shrink-0">
          {profile?.confirmed ? <ShieldCheck size={20} className="text-teal-600" />
            : profile ? <ShieldAlert size={20} className="text-coral-500" />
            : <ShieldOff size={20} className="text-primary-400" />}
        </span>
        <div>
          <p className="text-[13.5px] font-bold text-ink">
            {profile?.confirmed
              ? 'Insurance profile confirmed — cost calculations are active'
              : profile
              ? 'Policy saved but not confirmed — confirm to activate calculations'
              : 'No insurance profile added yet'}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            {profile?.confirmed
              ? `${profile.insurer} · ${profile.policyName} · Valid until ${profile.validUntil ?? 'not set'}`
              : 'Fill in your policy details below and confirm them to unlock insurance-aware estimates.'}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-[15px] font-bold text-ink">Policy details</h3>
        <p className="mt-0.5 text-[12px] text-ink-soft">
          Only <strong>confirmed</strong> values drive the insurance calculations. Unconfirmed entries are saved but never used in arithmetic.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="mc-ins">Insurer name</label>
            <input id="mc-ins" className="input" value={draft.insurer} onChange={(e) => setDraft({ ...draft, insurer: e.target.value })} placeholder="e.g. Star Health, HDFC Ergo" />
          </div>
          <div>
            <label className="label" htmlFor="mc-pname">Policy name / product</label>
            <input id="mc-pname" className="input" value={draft.policyName} onChange={(e) => setDraft({ ...draft, policyName: e.target.value })} placeholder="e.g. Comprehensive Care Plus" />
          </div>
          <div>
            <label className="label" htmlFor="mc-ptype">Policy type</label>
            <select id="mc-ptype" className="input" value={draft.policyType} onChange={(e) => setDraft({ ...draft, policyType: e.target.value })}>
              {['Individual floater', 'Family floater', 'Group', 'Government scheme', 'Top-up'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="mc-cov">Sum insured / coverage (₹)</label>
            <input id="mc-cov" type="number" className="input" value={draft.coverageAmount ?? ''} onChange={(e) => setDraft({ ...draft, coverageAmount: e.target.value ? Number(e.target.value) : null })} placeholder="e.g. 500000" />
          </div>
          <div>
            <label className="label" htmlFor="mc-rem">Remaining coverage (₹, if known)</label>
            <input id="mc-rem" type="number" className="input" value={draft.remainingLimit ?? ''} onChange={(e) => setDraft({ ...draft, remainingLimit: e.target.value ? Number(e.target.value) : null })} placeholder="Leave blank to use full sum insured" />
          </div>
          <div>
            <label className="label" htmlFor="mc-ded">Deductible (₹)</label>
            <input id="mc-ded" type="number" className="input" value={draft.deductible || ''} onChange={(e) => setDraft({ ...draft, deductible: Number(e.target.value) || 0 })} placeholder="0 if none" />
          </div>
          <div>
            <label className="label" htmlFor="mc-copay">Co-payment (%)</label>
            <input id="mc-copay" type="number" className="input" value={draft.copayPercent || ''} onChange={(e) => setDraft({ ...draft, copayPercent: Number(e.target.value) || 0 })} placeholder="0 if none" />
          </div>
          <div>
            <label className="label" htmlFor="mc-room">Room-rent limit (₹/day, if any)</label>
            <input id="mc-room" type="number" className="input" value={draft.roomRentLimit ?? ''} onChange={(e) => setDraft({ ...draft, roomRentLimit: e.target.value ? Number(e.target.value) : null })} placeholder="Leave blank if no sublimit" />
          </div>
          <div>
            <label className="label" htmlFor="mc-net">Network status</label>
            <select id="mc-net" className="input" value={draft.networkStatus} onChange={(e) => setDraft({ ...draft, networkStatus: e.target.value })}>
              <option value="unknown">Unknown</option>
              <option value="verified_in_network">Verified in-network</option>
              <option value="reported">Reported in-network (not verified)</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="mc-valid">Policy valid until</label>
            <input id="mc-valid" type="date" className="input" value={draft.validUntil ?? ''} onChange={(e) => setDraft({ ...draft, validUntil: e.target.value || null })} />
          </div>
          <label className="flex items-end gap-2 pb-2 text-[13px] font-semibold text-ink">
            <input type="checkbox" className="h-4 w-4 accent-primary-500" checked={draft.preauthRequired} onChange={(e) => setDraft({ ...draft, preauthRequired: e.target.checked })} />
            Pre-authorisation required
          </label>
        </div>

        <div className="mt-3">
          <label className="label" htmlFor="mc-excl">Exclusions / non-payables (one per line)</label>
          <textarea id="mc-excl" className="input min-h-[88px]" value={exclusionText} onChange={(e) => setExclusionText(e.target.value)} placeholder={'e.g. Pre-existing conditions (2-year waiting period)\nDental procedures\nCosmetic treatment'} />
        </div>

        <p className="mt-3 text-[11.5px] text-ink-faint">
          Demo mode — policy-document upload and OCR are not connected yet. Enter values manually as they appear in your policy document.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary text-[13px]" onClick={() => onSave(false)} disabled={saving}>
            Save without confirming
          </button>
          <button className="btn-primary text-[13px]" onClick={() => onSave(true)} disabled={saving}>
            <BadgeCheck size={15} /> I have reviewed — confirm these values
          </button>
        </div>
      </div>

      {profile?.confirmed && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Sum insured', value: profile.coverageAmount ? inr(profile.coverageAmount) : '—' },
            { label: 'Remaining coverage', value: profile.remainingLimit ? inr(profile.remainingLimit) : 'Full sum' },
            { label: 'Deductible', value: profile.deductible ? inr(profile.deductible) : 'None' },
            { label: 'Co-payment', value: profile.copayPercent ? `${profile.copayPercent}%` : 'None' },
          ].map((tile) => (
            <div key={tile.label} className="card p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{tile.label}</p>
              <p className="mt-1 font-display text-[18px] font-extrabold tabular-nums text-ink">{tile.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
/*  TAB: Past Medical Records                          */
/* ════════════════════════════════════════════════════ */
function RecordsTab() {
  const [records, setRecords] = useState<MedRecord[]>(DEMO_RECORDS);
  const [showAdd, setShowAdd] = useState(false);
  const [newRec, setNewRec] = useState<Omit<MedRecord, 'id' | 'source'>>({
    title: '', category: 'Condition', date: '', detail: '',
  });

  const handleAdd = () => {
    if (!newRec.title.trim()) return;
    setRecords((prev) => [{ ...newRec, id: `r${Date.now()}`, source: 'patient-reported' }, ...prev]);
    setNewRec({ title: '', category: 'Condition', date: '', detail: '' });
    setShowAdd(false);
  };

  const grouped = useMemo(() => {
    const map: Record<string, MedRecord[]> = {};
    for (const r of records) {
      if (!map[r.category]) map[r.category] = [];
      map[r.category].push(r);
    }
    return map;
  }, [records]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] font-bold text-ink">Medical timeline</h3>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            Your allergies, conditions, prescriptions and past reports — organized for quick sharing with care teams.
          </p>
        </div>
        <button className="btn-primary text-[13px]" onClick={() => setShowAdd((v) => !v)}>
          <Plus size={15} /> Add record
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-lavender/50 p-4">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-violet-500" />
        <div>
          <p className="text-[13px] font-bold text-ink">AI document extraction</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            Upload prescriptions, discharge summaries or diagnostic reports and MediCover AI will extract allergies, conditions, dates and relevant charges into your timeline. Extraction results require your review before they are used in any calculation.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-50">
            <Upload size={13} /> Upload a document (demo)
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card animate-fade-up p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-[14px] font-bold text-ink">New record</h4>
            <button onClick={() => setShowAdd(false)} className="rounded-lg p-1 text-ink-faint hover:bg-canvas"><X size={16} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input className="input" value={newRec.title} onChange={(e) => setNewRec({ ...newRec, title: e.target.value })} placeholder="e.g. Aspirin allergy" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={newRec.category} onChange={(e) => setNewRec({ ...newRec, category: e.target.value as MedRecord['category'] })}>
                {(['Allergy', 'Condition', 'Prescription', 'Lab Report', 'Discharge Summary', 'Bill'] as const).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date (approx.)</label>
              <input type="month" className="input" value={newRec.date} onChange={(e) => setNewRec({ ...newRec, date: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Detail / notes</label>
              <textarea className="input min-h-[72px]" value={newRec.detail} onChange={(e) => setNewRec({ ...newRec, detail: e.target.value })} placeholder="Relevant details, dosage, observations…" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn-primary text-[13px]" onClick={handleAdd}><Plus size={14} /> Add to timeline</button>
            <button className="btn-secondary text-[13px]" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, recs]) => {
          const Icon = CATEGORY_ICONS[cat as MedRecord['category']] ?? FileText;
          const tone = CATEGORY_TONES[cat as MedRecord['category']] ?? 'bg-canvas text-ink-soft';
          const [bgTone] = tone.split(' ');
          return (
            <div key={cat} className="card overflow-hidden">
              <div className={`flex items-center gap-2 border-b border-line px-5 py-3 ${bgTone} bg-opacity-30`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}><Icon size={14} /></span>
                <p className="font-display text-[13.5px] font-bold text-ink">{cat}</p>
                <span className="chip ml-auto border border-line bg-white/70 text-ink-faint">{recs.length}</span>
              </div>
              <ul className="divide-y divide-line">
                {recs.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold text-ink">{r.title}</p>
                        <span className={`chip text-[10.5px] ${r.source === 'uploaded' ? 'bg-sky text-primary-600' : 'bg-canvas border border-line text-ink-faint'}`}>
                          {r.source === 'uploaded' ? 'from document' : 'patient-reported'}
                        </span>
                      </div>
                      {r.detail && <p className="mt-0.5 text-[12px] text-ink-soft">{r.detail}</p>}
                      {r.date && <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-faint"><Clock size={10} /> {r.date}</p>}
                    </div>
                    <button
                      onClick={() => setRecords((p) => p.filter((x) => x.id !== r.id))}
                      className="mt-0.5 rounded p-1 text-ink-faint transition-colors hover:bg-peach hover:text-coral-500"
                      aria-label="Remove"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Notice kind="info">
        Records in this timeline are sample / patient-reported data for demonstration. In production, document extraction requires AI processing and your explicit review before any entry is used in calculations.
      </Notice>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
/*  TAB: Insurance-Aware Bill Estimator                */
/* ════════════════════════════════════════════════════ */
function EstimatorTab({ profile, hospitals, loading }: { profile: InsuranceProfile | null; hospitals: DbHospital[]; loading: boolean }) {
  const [procedure, setProcedure] = useState<ProcedureSlug>('angioplasty');
  const [expanded, setExpanded] = useState<string | null>(null);

  const comparisons = useMemo(() => compareEstimates(hospitals, procedure), [hospitals, procedure]);
  const confirmedProfile = profile?.confirmed ? profile : null;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse p-5">
            <div className="h-4 w-48 rounded bg-primary-50" />
            <div className="mt-2 h-3 w-32 rounded bg-primary-50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-[15px] font-bold text-ink">Insurance-aware hospital comparison</h3>
        <p className="mt-0.5 text-[12px] text-ink-soft">
          For each hospital, MediCover AI shows the estimated total bill, the potential insurance payment, and your expected out-of-pocket cost — side by side.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[13px] font-semibold text-ink" htmlFor="mc-proc">Treatment / procedure</label>
          <select id="mc-proc" className="input max-w-xs" value={procedure} onChange={(e) => setProcedure(e.target.value as ProcedureSlug)}>
            {PROCEDURES.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}
          </select>
        </div>
        {!confirmedProfile && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-yellow-50 px-3.5 py-2.5">
            <AlertTriangle size={14} className="shrink-0 text-amber-500" />
            <p className="text-[12.5px] font-semibold text-amber-800">
              Confirm your insurance profile to see insurance and out-of-pocket columns. Cost estimates are shown regardless.
            </p>
          </div>
        )}
      </div>

      {/* three-column legend */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Estimated hospital bill', desc: 'Sum of itemized treatment charges', color: 'bg-canvas border border-line', num: 'text-ink' },
          { label: 'Potential insurance payment', desc: 'Eligible after deductible, co-pay and limits', color: 'bg-sky/50 border border-primary-100', num: 'text-primary-600' },
          { label: 'Expected out-of-pocket', desc: 'Your estimated contribution', color: 'bg-mint/40 border border-teal-200', num: 'text-teal-700' },
        ].map((col) => (
          <div key={col.label} className={`rounded-2xl p-3.5 ${col.color}`}>
            <p className={`text-[11px] font-bold uppercase tracking-wide ${col.num}`}>{col.label}</p>
            <p className="mt-1 text-[11.5px] text-ink-soft">{col.desc}</p>
          </div>
        ))}
      </div>

      {comparisons.length === 0 && (
        <div className="card p-8 text-center">
          <Building2 size={32} className="mx-auto text-ink-faint" />
          <p className="mt-3 text-[13.5px] font-semibold text-ink-soft">No hospital cost data available for this treatment.</p>
          <p className="mt-1 text-[12px] text-ink-faint">Connect the database to load real hospital tariffs.</p>
        </div>
      )}

      <div className="space-y-3">
        {comparisons.map(({ hospital, estimate }, idx) => {
          const calc = estimateOutOfPocket(
            { estimateLow: estimate.totalLow, estimateHigh: estimate.totalHigh },
            confirmedProfile
          );
          const isOpen = expanded === hospital.id;
          const isLowest = idx === 0;

          return (
            <div key={hospital.id} className={`card overflow-hidden transition-shadow duration-200 ${isLowest ? 'ring-2 ring-teal-400/60' : ''}`}>
              {isLowest && (
                <div className="flex items-center gap-1.5 border-b border-teal-100 bg-mint/40 px-5 py-2">
                  <Zap size={13} className="text-teal-600" />
                  <span className="text-[11.5px] font-bold text-teal-700">Lowest estimated cost for this procedure</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[15px] font-bold text-ink">{hospital.name}</p>
                      <span className={`chip text-[11px] ${hospital.facilityStatus === 'government' ? 'bg-mint text-teal-700' : 'bg-lavender text-violet-700'}`}>
                        {hospital.facilityStatus === 'government' ? 'Government' : 'Private'}
                      </span>
                      {confirmedProfile && (
                        <span className={`chip text-[11px] ${hospital.networkStatus === 'verified_in_network' ? 'bg-sky text-primary-600' : 'bg-peach text-coral-600'}`}>
                          {hospital.networkStatus === 'verified_in_network' ? '✓ In-network' : 'Network unverified'}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-ink-soft">
                      {hospital.location}{hospital.distanceKm ? ` · ${hospital.distanceKm} km` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpanded(isOpen ? null : hospital.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                  >
                    {isOpen ? 'Hide breakdown' : 'View breakdown'}
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-line bg-canvas p-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">Estimated hospital bill</p>
                    <p className="mt-1 font-display text-[15px] font-extrabold tabular-nums text-ink">
                      {inr(estimate.totalLow)} – {inr(estimate.totalHigh)}
                    </p>
                    <p className="text-[10.5px] text-ink-faint">itemized · {hospital.source}</p>
                  </div>
                  <div className="rounded-xl border border-primary-100 bg-sky/40 p-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-primary-600">Potential insurance payment</p>
                    {calc.insurerPayable ? (
                      <>
                        <p className="mt-1 font-display text-[15px] font-extrabold tabular-nums text-ink">
                          {inr(calc.insurerPayable.low)} – {inr(calc.insurerPayable.high)}
                        </p>
                        <p className="text-[10.5px] text-ink-faint">after deductible & co-pay</p>
                      </>
                    ) : (
                      <p className="mt-1 text-[12.5px] font-semibold text-ink-soft">
                        {calc.status === 'needs-confirmation' ? 'Confirm policy first' : 'Add policy to unlock'}
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-teal-200 bg-mint/40 p-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-teal-700">Expected out-of-pocket</p>
                    {calc.outOfPocket ? (
                      <>
                        <p className="mt-1 font-display text-[15px] font-extrabold tabular-nums text-ink">
                          {inr(calc.outOfPocket.low)} – {inr(calc.outOfPocket.high)}
                        </p>
                        <p className="text-[10.5px] text-ink-faint">your share (estimate only)</p>
                      </>
                    ) : (
                      <p className="mt-1 text-[12.5px] font-semibold text-ink-soft">Awaiting policy</p>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 animate-fade-up space-y-3">
                    <p className="text-[12.5px] font-bold text-ink">Itemized charge breakdown</p>
                    <ul className="divide-y divide-line rounded-xl border border-line">
                      {estimate.categories.map((cat) => (
                        <li key={cat.category} className="flex items-center justify-between gap-3 px-4 py-2.5">
                          <p className="text-[12.5px] font-semibold text-ink">{cat.category}</p>
                          <span className="tabular-nums text-[12.5px] font-bold text-ink-soft">{inr(cat.low)} – {inr(cat.high)}</span>
                        </li>
                      ))}
                    </ul>
                    {calc.status === 'calculated' && (
                      <>
                        <p className="text-[12.5px] font-bold text-ink">Insurance calculation steps</p>
                        <ul className="divide-y divide-line rounded-xl border border-line">
                          {calc.lines.map((l, i) => (
                            <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
                              <div>
                                <p className="text-[12px] font-semibold text-ink">{l.label}</p>
                                <p className="text-[11px] text-ink-faint">{l.detail}</p>
                              </div>
                              {l.kind === 'info' ? (
                                <span className="chip border border-line bg-canvas text-ink-faint"><Info size={11} /> note</span>
                              ) : (
                                <span className="tabular-nums text-[12px] font-bold text-ink-soft">{inr(l.low)} – {inr(l.high)}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {calc.confirmationsNeeded.length > 0 && (
                      <div className="rounded-xl border border-peach bg-peach/30 p-3.5">
                        <p className="text-[12.5px] font-bold text-ink">Still to confirm with hospital / insurer</p>
                        <ul className="mt-2 space-y-1">
                          {calc.confirmationsNeeded.map((c) => (
                            <li key={c} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                              <AlertTriangle size={12} className="mt-0.5 shrink-0 text-coral-500" /> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Notice kind="warn">
        These are preliminary estimates based on sample itemized tariff data. MediLink does not guarantee that an insurer will approve or pay a claim. Final costs depend on policy wording, hospital billing, pre-authorisation and insurer adjudication. Having insurance does not automatically mean a hospital charges more — cost differences should be investigated using itemized evidence.
      </Notice>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
/*  TAB: Bill Verification & Overcharge Alerts         */
/* ════════════════════════════════════════════════════ */
function VerifyTab() {
  const flagged = DEMO_BILL_ITEMS.filter((b) => b.status === 'flag');
  const ok = DEMO_BILL_ITEMS.filter((b) => b.status === 'ok');
  const info = DEMO_BILL_ITEMS.filter((b) => b.status === 'info');

  const totalEstLow = DEMO_BILL_ITEMS.reduce((s, b) => s + b.estimateLow, 0);
  const totalEstHigh = DEMO_BILL_ITEMS.reduce((s, b) => s + b.estimateHigh, 0);
  const totalQuoted = DEMO_BILL_ITEMS.reduce((s, b) => s + (b.quotedAmount ?? 0), 0);
  const totalDiff = totalQuoted - totalEstHigh;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-[15px] font-bold text-ink">Bill verification & discrepancy review</h3>
        <p className="mt-0.5 text-[12px] text-ink-soft">
          Compare the hospital's quotation or itemized bill against tariff estimates. Differences are flagged for your review — not as automatic evidence of overcharging, but as items to clarify with the hospital.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Estimated range</p>
          <p className="mt-1 font-display text-[15px] font-extrabold tabular-nums text-ink">{inr(totalEstLow)} – {inr(totalEstHigh)}</p>
          <p className="text-[11px] text-ink-faint">based on itemized tariffs</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Hospital quoted amount</p>
          <p className="mt-1 font-display text-[15px] font-extrabold tabular-nums text-ink">{inr(totalQuoted)}</p>
          <p className="text-[11px] text-ink-faint">sum of quoted items (excl. pending)</p>
        </div>
        <div className={`card p-4 ${totalDiff > 0 ? 'border-coral-200 bg-peach/20' : 'border-teal-200 bg-mint/20'}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Difference vs estimate high</p>
          <p className={`mt-1 font-display text-[15px] font-extrabold tabular-nums ${totalDiff > 0 ? 'text-coral-600' : 'text-teal-600'}`}>
            {totalDiff > 0 ? '+' : ''}{inr(totalDiff)}
          </p>
          <p className="text-[11px] text-ink-faint">{totalDiff > 0 ? 'above estimate — review flagged items' : 'within estimate'}</p>
        </div>
      </div>

      {flagged.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-peach/40 px-5 py-3">
            <AlertTriangle size={15} className="text-coral-500" />
            <p className="font-display text-[13.5px] font-bold text-ink">Items requiring clarification ({flagged.length})</p>
          </div>
          <ul className="divide-y divide-line">
            {flagged.map((b) => (
              <li key={b.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-bold text-ink">{b.label}</p>
                      <span className="chip bg-peach text-[11px] text-coral-600">{b.category}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-ink-soft">{b.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-ink-faint">Estimate</p>
                    <p className="tabular-nums text-[12.5px] font-semibold text-ink-soft">{inr(b.estimateLow)} – {inr(b.estimateHigh)}</p>
                    <p className="mt-1 text-[11px] text-ink-faint">Quoted</p>
                    <p className="tabular-nums text-[13px] font-bold text-coral-600">{b.quotedAmount != null ? inr(b.quotedAmount) : '—'}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line bg-mint/30 px-5 py-3">
          <ShieldCheck size={15} className="text-teal-600" />
          <p className="font-display text-[13.5px] font-bold text-ink">Items within estimate ({ok.length})</p>
        </div>
        <ul className="divide-y divide-line">
          {ok.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-[13px] font-semibold text-ink">{b.label}</p>
                <p className="text-[11.5px] text-ink-soft">{b.note}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-ink-faint">Quoted</p>
                <p className="tabular-nums text-[13px] font-bold text-teal-600">{b.quotedAmount != null ? inr(b.quotedAmount) : '—'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {info.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-sky/30 px-5 py-3">
            <Info size={15} className="text-primary-500" />
            <p className="font-display text-[13.5px] font-bold text-ink">Pending items ({info.length})</p>
          </div>
          <ul className="divide-y divide-line">
            {info.map((b) => (
              <li key={b.id} className="px-5 py-3">
                <p className="text-[13px] font-semibold text-ink">{b.label}</p>
                <p className="text-[11.5px] text-ink-soft">{b.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-primary-500" />
          <h4 className="font-display text-[14px] font-bold text-ink">How to act on flagged items</h4>
        </div>
        <ol className="mt-3 space-y-2">
          {[
            "Request the hospital's itemized rate card for the flagged categories.",
            'Ask whether the room category billed matches the one you were admitted to.',
            'Check for duplicate line items — the same test or service appearing more than once.',
            'Confirm with your insurer which items are covered under your policy before discharge.',
            "If you believe a charge is incorrect, request a formal bill review through the hospital's billing department.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-ink-soft">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary-600">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <Notice kind="warn">
        A difference between an estimate and a quoted amount does not automatically mean a hospital has overcharged. Differences may arise from treatment complexity, room upgrades, additional services, or insurance-specific billing arrangements. Use this tool to identify items to clarify — not as a final determination.
      </Notice>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
/*  MAIN PAGE                                          */
/* ════════════════════════════════════════════════════ */
export function MediCoverPage() {
  const { lang } = useApp();
  const hi = lang === 'hi';

  const [activeTab, setActiveTab] = useState<Tab>('insurance');
  const [profile, setProfile] = useState<InsuranceProfile | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [exclusionText, setExclusionText] = useState('');
  const [saving, setSaving] = useState(false);
  const [hospitals, setHospitals] = useState<DbHospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, h] = await Promise.all([loadInsuranceProfile(), loadHospitals()]);
      setOffline(p === null && h.hospitals.length === 0);
      if (p) {
        setProfile(p);
        setDraft({ ...p });
        setExclusionText(p.exclusions.join('\n'));
      }
      setHospitals(h.hospitals);
      setLoadingHospitals(false);
    })();
  }, []);

  const handleSave = async (confirm: boolean) => {
    setSaving(true);
    const ok = await saveInsuranceProfile({
      ...draft,
      exclusions: exclusionText.split('\n').map((s) => s.trim()).filter(Boolean),
      confirmed: confirm,
    });
    if (ok) {
      const fresh = await loadInsuranceProfile();
      setProfile(fresh);
      if (fresh) setDraft({ ...fresh });
    }
    setSaving(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'insurance', label: 'Insurance Profile', icon: ShieldCheck },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'estimator', label: 'Bill Estimator', icon: IndianRupee },
    { id: 'verify', label: 'Bill Verification', icon: AlertTriangle, badge: 2 },
  ];

  return (
    <AppShell
      title="MediCover AI"
      subtitle={hi ? 'बीमा और चिकित्सा इतिहास प्रबंधक' : 'Insurance & Medical History Manager'}
    >
      {/* hero gradient band */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-teal-500 p-5 text-white shadow-lift">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-white/80" />
              <p className="font-display text-[18px] font-extrabold">MediCover AI</p>
            </div>
            <p className="mt-1 max-w-xl text-[13px] text-white/80">
              Know your real cost — estimated hospital bill, potential insurance payment, and your out-of-pocket share — before you walk in.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.confirmed ? (
              <span className="chip bg-white/20 text-[12px] text-white"><ShieldCheck size={12} /> Policy confirmed</span>
            ) : (
              <span className="chip bg-white/20 text-[12px] text-white"><ShieldAlert size={12} /> Policy not confirmed</span>
            )}
            <span className="chip bg-white/20 text-[12px] text-white"><Stethoscope size={12} /> {hospitals.length} hospitals loaded</span>
          </div>
        </div>
      </div>

      {/* tab bar */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-canvas p-1.5" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-card'
                  : 'text-ink-soft hover:bg-white/60 hover:text-ink'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {tab.badge && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[9px] font-bold text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* tab panels */}
      <div role="tabpanel">
        {activeTab === 'insurance' && (
          <InsuranceTab
            profile={profile}
            draft={draft}
            setDraft={setDraft}
            exclusionText={exclusionText}
            setExclusionText={setExclusionText}
            saving={saving}
            onSave={handleSave}
            offline={offline}
          />
        )}
        {activeTab === 'records' && <RecordsTab />}
        {activeTab === 'estimator' && (
          <EstimatorTab profile={profile} hospitals={hospitals} loading={loadingHospitals} />
        )}
        {activeTab === 'verify' && <VerifyTab />}
      </div>
    </AppShell>
  );
}
