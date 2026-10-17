import { useState } from 'react';
import { CheckCircle2, CircleDashed, Clock, FlaskConical, Phone, Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { labs } from '@/lib/demoData';

const referralStages = [
  { t: 'Referral created', meta: 'By Dr. Nair · Oct 15', state: 'done' },
  { t: 'Documents required', meta: 'Referral letter pending from physician', state: 'current' },
  { t: 'Appointment to arrange', meta: 'Lipid profile collection slot', state: 'todo' },
  { t: 'Test pending', meta: 'Lipid profile · due in 6 days', state: 'todo' },
  { t: 'Results awaiting review', meta: 'Results go to your clinician first', state: 'todo' },
  { t: 'Clinician follow-up required', meta: 'Discuss results at your consultation', state: 'todo' },
] as const;

export function LabsPage() {
  const { lang } = useApp();
  const s = t(lang);
  const [category, setCategory] = useState('All');
  const [searched, setSearched] = useState(true);

  const rows = labs.filter((l) => category === 'All' || l.category === category);

  return (
    <AppShell
      title={s.labsReferrals}
      subtitle={lang === 'hi' ? 'हर जांच और रेफरल का हिसाब रखें।' : 'Keep every test and referral on track.'}
    >
      <div className="mb-6">
        <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          {lang === 'hi' ? 'हर जांच और रेफरल, एक जगह।' : 'Every test and referral, on track.'}
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-7">
          <div className="card p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="lab-q">Test or laboratory</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input id="lab-q" className="input pl-9" placeholder="e.g., Lipid profile" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="lab-loc">Location</label>
                <select id="lab-loc" className="input"><option>Central District</option><option>North Ring Road</option><option>Lakefront Area</option></select>
              </div>
              <div>
                <label className="label" htmlFor="lab-cat">Test category</label>
                <select id="lab-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {['All', 'Blood test', 'Imaging', 'Cardiac'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="lab-opt">Collection option</label>
                <select id="lab-opt" className="input"><option>Any</option><option>Home collection</option><option>Walk-in</option></select>
              </div>
            </div>
            <button className="btn-primary mt-4" onClick={() => setSearched(true)}><Search size={15} /> Search Labs</button>
          </div>

          {searched && (
            <>
              <p className="text-[11.5px] font-medium text-ink-faint">{s.sampleNote}</p>
              <div className="space-y-3.5">
                {rows.map((l) => (
                  <div key={l.id} className="card p-5 transition-all duration-300 hover:shadow-lift">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky text-primary-500"><FlaskConical size={18} /></span>
                          <div>
                            <h3 className="font-display text-[15.5px] font-bold text-ink">{l.name}</h3>
                            <p className="text-[12px] text-ink-soft">{l.location} · <Phone size={10} className="inline" /> {l.contact}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="chip bg-sky text-primary-700">{l.test}</span>
                          <span className="chip bg-lavender text-violet-600">₹{l.price} (sample)</span>
                          <span className={`chip ${l.verified ? 'bg-mint text-teal-700' : 'bg-peach text-coral-600'}`}>
                            {l.verified ? 'Verified listing' : 'Unverified — confirm by phone'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[12px] font-medium text-ink-soft">{l.collection}</p>
                      </div>
                      <button className="btn-primary text-[12.5px]">Contact / Next Step</button>
                    </div>
                  </div>
                ))}
                {rows.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
                    <p className="font-display text-[15px] font-bold text-ink">No labs match these filters</p>
                    <p className="mt-1 text-[13px] text-ink-soft">Try a different test category.</p>
                  </div>
                )}
              </div>
            </>
          )}

          <Notice kind="info">
            Where results exist, MediLink directs you to your healthcare professional for
            interpretation — reports are never presented as clinician-verified inside the app.
          </Notice>
        </section>

        <aside className="lg:col-span-5">
          <div className="card sticky top-6 p-6">
            <h3 className="font-display text-[15px] font-bold text-ink">Referral workspace</h3>
            <p className="mt-1 text-[12.5px] text-ink-soft">Cardiology referral · created Oct 15 (sample)</p>
            <ol className="relative mt-5">
              {referralStages.map((st, i) => (
                <li key={st.t} className="relative flex gap-3.5 pb-6 last:pb-0">
                  {i < referralStages.length - 1 && (
                    <span className={`absolute left-[11px] top-6 h-full w-0.5 ${st.state === 'done' ? 'bg-teal-300' : 'bg-line'}`} />
                  )}
                  <span
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      st.state === 'done'
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : st.state === 'current'
                          ? 'border-primary-400 bg-white'
                          : 'border-line bg-white'
                    }`}
                  >
                    {st.state === 'done' ? <CheckCircle2 size={13} /> : st.state === 'current' ? <Clock size={12} className="text-primary-500" /> : <CircleDashed size={12} className="text-ink-faint" />}
                  </span>
                  <div>
                    <p className={`text-[13.5px] font-bold ${st.state !== 'todo' ? 'text-ink' : 'text-ink-faint'}`}>{st.t}</p>
                    <p className="mt-0.5 text-[12px] text-ink-soft">{st.meta}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-2 h-1.5 w-full rounded-full bg-line">
              <div className="h-full w-1/6 rounded-full bg-gradient-to-r from-primary-500 to-teal-400 transition-all duration-700" />
            </div>
            <p className="mt-2 text-[11.5px] font-medium text-ink-faint">1 of 6 stages complete · {s.sampleNote}</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
