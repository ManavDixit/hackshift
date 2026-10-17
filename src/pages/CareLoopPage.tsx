import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  FileText,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProgressRing } from '@/components/Charts';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { careTasks } from '@/lib/demoData';
import { StatusBadge } from '@/components/StatusBadge';

const barriers = [
  {
    id: 'bar1',
    title: 'Appointment not arranged',
    body: 'The cardiology follow-up has not been booked yet, and the window is 7 days after discharge.',
    actions: ['Find specialists near me', 'Prepare inquiry message', 'Mark barrier resolved'],
    tone: 'bg-peach text-coral-500',
    icon: CalendarCheck2,
  },
  {
    id: 'bar2',
    title: 'Documents missing',
    body: 'The referral letter from your physician has not appeared in your Health Records yet.',
    actions: ['Check Health Records', 'Send reminder', 'Mark barrier resolved'],
    tone: 'bg-sky text-primary-500',
    icon: FileText,
  },
  {
    id: 'bar3',
    title: 'Cost information needed',
    body: 'You have not compared procedure or test costs yet — estimates help you plan.',
    actions: ['Compare hospital costs', 'Compare lab prices', 'Mark barrier resolved'],
    tone: 'bg-lavender text-violet-500',
    icon: AlertTriangle,
  },
];

