import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Sparkles, Waves } from 'lucide-react';
import { Notice } from '@/components/Ui';
import { agents } from '@/lib/agents';

interface Step {
  at: number;
  agent: string | null;
  label: string;
  detail: string;
}

const scenario: Step[] = [
  { at: 0, agent: null, label: 'Request received', detail: 'Aarav (fictional) is discharged after a cardiac observation. The Orchestrator receives: “Organize my post-discharge care.”' },
  { at: 1, agent: 'orchestrator', label: 'Orchestrator routes work', detail: 'The Orchestrator identifies four relevant agents and creates a coordinated workflow.' },
  { at: 2, agent: 'hospital', label: 'Hospital agent responds', detail: 'Illustrative result: three nearby hospitals compared with itemized estimated cost ranges (sample data).' },
  { at: 3, agent: 'doctor', label: 'AI Doctor prepares context', detail: 'Illustrative result: plain-language explanation of discharge instructions and 4 questions prepared for the clinician.' },
  { at: 4, agent: 'lab', label: 'Lab coordinator organizes tests', detail: 'Illustrative result: lipid profile referral created with two comparable lab options (sample prices).' },
  { at: 5, agent: 'pharmacy', label: 'Pharmacy agent compares prices', detail: 'Illustrative result: comparable pack identified at 33% lower listed price, flagged for pharmacist verification.' },
  { at: 6, agent: 'careloop', label: 'CareLoop assembles the plan', detail: 'Illustrative result: 5-step care plan created with owners, due dates, and reminder preferences.' },
  { at: 7, agent: 'orchestrator', label: 'Orchestrator consolidates', detail: 'All results combined into one care-plan preview, ready for the patient to review. Human review recommended before booking anything.' },
];

