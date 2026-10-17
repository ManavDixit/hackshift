import { useMemo, useState } from 'react';
import { Download, FileText, Eye, Search, Trash2, Upload } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EmptyState, Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { documents } from '@/lib/demoData';
import type { DocRow } from '@/lib/types';

const categories = ['All', 'Prescription', 'Lab Report', 'Discharge Summary', 'Referral', 'Other'] as const;

const statusChip: Record<DocRow['status'], JSX.Element> = {
  ready: <span className="chip bg-mint text-teal-700">Ready</span>,
  processing: <span className="chip bg-sky text-primary-700 animate-pulse">Processing…</span>,
  failed: <span className="chip bg-peach text-coral-600">Failed</span>,
};

export function RecordsPage() {
  const { lang } = useApp();
  const s = t(lang);
  const [cat, setCat] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DocRow | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const rows = useMemo(
    () =>
      documents.filter(
        (d) => (cat === 'All' || d.category === cat) && d.title.toLowerCase().includes(query.toLowerCase())
      ),
    [cat, query]
  );

  const counts = categories.slice(1).map((c) => ({ c, n: documents.filter((d) => d.category === c).length }));

  return (
    <AppShell title={s.healthRecords} subtitle={lang === 'hi' ? 'आपके दस्तावेज़, सुरक्षित और व्यवस्थित।' : 'A secure, organized place for your documents.'}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[24px] font-extrabold tracking-tight text-ink">
          {lang === 'hi' ? 'दस्तावेज़ केंद्र' : 'Document center'}
        </h2>
        <button
          className="btn-primary"
          onClick={() => {
            setUploading(true);
            setUploaded(false);
            setTimeout(() => {
              setUploading(false);
              setUploaded(true);
            }, 1500);
          }}
        >
          <Upload size={15} /> Upload document
        </button>
      </div>

      {uploading && (
        <div className="mb-4 animate-fade-in">
          <div className="h-2 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary-500 to-teal-400" />
          </div>
          <p className="mt-1 text-[12px] font-semibold text-ink-soft">Uploading… (demo)</p>
        </div>
      )}
      {uploaded && (
        <div className="mb-4 animate-fade-up">
          <Notice kind="success">Document uploaded successfully and categorized as “Other”. You can rename it below (demo).</Notice>
        </div>
      )}

      <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input className="input pl-9" placeholder="Search documents" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search documents" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`chip border transition-colors ${cat === c ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-line bg-white text-ink-soft hover:border-primary-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {rows.length > 0 ? (
            <div className="card divide-y divide-line">
              {rows.map((d) => (
                <div key={d.id} className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-sky/30">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${d.status === 'failed' ? 'bg-peach text-coral-500' : 'bg-sky text-primary-500'}`}>
                    <FileText size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink">{d.title}</p>
                    <p className="mt-0.5 text-[11.5px] font-medium text-ink-faint">
                      {d.category} · {d.date} · {d.pages} pages · {d.source}
                    </p>
                  </div>
                  {statusChip[d.status]}
                  <div className="flex gap-1">
                    <button onClick={() => setSelected(d)} className="rounded-lg p-1.5 text-ink-faint hover:bg-primary-50 hover:text-primary-600" aria-label={`Open ${d.title}`}><Eye size={15} /></button>
                    <button className="rounded-lg p-1.5 text-ink-faint hover:bg-primary-50 hover:text-primary-600" aria-label={`Download ${d.title}`}><Download size={15} /></button>
                    <button className="rounded-lg p-1.5 text-ink-faint hover:bg-coral-50 hover:text-coral-500" aria-label={`Delete ${d.title}`}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} title="No documents found" body="Try a different category or search term, or upload a new document." />
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {counts.map(({ c, n }) => (
              <button key={c} onClick={() => setCat(c)} className="card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <p className="stat-num text-[20px]">{n}</p>
                <p className="mt-0.5 text-[11px] font-bold text-ink-soft">{c}</p>
              </button>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="card sticky top-6 overflow-hidden">
            {selected ? (
              <div className="animate-fade-up">
                <div className="flex min-h-[200px] items-center justify-center border-b border-line bg-gradient-to-b from-sky to-white px-6 py-10">
                  <div className="w-full max-w-[220px] rounded-lg border border-line bg-white p-4 shadow-card">
                    <div className="mb-3 h-2.5 w-3/4 rounded bg-line" />
                    <div className="mb-2 h-2 w-full rounded bg-line/70" />
                    <div className="mb-2 h-2 w-5/6 rounded bg-line/70" />
                    <div className="mb-2 h-2 w-full rounded bg-line/70" />
                    <div className="h-2 w-2/3 rounded bg-line/70" />
                    <p className="mt-4 text-center text-[10px] font-bold text-ink-faint">Document preview (demo)</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[15px] font-bold text-ink">{selected.title}</h3>
                  <div className="mt-3 space-y-2 text-[12.5px]">
                    {[
                      ['Category', selected.category],
                      ['Date', selected.date],
                      ['Pages', String(selected.pages)],
                      ['Source', selected.source],
                      ['Status', selected.status === 'ready' ? 'Ready' : selected.status === 'processing' ? 'Processing' : 'Failed'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-line/60 pb-2">
                        <span className="font-semibold text-ink-soft">{k}</span>
                        <span className="font-bold text-ink">{v}</span>
                      </div>
                    ))}
                  </div>
                  {selected.excerpt && (
                    <div className="mt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Extracted highlights (unverified)</p>
                      <p className="mt-1.5 rounded-xl bg-canvas px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-soft">{selected.excerpt}</p>
                      <p className="mt-1.5 text-[11px] font-medium text-ink-faint">
                        Automatic extraction — not clinician-verified. Confirm important details with your care team.
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button className="btn-secondary flex-1 text-[12.5px]"><Download size={14} /> Download</button>
                    <button className="btn-ghost text-[12.5px]" onClick={() => setSelected(null)}>Close</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky text-primary-500"><FileText size={20} /></span>
                <p className="text-[13.5px] font-bold text-ink">Document preview</p>
                <p className="mx-auto mt-1 max-w-[240px] text-[12.5px] text-ink-soft">
                  Select any document to preview it here with its metadata and any extracted highlights.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