export function CareLoopPage() {
  const { completedTasks, toggleTask, lang, navigate } = useApp();
  const s = t(lang);
  const [reminders, setReminders] = useState({ medication: true, appointment: true, lab: true, weekly: false });
  const [resolved, setResolved] = useState<string[]>([]);
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  const total = careTasks.length;
  const done = careTasks.filter((t) => completedTasks.includes(t.id) || t.status === 'completed').length;
  const pct = Math.round((done / total) * 100);

  const simulateUpload = () => {
    setUploadPct(0);
    const iv = setInterval(() => {
      setUploadPct((p) => {
        if (p === null) return null;
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(() => setUploadPct(null), 1400);
          return 100;
        }
        return p + 20;
      });
    }, 260);
  };

  return (
    <AppShell title={s.careloop} subtitle={lang === 'hi' ? 'निर्देशों को काम में बदलें और प्रगति ट्रैक करें।' : 'Turn instructions into organized actions and stay connected to the next step.'}>
      <div className="mb-6">
        <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          {lang === 'hi' ? 'देखभाल छुट्टी पर खत्म नहीं होती।' : "Care doesn't end at discharge."}
        </h2>
      </div>

      <div className="card mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h3 className="font-display text-[16px] font-bold text-ink">Your care-plan timeline</h3>
            <p className="mt-1 text-[12.5px] text-ink-soft">From discharge to completed follow-up · sample plan</p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={pct} size={72} stroke={7} label="complete" />
          </div>
        </div>
        <div className="border-t border-line bg-canvas/50 px-6 py-6">
          <ol className="relative flex gap-0 overflow-x-auto pb-2 lg:justify-between">
            {careTasks.map((task, i) => {
              const isDone = task.status === 'completed' || completedTasks.includes(task.id);
              return (
                <li key={task.id} className="relative min-w-[150px] flex-1 px-2 first:pl-0">
                  {i < careTasks.length - 1 && (
                    <span className={`absolute left-6 top-[11px] h-0.5 w-[calc(100%-8px)] ${isDone ? 'bg-teal-300' : 'bg-line'}`} />
                  )}
                  <span
                    className={`relative z-10 mb-3 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isDone ? 'border-teal-500 bg-teal-500 text-white' : task.status === 'attention' ? 'border-coral-400 bg-peach' : 'border-primary-300 bg-white'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={13} /> : <span className={`h-2 w-2 rounded-full ${task.status === 'attention' ? 'bg-coral-500 animate-pulse' : 'bg-primary-300'}`} />}
                  </span>
                  <p className={`text-[12.5px] font-bold leading-snug ${isDone ? 'text-ink' : 'text-ink'}`}>{task.title}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-ink-faint">{task.due}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-7">
          <div className="card p-6">
            <h3 className="mb-4 font-display text-[16px] font-bold text-ink">Tasks</h3>
            <div className="space-y-3">
              {careTasks.map((task) => {
                const isDone = task.status === 'completed' || completedTasks.includes(task.id);
                return (
                  <div key={task.id} className={`rounded-xl border px-4 py-3.5 transition-all ${isDone ? 'border-teal-100 bg-mint/40' : task.status === 'attention' ? 'border-coral-100 bg-peach/40' : 'border-line bg-white'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleTask(task.id)}
                          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                          className={`flex h-5.5 w-5.5 h-[22px] w-[22px] items-center justify-center rounded-md border-2 transition-all ${isDone ? 'border-teal-500 bg-teal-500 text-white' : 'border-line bg-white hover:border-primary-300'}`}
                        >
                          {isDone && <CheckCircle2 size={13} />}
                        </button>
                        <p className={`text-[13.5px] font-bold ${isDone ? 'text-ink-soft line-through' : 'text-ink'}`}>{task.title}</p>
                      </div>
                      {!isDone && task.status !== 'completed' && <StatusBadge status={task.status} />}
                    </div>
                    <div className="mt-1.5 pl-[34px] text-[12px] text-ink-soft">
                      <p>{task.owner} · {task.due}</p>
                      {task.next && <p className="text-ink-faint">Next: {task.next}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display text-[16px] font-bold text-ink">Barriers to resolve</h3>
            <p className="mt-1 text-[12.5px] text-ink-soft">Choose a next action for anything standing in your way.</p>
            <div className="mt-4 space-y-3">
              {barriers.map((b) => {
                const isResolved = resolved.includes(b.id);
                return (
                  <div key={b.id} className={`rounded-xl border px-4 py-4 transition-all ${isResolved ? 'border-teal-100 bg-mint/40' : 'border-line bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isResolved ? 'bg-mint text-teal-600' : b.tone}`}>
                        {isResolved ? <CheckCircle2 size={16} /> : <b.icon size={16} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[13.5px] font-bold ${isResolved ? 'text-ink-soft line-through' : 'text-ink'}`}>{b.title}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{b.body}</p>
                        {!isResolved && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {b.actions.map((a, ai) => (
                              <button
                                key={a}
                                onClick={() => ai === b.actions.length - 1 ? setResolved((r) => [...r, b.id]) : b.actions[0] === 'Find specialists near me' ? navigate('specialists') : b.actions[0] === 'Check Health Records' ? navigate('records') : navigate('hospitals')}
                                className={ai === b.actions.length - 1 ? 'chip bg-ink text-white hover:opacity-90' : 'chip bg-sky text-primary-700 hover:bg-primary-100'}
                              >
                                {a} {ai < b.actions.length - 1 && <ArrowRight size={11} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:col-span-5">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-ink"><Bell size={15} className="text-primary-500" /> Reminders & notifications</h3>
            <div className="mt-4 space-y-3">
              {([
                ['medication', 'Medication reminders', 'Daily at 9:00 AM and 9:00 PM'],
                ['appointment', 'Appointment follow-ups', '24 hours before each appointment'],
                ['lab', 'Lab test reminders', '48 hours before a due test'],
                ['weekly', 'Weekly care-plan summary', 'Every Sunday morning'],
              ] as const).map(([key, label, meta]) => (
                <label key={key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3">
                  <span>
                    <span className="block text-[13px] font-bold text-ink">{label}</span>
                    <span className="block text-[11.5px] text-ink-faint">{meta}</span>
                  </span>
                  <button
                    role="switch"
                    aria-checked={reminders[key]}
                    onClick={() => setReminders((r) => ({ ...r, [key]: !r[key] }))}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${reminders[key] ? 'bg-teal-500' : 'bg-line'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${reminders[key] ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-ink"><Upload size={15} className="text-teal-500" /> Add a document</h3>
            <p className="mt-1.5 text-[12.5px] text-ink-soft">Prescriptions, reports, discharge summaries, referral letters.</p>
            <button onClick={simulateUpload} className="btn-secondary mt-4 w-full border-dashed">
              <Upload size={15} /> Upload a document
            </button>
            {uploadPct !== null && (
              <div className="mt-3 animate-fade-in">
                <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-400 transition-all duration-200" style={{ width: `${uploadPct}%` }} />
                </div>
                <p className="mt-1 text-[11.5px] font-semibold text-ink-soft">
                  {uploadPct < 100 ? `Uploading… ${uploadPct}%` : 'Uploaded to Health Records (demo)'}
                </p>
              </div>
            )}
            <button className="btn-ghost mt-2 w-full text-[12.5px]" onClick={() => navigate('records')}>
              Open Health Records <ArrowRight size={13} />
            </button>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-[15px] font-bold text-ink"><MessageSquare size={15} className="text-violet-500" /> Coordination notes</h3>
            <div className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed">
              <div className="rounded-xl bg-sky px-3.5 py-2.5 text-primary-800">
                <strong>Care team (sample):</strong> Follow-up window is 7 days. Escalate if not arranged by day 5.
              </div>
              <div className="rounded-xl bg-mint/60 px-3.5 py-2.5 text-teal-800">
                <strong>AI Doctor (SehatSaathi):</strong> I prepared 4 questions for your consultation — review them before your visit.
              </div>
            </div>
          </div>

          <Notice kind="info">{s.sampleNote}</Notice>
        </aside>
      </div>

    </AppShell>
  );
}
