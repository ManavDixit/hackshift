import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronRight,
  Droplets,
  ExternalLink,
  HandHeart,
  Info,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Siren,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import {
  BLOOD_GROUPS,
  BLOOD_COMPONENTS,
  INDIAN_STATES,
  searchBloodBanks,
  buildEraktkoshUrl,
  DIRECTORY_DATE,
  type BloodBank,
  type BloodGroup,
  type BloodComponent,
  type SearchQuery,
} from '@/lib/bloodBankData';

/* ─── Donation stages ───────────────────────────── */
const donationStages = [
  'Donor registered',
  'Eligibility check',
  'Appointment scheduled',
  'Donation completed',
  'Thank-you & records',
];

/* ─── FacilityType chip ─────────────────────────── */
function FacilityChip({ type }: { type: BloodBank['facilityType'] }) {
  if (type === 'government')
    return <span className="chip bg-mint text-teal-700"><Building2 size={11} /> Government</span>;
  if (type === 'charitable')
    return <span className="chip bg-lavender text-violet-700"><HandHeart size={11} /> Charitable Trust</span>;
  return <span className="chip bg-sky text-primary-700"><Building2 size={11} /> Private</span>;
}

/* ─── Availability explanation ──────────────────── */
function AvailabilityBadge() {
  return (
    <span className="chip border border-amber-200 bg-amber-50 text-amber-700 text-[11px]">
      <ShieldOff size={11} /> Stock: verify directly
    </span>
  );
}

