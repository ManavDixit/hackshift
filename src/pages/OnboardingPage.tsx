import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Globe, HeartPulse, Loader2, Lock, Stethoscope } from 'lucide-react';
import { Logo } from '@/components/PublicHeader';
import { useApp } from '@/lib/appContext';
import type { Role } from '@/lib/types';

const steps = ['Role', 'Profile', 'Language', 'Preferences', 'Privacy', 'Done'];

export function OnboardingPage() {
  const { navigate, profile, setProfile } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<string[]>(['Reminders for medications', 'Lab test reminders']);
  const [consented, setConsented] = useState(false);

  const togglePref = (p: string) =>
    setPrefs((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const next = () => {
    if (step === 4) {
      if (!consented) return;
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setStep(5);
      }, 900);
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  };

  const finish = () => navigate(profile.role === 'worker' ? 'worker' : 'overview');

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="container-app flex h-16 items-center justify-between">
          <Logo onClick={() => navigate('home')} />
          <button className="btn-ghost text-[13px]" onClick={() => navigate('signin')}>
            Back to sign in
          </button>
        </div>
      </header>

      <div className="container-app py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 hidden items-center md:flex" aria-label="Progress">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[12.5px] font-bold transition-all duration-300 ${
                      i < step
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : i === step
                          ? 'border-primary-500 bg-white text-primary-600 shadow-glow'
                          : 'border-line bg-white text-ink-faint'
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </span>
                  <span className={`text-[11px] font-bold ${i <= step ? 'text-ink' : 'text-ink-faint'}`}>{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`mx-2 mb-5 h-0.5 flex-1 rounded ${i < step ? 'bg-teal-400' : 'bg-line'}`} />}
              </div>
            ))}
          </div>
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <span className="text-[12.5px] font-bold text-ink">Step {step + 1} of 6 — {steps[step]}</span>
          </div>

          <div className="card p-6 sm:p-8 animate-fade-up" key={step}>
            {step === 0 && (
              <>
                <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink">How will you use MediLink?</h2>
                <p className="mt-1.5 text-[13.5px] text-ink-soft">You can change this later in Settings.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {([
                    { role: 'patient' as Role, icon: HeartPulse, title: 'Patient / Caregiver', body: 'Find care, understand information, and stay on track.' },
                    { role: 'worker' as Role, icon: Stethoscope, title: 'Healthcare Worker', body: 'Coordinate patients, follow-ups, and referrals.' },
                  ]).map((o) => (
                    <button
                      key={o.role}
                      onClick={() => setProfile({ role: o.role })}
                      className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                        profile.role === o.role ? 'border-primary-400 bg-primary-50/60 shadow-glow' : 'border-line bg-white hover:border-primary-200'
                      }`}
                    >
                      <span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${o.role === 'patient' ? 'bg-sky text-primary-500' : 'bg-mint text-teal-600'}`}>
                        <o.icon size={20} />
                      </span>
                      <p className="font-display text-[15px] font-bold text-ink">{o.title}</p>
                      <p className="mt-1 text-[12.5px] text-ink-soft">{o.body}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink">Basic profile</h2>
                <p className="mt-1.5 text-[13.5px] text-ink-soft">Just enough to personalize your experience. No medical questions needed.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="ob-name">Display name</label>
                    <input id="ob-name" className="input" value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label" htmlFor="ob-city">City / district</label>
                    <input id="ob-city" className="input" value={profile.city} onChange={(e) => setProfile({ city: e.target.value })} />
                  </div>
                  <div>
                    <label className="label" htmlFor="ob-email">Email</label>
                    <input id="ob-email" className="input" type="email" value={profile.email} onChange={(e) => setProfile({ email: e.target.value })} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="label" htmlFor="ob-phone">Phone (optional)</label>
                    <input id="ob-phone" className="input" value={profile.phone} onChange={(e) => setProfile({ phone: e.target.value })} placeholder="+91 …" />
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink">Language preference</h2>
                <p className="mt-1.5 text-[13.5px] text-ink-soft">SehatSaathi, your AI Doctor, supports both languages.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {([
                    { l: 'en' as const, title: 'English', sub: 'Interface and AI responses in English' },
                    { l: 'hi' as const, title: 'हिन्दी', sub: 'इंटरफ़ेस और एआय उत्तर हिन्दी में' },
                  ]).map((o) => (
                    <button
                      key={o.l}
                      onClick={() => setProfile({ lang: o.l })}
                      className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${profile.lang === o.l ? 'border-primary-400 bg-primary-50/60 shadow-glow' : 'border-line bg-white hover:border-primary-200'}`}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky text-primary-500"><Globe size={20} /></span>
                      <span>
                        <span className="block font-display text-[15px] font-bold text-ink">{o.title}</span>
                        <span className="block text-[12.5px] text-ink-soft">{o.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink">Care preferences <span className="text-[13px] font-semibold text-ink-faint">(optional)</span></h2>
                <p className="mt-1.5 text-[13.5px] text-ink-soft">Choose which reminders would help you most.</p>
                <div className="mt-6 space-y-2.5">
                  {['Reminders for medications', 'Lab test reminders', 'Appointment follow-ups', 'Weekly care-plan summary'].map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePref(p)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-[13.5px] font-semibold transition-all ${
                        prefs.includes(p) ? 'border-primary-300 bg-primary-50/60 text-ink' : 'border-line bg-white text-ink-soft hover:border-primary-200'
                      }`}
                    >
                      {p}
                      <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${prefs.includes(p) ? 'border-primary-500 bg-primary-500 text-white' : 'border-line'}`}>
                        {prefs.includes(p) && <Check size={12} />}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="font-display text-[22px] font-extrabold tracking-tight text-ink">Privacy & consent</h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                  MediLink uses your information only to organize your care. The AI Doctor provides
                  education and navigation — never diagnoses or prescriptions. You can review or
                  withdraw consent anytime in Settings & Privacy.
                </p>
                <div className="mt-5 space-y-2.5">
                  {[
                    'Store my documents and care plan in my private health record.',
                    'Show me clearly labeled sample data until real sources are connected.',
                    'Allow the AI Doctor to reference my care context to help me prepare for appointments.',
                  ].map((c) => (
                    <label key={c} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink-soft">
                      <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-primary-500" />
                      {c}
                    </label>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-ink-faint">
                  <Lock size={13} /> You control your data. Consent can be changed at any time.
                </p>
              </>
            )}
            {step === 5 && (
              <div className="py-6 text-center">
                <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint text-teal-600 animate-fade-up">
                  <Check size={30} />
                </span>
                <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">You're all set, {profile.name.split(' ')[0]}!</h2>
                <p className="mx-auto mt-2 max-w-sm text-[13.5px] text-ink-soft">
                  Your {profile.role === 'worker' ? 'coordination workspace' : 'care dashboard'} is ready. Everything you see starts with clearly labeled sample data.
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button className="btn-secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                <ArrowLeft size={15} /> Back
              </button>
              {step < 5 ? (
                <button className="btn-primary" onClick={next} disabled={step === 4 && !consented}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <>Continue <ArrowRight size={15} /></>}
                </button>
              ) : (
                <button className="btn-primary" onClick={finish}>
                  Enter MediLink <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
