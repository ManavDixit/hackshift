import { useMemo, useState } from 'react';
import { Building2, Check, IndianRupee, ArrowRight, MapPin, Plus, Scale, Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { HBarChart } from '@/components/Charts';
import { Modal, Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { hospitals } from '@/lib/demoData';
import type { Hospital } from '@/lib/types';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function HospitalsPage() {
  const { lang, navigate } = useApp();
  const s = t(lang);
  const [compare, setCompare] = useState<string[]>([]);
  const [detail, setDetail] = useState<Hospital | null>(null);
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState(120000);

  const filtered = useMemo(
    () =>
      hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.location.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const compareHospitals = hospitals.filter((h) => compare.includes(h.id));
  const costData = hospitals.map((h) => ({ label: h.name.split(' ')[0], value: h.procedureLow, note: `Range ${inr(h.procedureLow)} – ${inr(h.procedureHigh)}` }));

  const toggleCompare = (id: string) =>
    setCompare((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev));

  return (
    <AppShell
      title={s.findHospitals}
      subtitle={lang === 'hi' ? 'उपलब्ध जानकारी, अनुमानित लागत और देखभाल विकल्पों की तुलना करें।' : 'Compare available information, estimated costs, and care options in one place.'}
      actions={
        <button className="btn-primary text-[13px]" onClick={() => document.getElementById('compare-panel')?.scrollIntoView({ behavior: 'smooth' })} disabled={compare.length < 2}>
          <Scale size={15} /> Compare ({compare.length})
        </button>
      }
    >
      <div className="mb-6">
        <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          {lang === 'hi' ? 'अपनी ज़रूरत के लिए सही अस्पताल खोजें।' : 'Find the right hospital for your needs.'}
        </h2>
        <button
          className="group mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-primary-100 bg-gradient-to-r from-sky/70 to-mint/50 p-5 text-left transition-all duration-300 hover:border-primary-200 hover:shadow-lift"
          onClick={() => navigate('find-care')}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white shadow-glow">
              <IndianRupee size={20} />
            </span>
            <div>
              <p className="font-display text-[15px] font-bold text-ink">
                {lang === 'hi' ? 'नया: अस्पताल लागत अनुमानक' : 'New: Hospital Cost Estimator'}
              </p>
              <p className="mt-0.5 text-[12.5px] text-ink-soft">
                {lang === 'hi'
                  ? 'वस्तुनिष्ठ शुल्कों से अनुमानित कुल लागत, कमरा उपलब्धता और भर्ती चेकलिस्ट देखें।'
                  : 'Itemized totals, room availability, and an admission checklist — built from hospital charge lists.'}
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="shrink-0 text-primary-500 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      <div className="card mb-6 p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label" htmlFor="h-loc">Location</label>
            <select id="h-loc" className="input"><option>Central District</option><option>North Ring Road</option><option>Lakefront Area</option></select>
          </div>
          <div>
            <label className="label" htmlFor="h-type">Hospital type</label>
            <select id="h-type" className="input"><option>Any</option><option>Multispecialty</option><option>Cardiac specialty</option></select>
          </div>
          <div>
            <label className="label" htmlFor="h-spec">Specialty</label>
            <select id="h-spec" className="input"><option>Cardiology</option><option>Internal Medicine</option></select>
          </div>
          <div>
            <label className="label" htmlFor="h-budget">Max budget (procedure, est.)</label>
            <select id="h-budget" className="input" value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
              <option value={60000}>Up to ₹60,000</option>
              <option value={90000}>Up to ₹90,000</option>
              <option value={120000}>Up to ₹1,20,000</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full"><Search size={15} /> Search</button>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] font-medium text-ink-faint">{s.sampleNote} — estimates are illustrative and must be confirmed with each hospital.</p>
      </div>

      <div className="space-y-4">
        {filtered.map((h) => (
          <div key={h.id} className="card p-5 transition-all duration-300 hover:shadow-lift">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky text-primary-500"><Building2 size={19} /></span>
                  <div>
                    <h3 className="font-display text-[16px] font-bold text-ink">{h.name}</h3>
                    <p className="flex items-center gap-1 text-[12px] font-medium text-ink-soft"><MapPin size={12} /> {h.location} · ~{h.distanceKm} km (sample)</p>
                  </div>
                  <span className={`chip ${h.availability.includes('likely') ? 'bg-mint text-teal-700' : 'bg-peach text-coral-600'}`}>{h.availability}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12.5px]">
                  <span className="text-ink-soft">Consultation: <strong className="text-ink tabular-nums">{inr(h.consultLow)} – {inr(h.consultHigh)}</strong></span>
                  <span className="text-ink-soft">Procedure (est.): <strong className="text-ink tabular-nums">{inr(h.procedureLow)} – {inr(h.procedureHigh)}</strong></span>
                  <span className="text-ink-soft">{h.specialty} · {h.type}</span>
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-ink-faint">{h.updated} · {h.source}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-[12.5px]" onClick={() => setDetail(h)}>View Details</button>
                <button
                  className={`btn text-[12.5px] ${compare.includes(h.id) ? 'bg-primary-500 text-white hover:bg-primary-600' : 'border border-line bg-white text-ink hover:border-primary-200'}`}
                  onClick={() => toggleCompare(h.id)}
                >
                  {compare.includes(h.id) ? <Check size={14} /> : <Plus size={14} />} Compare
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="font-display text-[15px] font-bold text-ink">No hospitals match your search</p>
            <p className="mt-1 text-[13px] text-ink-soft">Try a different location or clear the search field.</p>
          </div>
        )}
      </div>

      <div id="compare-panel" className="mt-8">
        {compareHospitals.length >= 2 && (
          <div className="card p-6 animate-fade-up">
            <h3 className="font-display text-[17px] font-bold text-ink">Side-by-side comparison</h3>
            <p className="mt-1 text-[12px] font-medium text-ink-faint">{s.sampleNote}</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line">
                    <th className="pb-3 pr-4 font-bold text-ink-soft">Criteria</th>
                    {compareHospitals.map((h) => (
                      <th key={h.id} className="pb-3 pr-4 font-display font-bold text-ink">{h.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    ['Estimated procedure cost', (h: Hospital) => `${inr(h.procedureLow)} – ${inr(h.procedureHigh)}`],
                    ['Consultation', (h: Hospital) => `${inr(h.consultLow)} – ${inr(h.consultHigh)}`],
                    ['Room categories', (h: Hospital) => h.room],
                    ['Included services', (h: Hospital) => h.included.join(', ')],
                    ['Important exclusions', (h: Hospital) => h.exclusions.join(', ')],
                    ['Location', (h: Hospital) => `${h.location} (~${h.distanceKm} km)`],
                    ['Source verification', (h: Hospital) => `${h.source} · ${h.updated}`],
                  ].map(([label, fn]) => (
                    <tr key={label as string}>
                      <td className="py-3 pr-4 font-semibold text-ink-soft">{label as string}</td>
                      {compareHospitals.map((h) => (
                        <td key={h.id} className="py-3 pr-4 text-ink">{(fn as (x: Hospital) => string)(h)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-3 text-[13.5px] font-bold text-ink">Lowest estimated procedure cost</h4>
                <HBarChart data={costData.filter((d) => compareHospitals.some((h) => h.name.startsWith(d.label)))} unit="₹" />
              </div>
              <div className="rounded-2xl border border-line bg-sky/50 p-5">
                <h4 className="text-[13.5px] font-bold text-ink">Before you book, ask:</h4>
                <ul className="mt-3 space-y-2 text-[12.5px] text-ink-soft">
                  {[
                    'What is included in this estimate, and what is not?',
                    'Which room category does this price assume?',
                    'Are pre-procedure tests billed separately?',
                    'What is the expected length of stay?',
                    'What follow-up care is included?',
                  ].map((q) => (
                    <li key={q} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" /> {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {compareHospitals.length < 2 && (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-8 text-center">
            <p className="text-[13.5px] font-bold text-ink">Select two or three hospitals to compare</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">Use the Compare button on any hospital card.</p>
          </div>
        )}
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ''} wide>
        {detail && (
          <div className="space-y-4">
            <Notice kind="info">{s.sampleNote} · {detail.updated}</Notice>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Consultation (est.)', `${inr(detail.consultLow)} – ${inr(detail.consultHigh)}`],
                ['Procedure (est.)', `${inr(detail.procedureLow)} – ${inr(detail.procedureHigh)}`],
                ['Room categories', detail.room],
                ['Availability', detail.availability],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line bg-canvas px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{k}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">Included services</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detail.included.map((i) => <span key={i} className="chip bg-mint text-teal-700">{i}</span>)}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">Important exclusions</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detail.exclusions.map((i) => <span key={i} className="chip bg-peach text-coral-600">{i}</span>)}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-sky/50 p-4">
              <p className="text-[13px] font-bold text-ink">Questions to ask before booking</p>
              <ul className="mt-2 space-y-1.5 text-[12.5px] text-ink-soft">
                {['Is this estimate fixed or indicative?', 'What insurance or scheme support applies to me?', 'Who coordinates my follow-up after discharge?'].map((q) => (
                  <li key={q} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-400" /> {q}</li>
                ))}
              </ul>
            </div>
            <Notice kind="warn">
              MediLink does not book or guarantee availability. Contact the hospital directly to confirm current prices and beds.
            </Notice>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