/* ─── Blood bank result card ────────────────────── */
function BloodBankCard({ bank, bloodGroup, component }: { bank: BloodBank; bloodGroup: BloodGroup; component: BloodComponent }) {
  const [expanded, setExpanded] = useState(false);
  const componentLabel = BLOOD_COMPONENTS.find((c) => c.value === component)?.label ?? component;
  const directionsUrl = bank.lat && bank.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(bank.name + ' ' + bank.address)}`;

  return (
    <div className="card overflow-hidden transition-shadow duration-200 hover:shadow-lift">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peach text-coral-500">
              <Droplets size={19} />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-bold text-ink">{bank.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-soft">
                <MapPin size={11} /> {bank.district}, {bank.state}
                {bank.pincode && <span className="text-ink-faint"> — {bank.pincode}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-primary-600 hover:bg-primary-50"
          >
            Details {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        </div>

        {/* chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <FacilityChip type={bank.facilityType} />
          <span className="chip border border-coral-100 bg-coral-50 text-coral-600">
            <Droplets size={11} /> {bloodGroup}
          </span>
          <span className="chip bg-sky text-primary-700 text-[11px]">{componentLabel}</span>
          <AvailabilityBadge />
        </div>

        {/* data age notice */}
        <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-faint">
          <Info size={11} /> Directory: NHM/NIC public listing · last reviewed {DIRECTORY_DATE} · stock not tracked
        </p>
      </div>

      {/* expanded detail */}
      {expanded && (
        <div className="animate-fade-up border-t border-line bg-canvas px-5 py-4 space-y-3">
          {bank.address && (
            <p className="flex items-start gap-2 text-[12.5px] text-ink-soft">
              <MapPin size={13} className="mt-0.5 shrink-0 text-ink-faint" />
              {bank.address}
            </p>
          )}
          {bank.phone && (
            <p className="flex items-center gap-2 text-[12.5px] text-ink-soft">
              <Phone size={13} className="shrink-0 text-ink-faint" />
              {bank.phone}
            </p>
          )}

          {/* ⚠ Stock transparency */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-amber-800">
              <ShieldAlert size={14} /> Stock availability is not tracked by MediLink
            </p>
            <p className="mt-1.5 text-[12px] text-amber-700">
              No authorized real-time stock API is publicly available for Indian blood banks at this time.
              MediLink shows you where this blood bank is — you must verify {bloodGroup} ({componentLabel}) availability
              directly by calling the bank or checking e-RaktKosh.
            </p>
          </div>

          {/* action buttons */}
          <div className="flex flex-wrap gap-2">
            {bank.phone && (
              <a
                href={`tel:${bank.phone.replace(/[^0-9+]/g, '')}`}
                className="btn-primary text-[13px]"
              >
                <Phone size={14} /> Call Blood Bank
              </a>
            )}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-[13px]"
            >
              <MapPin size={14} /> Get Directions
            </a>
            <a
              href={buildEraktkoshUrl(bank.state, bloodGroup)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-[13px]"
            >
              <ExternalLink size={14} /> Verify on e-RaktKosh
            </a>
          </div>

          <p className="text-[11px] text-ink-faint">
            Source ID: {bank.sourceId ?? 'not available'} ·{' '}
            <a href="https://eraktkosh.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-600">
              eraktkosh.mohfw.gov.in
            </a>{' '}
            is the official MoHFW live stock portal.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── No results card ───────────────────────────── */
function NoResults({ state, district }: { state: string; district: string }) {
  return (
    <div className="card p-8 text-center">
      <Droplets size={32} className="mx-auto text-coral-300" />
      <h3 className="mt-3 font-display text-[15px] font-bold text-ink">No blood banks found in directory</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] text-ink-soft">
        Our static directory covers major government facilities but is not exhaustive.
        {state && ` No entries for ${district ? `${district}, ` : ''}${state} matched your component selection.`}
      </p>
      <div className="mx-auto mt-4 max-w-md space-y-2">
        <p className="text-[13px] font-semibold text-ink">Try these official sources:</p>
        <a
          href="https://eraktkosh.mohfw.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mx-auto text-[13px]"
        >
          <ExternalLink size={14} /> Search on e-RaktKosh (Government portal)
        </a>
      </div>
    </div>
  );
}

/* ─── Find Blood tab ─────────────────────────────── */
function FindBloodTab() {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [component, setComponent] = useState<BloodComponent>('prbc');
  const [units, setUnits] = useState<string>('');
  const [urgency, setUrgency] = useState<SearchQuery['urgency']>('within_24h');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<BloodBank[]>([]);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!state && !district && !pincode) {
      setError('Please select at least a State, District, or enter a PIN code.');
      return;
    }
    setError('');
    const found = searchBloodBanks({
      state,
      district,
      bloodGroup,
      component,
      units: units ? Number(units) : null,
      pincode,
      urgency,
    });
    setResults(found);
    setSearched(true);
  };

  const componentMeta = BLOOD_COMPONENTS.find((c) => c.value === component);

  return (
    <div className="space-y-5">
      {/* emergency banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <Siren size={18} className="mt-0.5 shrink-0 text-red-500" />
        <div>
          <p className="text-[13px] font-bold text-red-800">Medical emergency?</p>
          <p className="mt-0.5 text-[12.5px] text-red-700">
            Go to the nearest hospital emergency immediately or call <strong>108</strong> (ambulance) / <strong>112</strong>.
            Do not use this tool to arrange blood in an active emergency — it does not track live stock.
          </p>
        </div>
      </div>

      {/* search form */}
      <div className="card p-5">
        <p className="mb-4 text-[12px] font-bold uppercase tracking-wide text-ink-faint flex items-center gap-1.5">
          <Search size={13} /> Search criteria
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="bb-state">State *</label>
            <select id="bb-state" className="input" value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); }}>
              <option value="">— Select state —</option>
              {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="bb-district">District</label>
            <input
              id="bb-district"
              className="input"
              placeholder="e.g. Mumbai, Jaipur"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="bb-pin">PIN code</label>
            <input
              id="bb-pin"
              className="input"
              placeholder="e.g. 400012"
              value={pincode}
              maxLength={6}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div>
            <label className="label" htmlFor="bb-group">Blood group *</label>
            <select id="bb-group" className="input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}>
              {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="bb-comp">Blood component *</label>
            <select id="bb-comp" className="input" value={component} onChange={(e) => setComponent(e.target.value as BloodComponent)}>
              {BLOOD_COMPONENTS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {componentMeta && <p className="mt-1 text-[11px] text-ink-faint">{componentMeta.note}</p>}
          </div>
          <div>
            <label className="label" htmlFor="bb-qty">Units required (optional)</label>
            <input
              id="bb-qty"
              className="input"
              type="number"
              min={1}
              placeholder="e.g. 2"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-ink-faint">1 unit ≈ 350–450 mL whole blood</p>
          </div>
          <div>
            <label className="label" htmlFor="bb-urgency">Urgency</label>
            <select id="bb-urgency" className="input" value={urgency} onChange={(e) => setUrgency(e.target.value as SearchQuery['urgency'])}>
              <option value="emergency">Emergency (call 108 first)</option>
              <option value="within_24h">Needed within 24 hours</option>
              <option value="within_3d">Within 3 days</option>
              <option value="planned">Planned / scheduled</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-coral-600">
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        <button className="btn-primary mt-4 text-[13.5px]" onClick={handleSearch}>
          <Search size={15} /> Find Blood Banks
        </button>
      </div>

      {/* data transparency notice */}
      <div className="rounded-2xl border border-line bg-canvas p-4 text-[12.5px] text-ink-soft space-y-1.5">
        <p className="font-bold text-ink flex items-center gap-2"><ShieldCheck size={14} className="text-primary-500" /> Data transparency</p>
        <p>• Results are from a <strong>static blood bank directory</strong> (NHM/NIC public listings, last reviewed {DIRECTORY_DATE}).</p>
        <p>• <strong>Stock availability is not tracked</strong> — no authorized public API is available at this time.</p>
        <p>• Use the <strong>"Verify on e-RaktKosh"</strong> button on each result to check live stock on the official government portal.</p>
        <p>• Never assume a blood bank has stock available without calling them directly.</p>
      </div>

      {/* results */}
      {searched && (
        <div className="space-y-3">
          {results.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-ink-soft">
                  <span className="font-bold text-ink">{results.length}</span> blood bank{results.length !== 1 ? 's' : ''} found in directory
                </p>
                <a
                  href="https://eraktkosh.mohfw.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] font-semibold text-primary-600 hover:underline"
                >
                  <ExternalLink size={12} /> Check live stock on e-RaktKosh
                </a>
              </div>
              {results.map((bank) => (
                <BloodBankCard key={bank.id} bank={bank} bloodGroup={bloodGroup} component={component} />
              ))}
              <Notice kind="warn">
                These are directory listings only. <strong>Stock availability is unknown</strong> for all results — call the blood bank directly or visit{' '}
                <a href="https://eraktkosh.mohfw.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-semibold">eraktkosh.mohfw.gov.in</a>{' '}
                to check current stock. Do not travel to a blood bank without first confirming they have the required blood group and component.
              </Notice>
            </>
          ) : (
            <NoResults state={state} district={district} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Donor tab ──────────────────────────────────── */
function DonorTab() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [group, setGroup] = useState<BloodGroup>('B+');
  const [city, setCity] = useState('');
  const [lastDonation, setLastDonation] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="card p-6 lg:col-span-7">
        <h3 className="font-display text-[16px] font-bold text-ink">Register as a blood donor</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          Register your interest and we will help you find nearby donation drives. Your contact details remain private — they are never displayed publicly or shared without your consent.
        </p>
        {!submitted ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="dn-name">Full name</label>
                <input id="dn-name" className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="dn-group">Blood group</label>
                <select id="dn-group" className="input" value={group} onChange={(e) => setGroup(e.target.value as BloodGroup)}>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="dn-city">City / district</label>
                <input id="dn-city" className="input" placeholder="e.g. Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="dn-last">Last donation (if any)</label>
                <input id="dn-last" className="input" type="date" value={lastDonation} onChange={(e) => setLastDonation(e.target.value)} />
              </div>
            </div>
            <button className="btn-primary mt-5" onClick={handleSubmit} disabled={!name.trim()}>
              <HandHeart size={15} /> Register Interest
            </button>
            <p className="mt-3 text-[11.5px] text-ink-faint">Demonstration only — no donor registry is contacted in this demo.</p>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-teal-200 bg-mint/50 p-5 animate-fade-up">
            <p className="font-display text-[15px] font-bold text-teal-800">✓ Interest registered</p>
            <p className="mt-1 text-[13px] text-teal-700">
              Thank you, {name}! Your details ({group}) have been noted. In a live deployment you would receive nearby donation-drive notifications.
            </p>
            <div className="mt-3 rounded-xl border border-teal-200 bg-white p-4 text-[12.5px] text-ink-soft space-y-1">
              <p><span className="font-semibold">Name:</span> {name}</p>
              <p><span className="font-semibold">Blood group:</span> {group}</p>
              <p><span className="font-semibold">City:</span> {city || 'not provided'}</p>
              <p><span className="font-semibold">Last donation:</span> {lastDonation || 'not provided'}</p>
            </div>
            <p className="mt-3 text-[11.5px] text-ink-faint">Demo mode — no data was stored or transmitted.</p>
          </div>
        )}
      </div>
      <aside className="lg:col-span-5">
        <div className="card p-6">
          <h3 className="font-display text-[15px] font-bold text-ink">Your donation journey</h3>
          <ol className="relative mt-5">
            {donationStages.map((st, i) => (
              <li key={st} className="relative flex gap-3.5 pb-6 last:pb-0">
                {i < donationStages.length - 1 && <span className="absolute left-[11px] top-6 h-full w-0.5 bg-line" />}
                <span className={`relative z-10 h-6 w-6 shrink-0 rounded-full border-2 ${i === 0 ? 'border-teal-500 bg-teal-500' : 'border-line bg-white'}`} />
                <p className={`pt-0.5 text-[13.5px] font-bold ${i === 0 ? 'text-ink' : 'text-ink-faint'}`}>{st}</p>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-xl border border-line bg-canvas px-4 py-3 text-[12px] text-ink-soft">
            Donor identities and contact details are never displayed publicly. Verification happens through authorized channels only.
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────── */
export function BloodBankPage() {
  const { lang } = useApp();
  const s = t(lang);
  const [tab, setTab] = useState<'find' | 'donor'>('find');

  return (
    <AppShell
      title={s.bloodBank}
      subtitle="Blood bank directory and donation coordination — powered by authorized government data"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
            Find blood, or give it.
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Government blood bank directory · stock verification via e-RaktKosh · donor coordination.
          </p>
        </div>
        <div className="flex rounded-xl border border-line bg-white p-1">
          <button
            onClick={() => setTab('find')}
            className={`btn px-4 py-2 text-[13px] ${tab === 'find' ? 'bg-coral-500 text-white shadow-sm hover:bg-coral-600' : 'text-ink-soft hover:text-ink'}`}
          >
            <Droplets size={14} /> Find Blood
          </button>
          <button
            onClick={() => setTab('donor')}
            className={`btn px-4 py-2 text-[13px] ${tab === 'donor' ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600' : 'text-ink-soft hover:text-ink'}`}
          >
            <HandHeart size={14} /> Become a Donor
          </button>
        </div>
      </div>

      {tab === 'find' ? <FindBloodTab /> : <DonorTab />}
    </AppShell>
  );
}
