import { useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  CalendarSearch,
  CheckCircle2,
  Mail,
  MapPin,
  Search,
  Send,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Modal, Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { specialists } from '@/lib/demoData';
import type { Specialist } from '@/lib/types';

/* ─── Inquiry composer + sent state ─────────────── */
type InquiryState = 'idle' | 'composing' | 'sent';

function InquiryComposer({
  doctor,
  onSent,
}: {
  doctor: Specialist;
  onSent: () => void;
}) {
  const { profile } = useApp();
  const [state, setState] = useState<InquiryState>('idle');
  const [message, setMessage] = useState(
    `Hello Dr. ${doctor.name.replace('Dr. ', '')},\n\nI would like to request a consultation regarding my health concerns. Please let me know your available slots.\n\nThank you.`
  );
  const [sending, setSending] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    setSending(true);
    // Simulate send delay
    setTimeout(() => {
      setSending(false);
      setState('sent');
      onSent();
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  if (state === 'idle') {
    return (
      <button
        className="btn-primary"
        onClick={() => {
          setState('composing');
          setTimeout(() => textRef.current?.focus(), 50);
        }}
      >
        <Send size={15} /> Send Inquiry
      </button>
    );
  }

  if (state === 'sent') {
    return (
      <div className="w-full animate-fade-up rounded-2xl border border-teal-200 bg-mint/50 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="font-display text-[15px] font-bold text-teal-800">Inquiry sent!</p>
            <p className="text-[12.5px] text-teal-700">
              Your message was sent to <strong>{doctor.name}</strong> at {doctor.facility}.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-teal-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={13} className="text-teal-600" />
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-teal-600">Email receipt</p>
          </div>
          <p className="text-[12px] text-ink-soft"><span className="font-semibold text-ink">To:</span> {doctor.name} · {doctor.facility}</p>
          <p className="text-[12px] text-ink-soft"><span className="font-semibold text-ink">From:</span> {profile.name} · {profile.email || 'your registered email'}</p>
          <p className="text-[12px] text-ink-soft"><span className="font-semibold text-ink">Sent:</span> {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          <hr className="my-2 border-line" />
          <p className="whitespace-pre-wrap text-[12px] text-ink-soft leading-relaxed">{message}</p>
        </div>
        <p className="mt-3 text-[11.5px] text-teal-700">
          A confirmation has been sent to your registered contact. The clinic will respond within 1–2 working days.
        </p>
        <Notice kind="info">
          This is a demonstration — no actual email was sent. In a live deployment this would use a verified messaging gateway.
        </Notice>
      </div>
    );
  }

  // composing state
  return (
    <div className="w-full animate-fade-up space-y-3 rounded-2xl border border-primary-100 bg-sky/30 p-4">
      <div className="flex items-center gap-2">
        <Mail size={15} className="text-primary-500" />
        <p className="font-display text-[13.5px] font-bold text-ink">Inquiry to {doctor.name}</p>
        <span className="ml-auto text-[11px] text-ink-faint">Ctrl + Enter to send</span>
      </div>

      <div className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-[12px] text-ink-soft space-y-0.5">
        <p><span className="font-semibold">To:</span> {doctor.name} · {doctor.facility}</p>
        <p><span className="font-semibold">From:</span> {profile.name}</p>
        <p><span className="font-semibold">Subject:</span> Consultation inquiry — MediLink AI</p>
      </div>

      <textarea
        ref={textRef}
        id="inquiry-body"
        className="input min-h-[140px] resize-none text-[13px] leading-relaxed"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your message to the doctor…"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn-primary text-[13px] disabled:opacity-60"
          onClick={handleSend}
          disabled={sending || !message.trim()}
        >
          {sending ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending…
            </>
          ) : (
            <><Send size={14} /> Send inquiry</>
          )}
        </button>
        <button
          className="btn-secondary text-[13px]"
          onClick={() => setState('idle')}
          disabled={sending}
        >
          Cancel
        </button>
        <p className="ml-auto text-[11px] text-ink-faint">Demo mode — not a real email</p>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────── */
export function SpecialistsPage() {
  const { lang, navigate } = useApp();
  const s = t(lang);
  const [spec, setSpec] = useState('All');
  const [mode, setMode] = useState('All');
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState<Specialist | null>(null);
  const [saved, setSaved] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  const closeModal = () => {
    setProfile(null);
    setSaved(false);
    setInquirySent(false);
  };

  const filtered = useMemo(
    () =>
      specialists.filter(
        (d) =>
          (spec === 'All' || d.specialty === spec) &&
          (mode === 'All' || d.modes.some((m) => m.toLowerCase().includes(mode.toLowerCase()))) &&
          (d.name.toLowerCase().includes(query.toLowerCase()) || d.specialty.toLowerCase().includes(query.toLowerCase()))
      ),
    [spec, mode, query]
  );

  return (
    <AppShell
      title={s.findSpecialists}
      subtitle={lang === 'hi' ? 'विशेषता, स्थान और परामर्श मोड के अनुसार विशेषज्ञ खोजें।' : 'Discover relevant professionals by specialty, location, and consultation mode.'}
    >
      <div className="mb-6">
        <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          {lang === 'hi' ? 'अपने लिए सही विशेषज्ञ खोजें।' : 'Find the right specialist.'}
        </h2>
      </div>

      <div className="card mb-6 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="sp-q">Search</label>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input id="sp-q" className="input pl-9" placeholder="Name or specialty" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="sp-spec">Specialty</label>
          <select id="sp-spec" className="input" value={spec} onChange={(e) => setSpec(e.target.value)}>
            {['All', 'Cardiologist', 'Internal Medicine'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sp-mode">Consultation mode</label>
          <select id="sp-mode" className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
            {['All', 'In-person', 'Video'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sp-dist">Distance</label>
          <select id="sp-dist" className="input"><option>Any distance</option><option>Within 5 km</option><option>Within 15 km</option></select>
        </div>
      </div>

      <p className="mb-3 text-[11.5px] font-medium text-ink-faint">{s.sampleNote}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((d) => (
          <div key={d.id} className="card flex gap-4 p-5 transition-all duration-300 hover:shadow-lift">
            <img
              src={d.photo}
              alt={`Portrait of ${d.name}`}
              className="h-[104px] w-[88px] shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-[15.5px] font-bold text-ink">{d.name}</h3>
                  <p className="text-[12.5px] font-semibold text-primary-600">{d.specialty}</p>
                </div>
                <span className="chip bg-mint text-teal-700"><BadgeCheck size={12} /> {d.rating} ({d.reviews})</span>
              </div>
              <p className="mt-1 text-[12px] text-ink-soft">{d.qualifications}</p>
              <p className="mt-0.5 text-[12px] text-ink-soft">{d.facility}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-faint"><MapPin size={11} /> {d.location} · ~{d.distanceKm} km</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {d.modes.map((m) => (
                  <span key={m} className="chip bg-sky text-primary-700">
                    {m === 'Video follow-up' || m === 'Video consult' ? <><Video size={11} /> {m}</> : <><Stethoscope size={11} /> {m}</>}
                  </span>
                ))}
                <span className="chip bg-lavender text-violet-600">~₹{d.fee} (sample)</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary px-3.5 py-2 text-[12.5px]" onClick={() => setProfile(d)}>View Profile</button>
                <button className="btn-secondary px-3.5 py-2 text-[12.5px]" onClick={() => setProfile(d)}>Send Inquiry</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center lg:col-span-2">
            <p className="font-display text-[15px] font-bold text-ink">No specialists match these filters</p>
            <p className="mt-1 text-[13px] text-ink-soft">Try widening the specialty or consultation mode.</p>
          </div>
        )}
      </div>

      <Modal open={!!profile} onClose={closeModal} title={profile?.name ?? ''} wide>
        {profile && (
          <div className="space-y-4">
            {/* doctor header */}
            <div className="flex flex-wrap items-start gap-4">
              <img src={profile.photo} alt={`Portrait of ${profile.name}`} className="h-24 w-24 rounded-2xl object-cover" />
              <div>
                <p className="font-display text-[17px] font-bold text-ink">{profile.name}</p>
                <p className="text-[13px] font-semibold text-primary-600">{profile.specialty} · {profile.qualifications}</p>
                <p className="mt-1 text-[12.5px] text-ink-soft">{profile.facility} — {profile.location}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="chip bg-mint text-teal-700"><BadgeCheck size={12} /> {profile.rating} rating · {profile.reviews} reviews (sample)</span>
                  <span className="chip bg-lavender text-violet-600">Consultation ~₹{profile.fee} (sample)</span>
                </div>
              </div>
            </div>

            {/* specializations */}
            <div>
              <p className="text-[13px] font-bold text-ink">Areas of specialization</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(profile.specialty === 'Cardiologist'
                  ? ['Preventive cardiology', 'Hypertension care', 'Post-discharge cardiac rehab']
                  : ['Chronic disease management', 'Preventive health checks', 'Diabetes care']
                ).map((a) => <span key={a} className="chip bg-sky text-primary-700">{a}</span>)}
              </div>
            </div>

            {/* documents checklist — only show when not yet sent */}
            {!inquirySent && (
              <div className="rounded-2xl border border-line bg-sky/50 p-4">
                <p className="flex items-center gap-2 text-[13px] font-bold text-ink">
                  <CalendarSearch size={15} className="text-primary-500" /> Documents to prepare
                </p>
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-ink-soft">
                  {['Recent discharge summary or referral letter', 'Current prescription list', 'Latest lab reports (e.g., lipid profile)', 'Questions prepared with the AI Doctor'].map((doc) => (
                    <li key={doc} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-400" /> {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Inquiry composer ── */}
            <InquiryComposer doctor={profile} onSent={() => setInquirySent(true)} />

            {/* Save to records — always available */}
            {!inquirySent && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  className={`btn-secondary transition-all duration-200 ${saved ? 'border-teal-400 bg-mint text-teal-700' : ''}`}
                  onClick={() => setSaved(true)}
                  disabled={saved}
                >
                  {saved ? (
                    <><CheckCircle2 size={15} className="text-teal-600" /> Saved to Records</>
                  ) : (
                    <><Star size={15} /> Save to Records</>
                  )}
                </button>
              </div>
            )}

            {saved && !inquirySent && (
              <p className="text-[12px] font-semibold text-teal-700 animate-fade-up">
                ✓ {profile.name} saved to your Health Records.{' '}
                <button className="underline hover:text-primary-600" onClick={() => { closeModal(); navigate('records'); }}>
                  Open Health Records
                </button>
              </p>
            )}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
