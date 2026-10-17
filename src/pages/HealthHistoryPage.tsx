import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  ClipboardCopy,
  Download,
  FileText,
  Lock,
  Pill,
  ScanLine,
  Share2,
  Stethoscope,
  Upload,
  UserRound,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Notice, Modal } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import {
  deleteTimelineEntry,
  insertHealthDocument,
  insertTimelineEntry,
  loadHealthDocuments,
  loadTimeline,
  updateDocumentExtraction,
  updateTimelineEntry,
  type EntryOrigin,
  type EntryType,
  type HealthDocument,
  type TimelineEntry,
} from '@/lib/healthData';

const TYPE_META: Record<EntryType, { label: string; icon: typeof Pill; cls: string }> = {
  condition: { label: 'Condition', icon: Stethoscope, cls: 'bg-peach text-coral-600' },
  medication: { label: 'Medication', icon: Pill, cls: 'bg-mint text-teal-700' },
  allergy: { label: 'Allergy', icon: ScanLine, cls: 'bg-peach text-coral-600' },
  procedure: { label: 'Procedure', icon: Stethoscope, cls: 'bg-sky text-primary-600' },
  test: { label: 'Test', icon: FileText, cls: 'bg-lavender text-violet-600' },
  visit: { label: 'Visit', icon: CalendarDays, cls: 'bg-sky text-primary-600' },
};

const ORIGIN_META: Record<EntryOrigin, { label: string; cls: string }> = {
  'patient-reported': { label: 'Patient-reported', cls: 'bg-canvas text-ink-soft border border-line' },
  'document-extracted': { label: 'Document-extracted', cls: 'bg-sky text-primary-600' },
  'clinician-confirmed': { label: 'Clinician-confirmed', cls: 'bg-mint text-teal-700' },
};

const DOC_CATEGORIES = ['Prescription', 'Lab Report', 'Discharge Summary', 'Other'] as const;

