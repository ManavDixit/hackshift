import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BedDouble,
  Building2,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Info,
  ListChecks,
  MapPin,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { HBarChart } from '@/components/Charts';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import {
  ADMISSION_CHECKLIST,
  PROCEDURES,
  compareEstimates,
  freshnessLabel,
  loadHospitals,
  type Comparison,
  type DbHospital,
  type ProcedureSlug,
} from '@/lib/hospitalData';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function AvailabilityBadge({ status, beds }: { status: string; beds: number | null }) {
  if (status === 'verified') {
    return (
      <span className="chip bg-mint text-teal-700">
        <CheckCircle2 size={12} /> {beds !== null ? `${beds} reported` : 'Reported available'}
      </span>
    );
  }
  if (status === 'reported') {
    return (
      <span className="chip bg-sky text-primary-600">
        <Info size={12} /> Reported, not confirmed
      </span>
    );
  }
  return (
    <span className="chip bg-peach text-coral-600">
      <XCircle size={12} /> Not reported
    </span>
  );
}

export function CostEstimatorPage() {
  const { lang, navigate } = useApp();
  const s = t(lang);
  const [hospitals, setHospitals] = useState<DbHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [procedure, setProcedure] = useState<ProcedureSlug>('angioplasty');
  const [roomFilter, setRoomFilter] = useState<string>('any');
  const [selected, setSelected] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await loadHospitals();
    setHospitals(res.hospitals);
    setOffline(res.offline || res.hospitals.length === 0);
    setSelected(res.hospitals[0]?.slug ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const comparisons: Comparison[] = useMemo(
    () => compareEstimates(hospitals, procedure),
    [hospitals, procedure]
  );

  const chartData = comparisons.map((c) => ({
    label: c.hospital.name.split(' ')[0],
    value: c.estimate.totalLow,
    note: `${inr(c.estimate.totalLow)} – ${inr(c.estimate.totalHigh)}`,
  }));

  const selectedComparison = comparisons.find((c) => c.hospital.slug === selected) ?? null;

  const visibleRooms = (h: DbHospital) =>
    roomFilter === 'any' ? h.rooms : h.rooms.filter((r) => r.category === roomFilter);

  const roomCategories = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => h.rooms.forEach((r) => set.add(r.category)));
    return ['any', ...Array.from(set)];
  }, [hospitals]);

  return (
    <AppShell
      title={lang === 'hi' ? 'अस्पताल लागत अनुमानक' : 'Hospital Cost Estimator'}
      subtitle={
        lang === 'hi'
          ? 'स्पष्ट गणित के साथ वस्तुनिष्ठ लागत अनुमान और कमरा उपलब्धता।'
          : 'Itemized estimates with transparent arithmetic and room availability.'
      }
      actions={
        <div className="flex gap-2">
          <button className="btn-secondary text-[13px]" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {lang === 'hi' ? 'रिफ्रेश' : 'Refresh'}
          </button>
          <button className="btn-primary text-[13px]" onClick={() => setShowChecklist(true)}>
            <ListChecks size={15} /> {lang === 'hi' ? 'भर्ती चेकलिस्ट' : 'Admission checklist'}
          </button>
        </div>
      }
    >
      <div className="mb-6">
        <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          {lang === 'hi'
            ? 'इलाज से पहले अपनी लागत समझें।'
            : 'Understand your treatment cost before you commit.'}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
          {lang === 'hi'
            ? 'हर अनुमान अस्पताल की वस्तुनिष्ठ शुल्क सूची का योग है — कोई AI-जनित कीमत नहीं। श्रेणियाँ अनिश्चितता दिखाती हैं; अंतिम बिल अस्पताल द्वारा तय होता है।'
            : 'Every estimate is the sum of a hospital\u2019s itemized charge list — never an AI-invented price. Ranges show uncertainty; the final bill is decided by the hospital.'}
        </p>
      </div>

      {offline && !loading && (
        <div className="mb-6">
          <Notice kind="warn">
            {lang === 'hi'
              ? 'डेटाबेस से जुड़ नहीं पा रहे हैं, इसलिए अनुमान अभी उपलब्ध नहीं हैं। कृपया बाद में रिफ्रेश करें।'
              : 'Could not reach the reference database right now, so estimates are unavailable. Please refresh in a moment.'}
          </Notice>
        </div>
      )}

      {loading && (
        <div className="card mb-6 animate-pulse p-6">
          <div className="h-4 w-40 rounded bg-primary-50" />
          <div className="mt-3 h-3 w-72 rounded bg-primary-50" />
          <div className="mt-6 h-24 rounded-xl bg-primary-50/60" />
        </div>
      )}

      {!loading && !offline && (
        <>
          <div className="card mb-6 p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label" htmlFor="est-procedure">Treatment</label>
                <select
                  id="est-procedure"
                  className="input"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value as ProcedureSlug)}
                >
                  {PROCEDURES.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="est-room">Room category filter</label>
                <select
                  id="est-room"
                  className="input"
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                >
                  {roomCategories.map((c) => (
                    <option key={c} value={c}>{c === 'any' ? 'All categories' : c}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] font-medium text-ink-faint">
              {s.sampleNote} · {lang === 'hi'
                ? 'रेंज अस्पताल की सूचीबद्ध शुल्क रेंज से आती हैं।'
                : 'Ranges come from each hospital\u2019s listed charge ranges, summed line by line.'}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-7">
            <div className="space-y-4 lg:col-span-4">
              {comparisons.map((c) => {
                const isActive = selected === c.hospital.slug;
                return (
                  <button
                    key={c.hospital.slug}
                    onClick={() => setSelected(c.hospital.slug)}
                    className={`card w-full p-5 text-left transition-all duration-300 hover:shadow-lift ${
                      isActive ? 'ring-2 ring-primary-200' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky text-primary-500">
                          <Building2 size={19} />
                        </span>
                        <div>
                          <h3 className="font-display text-[15.5px] font-bold text-ink">{c.hospital.name}</h3>
                          <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-ink-soft">
                            <MapPin size={12} /> {c.hospital.location} · {c.hospital.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">
                          {lang === 'hi' ? 'अनुमानित कुल' : 'Estimated total'}
                        </p>
                        <p className="font-display text-[17px] font-extrabold tabular-nums text-ink">
                          {inr(c.estimate.totalLow)} – {inr(c.estimate.totalHigh)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {c.hospital.rooms.slice(0, 3).map((r) => (
                        <AvailabilityBadge key={r.id} status={r.availabilityStatus} beds={r.bedsReported} />
                      ))}
                      <span className="text-[11px] font-medium text-ink-faint">
                        {c.hospital.source} · {freshnessLabel(c.hospital.updatedHoursAgo)}
                      </span>
                    </div>
                  </button>
                );
              })}

              <div className="card p-6">
                <h3 className="font-display text-[16px] font-bold text-ink">
                  {lang === 'hi' ? 'सबसे कम अनुमानित कुल लागत' : 'Lowest estimated total'}
                </h3>
                <p className="mt-1 text-[12px] font-medium text-ink-faint">
                  {lang === 'hi'
                    ? 'निचली सीमा की तुलना — ऊपरी सीमा के लिए कार्ड देखें।'
                    : 'Comparing the lower bounds of each estimate — check cards for the upper bounds.'}
                </p>
                <div className="mt-4">
                  <HBarChart data={chartData} unit="₹" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card sticky top-24 p-6">
                {selectedComparison ? (
                  <>
                    <h3 className="font-display text-[16px] font-bold text-ink">
                      {selectedComparison.hospital.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] font-medium text-ink-soft">
                      {PROCEDURES.find((p) => p.slug === procedure)?.label}
                    </p>
                    <div className="mt-4 rounded-2xl bg-sky/60 p-4">
                      <div className="flex items-baseline justify-between">
                        <p className="text-[12px] font-bold uppercase tracking-wide text-primary-600">
                          {lang === 'hi' ? 'अनुमानित कुल' : 'Estimated total'}
                        </p>
                        <p className="font-display text-[19px] font-extrabold tabular-nums text-ink">
                          {inr(selectedComparison.estimate.totalLow)} – {inr(selectedComparison.estimate.totalHigh)}
                        </p>
                      </div>
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-medium text-ink-soft">
                        <IndianRupee size={12} className="mt-0.5 shrink-0" />
                        {lang === 'hi'
                          ? 'नीचे की प्रत्येक पंक्ति का योग। यह अंतिम बिल नहीं है।'
                          : 'Sum of every line below. This is not a final bill.'}
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedComparison.estimate.categories.map((cat) => (
                        <div key={cat.category} className="rounded-xl border border-line bg-canvas p-3.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-[12.5px] font-bold text-ink">{cat.category}</p>
                            <p className="text-[12.5px] font-bold tabular-nums text-ink-soft">
                              {inr(cat.low)} – {inr(cat.high)}
                            </p>
                          </div>
                          <ul className="mt-1.5 space-y-1">
                            {cat.items.map((item) => (
                              <li key={item.id} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                                <span className="text-ink-soft">{item.item}</span>
                                <span className="shrink-0 tabular-nums text-ink-faint">
                                  {inr(item.priceLow)} – {inr(item.priceHigh)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
                        <BedDouble size={14} /> {lang === 'hi' ? 'कमरा उपलब्धता' : 'Room availability'}
                      </p>
                      <div className="mt-2 space-y-2">
                        {visibleRooms(selectedComparison.hospital).map((r) => (
                          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3.5 py-2.5">
                            <div>
                              <p className="text-[12.5px] font-semibold text-ink">{r.category}</p>
                              <p className="text-[11px] text-ink-faint tabular-nums">
                                {inr(r.rateLow)} – {inr(r.rateHigh)}/day
                              </p>
                            </div>
                            <AvailabilityBadge status={r.availabilityStatus} beds={r.bedsReported} />
                          </div>
                        ))}
                        {visibleRooms(selectedComparison.hospital).length === 0 && (
                          <p className="text-[12px] text-ink-faint">
                            {lang === 'hi' ? 'इस फ़िल्टर के लिए कोई श्रेणी नहीं।' : 'No categories match this filter.'}
                          </p>
                        )}
                      </div>
                    </div>

                    <Notice kind="info">
                      {lang === 'hi'
                        ? 'MediLink बुकिंग या उपलब्धता की गारंटी नहीं देता। कृपया अस्पताल से सीधे पुष्टि करें।'
                        : 'MediLink does not book or guarantee availability. Confirm directly with the hospital.'}
                    </Notice>
                  </>
                ) : (
                  <p className="text-[13px] text-ink-soft">
                    {lang === 'hi' ? 'कोई अस्पताल चुनें।' : 'Select a hospital to see its itemized estimate.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showChecklist && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowChecklist(false)} />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift animate-fade-up sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-[17px] font-bold text-ink">
                  {lang === 'hi' ? 'भर्ती चेकलिस्ट' : 'Admission checklist'}
                </h3>
                <p className="mt-0.5 text-[12.5px] text-ink-soft">
                  {lang === 'hi'
                    ? 'भर्ती से पहले इन्हें तैयार रखें।'
                    : 'Prepare these before you are admitted.'}
                </p>
              </div>
              <button className="rounded-lg p-1.5 text-ink-soft hover:bg-primary-50" onClick={() => setShowChecklist(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <ul className="mt-5 space-y-2.5">
              {ADMISSION_CHECKLIST.map((step) => (
                <li key={step} className="flex items-start gap-2.5 rounded-xl border border-line bg-canvas px-4 py-3">
                  <ClipboardList size={15} className="mt-0.5 shrink-0 text-primary-500" />
                  <span className="text-[13px] leading-relaxed text-ink">{step}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Notice kind="warn">
                <span className="flex items-start gap-1.5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {lang === 'hi'
                    ? 'यह सामान्य मार्गदर्शन है — आपका अस्पताल अलग आवश्यकताएँ बता सकता है।'
                    : 'This is general guidance — your hospital may require different items.'}
                </span>
              </Notice>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
