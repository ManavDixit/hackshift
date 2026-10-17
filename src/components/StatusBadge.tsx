import { AlertTriangle, CheckCircle2, Clock, CircleDashed, type LucideIcon } from 'lucide-react';

type Status = 'completed' | 'upcoming' | 'pending' | 'attention' | 'On track' | 'Due soon' | 'Overdue';

const map: Record<string, { cls: string; label: string; icon: LucideIcon }> = {
  completed: { cls: 'bg-mint text-teal-700', label: 'Completed', icon: CheckCircle2 },
  upcoming: { cls: 'bg-sky text-primary-700', label: 'Upcoming', icon: Clock },
  pending: { cls: 'bg-peach text-coral-600', label: 'Pending', icon: CircleDashed },
  attention: { cls: 'bg-peach text-coral-600', label: 'Needs attention', icon: AlertTriangle },
  'On track': { cls: 'bg-mint text-teal-700', label: 'On track', icon: CheckCircle2 },
  'Due soon': { cls: 'bg-peach text-coral-600', label: 'Due soon', icon: Clock },
  Overdue: { cls: 'bg-coral-50 text-coral-600 border border-coral-200', label: 'Overdue', icon: AlertTriangle },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = map[status] ?? map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`chip ${cfg.cls}`}>
      <Icon size={13} strokeWidth={2.4} />
      {cfg.label}
    </span>
  );
}
