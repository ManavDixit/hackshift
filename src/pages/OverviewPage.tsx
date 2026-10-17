import {
  ArrowRight,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  FileText,
  FlaskConical,
  MessageCircleQuestion,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube2,
  Upload,
} from 'lucide-react';
import { AiDoctor } from '@/components/AiDoctor';
import { StatusBadge } from '@/components/StatusBadge';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { activityFeed, careTasks } from '@/lib/demoData';
import { ProgressRing } from '@/components/Charts';

const feedIcons: Record<string, React.ElementType> = {
  upload: Upload,
  test: TestTube2,
  reminder: Clock,
  doc: FileText,
};

export function OverviewPage() {
  const { navigate, profile, lang } = useApp();
  const s = t(lang);
  const done = careTasks.filter((t) => t.status === 'completed').length;

  const metrics = [
    { label: 'Active care tasks', value: '4', sub: '1 needs attention', icon: CheckCircle2, tone: 'bg-sky text-primary-500' },
    { label: 'Upcoming appointments', value: '1', sub: 'Follow-up, est. next week', icon: CalendarCheck2, tone: 'bg-mint text-teal-600' },
    { label: 'Pending tests & referrals', value: '2', sub: 'Lipid profile + referral letter', icon: FlaskConical, tone: 'bg-peach text-coral-500' },
    { label: 'Care-plan steps done', value: `${done} of 5`, sub: '20% complete (sample)', icon: Stethoscope, tone: 'bg-lavender text-violet-500' },
  ];

  const nextActions = [
    { icon: Stethoscope, title: 'Find a specialist', body: 'Cardiology follow-up recommended within 7 days.', cta: 'Find Specialists', page: 'specialists', tone: 'bg-lavender text-violet-500' },
    { icon: Pill, title: 'Compare medicine prices', body: 'A comparable pack may cost less. Verify with a pharmacist.', cta: 'Compare Medicines', page: 'medicines', tone: 'bg-mint text-teal-600' },
    { icon: FlaskConical, title: 'Complete a pending lab referral', body: 'Lipid profile due in 6 days. Compare labs near you.', cta: 'Open LabLink', page: 'labs', tone: 'bg-sky text-primary-500' },
    { icon: ShieldCheck, title: 'Check your insurance coverage', body: 'See your estimated out-of-pocket cost across hospitals with MediCover AI.', cta: 'Open MediCover AI', page: 'medicover', tone: 'bg-peach text-coral-500' },
  ];

  return (
    <AppShell title={s.overview} subtitle={`${new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
            {s.goodMorning}, {profile.name.split(' ')[0]}.
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            You have one task that needs attention and two pending items. Here's your journey at a glance.
          </p>
        </div>
        <button className="btn-secondary relative" onClick={() => navigate('notifications')} aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[9px] font-bold text-white">3</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={m.label} className="card p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${m.tone}`}>
              <m.icon size={17} />
            </span>
            <p className="stat-num">{m.value}</p>
            <p className="mt-1 text-[12px] font-bold text-ink">{m.label}</p>
            <p className="text-[11px] font-medium text-ink-faint">{m.sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] font-medium text-ink-faint">{s.sampleNote}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-label="Your care journey">
          <div className="card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[16px] font-bold text-ink">Your care journey</h3>
              <button className="text-[12.5px] font-bold text-primary-600 hover:underline" onClick={() => navigate('careloop')}>Open CareLoop</button>
            </div>
            <ol className="relative">
              {careTasks.map((task, i) => (
                <li key={task.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < careTasks.length - 1 && (
                    <span className={`absolute left-[13px] top-8 h-full w-0.5 ${task.status === 'completed' ? 'bg-teal-300' : 'bg-line'}`} />
                  )}
                  <span
                    className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                      task.status === 'completed'
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : task.status === 'attention'
                          ? 'border-coral-400 bg-peach text-coral-500 animate-pulse-ring'
                          : task.status === 'pending'
                            ? 'border-amber-300 bg-white text-amber-400'
                            : 'border-primary-300 bg-white text-primary-400'
                    }`}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={14} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors hover:bg-sky/40">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-bold text-ink">{task.title}</p>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="mt-0.5 text-[12.5px] font-medium text-ink-soft">
                      {task.owner} · {task.due}
                    </p>
                    {task.next && <p className="mt-0.5 text-[12px] text-ink-faint">Next: {task.next}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nextActions.map((a) => (
              <button
                key={a.title}
                onClick={() => navigate(a.page)}
                className="card group p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${a.tone}`}>
                  <a.icon size={18} />
                </span>
                <p className="text-[13.5px] font-bold text-ink">{a.title}</p>
                <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-soft">{a.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-primary-600 transition-transform group-hover:translate-x-0.5">
                  {a.cta} <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-5 lg:col-span-4">
          <div className="card relative overflow-hidden p-5">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-mint/70 blur-xl" />
            <div className="relative flex items-start gap-3.5">
              <AiDoctor size={84} />
              <div>
                <p className="font-display text-[14px] font-bold text-ink">Need help understanding your next step?</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">SehatSaathi can explain your report or prepare questions for your appointment.</p>
              </div>
            </div>
            <div className="relative mt-4 space-y-1.5">
              {['Explain my report', 'What should I prepare for my appointment?', 'Help me organize my next steps'].map((q) => (
                <button
                  key={q}
                  onClick={() => navigate('aidoctor')}
                  className="flex w-full items-center justify-between rounded-xl border border-line bg-white px-3.5 py-2.5 text-left text-[12.5px] font-semibold text-ink-soft transition-all hover:border-primary-200 hover:text-primary-700"
                >
                  <span className="flex items-center gap-2"><MessageCircleQuestion size={14} className="text-teal-500" />{q}</span>
                  <ArrowRight size={13} />
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[14.5px] font-bold text-ink">Care-plan progress</h3>
              <ProgressRing value={20} size={54} stroke={6} />
            </div>
            <p className="mt-2 text-[12px] text-ink-soft">1 of 5 steps complete — the cardiology follow-up is the current priority.</p>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-[14.5px] font-bold text-ink">Recent activity</h3>
            <ul className="mt-3 space-y-3">
              {activityFeed.map((a) => {
                const Icon = feedIcons[a.icon] ?? FileText;
                return (
                  <li key={a.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky text-primary-500">
                      <Icon size={13} />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-semibold text-ink">{a.title}</p>
                      <p className="text-[11px] text-ink-faint">{a.meta}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-3 text-[12px] font-semibold text-ink-faint">
            <Sparkles size={14} className="text-teal-400" /> {s.sampleNote}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
