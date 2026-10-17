import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/35 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift animate-fade-up sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-soft hover:bg-primary-50 hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Notice({ kind = 'info', children }: { kind?: 'info' | 'warn' | 'success'; children: ReactNode }) {
  const styles = {
    info: { cls: 'bg-sky text-primary-800 border-primary-100', Icon: Info },
    warn: { cls: 'bg-peach text-coral-700 border-coral-100', Icon: AlertTriangle },
    success: { cls: 'bg-mint text-teal-700 border-teal-100', Icon: CheckCircle2 },
  }[kind];
  const Icon = styles.Icon;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-medium leading-relaxed ${styles.cls}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, body, icon: Icon }: { title: string; body: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky text-primary-500">
        <Icon size={22} />
      </span>
      <p className="font-display text-[15px] font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-ink-soft">{body}</p>
    </div>
  );
}
