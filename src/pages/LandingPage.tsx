import { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Droplets,
  FlaskConical,
  HeartPulse,
  Lock,
  MessageCircleQuestion,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Workflow,
} from 'lucide-react';
import { AiDoctor } from '@/components/AiDoctor';
import { Reveal } from '@/components/Reveal';
import { PublicHeader, Logo } from '@/components/PublicHeader';
import { useApp } from '@/lib/appContext';
import { agents } from '@/lib/agents';

function HeroFloatingCards() {
  const { navigate } = useApp();
  return (
    <div className="pointer-events-none absolute inset-0 hidden sm:block">
      <div className="pointer-events-auto absolute left-0 top-6 w-56 animate-float-slow rounded-2xl border border-line bg-white/95 p-3.5 shadow-lift backdrop-blur" style={{ animationDelay: '0.4s' }}>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky text-primary-500"><Building2 size={14} /></span>
          <p className="text-[12px] font-bold text-ink">Hospital comparison</p>
        </div>
        <div className="space-y-1.5">
          {[['City Care', '₹58–88k'], ['Lakeview', '₹62–95k'], ['Sunrise', '₹74–118k']].map(([n, p]) => (
            <div key={n} className="flex justify-between text-[11px] font-semibold text-ink-soft">
              <span>{n}</span>
              <span className="tabular-nums">{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-auto absolute right-0 top-16 w-48 animate-float-slow rounded-2xl border border-line bg-white/95 p-3.5 shadow-lift backdrop-blur" style={{ animationDelay: '1.2s' }}>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-teal-600"><FlaskConical size={14} /></span>
          <p className="text-[12px] font-bold text-ink">Upcoming lab test</p>
        </div>
        <p className="text-[11.5px] font-semibold text-ink-soft">Lipid profile · due in 6 days</p>
        <div className="mt-2 h-1.5 rounded-full bg-line"><div className="h-full w-2/3 rounded-full bg-teal-400" /></div>
      </div>
      <div className="pointer-events-auto absolute bottom-20 left-4 w-52 animate-float-slow rounded-2xl border border-line bg-white/95 p-3.5 shadow-lift backdrop-blur" style={{ animationDelay: '0.8s' }}>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lavender text-violet-500"><Pill size={14} /></span>
          <p className="text-[12px] font-bold text-ink">Medicine savings</p>
        </div>
        <p className="text-[11.5px] text-ink-soft">Comparable pack found <span className="font-bold text-teal-600">33% lower</span> (sample)</p>
      </div>
      <div className="pointer-events-auto absolute bottom-6 right-6 w-56 animate-float-slow rounded-2xl border border-line bg-white/95 p-3.5 shadow-lift backdrop-blur" style={{ animationDelay: '1.6s' }}>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-500"><CalendarCheck2 size={14} /></span>
          <p className="text-[12px] font-bold text-ink">Care-plan progress</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-line"><div className="h-full w-1/4 rounded-full bg-primary-400" /></div>
          <span className="text-[11px] font-bold text-ink-soft">1 of 5 steps</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { navigate, lang } = useApp();
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 80% at 78% 30%, rgba(20,184,166,0.10), transparent 60%), radial-gradient(50% 70% at 20% 15%, rgba(57,120,246,0.10), transparent 55%), linear-gradient(180deg,#F7FAFF 0%,#FFFFFF 100%)',
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden="true">
        <defs>
          <pattern id="net" width="220" height="220" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="#B4CEFF" />
            <circle cx="120" cy="60" r="1.5" fill="#C8F2EB" />
            <circle cx="60" cy="170" r="1.5" fill="#D5CBFF" />
            <path d="M10 10 L120 60 M120 60 L60 170 M10 10 L60 170" stroke="#E5EBF3" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#net)" />
      </svg>

      <div className="container-app relative grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-6 lg:py-20">
        <div className="lg:col-span-6">
          <span className="eyebrow animate-fade-up">
            <Sparkles size={13} />
            AI-Powered Connected Healthcare
          </span>
          <h1 className="mt-4 font-display text-[38px] font-extrabold leading-[1.12] tracking-tight text-ink animate-fade-up sm:text-[46px] lg:text-[54px]" style={{ animationDelay: '80ms' }}>
            Healthcare, connected.
            <br />
            <span className="bg-gradient-to-r from-primary-500 to-teal-500 bg-clip-text text-transparent">Care, continued.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-soft animate-fade-up" style={{ animationDelay: '160ms' }}>
            MediLink brings hospitals, specialists, medicines, diagnostics, and follow-up care
            together in one intelligent hub — coordinated by eight specialized AI agents and a
            central orchestrator, so care doesn't stop when you leave the hospital.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
            <button className="btn-primary px-5 py-3" onClick={() => navigate('signin')}>
              Explore MediLink <ArrowRight size={16} />
            </button>
            <button className="btn-secondary px-5 py-3" onClick={() => navigate('aidoctor')}>
              <MessageCircleQuestion size={16} className="text-teal-500" /> Meet Your AI Doctor
            </button>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[12.5px] font-semibold text-ink-faint animate-fade-up" style={{ animationDelay: '320ms' }}>
            <ShieldCheck size={15} className="text-teal-500" />
            {lang === 'hi' ? 'सहमति-आधारित, मानव-नियंत्रित डिज़ाइन' : 'Consent-first design · Human oversight on every step'}
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative mx-auto flex max-w-[480px] items-center justify-center py-8">
            <div
              className="absolute inset-x-8 top-1/2 h-56 -translate-y-1/2 rounded-[48px] opacity-70 blur-2xl"
              style={{ background: 'linear-gradient(120deg, rgba(57,120,246,0.16), rgba(20,184,166,0.20))' }}
            />
            <svg className="absolute h-[380px] w-[380px] opacity-60" viewBox="0 0 380 380" fill="none" aria-hidden="true">
              <circle cx="190" cy="190" r="150" stroke="#D6E6FF" strokeWidth="1.2" strokeDasharray="3 6" />
              <circle cx="190" cy="190" r="105" stroke="#C8F2EB" strokeWidth="1.2" strokeDasharray="3 6" />
              <circle cx="40" cy="120" r="5" fill="#3978F6" opacity="0.5" />
              <circle cx="340" cy="150" r="5" fill="#14B8A6" opacity="0.5" />
              <circle cx="80" cy="330" r="4" fill="#7C63E8" opacity="0.5" />
              <circle cx="320" cy="320" r="4" fill="#E4593A" opacity="0.4" />
            </svg>
            <HeroFloatingCards />
            <div className="relative z-10">
              <AiDoctor size={300} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const journey = [
  { n: '01', title: 'Discover Care', body: 'Describe what you need — a hospital, a specialist, a test, or a medicine.', icon: HeartPulse, color: 'text-primary-500 bg-sky' },
  { n: '02', title: 'Compare Options', body: 'See costs, availability status, and distances side by side, with sources.', icon: Building2, color: 'text-teal-600 bg-mint' },
  { n: '03', title: 'Understand', body: 'The AI Doctor explains reports and terms in plain language, English or Hindi.', icon: MessageCircleQuestion, color: 'text-violet-500 bg-lavender' },
  { n: '04', title: 'Coordinate', body: 'Referrals, labs, documents, and reminders are organized for you.', icon: Workflow, color: 'text-coral-500 bg-peach' },
  { n: '05', title: 'Follow Through', body: 'CareLoop keeps follow-ups on track until every step is complete.', icon: CalendarCheck2, color: 'text-primary-600 bg-primary-50' },
];

function Journey() {
  return (
    <section id="journey" className="container-app py-16 lg:py-20">
      <Reveal>
        <span className="eyebrow">How it works</span>
        <h2 className="mt-2 max-w-xl font-display text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          The healthcare journey, simplified.
        </h2>
      </Reveal>
      <div className="relative mt-10">
        <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-primary-200 via-teal-200 to-primary-100 lg:block" />
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {journey.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <li className="relative">
                <span className={`relative z-10 mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-line bg-white shadow-card ${s.color}`}>
                  <s.icon size={22} strokeWidth={2.2} />
                </span>
                <p className="font-mono text-[11px] font-bold tracking-widest text-ink-faint">{s.n}</p>
                <h3 className="mt-1 font-display text-[16px] font-bold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AgentsPreview() {
  const { navigate } = useApp();
  const [active, setActive] = useState('orchestrator');
  const shown = agents.filter((a) => a.id !== 'orchestrator');
  const pos = [
    'left-1/2 top-0 -translate-x-1/2',
    'right-2 top-[16%]',
    'right-0 top-1/2 -translate-y-1/2',
    'right-2 bottom-[16%]',
    'left-1/2 bottom-0 -translate-x-1/2',
    'left-2 bottom-[16%]',
    'left-0 top-1/2 -translate-y-1/2',
  ];
  return (
    <section id="agents" className="border-y border-line bg-white py-16 lg:py-20">
      <div className="container-app grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">Architecture</span>
          <h2 className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">
            One hub. Eight intelligent agents.
          </h2>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            Every request flows through the MediLink Orchestrator, which routes work to exactly the
            right specialists — hospital costs, specialists, pharmacy, blood bank, labs, health
            education, and care coordination.
          </p>
          <button className="btn-secondary mt-6" onClick={() => navigate('agents')}>
            See the agent network <ArrowRight size={15} />
          </button>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative mx-auto aspect-square w-full max-w-[440px]">
            <div className="absolute inset-[16%] rounded-full border border-dashed border-line" />
            <div className="absolute inset-[30%] rounded-full border border-dashed border-line" />
            <button
              onMouseEnter={() => setActive('orchestrator')}
              onClick={() => setActive('orchestrator')}
              className={`absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border bg-gradient-to-br from-primary-500 to-teal-500 text-white shadow-glow transition-transform duration-300 hover:scale-105 ${
                active === 'orchestrator' ? 'ring-4 ring-primary-100' : ''
              }`}
            >
              <Network size={22} />
              <span className="mt-1 px-1 text-center text-[10px] font-bold leading-tight">MediLink Orchestrator</span>
            </button>
            {shown.map((a, i) => (
              <button
                key={a.id}
                onMouseEnter={() => setActive(a.id)}
                onClick={() => setActive(a.id)}
                style={{ position: 'absolute' }}
                className={`group absolute ${pos[i]} flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  active === a.id ? 'ring-2' : ''
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${''}`}
                  style={{ background: a.soft, color: a.accent }}
                >
                  <a.icon size={18} />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="font-display text-[14px] font-bold text-ink">{agents.find((a) => a.id === active)?.name}</p>
            <p className="mx-auto mt-0.5 max-w-sm text-[12.5px] text-ink-soft">{agents.find((a) => a.id === active)?.role}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Network } from 'lucide-react';

const services = [
  { icon: Building2, title: 'Hospitals', body: 'Compare estimated costs, room categories, and availability information.', cta: 'Find Hospitals', page: 'hospitals', tone: 'bg-sky text-primary-500' },
  { icon: Stethoscope, title: 'Specialists', body: 'Discover relevant doctors by specialty, location, and consultation mode.', cta: 'Find Specialists', page: 'specialists', tone: 'bg-lavender text-violet-500' },
  { icon: Pill, title: 'Pharmacies', body: 'Compare equivalent medicines and understand potential savings safely.', cta: 'Compare Medicines', page: 'medicines', tone: 'bg-mint text-teal-600' },
  { icon: Droplets, title: 'Blood Banks', body: 'Find blood resources and coordinate donations with verification.', cta: 'Virtual Blood Bank', page: 'bloodbank', tone: 'bg-peach text-coral-500' },
  { icon: FlaskConical, title: 'Labs & Referrals', body: 'Keep every test, referral, and pending action organized.', cta: 'Open LabLink', page: 'labs', tone: 'bg-sky text-primary-600' },
  { icon: Workflow, title: 'Care coordination', body: 'CareLoop turns discharge instructions into completed follow-through.', cta: 'See CareLoop', page: 'careloop', tone: 'bg-lavender text-violet-600' },
];

function Services() {
  const { navigate } = useApp();
  return (
    <section id="services" className="container-app py-16 lg:py-20">
      <Reveal>
        <span className="eyebrow">Healthcare services</span>
        <h2 className="mt-2 max-w-xl font-display text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          Everything you need, in one place.
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 70}>
            <button
              onClick={() => navigate(s.page)}
              className="group flex h-full w-full flex-col rounded-2xl border border-line bg-white p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift"
            >
              <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon size={20} strokeWidth={2.2} />
              </span>
              <h3 className="font-display text-[16px] font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-soft">{s.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-600 transition-transform duration-200 group-hover:translate-x-1">
                {s.cta} <ArrowRight size={14} />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function MeetDoctor() {
  const { navigate } = useApp();
  return (
    <section id="doctor" className="relative overflow-hidden py-16 lg:py-20" style={{ background: 'linear-gradient(180deg,#FFFFFF, #F2F8FF 50%, #FFFFFF)' }}>
      <div className="container-app grid items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="relative mx-auto flex max-w-[360px] items-center justify-center rounded-[40px] border border-line bg-gradient-to-b from-sky to-white p-8 shadow-card">
            <AiDoctor size={260} />
            <span className="absolute bottom-6 right-6 chip bg-mint text-teal-700">SehatSaathi</span>
          </div>
        </Reveal>
        <div className="lg:col-span-7">
          <Reveal>
            <span className="eyebrow">Your always-available guide</span>
            <h2 className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">
              Meet your AI Doctor.
            </h2>
            <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-ink-soft">
              SehatSaathi explains medical terminology in plain language, helps you prepare
              questions for your clinician, and organizes your next steps — in English and Hindi.
              It educates and navigates; it never diagnoses or prescribes.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-6 max-w-lg rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint text-teal-600">
                  <HeartPulse size={15} />
                </span>
                <div>
                  <p className="text-[13.5px] leading-relaxed text-ink">
                    “Your report mentions <strong>hyperlipidemia</strong> — simply put, higher-than-recommended
                    fat levels in your blood. It's common and manageable. You could ask your doctor:
                    <em> 'What target levels should I aim for, and how often should we re-test?'</em>”
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="chip bg-sky text-primary-700">Plain-language explanation</span>
                    <span className="chip bg-mint text-teal-700">Questions prepared</span>
                    <span className="chip bg-lavender text-violet-600">English · हिन्दी</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <button className="btn-primary mt-6" onClick={() => navigate('aidoctor')}>
              Talk to SehatSaathi <ArrowRight size={15} />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CareLoopSection() {
  const { navigate } = useApp();
  const steps = [
    { t: 'Discharge instructions received', done: true },
    { t: 'Follow-up appointment arranged', done: false },
    { t: 'Blood test completed', done: false },
    { t: 'Documents collected', done: false },
    { t: 'Follow-up consultation attended', done: false },
  ];
  return (
    <section className="container-app py-16 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">CareLoop</span>
          <h2 className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">
            Care should not stop at discharge.
          </h2>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            Most care plans fall apart between visits. CareLoop turns discharge instructions into
            organized actions — with owners, due dates, reminders, and barrier resolution — and
            tracks progress until the loop is closed.
          </p>
          <button className="btn-secondary mt-6" onClick={() => navigate('careloop')}>
            Explore the CareLoop workspace <ArrowRight size={15} />
          </button>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-bold text-ink">Recovery journey (sample)</p>
              <span className="chip bg-sky text-primary-700">1 of 5 complete</span>
            </div>
            <ol className="relative space-y-0">
              {steps.map((s, i) => (
                <li key={s.t} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {i < steps.length - 1 && <span className="absolute left-[11px] top-6 h-full w-0.5 bg-line" />}
                  <span
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-white ${
                      s.done ? 'border-teal-500 bg-teal-500' : 'border-line bg-white'
                    }`}
                  >
                    {s.done ? <Workflow size={12} /> : null}
                  </span>
                  <p className={`pt-0.5 text-[13.5px] font-semibold ${s.done ? 'text-ink' : 'text-ink-faint'}`}>{s.t}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TwoPanels() {
  const { navigate } = useApp();
  return (
    <section className="border-y border-line bg-white py-16 lg:py-20">
      <div className="container-app">
        <Reveal>
          <span className="eyebrow">Two experiences, one platform</span>
          <h2 className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">
            Built for patients and healthcare teams.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-line bg-gradient-to-b from-sky/60 to-white p-7">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-glow">
                <HeartPulse size={22} />
              </span>
              <h3 className="font-display text-[19px] font-bold text-ink">Patient empowerment</h3>
              <ul className="mt-4 flex-1 space-y-2.5 text-[13.5px] text-ink-soft">
                {['Understand your reports in plain language', 'Compare costs before you commit', 'Keep every record and referral in one place', 'Stay on track with reminders and follow-ups'].map((li) => (
                  <li key={li} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                    {li}
                  </li>
                ))}
              </ul>
              <button className="btn-primary mt-6 self-start" onClick={() => navigate('signin')}>Enter as Patient</button>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex h-full flex-col rounded-3xl border border-line bg-gradient-to-b from-mint/60 to-white p-7">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-white">
                <Stethoscope size={22} />
              </span>
              <h3 className="font-display text-[19px] font-bold text-ink">Team coordination</h3>
              <ul className="mt-4 flex-1 space-y-2.5 text-[13.5px] text-ink-soft">
                {['See who needs follow-up before it slips', 'Track pending tests and referrals', 'Resolve barriers with concrete next actions', 'Escalate cases to the right professional'].map((li) => (
                  <li key={li} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                    {li}
                  </li>
                ))}
              </ul>
              <button className="btn-secondary mt-6 self-start" onClick={() => navigate('signin')}>Enter as Healthcare Worker</button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  const items = [
    { icon: Lock, title: 'Consent first', body: 'Your data is used only with your explicit permission, and you can change your choices anytime.' },
    { icon: MessageCircleQuestion, title: 'Source transparency', body: 'Costs, availability, and health information always show where they came from — sample data is labeled.' },
    { icon: ShieldCheck, title: 'Human escalation', body: 'The AI Doctor educates and navigates. Diagnoses, prescriptions, and clinical decisions stay with professionals.' },
  ];
  return (
    <section id="about" className="container-app py-16 lg:py-20">
      <Reveal>
        <span className="eyebrow">Privacy & responsible AI</span>
        <h2 className="mt-2 max-w-xl font-display text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">
          Trustworthy by design, not by promise.
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 80}>
            <div className="h-full rounded-2xl border border-line bg-white p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky text-primary-500">
                <it.icon size={18} />
              </span>
              <h3 className="font-display text-[15px] font-bold text-ink">{it.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{it.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  const { navigate } = useApp();
  return (
    <section className="container-app pb-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-line bg-gradient-to-br from-primary-600 via-primary-500 to-teal-500 px-8 py-14 text-center shadow-lift">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-teal-300/20 blur-2xl" />
          <h2 className="relative font-display text-[28px] font-extrabold tracking-tight text-white sm:text-[34px]">
            Start your connected care journey.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-primary-50">
            Create a free account and let MediLink organize your healthcare — from discovery to
            follow-through.
          </p>
          <button className="btn relative mt-7 bg-white px-6 py-3 text-primary-700 shadow-lift hover:bg-primary-50" onClick={() => navigate('signin')}>
            Get Started Free <ArrowRight size={16} />
          </button>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const { navigate } = useApp();
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-app grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Logo onClick={() => navigate('home')} />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-soft">
            The connected healthcare hub. Eight specialized AI agents, one coordinated care journey.
          </p>
        </div>
        {[
          { h: 'Product', links: [['Agent Network', 'agents'], ['AI Doctor', 'aidoctor'], ['CareLoop', 'careloop']] },
          { h: 'Services', links: [['Hospitals', 'hospitals'], ['Specialists', 'specialists'], ['Medicines', 'medicines'], ['Labs', 'labs']] },
          { h: 'Company', links: [['Privacy', 'settings'], ['Accessibility', 'settings'], ['Responsible use', 'settings']] },
        ].map((col) => (
          <div key={col.h}>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-faint">{col.h}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map(([label, page]) => (
                <li key={label}>
                  <button className="text-[13.5px] font-medium text-ink-soft transition-colors hover:text-primary-600" onClick={() => navigate(page)}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-5">
        <div className="container-app flex flex-col items-center justify-between gap-2 text-[12px] font-medium text-ink-faint sm:flex-row">
          <p>MediLink — hackathon demonstration. All health data shown is clearly labeled sample data.</p>
          <p>Contact: hello@medilink.example</p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <PublicHeader />
      <Hero />
      <Journey />
      <AgentsPreview />
      <Services />
      <MeetDoctor />
      <CareLoopSection />
      <TwoPanels />
      <Privacy />
      <FinalCta />
      <Footer />
    </div>
  );
}
