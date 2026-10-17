import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Heart,
  IndianRupee,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import {
  loadHospitals,
  freshnessLabel,
  PROCEDURES,
  type DbHospital,
  type ProcedureSlug,
} from '@/lib/hospitalData';
import {
  DEFAULT_REQUIREMENTS,
  formatInr,
  matchHospitals,
  procedureService,
  reasonLabel,
  serviceLabel,
  warningLabel,
  type MatchingRequirements,
  type RankedHospital,
  type WeightKey,
} from '@/lib/hospitalMatch';

const inr = formatInr;

/* ─── Status chip ──────────────────────────── */
function StatusChip({ status, children }: { status: 'verified' | 'reported' | 'unknown'; children: React.ReactNode }) {
  const cls =
    status === 'verified' ? 'bg-mint text-teal-700'
    : status === 'reported' ? 'bg-sky text-primary-600'
    : 'bg-peach text-coral-600';
  const Icon = status === 'verified' ? CheckCircle2 : status === 'reported' ? Info : XCircle;
  return <span className={`chip ${cls}`}><Icon size={12} /> {children}</span>;
}

/* ─── Scheme eligibility data ──────────────── */
interface GovScheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  coverageAmount: number;
  eligibilityNote: string;
  applies: (req: ExtendedReq) => boolean;
  color: string;
  textColor: string;
}

interface ExtendedReq extends MatchingRequirements {
  familyIncome: 'below_1l' | '1l_to_3l' | '3l_to_6l' | 'above_6l' | 'unknown';
  hasRationCard: boolean;
  isGovernmentEmployee: boolean;
  patientAge: 'below_18' | '18_to_59' | '60_plus' | 'unknown';
  preferredHospitalType: 'any' | 'government' | 'private';
  budgetSensitivity: 'very_tight' | 'moderate' | 'comfortable' | 'no_limit';
}

const SCHEMES: GovScheme[] = [
  {
    id: 'pmjay',
    name: 'Ayushman Bharat PM-JAY',
    shortName: 'PM-JAY',
    description: 'Government health insurance for low-income families. Covers secondary and tertiary hospitalisation at empanelled hospitals.',
    coverageAmount: 500000,
    eligibilityNote: 'Based on SECC 2011 deprivation criteria. Eligibility must be verified at the hospital or on the PMJAY portal.',
    applies: (req) =>
      req.familyIncome === 'below_1l' || req.familyIncome === '1l_to_3l' || req.hasRationCard,
    color: 'bg-amber-50 border border-amber-200',
    textColor: 'text-amber-800',
  },
  {
    id: 'cghs',
    name: 'Central Govt. Health Scheme (CGHS)',
    shortName: 'CGHS',
    description: 'Comprehensive healthcare for central government employees, pensioners, and their dependants.',
    coverageAmount: 0,
    eligibilityNote: 'Only for current and retired central government employees and their registered dependants.',
    applies: (req) => req.isGovernmentEmployee,
    color: 'bg-sky/40 border border-primary-100',
    textColor: 'text-primary-800',
  },
  {
    id: 'janani',
    name: 'Janani Suraksha Yojana (JSY)',
    shortName: 'JSY',
    description: 'Cash assistance and free delivery services for pregnant women at government institutions.',
    coverageAmount: 0,
    eligibilityNote: 'For pregnant women, especially below poverty line. Delivered at government health centres.',
    applies: () => false, // can be expanded based on condition
    color: 'bg-lavender border border-violet-100',
    textColor: 'text-violet-800',
  },
];

const DEFAULT_EXTENDED: ExtendedReq = {
  ...DEFAULT_REQUIREMENTS,
  familyIncome: 'unknown',
  hasRationCard: false,
  isGovernmentEmployee: false,
  patientAge: 'unknown',
  preferredHospitalType: 'any',
  budgetSensitivity: 'moderate',
};