export function HealthHistoryPage() {
  const { lang } = useApp();
  const hi = lang === 'hi';
  const [docs, setDocs] = useState<HealthDocument[]>([]);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [reviewDoc, setReviewDoc] = useState<HealthDocument | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<(typeof DOC_CATEGORIES)[number]>('Lab Report');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualType, setManualType] = useState<EntryType>('condition');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDetail, setManualDetail] = useState('');
  const [manualDate, setManualDate] = useState('');

  const reload = async () => {
    const [d, e] = await Promise.all([loadHealthDocuments(), loadTimeline()]);
    setDocs(d);
    setEntries(e);
    setOffline(d.length === 0 && e.length === 0);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, []);

  const pendingEntries = entries.filter((e) => e.approval === 'pending_review');
  const approved = entries.filter((e) => e.approval === 'approved');
  const shared = approved.filter((e) => e.shareWithProvider);

  const summaryText = useMemo(() => {
    const lines = [
      'PATIENT SUMMARY (prepared by the patient, not a medical record)',
      ...shared.map((e) =>
        `- [${TYPE_META[e.entryType].label}] ${e.title}${e.detail ? `: ${e.detail}` : ''}${e.entryDate ? ` (${e.entryDate})` : ''} [${ORIGIN_META[e.origin].label}]`
      ),
    ];
    return lines.join('\n');
  }, [shared]);

  const handleUpload = async () => {
    if (!uploadTitle.trim()) return;
    setBusy(true);
    const doc = await insertHealthDocument({
      title: uploadTitle.trim(),
      category: uploadCategory,
      fileName: uploadFile?.name ?? null,
      fileType: uploadFile?.type ?? null,
      pages: 1,
    });
    if (doc) {
      await updateDocumentExtraction(doc.id, 'extracted');
      await insertTimelineEntry({
        entryType: 'visit',
        title: `${uploadCategory} — ${uploadTitle.trim()}`,
        detail: `Uploaded as ${uploadCategory}. Review and confirm the extracted details below before they are added to your approved history.`,
        entryDate: new Date().toISOString().slice(0, 10),
        origin: 'document-extracted',
        documentId: doc.id,
        sourceLabel: `Extracted from upload · needs your review`,
      });
    }
    await reload();
    setBusy(false);
    setShowUpload(false);
    setUploadTitle('');
    setUploadFile(null);
    const fresh = await loadHealthDocuments();
    const newest = fresh[0];
    if (newest) setReviewDoc(newest);
  };

  const approve = async (entry: TimelineEntry, title: string) => {
    await updateTimelineEntry(entry.id, { approval: 'approved', title });
    setReviewDoc(null);
    await reload();
  };

  const discard = async (entry: TimelineEntry) => {
    await deleteTimelineEntry(entry.id);
    await reload();
  };

  const toggleShare = async (entry: TimelineEntry) => {
    await updateTimelineEntry(entry.id, { shareWithProvider: !entry.shareWithProvider });
    await reload();
  };

  const addManual = async () => {
    if (!manualTitle.trim()) return;
    await insertTimelineEntry({
      entryType: manualType,
      title: manualTitle.trim(),
      detail: manualDetail.trim() || null,
      entryDate: manualDate || null,
      origin: 'patient-reported',
    });
    setManualTitle('');
    setManualDetail('');
    setManualDate('');
    setShowAddManual(false);
    await reload();
  };

  const downloadSummary = () => {
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'patient-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title={hi ? 'मेरा स्वास्थ्य इतिहास' : 'My Health History'}
      subtitle={hi
        ? 'दस्तावेज़ अपलोड करें, निकाली गई जानकारी की समीक्षा करें, फिर अपनी टाइमलाइन में सहेजें।'
        : 'Upload documents, review what was extracted, then save approved entries to your timeline.'}
      actions={
        <div className="flex gap-2">
          <button className="btn-secondary text-[13px]" onClick={() => setShowAddManual(true)}>
            <UserRound size={15} /> {hi ? 'मैनुअल एंट्री' : 'Add manually'}
          </button>
          <button className="btn-primary text-[13px]" onClick={() => setShowUpload(true)}>
            <Upload size={15} /> {hi ? 'दस्तावेज़ अपलोड' : 'Upload document'}
          </button>
        </div>
      }
    >
      {offline && !loading && (
        <Notice kind="warn">
          {hi ? 'डेटाबेस उपलब्ध नहीं — अभी कोई रिकॉर्ड नहीं दिखा सकते।' : 'The database is not reachable, so records cannot be shown right now.'}
        </Notice>
      )}

      {loading && <div className="card animate-pulse p-6"><div className="h-4 w-48 rounded bg-primary-50" /></div>}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-7">
          <div className="space-y-6 lg:col-span-4">
            {pendingEntries.length > 0 && (
              <div className="rounded-2xl border border-peach bg-peach/30 p-5">
                <h3 className="font-display text-[15px] font-bold text-ink">
                  {hi ? 'समीक्षा बाकी है' : 'Needs your review'}
                </h3>
                <p className="mt-1 text-[12.5px] text-ink-soft">
                  {hi
                    ? 'दस्तावेज़ों से निकाली गई जानकारी तब तक इतिहास का हिस्सा नहीं होती जब तक आप स्वीकृत न दें।'
                    : 'Information extracted from documents is not part of your history until you approve it.'}
                </p>
                <ul className="mt-3 space-y-2">
                  {pendingEntries.map((e) => (
                    <li key={e.id} className="rounded-xl border border-line bg-white p-3.5">
                      <p className="text-[13px] font-bold text-ink">{e.title}</p>
                      {e.detail && <p className="mt-0.5 text-[12px] text-ink-soft">{e.detail}</p>}
                      <p className="mt-1 text-[11px] font-medium text-ink-faint">{e.sourceLabel}</p>
                      <div className="mt-2.5 flex gap-2">
                        <button className="btn-primary text-[12px]" onClick={() => approve(e, e.title)}>
                          <BadgeCheck size={13} /> {hi ? 'स्वीकृत करें' : 'Approve'}
                        </button>
                        <button className="btn-secondary text-[12px]" onClick={() => discard(e)}>
                          {hi ? 'हटाएँ' : 'Discard'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card p-5">
              <h3 className="font-display text-[16px] font-bold text-ink">{hi ? 'चिकित्सा टाइमलाइन' : 'Medical timeline'}</h3>
              <p className="mt-1 text-[12px] font-medium text-ink-faint">{hi ? 'स्वीकृत प्रविष्टियाँ, नवीनतम पहले।' : 'Approved entries, newest first. Each shows its source.'}</p>
              {approved.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-line bg-canvas p-6 text-center text-[13px] text-ink-soft">
                  {hi ? 'अभी कोई स्वीकृत प्रविष्टि नहीं। दस्तावेज़ अपलोड करें या मैनुअल जोड़ें।' : 'No approved entries yet. Upload a document or add one manually.'}
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {approved.map((e) => {
                    const meta = TYPE_META[e.entryType];
                    const Icon = meta.icon;
                    return (
                      <li key={e.id} className="flex gap-3 rounded-xl border border-line bg-canvas p-4">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.cls}`}><Icon size={16} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13.5px] font-bold text-ink">{e.title}</p>
                            <span className={`chip ${ORIGIN_META[e.origin].cls}`}>{ORIGIN_META[e.origin].label}</span>
                          </div>
                          {e.detail && <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{e.detail}</p>}
                          <p className="mt-1 text-[11px] font-medium text-ink-faint">
                            {e.entryDate && `${e.entryDate} · `}{e.sourceLabel}
                          </p>
                          <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-primary-600">
                            <input type="checkbox" className="h-3.5 w-3.5 accent-primary-500" checked={e.shareWithProvider} onChange={() => toggleShare(e)} />
                            <Share2 size={12} /> {hi ? 'विज़िट सारांश में शामिल करें' : 'Include in visit summary'}
                          </label>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <div className="card p-5">
              <h3 className="font-display text-[15px] font-bold text-ink">{hi ? 'दस्तावेज़' : 'Documents'}</h3>
              {docs.length === 0 ? (
                <p className="mt-3 text-[12.5px] text-ink-soft">{hi ? 'अभी कोई दस्तावेज़ नहीं।' : 'No documents uploaded yet.'}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {docs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-bold text-ink">{d.title}</p>
                        <p className="text-[11px] text-ink-faint">{d.category} · {d.pages} page(s) · {d.extractionStatus}</p>
                      </div>
                      <button className="btn-secondary shrink-0 text-[11.5px]" onClick={() => setReviewDoc(d)}>
                        {d.extractionStatus === 'extracted' ? (hi ? 'समीक्षा' : 'Review') : (hi ? 'देखें' : 'View')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
                {hi
                  ? 'डेमो मोड: फ़ाइलें संग्रहीत नहीं होतीं — केवल मेटाडेटा सहेजा जाता है।'
                  : 'Demo mode: file contents are not stored — only the metadata you see.'}
              </p>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-[15px] font-bold text-ink">{hi ? 'विज़िट सारांश' : 'Appointment summary'}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                {hi
                  ? `${shared.length} प्रविष्टियाँ आपकी सहमति से साझा करने के लिए चिह्नित हैं।`
                  : `${shared.length} entr${shared.length === 1 ? 'y is' : 'ies are'} marked for sharing, with your consent per entry.`}
              </p>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary flex-1 justify-center text-[12.5px]" onClick={() => setShowSummary(true)} disabled={shared.length === 0}>
                  <ClipboardCopy size={14} /> {hi ? 'देखें' : 'Preview'}
                </button>
                <button className="btn-primary flex-1 justify-center text-[12.5px]" onClick={downloadSummary} disabled={shared.length === 0}>
                  <Download size={14} /> {hi ? 'डाउनलोड' : 'Download'}
                </button>
              </div>
            </div>

            <Notice kind="info">
              <span className="flex items-start gap-1.5">
                <Lock size={14} className="mt-0.5 shrink-0" />
                {hi
                  ? 'MediLink दस्तावेज़ से निदान नहीं करता। निकाली गई जानकारी केवल तब तक अपुष्ट रहती है जब तक आप स्वीकृत न दें।'
                  : 'MediLink does not diagnose from documents. Extracted facts stay unconfirmed until you approve them.'}
              </span>
            </Notice>
          </div>
        </div>
      )}

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title={hi ? 'दस्तावेज़ अपलोड करें' : 'Upload a document'}>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="doc-title">Title</label>
            <input id="doc-title" className="input" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Discharge summary — October visit" />
          </div>
          <div>
            <label className="label" htmlFor="doc-cat">Category</label>
            <select id="doc-cat" className="input" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value as (typeof DOC_CATEGORIES)[number])}>
              {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="doc-file">File (PDF or image, stored as metadata in demo mode)</label>
            <input id="doc-file" type="file" accept=".pdf,image/*" className="input" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
          </div>
          <button className="btn-primary w-full justify-center" onClick={handleUpload} disabled={busy || !uploadTitle.trim()}>
            {busy ? (hi ? 'जाँच जारी…' : 'Processing…') : (hi ? 'अपलोड करें' : 'Upload')}
          </button>
        </div>
      </Modal>

      <Modal open={showAddManual} onClose={() => setShowAddManual(false)} title={hi ? 'मैनुअल प्रविष्टि जोड़ें' : 'Add a manual entry'}>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="m-type">Type</label>
            <select id="m-type" className="input" value={manualType} onChange={(e) => setManualType(e.target.value as EntryType)}>
              {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="m-title">Title</label>
            <input id="m-title" className="input" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="e.g. Penicillin allergy" />
          </div>
          <div>
            <label className="label" htmlFor="m-detail">Details (optional)</label>
            <textarea id="m-detail" className="input min-h-20" value={manualDetail} onChange={(e) => setManualDetail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="m-date">Date (optional)</label>
            <input id="m-date" type="date" className="input" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
          </div>
          <button className="btn-primary w-full justify-center" onClick={addManual} disabled={!manualTitle.trim()}>
            {hi ? 'सहेजें' : 'Save entry'}
          </button>
          <p className="text-[11.5px] text-ink-faint">
            {hi ? 'मैनुअल प्रविष्टियाँ "patient-reported" के रूप में चिह्नित होती हैं।' : 'Manual entries are marked "patient-reported" and never presented as clinician-confirmed.'}
          </p>
        </div>
      </Modal>

      <Modal open={showSummary} onClose={() => setShowSummary(false)} title={hi ? 'विज़िट सारांश' : 'Appointment summary'}>
        <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-canvas p-4 text-[12px] leading-relaxed text-ink-soft">{summaryText}</pre>
        <button className="btn-primary mt-4 w-full justify-center" onClick={downloadSummary}>
          <Download size={14} /> {hi ? 'डाउनलोड करें' : 'Download'}
        </button>
      </Modal>

      <Modal open={!!reviewDoc} onClose={() => setReviewDoc(null)} title={reviewDoc?.title ?? ''}>
        {reviewDoc && (
          <div className="space-y-4">
            <Notice kind="info">
              {hi
                ? 'डेमो मोड: कोई वास्तविक OCR नहीं — नीचे की प्रविष्टियाँ इस दस्तावेज़ से जुड़े उदाहरण हैं। सही लगने पर ही स्वीकृत करें।'
                : 'Demo mode: no real OCR is connected — the entries below are examples linked to this document. Approve only what looks right.'}
            </Notice>
            {entries.filter((e) => e.documentId === reviewDoc.id).map((e) => (
              <div key={e.id} className="rounded-xl border border-line bg-canvas p-4">
                <p className="text-[13px] font-bold text-ink">{e.title}</p>
                {e.detail && <p className="mt-0.5 text-[12px] text-ink-soft">{e.detail}</p>}
                <p className="mt-1 text-[11px] font-medium text-ink-faint">{e.approval === 'approved' ? (hi ? 'स्वीकृत' : 'Approved') : (hi ? 'समीक्षा बाकी' : 'Pending review')}</p>
                {e.approval !== 'approved' && (
                  <div className="mt-2 flex gap-2">
                    <button className="btn-primary text-[12px]" onClick={() => approve(e, e.title)}>{hi ? 'स्वीकृत करें' : 'Approve'}</button>
                    <button className="btn-secondary text-[12px]" onClick={() => discard(e)}>{hi ? 'हटाएँ' : 'Discard'}</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
