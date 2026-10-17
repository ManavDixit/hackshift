import { useState } from 'react';
import { Bell, Check, FileText, Globe, Laptop, Link2, Lock, LogOut, ShieldCheck, User } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Modal, Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';

export function SettingsPage() {
  const { lang, setLang, profile, setProfile, navigate } = useApp();
  const s = t(lang);
  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useState({ email: true, push: true, weekly: false });
  const [access, setAccess] = useState({ largeText: false, reducedMotion: false });
  const [connected, setConnected] = useState<string[]>(['Lab sample network (demo)']);
  const [confirm, setConfirm] = useState<null | 'signout' | 'data'>(null);

  const flashSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const toggleConnected = (name: string) =>
    setConnected((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  return (
    <AppShell
      title={s.settings}
      subtitle={lang === 'hi' ? 'प्रोफ़ाइल, सूचनाएँ, पहुँच और गोपनीयता।' : 'Profile, notifications, accessibility, and privacy.'}
      actions={saved ? <span className="chip bg-mint text-teal-700 animate-fade-in"><Check size={12} /> Saved</span> : undefined}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><User size={17} className="text-primary-500" /> Personal profile</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="set-name">Display name</label>
              <input id="set-name" className="input" value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} onBlur={flashSave} />
            </div>
            <div>
              <label className="label" htmlFor="set-email">Email</label>
              <input id="set-email" className="input" type="email" value={profile.email} onChange={(e) => setProfile({ email: e.target.value })} onBlur={flashSave} placeholder="you@example.com" />
            </div>
            <div>
              <label className="label" htmlFor="set-phone">Phone</label>
              <input id="set-phone" className="input" value={profile.phone} onChange={(e) => setProfile({ phone: e.target.value })} onBlur={flashSave} placeholder="+91 …" />
            </div>
            <div>
              <label className="label" htmlFor="set-city">City / district</label>
              <input id="set-city" className="input" value={profile.city} onChange={(e) => setProfile({ city: e.target.value })} onBlur={flashSave} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Globe size={17} className="text-teal-500" /> Language preference</h3>
          <div className="mt-4 flex gap-2.5">
            {(['en', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); flashSave(); }}
                className={`btn flex-1 ${lang === l ? 'bg-primary-500 text-white hover:bg-primary-600' : 'border border-line bg-white text-ink hover:border-primary-200'}`}
              >
                {l === 'en' ? 'English' : 'हिन्दी'}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[12px] text-ink-faint">Applies to the interface and SehatSaathi responses.</p>
        </section>

        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Bell size={17} className="text-violet-500" /> Notification preferences</h3>
          <div className="mt-4 space-y-2.5">
            {([
              ['email', 'Email reminders', 'Care tasks, appointments, and lab reminders'],
              ['push', 'In-app notifications', 'Referral updates and document status'],
              ['weekly', 'Weekly summary', 'A Sunday digest of your care-plan progress'],
            ] as const).map(([key, label, meta]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                <span>
                  <span className="block text-[13px] font-bold text-ink">{label}</span>
                  <span className="block text-[11.5px] text-ink-faint">{meta}</span>
                </span>
                <button
                  role="switch"
                  aria-checked={notif[key]}
                  onClick={() => { setNotif((n) => ({ ...n, [key]: !n[key] })); flashSave(); }}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${notif[key] ? 'bg-teal-500' : 'bg-line'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${notif[key] ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Laptop size={17} className="text-coral-500" /> Accessibility</h3>
          <div className="mt-4 space-y-2.5">
            {([
              ['largeText', 'Larger text', 'Increase base text size across the app'],
              ['reducedMotion', 'Reduce motion', 'Minimize animations and transitions'],
            ] as const).map(([key, label, meta]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                <span>
                  <span className="block text-[13px] font-bold text-ink">{label}</span>
                  <span className="block text-[11.5px] text-ink-faint">{meta}</span>
                </span>
                <button
                  role="switch"
                  aria-checked={access[key]}
                  onClick={() => { setAccess((a) => ({ ...a, [key]: !a[key] })); flashSave(); }}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${access[key] ? 'bg-primary-500' : 'bg-line'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${access[key] ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Link2 size={17} className="text-primary-500" /> Connected services</h3>
          <div className="mt-4 space-y-2.5">
            {['Lab sample network (demo)', 'Hospital directory (demo)', 'Pharmacy pricing feed (demo)'].map((name) => (
              <label key={name} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                <span className="text-[13px] font-bold text-ink">{name}</span>
                <button
                  role="switch"
                  aria-checked={connected.includes(name)}
                  onClick={() => { toggleConnected(name); flashSave(); }}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${connected.includes(name) ? 'bg-teal-500' : 'bg-line'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${connected.includes(name) ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><ShieldCheck size={17} className="text-teal-500" /> Consent & data permissions</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            MediLink processes your information only to organize your care. The AI Doctor provides
            education and navigation — never diagnoses or prescriptions. You can withdraw any consent
            below at any time.
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button className="btn-secondary justify-start" onClick={() => navigate('records')}><FileText size={15} /> Manage my documents</button>
            <button className="btn-secondary justify-start text-coral-600 hover:border-coral-200 hover:bg-coral-50" onClick={() => setConfirm('data')}>
              <Lock size={15} /> Review data & consent
            </button>
          </div>
        </section>

        <section className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Lock size={17} className="text-ink-soft" /> Session management</h3>
          <p className="mt-2 text-[13px] text-ink-soft">You are signed in on this device as <strong className="text-ink">{profile.name}</strong> (demonstration session).</p>
          <button className="btn mt-4 border border-line bg-white text-coral-600 hover:border-coral-200 hover:bg-coral-50" onClick={() => setConfirm('signout')}>
            <LogOut size={15} /> Sign out of this device
          </button>
        </section>

        <Notice kind="info">
          MediLink makes no security certifications or compliance claims in this demonstration. All
          connected-service toggles are illustrative.
        </Notice>
      </div>

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === 'signout' ? 'Sign out?' : 'Review data & consent'}>
        {confirm === 'signout' ? (
          <>
            <p className="text-[13.5px] leading-relaxed text-ink-soft">
              This is a demonstration session — signing out returns you to the public website. No
              server session exists to end.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button className="btn-primary flex-1" onClick={() => { setConfirm(null); navigate('home'); }}>Sign out</button>
              <button className="btn-secondary flex-1" onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <ul className="space-y-2.5 text-[13px] leading-relaxed text-ink-soft">
              {[
                'Your documents and care plan stay in your private record unless you delete them.',
                'Sample data is clearly labeled and never mixed with real sources.',
                'The AI Doctor reads your care context only to help you prepare — never to diagnose.',
                'You can export or request deletion of your data at any time.',
              ].map((li) => (
                <li key={li} className="flex items-start gap-2.5">
                  <Check size={15} className="mt-0.5 shrink-0 text-teal-500" /> {li}
                </li>
              ))}
            </ul>
            <button className="btn-primary mt-5 w-full" onClick={() => setConfirm(null)}>I understand</button>
          </>
        )}
      </Modal>
    </AppShell>
  );
}