/* ────────────────────────────────────────────────────
   STEP 1 — Needs questionnaire
──────────────────────────────────────────────────── */
function NeedsForm({
  req, setReq, weights, setWeights, onNext,
}: {
  req: ExtendedReq;
  setReq: React.Dispatch<React.SetStateAction<ExtendedReq>>;
  weights: Record<WeightKey, number>;
  setWeights: React.Dispatch<React.SetStateAction<Record<WeightKey, number>>>;
  onNext: () => void;
}) {
  const set = <K extends keyof ExtendedReq>(key: K, value: ExtendedReq[K]) =>
    setReq((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto max-w-2xl animate-fade-up space-y-5">
      {/* treatment */}
      <div className="card p-5">
        <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-ink-faint">
          <Filter size={13} /> Step 1 of 3 — Treatment & urgency
        </p>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="fc-proc">What service or treatment do you need?</label>
            <select id="fc-proc" className="input" value={req.procedure} onChange={(e) => set('procedure', e.target.value as ProcedureSlug)}>
              {PROCEDURES.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Is this an emergency or a planned visit?</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['planned', 'emergency'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => set('urgency', u)}
                  className={`rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-all ${req.urgency === u ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-line bg-white text-ink-soft hover:border-primary-200'}`}
                >
                  {u === 'planned' ? 'Planned visit' : 'Emergency'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* patient & family background */}
      <div className="card p-5">
        <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-ink-faint">
          <Heart size={13} /> Step 2 of 3 — Patient & family background
        </p>
        <p className="mb-3 text-[12px] text-ink-soft">
          This helps us check which government schemes may be available to you. All fields are optional.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fc-income">Annual household income (approx.)</label>
            <select id="fc-income" className="input" value={req.familyIncome} onChange={(e) => set('familyIncome', e.target.value as ExtendedReq['familyIncome'])}>
              <option value="unknown">Prefer not to say</option>
              <option value="below_1l">Below ₹1 lakh</option>
              <option value="1l_to_3l">₹1 – 3 lakh</option>
              <option value="3l_to_6l">₹3 – 6 lakh</option>
              <option value="above_6l">Above ₹6 lakh</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fc-age">Patient age group</label>
            <select id="fc-age" className="input" value={req.patientAge} onChange={(e) => set('patientAge', e.target.value as ExtendedReq['patientAge'])}>
              <option value="unknown">Not specified</option>
              <option value="below_18">Below 18</option>
              <option value="18_to_59">18 – 59 years</option>
              <option value="60_plus">60 years or older</option>
            </select>
          </div>
        </div>
        <div className="mt-3 space-y-2.5 rounded-xl border border-line bg-canvas p-3.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-ink">
            <input type="checkbox" className="h-4 w-4 accent-primary-500" checked={req.hasRationCard} onChange={(e) => set('hasRationCard', e.target.checked)} />
            Family has a BPL / ration card
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-ink">
            <input type="checkbox" className="h-4 w-4 accent-primary-500" checked={req.isGovernmentEmployee} onChange={(e) => set('isGovernmentEmployee', e.target.checked)} />
            Patient or family member is a central/state government employee or pensioner
          </label>
        </div>
      </div>

      {/* preferences */}
      <div className="card p-5">
        <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-ink-faint">
          <SlidersHorizontal size={13} /> Step 3 of 3 — Preferences & access needs
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fc-htype">Preferred hospital type</label>
            <select id="fc-htype" className="input" value={req.preferredHospitalType} onChange={(e) => set('preferredHospitalType', e.target.value as ExtendedReq['preferredHospitalType'])}>
              <option value="any">Any (show both)</option>
              <option value="government">Government hospitals first</option>
              <option value="private">Private hospitals only</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fc-budget-sens">Budget sensitivity</label>
            <select id="fc-budget-sens" className="input" value={req.budgetSensitivity} onChange={(e) => set('budgetSensitivity', e.target.value as ExtendedReq['budgetSensitivity'])}>
              <option value="very_tight">Very tight — lowest cost is critical</option>
              <option value="moderate">Moderate — balance of cost and quality</option>
              <option value="comfortable">Comfortable — quality over cost</option>
              <option value="no_limit">No budget constraint</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fc-dist">Maximum travel distance</label>
            <select id="fc-dist" className="input" value={req.maxDistanceKm ?? ''} onChange={(e) => set('maxDistanceKm', e.target.value ? Number(e.target.value) : null)}>
              <option value="">No limit</option>
              <option value={5}>Up to 5 km</option>
              <option value={10}>Up to 10 km</option>
              <option value={15}>Up to 15 km</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fc-maxbud">Max budget — lower estimate (₹)</label>
            <select id="fc-maxbud" className="input" value={req.maxBudgetLow ?? ''} onChange={(e) => set('maxBudgetLow', e.target.value ? Number(e.target.value) : null)}>
              <option value="">No limit</option>
              <option value={30000}>Up to ₹30,000</option>
              <option value={60000}>Up to ₹60,000</option>
              <option value={80000}>Up to ₹80,000</option>
              <option value={100000}>Up to ₹1,00,000</option>
            </select>
          </div>
        </div>
        <div className="mt-3 space-y-2.5 rounded-xl border border-line bg-canvas p-3.5">
          {([
            ['governmentOnly', 'Government facilities only (mandatory filter)'],
            ['wheelchairRequired', 'Wheelchair accessibility required'],
            ['requireInNetwork', 'Must be in my insurance network'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-ink">
              <input type="checkbox" className="h-4 w-4 accent-primary-500" checked={req[key]} onChange={(e) => set(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
        {/* ranking weights */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(['cost', 'distance', 'network'] as const).map((k) => (
            <div key={k}>
              <label className="label" htmlFor={`w-${k}`}>
                {k === 'cost' ? 'Lower cost priority' : k === 'distance' ? 'Proximity priority' : 'Insurance network priority'}
              </label>
              <input
                id={`w-${k}`} type="range" min={0} max={3} step={1}
                value={weights[k]}
                onChange={(e) => setWeights((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                className="w-full accent-primary-500"
              />
              <p className="text-[11px] font-medium text-ink-faint">{weights[k] === 0 ? 'Ignore' : `Weight ${weights[k]}`}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary w-full justify-center text-[14px]" onClick={onNext}>
        Show matching hospitals <ArrowRight size={15} />
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Scheme eligibility panel
──────────────────────────────────────────────────── */
function SchemePanel({ req }: { req: ExtendedReq }) {
  const [open, setOpen] = useState(true);
  const eligible = SCHEMES.filter((s) => s.applies(req));

  if (eligible.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-canvas p-4 text-[12.5px] text-ink-soft">
        <p className="font-semibold text-ink">Government scheme eligibility</p>
        <p className="mt-1">Based on your inputs, no specific scheme eligibility was identified. If your income or circumstances change, update Step 2 to check again. You can also visit <strong>pmjay.gov.in</strong> or your local government hospital to check directly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
      <button
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-500" />
          <p className="font-display text-[13.5px] font-bold text-amber-900">
            {eligible.length} government scheme{eligible.length > 1 ? 's' : ''} may apply
          </p>
        </div>
        {open ? <ChevronDown size={16} className="text-amber-600" /> : <ChevronRight size={16} className="text-amber-600" />}
      </button>
      {open && (
        <div className="border-t border-amber-200 divide-y divide-amber-100">
          {eligible.map((scheme) => (
            <div key={scheme.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`chip text-[11px] ${scheme.color} ${scheme.textColor}`}>
                  <BadgeCheck size={11} /> {scheme.shortName}
                </span>
                <p className="font-semibold text-[13px] text-amber-900">{scheme.name}</p>
              </div>
              <p className="mt-1.5 text-[12.5px] text-amber-800">{scheme.description}</p>
              {scheme.coverageAmount > 0 && (
                <p className="mt-1 text-[12px] font-bold text-amber-700">
                  Coverage up to ₹{(scheme.coverageAmount / 100000).toFixed(0)} lakh per family per year
                </p>
              )}
              <div className="mt-2 flex items-start gap-1.5">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-[11.5px] text-amber-700">{scheme.eligibilityNote}</p>
              </div>
            </div>
          ))}
          <div className="px-4 py-3 bg-amber-100/50">
            <p className="text-[11.5px] text-amber-700">
              ⚠ Scheme eligibility shown here is indicative only — based on your inputs. Actual eligibility must be verified at the hospital scheme desk or official portal. MediLink does not confirm or guarantee coverage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Hospital result card
──────────────────────────────────────────────────── */
function HospitalCard({
  ranked,
  idx,
  isSelected,
  req,
  onSelect,
}: {
  ranked: RankedHospital;
  idx: number;
  isSelected: boolean;
  req: ExtendedReq;
  onSelect: () => void;
}) {
  const { hospital: h, estimateLow, estimateHigh, factors, warnings } = ranked;
  const isGov = h.facilityStatus === 'government';
  const govPreferred = req.preferredHospitalType === 'government';

  return (
    <button
      onClick={onSelect}
      className={`card w-full p-5 text-left transition-all duration-300 hover:shadow-lift ${isSelected ? 'ring-2 ring-primary-200' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isGov ? 'bg-mint text-teal-600' : 'bg-sky text-primary-500'}`}>
            <Building2 size={19} />
          </span>
          <div>
            <h3 className="font-display text-[15.5px] font-bold text-ink">
              {idx === 0 && (
                <span className="mr-1.5 rounded-md bg-mint px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-teal-700">Best match</span>
              )}
              {h.name}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] font-medium text-ink-soft">
              <span className="flex items-center gap-1"><MapPin size={11} /> {h.location}</span>
              <span className={`chip text-[11px] ${isGov ? 'bg-mint text-teal-700' : 'bg-lavender text-violet-700'}`}>
                {isGov ? 'Government' : 'Private'}
              </span>
              {govPreferred && isGov && (
                <span className="chip bg-amber-50 text-[11px] text-amber-700 border border-amber-200">
                  <Star size={10} /> Your preference
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Estimated total</p>
          <p className="font-display text-[16px] font-extrabold tabular-nums text-ink">{inr(estimateLow)} – {inr(estimateHigh)}</p>
          <p className="text-[10.5px] text-ink-faint">itemized · {h.source}</p>
        </div>
      </div>

      {/* reason factors */}
      <ul className="mt-3 space-y-1">
        {factors.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" /> {f}
          </li>
        ))}
      </ul>

      {/* data freshness */}
      <p className="mt-2 text-[11px] text-ink-faint">
        Data: {h.source} · {freshnessLabel(h.updatedHoursAgo)}
      </p>

      {/* warnings */}
      {warnings.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {warnings.map((w, i) => (
            <span key={i} className="chip bg-peach text-coral-600">
              <AlertTriangle size={11} /> {warningLabel(w)}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

/* ────────────────────────────────────────────────────
   Detail panel (sticky sidebar)
──────────────────────────────────────────────────── */
function DetailPanel({ selected, req }: { selected: RankedHospital; req: ExtendedReq }) {
  const h = selected.hospital;
  const isGov = h.facilityStatus === 'government';
  const eligibleSchemes = SCHEMES.filter((s) => s.applies(req));

  return (
    <div className="card sticky top-24 space-y-4 p-5">
      <div>
        <h3 className="font-display text-[16px] font-bold text-ink">{h.name}</h3>
        <p className="mt-0.5 text-[12px] font-medium text-ink-soft">Why this facility fits your needs</p>
      </div>

      {/* recommendation reasoning */}
      <div className="rounded-xl bg-sky/40 p-3.5 text-[12.5px] leading-relaxed text-ink-soft space-y-2">
        <p>
          This facility provides the requested <strong>{serviceLabel(procedureService(req.procedure))}</strong> service and satisfies all mandatory requirements you set.
        </p>
        {isGov && (
          <p>
            As a <strong>government hospital</strong>, it may accept Ayushman Bharat PM-JAY and other state schemes — confirm at the hospital's scheme desk before admission.
          </p>
        )}
        {req.budgetSensitivity === 'very_tight' && (
          <p>
            You indicated a <strong>very tight budget</strong>. This hospital has been prioritised by lowest estimated cost. Verify final tariffs directly with the billing department.
          </p>
        )}
        <p>
          Insurance network status is{' '}
          <strong>
            {h.networkStatus === 'verified_in_network'
              ? 'verified'
              : h.networkStatus === 'reported'
              ? 'reported (not independently verified)'
              : 'unknown — confirm with your insurer'}
          </strong>.
        </p>
      </div>

      {/* scheme match in context */}
      {isGov && eligibleSchemes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <p className="text-[12.5px] font-bold text-amber-800">
            <Star size={13} className="inline mr-1 text-amber-500" />
            Scheme benefit estimate for this hospital
          </p>
          {eligibleSchemes.map((s) => (
            <div key={s.id} className="mt-2">
              <p className="text-[12px] font-semibold text-amber-700">{s.shortName}</p>
              {s.coverageAmount > 0 ? (
                <p className="text-[11.5px] text-amber-700">
                  If eligible and approved: up to <strong>₹{(s.coverageAmount / 100000).toFixed(0)} lakh</strong> covered. Your share may be <strong>₹0 – ₹{inr(Math.max(0, selected.estimateHigh - s.coverageAmount))}</strong> depending on claim approval.
                </p>
              ) : (
                <p className="text-[11.5px] text-amber-700">Benefits are service-based. Confirm specifics at the hospital scheme desk.</p>
              )}
            </div>
          ))}
          <p className="mt-2 text-[11px] text-amber-600">These figures are illustrative — not a confirmed benefit or guarantee of coverage.</p>
        </div>
      )}

      {/* status chips */}
      <div className="flex flex-wrap gap-2">
        <StatusChip status={h.networkStatus === 'verified_in_network' ? 'verified' : h.networkStatus === 'reported' ? 'reported' : 'unknown'}>
          {h.networkStatus === 'verified_in_network' ? 'Insurance: verified' : h.networkStatus === 'reported' ? 'Insurance: reported' : 'Insurance: unknown'}
        </StatusChip>
        <StatusChip status={h.wheelchairStatus}>
          {h.wheelchairStatus === 'verified' ? 'Wheelchair: verified' : h.wheelchairStatus === 'reported' ? 'Wheelchair: reported' : 'Wheelchair: unknown'}
        </StatusChip>
        <StatusChip status={isGov ? 'verified' : 'reported'}>
          {isGov ? 'Government facility' : 'Private facility'}
        </StatusChip>
      </div>

      {/* contact & data source */}
      <div className="space-y-1.5 text-[12.5px]">
        {h.address && <p className="flex items-start gap-1.5 text-ink-soft"><MapPin size={13} className="mt-0.5 shrink-0" /> {h.address}</p>}
        {h.phone && <p className="flex items-center gap-1.5 text-ink-soft"><Phone size={13} className="shrink-0" /> {h.phone} <span className="text-ink-faint">(sample)</span></p>}
        {h.networkVerifiedHoursAgo !== null && (
          <p className="flex items-center gap-1.5 text-ink-soft">
            <ShieldCheck size={13} className="shrink-0" /> Network status {freshnessLabel(h.networkVerifiedHoursAgo)}
          </p>
        )}
        <p className="flex items-center gap-1.5 text-ink-faint">
          <Info size={13} className="shrink-0" /> Source: {h.source} · tariffs {freshnessLabel(h.updatedHoursAgo)}
        </p>
      </div>

      <Notice kind="info">
        MediLink does not book appointments or guarantee availability, scheme coverage, or tariff accuracy. Verify all information directly with the facility.
      </Notice>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────── */
export function FindCarePage() {
  const { lang } = useApp();
  const hi = lang === 'hi';
  const [step, setStep] = useState<1 | 2>(1);
  const [hospitals, setHospitals] = useState<DbHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [req, setReq] = useState<ExtendedReq>(DEFAULT_EXTENDED);
  const [weights, setWeights] = useState<Record<WeightKey, number>>({ cost: 1, distance: 1, network: 1 });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await loadHospitals();
      setHospitals(res.hospitals);
      setOffline(res.offline || res.hospitals.length === 0);
      setLoading(false);
    })();
  }, []);

  // boost cost weight if budget-sensitive
  const effectiveWeights = useMemo<Record<WeightKey, number>>(() => {
    const boost = req.budgetSensitivity === 'very_tight' ? 2 : req.budgetSensitivity === 'moderate' ? 1 : 0;
    return { ...weights, cost: Math.min(3, weights.cost + boost) };
  }, [weights, req.budgetSensitivity]);

  // apply government-only if preferredHospitalType === 'government' (but not as hard filter — only hard filter if checkbox)
  const matchReq = useMemo<MatchingRequirements>(() => ({
    ...req,
    governmentOnly: req.governmentOnly || req.preferredHospitalType === 'government',
  }), [req]);

  const result = useMemo(() => matchHospitals(hospitals, matchReq, effectiveWeights), [hospitals, matchReq, effectiveWeights]);

  // Sort: if government preferred, float government hospitals to top within eligible list
  const sortedEligible = useMemo(() => {
    if (req.preferredHospitalType !== 'government') return result.eligible;
    return [...result.eligible].sort((a, b) => {
      const aGov = a.hospital.facilityStatus === 'government' ? 0 : 1;
      const bGov = b.hospital.facilityStatus === 'government' ? 0 : 1;
      return aGov - bGov;
    });
  }, [result.eligible, req.preferredHospitalType]);

  const selected = sortedEligible.find((r) => r.hospital.slug === selectedSlug) ?? sortedEligible[0] ?? null;

  return (
    <AppShell
      title={hi ? 'सही अस्पताल खोजें' : 'Find the Right Hospital'}
      subtitle="Clinical suitability first — then affordability, distance, and availability"
    >
      {/* hero */}
      <div className="mb-6">
        <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          {hi ? 'बताइए आपको क्या चाहिए — हम वही दिखाएँगे।' : 'Tell us what you need — we only show what truly fits.'}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
          Recommendations are based on <strong>clinical suitability first</strong>, then specialty evidence, affordability, distance, and verified availability. Government scheme eligibility is checked automatically. Hospitals that cannot meet your essential requirements are removed — not just ranked lower.
        </p>
      </div>

      {step === 1 && req.urgency === 'emergency' && (
        <div className="mb-6">
          <Notice kind="warn">
            <span className="flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              For an emergency, call <strong>108</strong> (ambulance) or <strong>112</strong> immediately or go to the nearest hospital. Do not wait for cost comparisons.
            </span>
          </Notice>
        </div>
      )}

      {loading && (
        <div className="card animate-pulse p-6">
          <div className="h-4 w-40 rounded bg-primary-50" />
          <div className="mt-3 h-3 w-72 rounded bg-primary-50" />
        </div>
      )}

      {offline && !loading && (
        <Notice kind="warn">
          The reference database is not reachable right now. Please try again shortly.
        </Notice>
      )}

      {!loading && !offline && step === 1 && (
        <NeedsForm req={req} setReq={setReq} weights={weights} setWeights={setWeights} onNext={() => setStep(2)} />
      )}

      {!loading && !offline && step === 2 && (
        <div className="animate-fade-up">
          <button className="btn-secondary mb-5 text-[13px]" onClick={() => setStep(1)}>
            <ArrowLeft size={14} /> Change needs
          </button>

          {/* scheme eligibility panel */}
          <div className="mb-5">
            <SchemePanel req={req} />
          </div>

          {sortedEligible.length === 0 ? (
            <div className="card p-8 text-center">
              <Building2 size={32} className="mx-auto text-ink-faint" />
              <h3 className="mt-3 font-display text-[16px] font-bold text-ink">
                No hospital meets all of your mandatory requirements
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-[13px] leading-relaxed text-ink-soft">
                We did not weaken your requirements. Review which requirement could not be satisfied below — you can relax a specific one if you choose.
              </p>
              <button className="btn-secondary mx-auto mt-4 text-[13px]" onClick={() => setStep(1)}>
                <ArrowLeft size={14} /> Review requirements
              </button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-7">
              {/* left: list */}
              <div className="space-y-4 lg:col-span-4">
                {/* result summary */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-ink-soft">
                    <span className="font-bold text-ink">{sortedEligible.length}</span> hospital{sortedEligible.length !== 1 ? 's' : ''} match your requirements
                    {req.preferredHospitalType === 'government' && <span className="ml-1.5 chip bg-mint text-teal-700 text-[11px]"><Star size={10} /> Government first</span>}
                  </p>
                  <p className="text-[11.5px] text-ink-faint flex items-center gap-1">
                    <Info size={12} /> Ranked by: {effectiveWeights.cost >= 2 ? 'cost · ' : ''}{effectiveWeights.distance >= 2 ? 'distance · ' : ''}{effectiveWeights.network >= 2 ? 'network · ' : ''}clinical suitability
                  </p>
                </div>

                {sortedEligible.map((r, idx) => (
                  <HospitalCard
                    key={r.hospital.slug}
                    ranked={r}
                    idx={idx}
                    isSelected={selected?.hospital.slug === r.hospital.slug}
                    req={req}
                    onSelect={() => setSelectedSlug(r.hospital.slug)}
                  />
                ))}

                {/* data transparency note */}
                <div className="rounded-xl border border-line bg-canvas p-4 text-[12px] text-ink-faint space-y-1">
                  <p className="flex items-center gap-1.5 font-semibold text-ink-soft"><Sparkles size={12} /> Data transparency</p>
                  <p>• <strong>Verified</strong> — independently confirmed</p>
                  <p>• <strong>Reported</strong> — stated by the facility, not independently confirmed</p>
                  <p>• <strong>Unknown</strong> — no data available; treat as unconfirmed</p>
                  <p>• Cost figures are itemized tariff <em>estimates</em>, not final bills or quotes.</p>
                  <p>• Scheme benefits are indicative only. Actual coverage depends on insurer/scheme adjudication.</p>
                </div>
              </div>

              {/* right: detail */}
              <div className="lg:col-span-3">
                {selected && <DetailPanel selected={selected} req={req} />}
              </div>
            </div>
          )}

          {/* excluded hospitals */}
          {result.excluded.length > 0 && (
            <div className="card mt-6 p-5">
              <h3 className="text-[13.5px] font-bold text-ink">Excluded by your mandatory requirements</h3>
              <p className="mt-1 text-[12px] font-medium text-ink-faint">
                These facilities were filtered out entirely — not ranked lower. If a reason looks wrong, change that requirement in Step 1.
              </p>
              <ul className="mt-3 divide-y divide-line">
                {result.excluded.map(({ hospital, reason }) => (
                  <li key={hospital.slug} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div>
                      <span className="text-[13px] font-semibold text-ink">{hospital.name}</span>
                      <span className="ml-2 chip text-[11px] bg-canvas text-ink-faint border border-line">
                        {hospital.facilityStatus === 'government' ? 'Government' : 'Private'}
                      </span>
                    </div>
                    <span className="chip bg-peach text-coral-600"><XCircle size={11} /> {reasonLabel(reason)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* alternative suggestion when government preferred but none found */}
          {req.preferredHospitalType === 'government' && sortedEligible.every(r => r.hospital.facilityStatus !== 'government') && sortedEligible.length > 0 && (
            <Notice kind="warn">
              No government hospitals matched your requirements for this procedure. The results above show suitable private hospitals. You can also visit a government district hospital directly to inquire about availability.
            </Notice>
          )}
        </div>
      )}
    </AppShell>
  );
}
