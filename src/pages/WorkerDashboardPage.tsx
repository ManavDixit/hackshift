import { useMemo, useState } from 'react';
import { ArrowUpRight, Bell, FileText, ShieldAlert, Stethoscope, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { HBarChart, LineChart, ProgressRing } from '@/components/Charts';
import { EmptyState, Modal, Notice } from '@/components/Ui';
import { StatusBadge } from '@/components/StatusBadge';
import { useApp } from '@/lib/appContext';
import { careTasks, workQueue } from '@/lib/demoData';
import type { WorkQueueRow } from '@/lib/types';

type SortKey = 'patient' | 'due' | 'status';

export function WorkerDashboardPage() {
  const { lang, profile, navigate } = useApp();
  const [queue, setQueue] = useState<WorkQueueRow[]>(workQueue);
  const [sortKey, setSortKey] = useState<SortKey>('due');
  const [selectedPatient, setSelectedPatient] = useState<WorkQueueRow | null>(null);
  const [escalated, setEscalated] = useState(false);

  const sorted = useMemo(() => {
    const order: Record<string, number> = { Overdue: 0, 'Due soon': 1, 'On track': 2 };
    return [...queue].sort((a, b) => {
      if (sortKey === 'status') return order[a.status] - order[b.status];
      if (sortKey === 'patient') return a.patient.localeCompare(b.patient);
      return 0;
    });
  }, [queue, sortKey]);

  const metrics = [
    { label: 'Assigned patients', value: '24', sub: 'Across 3 care teams', icon: Users, tone: 'bg-sky text-primary-500' },
    { label: 'Open coordination tasks', value: '9', sub: '4 due this week', icon: FileText, tone: 'bg-mint text-teal-600' },
    { label: 'Overdue follow-ups', value: '2', sub: 'Needs action today', icon: Bell, tone: 'bg-peach text-coral-500' },
    { label: 'Referrals awaiting action', value: '3', sub: '1 missing documents', icon: Stethoscope, tone: 'bg-lavender text-violet-500' },
  ];

  const distribution = [
    { label: 'Appointments', value: 4, color: 'linear-gradient(90deg,#3978F6,#5D93F9)' },
    { label: 'Tests pending', value: 3, color: 'linear-gradient(90deg,#14B8A6,#2EC4B0)' },
    { label: 'Documents', value: 2, color: 'linear-gradient(90deg,#7C63E8,#9A82F5)' },
    { label: 'Escalations', value: 1, color: 'linear-gradient(90deg,#E4593A,#F07E5C)' },
  ];

  return (
    <AppShell
      title={lang === 'hi' ? 'टीम अवलोकन' : 'Team overview'}
      subtitle={lang === 'hi' ? 'समन्वय और फ़ॉलो-अप की ज़रूरत वाले रोगी।' : 'Patients who need coordination or follow-up.'}
      actions={
        <span className="chip bg-lavender text-violet-600">
          {profile.name} · Healthcare Worker (demo)
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={m.label} className="card p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${m.tone}`}><m.icon size={17} /></span>
            <p className="stat-num">{m.value}</p>
            <p className="mt-1 text-[12px] font-bold text-ink">{m.label}</p>
            <p className="text-[11px] font-medium text-ink-faint">{m.sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] font-medium text-ink-faint">Demonstration data — not connected to a live hospital system.</p>

      <div className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <h3 className="font-display text-[16px] font-bold text-ink">Priority work queue</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] font-bold text-ink-faint">Sort:</span>
            {(['due', 'status', 'patient'] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className={`rounded-lg px-2.5 py-1 text-[11.5px] font-bold capitalize transition-colors ${sortKey === k ? 'bg-primary-50 text-primary-700' : 'text-ink-faint hover:text-ink'}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-canvas/60 text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-bold">Patient</th>
                <th className="px-4 py-3 font-bold">Pending action</th>
                <th className="px-4 py-3 font-bold">Due</th>
                <th className="px-4 py-3 font-bold">Owner</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Last update</th>
                <th className="px-5 py-3 font-bold">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sorted.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedPatient(r)}
                  className="cursor-pointer transition-colors hover:bg-sky/40"
                >
                  <td className="px-5 py-3.5 font-bold text-ink">{r.patient}</td>
                  <td className="px-4 py-3.5 text-ink">{r.action}</td>
                  <td className="px-4 py-3.5 font-medium text-ink-soft">{r.due}</td>
                  <td className="px-4 py-3.5 text-ink-soft">{r.owner}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3.5 text-ink-faint">{r.lastUpdate}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-primary-600">
                      {r.next} <ArrowUpRight size={13} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="p-6"><EmptyState icon={Users} title="Queue is clear" body="No patients currently need coordination. New cases will appear here." /></div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <div className="card p-6 lg:col-span-5">
          <h3 className="font-display text-[15px] font-bold text-ink">Follow-up completion trend</h3>
          <p className="mt-1 text-[12px] font-medium text-ink-faint">Completed follow-ups per week (sample)</p>
          <div className="mt-4">
            <LineChart points={[3, 5, 4, 7, 6, 9]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']} />
          </div>
        </div>
        <div className="card p-6 lg:col-span-4">
          <h3 className="font-display text-[15px] font-bold text-ink">Open tasks by category</h3>
          <p className="mt-1 text-[12px] font-medium text-ink-faint">Total: 10 open tasks (sample)</p>
          <div className="mt-5">
            <HBarChart data={distribution} unit="tasks" />
          </div>
        </div>
        <div className="card flex flex-col items-center justify-center p-6 lg:col-span-3">
          <h3 className="self-start font-display text-[15px] font-bold text-ink">Care-plan progress</h3>
          <div className="my-4"><ProgressRing value={64} size={110} stroke={9} label="avg" /></div>
          <p className="text-center text-[12px] leading-relaxed text-ink-soft">
            Average completion across active care plans (sample).
          </p>
        </div>
      </div>

      <Modal open={!!selectedPatient} onClose={() => { setSelectedPatient(null); setEscalated(false); }} title={selectedPatient?.patient ?? ''} wide>
        {selectedPatient && (
          <div className="space-y-4">
            <Notice kind="info">Privacy-safe pseudonymized view. Full identity is revealed only through authorized access (demo).</Notice>
            <div className="rounded-xl border border-line bg-canvas px-4 py-3">
              <p className="text-[12px] font-bold uppercase tracking-wide text-ink-faint">Pending action</p>
              <p className="mt-0.5 text-[14px] font-bold text-ink">{selectedPatient.action} · {selectedPatient.due}</p>
            </div>
            <div>
              <p className="mb-2.5 text-[13px] font-bold text-ink">Care-plan timeline</p>
              <ol className="relative">
                {careTasks.map((t, i) => (
                  <li key={t.id} className="relative flex gap-3 pb-3.5 last:pb-0">
                    {i < careTasks.length - 1 && <span className={`absolute left-[9px] top-5 h-full w-0.5 ${t.status === 'completed' ? 'bg-teal-300' : 'bg-line'}`} />}
                    <span className={`relative z-10 mt-0.5 h-[19px] w-[19px] shrink-0 rounded-full border-2 ${t.status === 'completed' ? 'border-teal-500 bg-teal-500' : t.status === 'attention' ? 'border-coral-400 bg-peach' : 'border-line bg-white'}`} />
                    <p className={`text-[13px] font-semibold ${t.status === 'completed' ? 'text-ink-soft' : 'text-ink'}`}>{t.title}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Relevant documents</p>
                <p className="mt-1 text-[12.5px] font-semibold text-ink">Discharge summary · ECG report</p>
              </div>
              <div className="rounded-xl border border-line px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Referral status</p>
                <p className="mt-1 text-[12.5px] font-semibold text-ink">Awaiting referral letter</p>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="esc-note">Coordination note</label>
              <textarea id="esc-note" className="input min-h-[72px] resize-none" placeholder="Add a note for the care team…" />
            </div>
            <div className="rounded-2xl border border-coral-100 bg-peach/40 p-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-coral-700"><ShieldAlert size={15} /> Human escalation</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                Assign this unresolved case to an authorized clinician. Escalation status is shown
                honestly — a case is marked “clinician reviewed” only after that actually happens.
              </p>
              <button className="btn mt-3 bg-coral-500 text-white hover:bg-coral-600" onClick={() => setEscalated(true)}>
                {escalated ? 'Escalated — pending clinician review' : 'Escalate to Dr. Mehta'}
              </button>
              {escalated && <p className="mt-2 text-[12px] font-semibold text-coral-600 animate-fade-in">Status: escalation sent · awaiting clinician review (demo)</p>}
            </div>
            <button className="btn-secondary w-full" onClick={() => navigate('labs')}>Open referral workspace</button>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