export function AgentNetworkPage() {
  const [phase, setPhase] = useState(-1);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => {
        setPhase((p) => {
          if (p >= scenario.length - 1) {
            setRunning(false);
            return p;
          }
          return p + 1;
        });
      }, 1600);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const active = phase >= 0 ? scenario[Math.min(phase, scenario.length - 1)] : null;
  const activeAgentId = active?.agent ?? null;
  const touchedAgents = new Set(scenario.slice(0, phase + 1).map((s) => s.agent).filter(Boolean));
  const currentStep = scenario[Math.max(phase, 0)];

  const start = () => {
    setPhase(0);
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setPhase(-1);
  };

  const byId = (id: string) => agents.find((a) => a.id === id)!;
  const others = agents.filter((a) => a.id !== 'orchestrator');

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-app py-10">
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow"><Waves size={13} /> Medilink Intelligence</span>
          <h1 className="mt-2 font-display text-[30px] font-extrabold tracking-tight text-ink sm:text-[36px]">
            The eight-agent network
          </h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">
            MediLink coordinates exactly eight specialized AI agents through one Orchestrator. Each
            agent has a focused responsibility, and the Orchestrator routes every request to the
            right combination — then consolidates the results.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="card relative overflow-hidden p-6">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{ background: 'radial-gradient(50% 40% at 50% 45%, rgba(20,184,166,0.07), transparent 70%)' }}
                />
                <div className="relative mx-auto aspect-[4/3.4] w-full max-w-[520px]">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 440" fill="none" aria-hidden="true">
                    {others.map((a, i) => {
                      const ang = (Math.PI * 2 * i) / others.length - Math.PI / 2;
                      const cx = 260 + Math.cos(ang) * 185;
                      const cy = 210 + Math.sin(ang) * 165;
                      const isActive = activeAgentId === a.id || (phase >= scenario.length - 1 && phase >= 0);
                      const wasTouched = touchedAgents.has(a.id);
                      return (
                        <path
                          key={a.id}
                          d={`M260 210 Q ${(260 + cx) / 2 + (cy - 210) * 0.18} ${(210 + cy) / 2 + (260 - cx) * 0.18} ${cx} ${cy}`}
                          stroke={wasTouched ? a.accent : '#E5EBF3'}
                          strokeWidth={isActive ? 2.4 : 1.4}
                          strokeDasharray="6 6"
                          className={isActive && running ? 'animate-flow-dash' : ''}
                          style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                        />
                      );
                    })}
                  </svg>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <AgentBubble id="orchestrator" size={96} active={activeAgentId === 'orchestrator'} dimmed={false} />
                  </div>
                  {others.map((a, i) => {
                    const ang = (Math.PI * 2 * i) / others.length - Math.PI / 2;
                    const cx = 50 + (Math.cos(ang) * 50 + 50) * 0.84;
                    const cy = 50 + (Math.sin(ang) * 50 + 50) * 0.75;
                    return (
                      <div
                        key={a.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${cx}%`, top: `${cy}%` }}
                      >
                        <AgentBubble
                          id={a.id}
                          size={62}
                          active={activeAgentId === a.id}
                          dimmed={phase >= 0 && !touchedAgents.has(a.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {!running && phase < 0 && (
                  <button className="btn-primary" onClick={start}>
                    <Play size={15} /> Run Demo Workflow
                  </button>
                )}
                {running && (
                  <button className="btn-secondary" onClick={() => setRunning(false)}>
                    <Pause size={15} /> Pause
                  </button>
                )}
                {!running && phase >= 0 && phase < scenario.length - 1 && (
                  <button className="btn-primary" onClick={() => setRunning(true)}>
                    <Play size={15} /> Resume
                  </button>
                )}
                <button className="btn-secondary" onClick={() => { setPhase(0); setRunning(true); }} disabled={phase < 0}>
                  <RotateCcw size={15} /> Restart
                </button>
                <button className="btn-ghost" onClick={reset} disabled={phase < 0}>
                  Reset
                </button>
                <span className="chip bg-lavender text-violet-600"><Sparkles size={12} /> Illustrative demo</span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="card sticky top-6 p-6">
                {phase < 0 ? (
                  <div className="py-8 text-center">
                    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky text-primary-500">
                      <Waves size={24} />
                    </span>
                    <p className="font-display text-[16px] font-bold text-ink">Watch a workflow come together</p>
                    <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
                      Run the demo to see how a fictional post-discharge request flows through the
                      Orchestrator and its agents.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="chip bg-sky text-primary-700">Step {Math.min(phase + 1, scenario.length)} of {scenario.length}</span>
                      <span className="text-[12px] font-bold text-ink-faint">{Math.round(((phase + 1) / scenario.length) * 100)}%</span>
                    </div>
                    <div className="mb-5 h-1.5 w-full rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-teal-400 transition-all duration-700"
                        style={{ width: `${((phase + 1) / scenario.length) * 100}%` }}
                      />
                    </div>
                    <span
                      className="chip mb-3"
                      style={{ background: currentStep.agent ? byId(currentStep.agent).soft : '#E9F2FF', color: currentStep.agent ? byId(currentStep.agent).accent : '#2660DB' }}
                    >
                      {currentStep.agent ? byId(currentStep.agent).name : 'MediLink user'}
                    </span>
                    <h3 className="font-display text-[17px] font-bold text-ink">{currentStep.label}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{currentStep.detail}</p>
                    {phase >= scenario.length - 1 && (
                      <div className="mt-5 rounded-2xl border border-teal-100 bg-mint/60 p-4 animate-fade-up">
                        <p className="text-[12px] font-bold uppercase tracking-wide text-teal-700">Care-plan preview (illustrative)</p>
                        <ul className="mt-2 space-y-1.5 text-[13px] font-medium text-ink-soft">
                          {['Review discharge instructions', 'Arrange cardiology follow-up', 'Complete lipid profile', 'Collect referral letter', 'Attend follow-up consultation'].map((s) => (
                            <li key={s} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                <div className="mt-5">
                  <Notice kind="info">
                    This simulation is a design demonstration. No real clinical analysis, booking, or
                    backend agent execution occurs.
                  </Notice>
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-12 font-display text-[22px] font-extrabold tracking-tight text-ink">Agent details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((a) => (
              <div key={a.id} className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: a.soft, color: a.accent }}>
                  <a.icon size={20} />
                </span>
                <h3 className="font-display text-[14.5px] font-bold leading-snug text-ink">{a.name}</h3>
                <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-soft">{a.role}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="chip bg-mint text-teal-700">Active</span>
                  <span className="cursor-pointer text-[12px] font-bold text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
                    View details
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function byId(id: string) {
  return agents.find((a) => a.id === id)!;
}

function AgentBubble({ id, size, active, dimmed }: { id: string; size: number; active: boolean; dimmed: boolean }) {
  const a = byId(id);
  const Icon = a.icon;
  const isOrch = id === 'orchestrator';
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 bg-white shadow-card transition-all duration-300 ${
        active ? 'scale-110 shadow-glow' : dimmed ? 'opacity-40' : ''
      }`}
      style={{
        width: size,
        height: size,
        borderColor: active ? a.accent : '#E5EBF3',
        borderRadius: isOrch ? '9999px' : undefined,
        background: isOrch ? 'linear-gradient(135deg,#3978F6,#14B8A6)' : undefined,
        boxShadow: active ? `0 0 0 4px ${a.soft}, 0 8px 24px rgba(24,36,58,0.12)` : undefined,
      }}
      title={a.name}
    >
      <Icon size={size * 0.32} style={{ color: isOrch ? '#fff' : a.accent }} strokeWidth={2.2} />
      {isOrch && <span className="mt-1 text-center text-[8.5px] font-bold leading-tight text-white">MediLink<br />Orchestrator</span>}
    </div>
  );
}
