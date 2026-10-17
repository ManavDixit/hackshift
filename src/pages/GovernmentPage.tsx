import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Database,
  FileDown,
  Landmark,
  MapPin,
  Phone,
  RefreshCw,
  Search,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { loadGovFacilities, loadGovSchemes, type GovFacility, type GovScheme } from '@/lib/healthData';

const STATUS_META: Record<GovFacility['verificationStatus'], { cls: string; label: string }> = {
  VERIFIED: { cls: 'bg-mint text-teal-700', label: 'Verified' },
  REPORTED: { cls: 'bg-sky text-primary-600', label: 'Reported' },
  ESTIMATED: { cls: 'bg-sky text-primary-600', label: 'Estimated' },
  DEMO: { cls: 'bg-peach text-coral-600', label: 'Demo data — not official' },
  STALE: { cls: 'bg-peach text-coral-600', label: 'Stale — refresh overdue' },
  UNKNOWN: { cls: 'bg-canvas text-ink-soft border border-line', label: 'Unknown' },
};

function freshness(iso: string | null): string {
  if (!iso) return 'never verified';
  const hours = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 36e5));
  if (hours < 24) return `verified ${hours}h ago`;
  return `verified ${Math.round(hours / 24)} day(s) ago`;
}

export function GovernmentPage() {
  const { lang } = useApp();
  const hi = lang === 'hi';
  const [facilities, setFacilities] = useState<GovFacility[]>([]);
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('any');

  useEffect(() => {
    (async () => {
      const [f, s] = await Promise.all([loadGovFacilities(), loadGovSchemes()]);
      setFacilities(f);
      setSchemes(s);
      setOffline(f.length === 0 && s.length === 0);
      setLoading(false);
    })();
  }, []);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    facilities.forEach((f) => f.specialties.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [facilities]);

  const filtered = facilities.filter((f) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      f.name.toLowerCase().includes(q) ||
      (f.district ?? '').toLowerCase().includes(q) ||
      (f.city ?? '').toLowerCase().includes(q) ||
      (f.locality ?? '').toLowerCase().includes(q);
    const matchesSpec = specialty === 'any' || f.specialties.includes(specialty);
    return matchesQuery && matchesSpec;
  });

  return (
    <AppShell
      title={hi ? 'सरकारी स्वास्थ्य सेवा' : 'Government Healthcare'}
      subtitle={hi
        ? 'सार्वजनिक स्वास्थ्य सुविधाएँ और योजनाएँ — स्रोत और ताज़गी की जानकारी के साथ।'
        : 'Public healthcare facilities and schemes — always shown with source and freshness.'}
    >
      {offline && !loading && (
        <Notice kind="warn">
          {hi ? 'डेटाबेस उपलब्ध नहीं — निर्देशिका नहीं दिख सकती।' : 'The database is not reachable — the directory cannot be shown right now.'}
        </Notice>
      )}

      {loading && <div className="card animate-pulse p-6"><div className="h-4 w-48 rounded bg-primary-50" /></div>}

      {!loading && !offline && (
        <div className="space-y-6">
          <Notice kind="info">
            {hi
              ? 'डेमो मोड: अभी कोई भी सरकारी डेटाबेस लाइव-कनेक्टेड नहीं है। नीचे की सुविधाएँ काल्पनिक डेमो पंक्तियाँ हैं। वास्तविक आधिकारिक डेटा भविष्य में अनुमत डेटासेट आयात से आएगा और तब "Verified" लेबल + वास्तविक स्रोत दिखेगा।'
              : 'Demo mode: no government database is live-connected. The facilities below are fictional demo rows. Real official data would arrive via a permitted dataset import and would be labelled "Verified" with its actual source.'}
          </Notice>

          <div className="card p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="label" htmlFor="gov-q">{hi ? 'खोज (नाम, ज़िला, शहर, क्षेत्र)' : 'Search (name, district, city, locality)'}</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input id="gov-q" className="input pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={hi ? 'उदा. Lakefront' : 'e.g. Lakefront'} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="gov-spec">{hi ? 'विशेषता/सेवा' : 'Specialty / service'}</label>
                <select id="gov-spec" className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  <option value="any">{hi ? 'कोई भी' : 'Any'}</option>
                  {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
                <p className="font-display text-[15px] font-bold text-ink">{hi ? 'कोई सुविधा नहीं मिली' : 'No facilities match'}</p>
                <p className="mt-1 text-[13px] text-ink-soft">{hi ? 'खोज या फ़िल्टर बदलकर देखें।' : 'Try a different search or filter.'}</p>
              </div>
            )}
            {filtered.map((f) => {
              const status = STATUS_META[f.verificationStatus];
              const stale = f.lastVerifiedAt
                ? (Date.now() - new Date(f.lastVerifiedAt).getTime()) / 864e5 > 21
                : true;
              return (
                <div key={f.id} className="card p-5 transition-all duration-300 hover:shadow-lift">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky text-primary-500"><Landmark size={19} /></span>
                      <div>
                        <h3 className="font-display text-[15.5px] font-bold text-ink">{f.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-ink-soft">
                          <MapPin size={12} /> {[f.locality, f.city, f.district, f.state].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-[12px] font-medium text-ink-soft">{f.facilityType} · {hi ? 'सरकारी' : 'Government facility'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`chip ${status.cls}`}>{status.label}</span>
                      {stale && <span className="chip bg-peach text-coral-600"><AlertTriangle size={11} /> {hi ? 'ताज़गी जाँचनी है' : 'Freshness check needed'}</span>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.specialties.map((s) => <span key={s} className="chip bg-sky text-primary-600">{s}</span>)}
                  </div>
                  <div className="mt-3 space-y-1 text-[12.5px] text-ink-soft">
                    {f.address && <p>{f.address}</p>}
                    {f.phone && <p className="flex items-center gap-1.5"><Phone size={12} className="shrink-0" /> {f.phone}</p>}
                  </div>
                  <div className="mt-3 rounded-xl bg-canvas px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-faint">
                    <p><strong className="text-ink-soft">Source:</strong> {f.sourceName}{f.sourceRecordId ? ` · record ${f.sourceRecordId}` : ''}</p>
                    <p><strong className="text-ink-soft">Imported:</strong> {new Date(f.importDate).toLocaleDateString('en-IN')} · <strong className="text-ink-soft">{freshness(f.lastVerifiedAt)}</strong></p>
                    <p className="mt-1">{hi
                      ? 'यह लिस्टिंग वर्तमान बेड/अपॉइंटमेंट उपलब्धता, योजना पात्रता या विशेष उपचार उपलब्धता का प्रमाण नहीं है — कृपया सुविधा से सीधे पुष्टि करें।'
                      : 'This listing is not proof of current bed/appointment availability, scheme eligibility, or specific treatment capability — confirm directly with the facility.'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><BadgeCheck size={17} className="text-teal-600" /> {hi ? 'स्वास्थ्य योजनाएँ' : 'Healthcare schemes'}</h3>
            <ul className="mt-4 space-y-3">
              {schemes.map((s) => {
                const status = STATUS_META[s.verificationStatus];
                return (
                  <li key={s.id} className="rounded-xl border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13.5px] font-bold text-ink">{s.name}</p>
                      <span className={`chip ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{s.description}</p>
                    {s.benefits && <p className="mt-1 text-[12px] text-ink-soft"><strong>{hi ? 'लाभ:' : 'Benefits:'}</strong> {s.benefits}</p>}
                    <p className="mt-1 text-[12px] text-ink-soft"><strong>{hi ? 'पात्रता:' : 'Eligibility:'}</strong> {s.eligibilityNote}</p>
                    <p className="mt-1.5 text-[11px] text-ink-faint">Source: {s.sourceName}</p>
                    {s.officialUrl && (
                      <a href={s.officialUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold text-primary-600 hover:underline">
                        <FileDown size={13} /> {hi ? 'आधिकारिक पोर्टल खोलें' : 'Open the official portal'}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11.5px] text-ink-faint">
              {hi
                ? 'MediLink आय, पते या अधूरी जानकारी से योजना पात्रता नहीं तय करता। पात्रता का निर्णय सक्षम प्राधिकरण ही करता है।'
                : 'MediLink does not decide scheme eligibility from income, address, or incomplete information — only the competent authority can.'}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Database size={17} className="text-primary-500" /> {hi ? 'आधिकारिक डेटासेट आयात वर्कफ़्लो' : 'Official dataset ingestion workflow'}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
              {hi
                ? 'यह मॉड्यूल एक पुन: प्रयोज्य आयात पाइपलाइन के साथ बना है — स्रोत पंजीकृत होते हैं, आयात लॉग होते हैं, और हर पंक्ति अपना स्रोत/ताज़गी रिकॉर्ड रखती है। स्वचालित रिफ्रेश तभी चलता है जब स्रोत अनुमति देता है।'
                : 'This module is built around a reusable ingestion pipeline: sources are registered, imports are logged, and every row keeps its own provenance and freshness record. Automated refresh only runs where the source permits it.'}
            </p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink-soft">
              <li className="flex items-start gap-2"><RefreshCw size={13} className="mt-0.5 shrink-0 text-primary-400" /> Registered sources: PM-JAY empanelled hospital list (manual refresh — automated use not assumed), state directory (manual import only)</li>
              <li className="flex items-start gap-2"><Building2 size={13} className="mt-0.5 shrink-0 text-primary-400" /> Import steps: validate → normalize → deduplicate by source record ID → upsert with provenance (source URL, import date, record ID, last-verified date)</li>
              <li className="flex items-start gap-2"><AlertTriangle size={13} className="mt-0.5 shrink-0 text-primary-400" /> No protected-system scraping, no fake live integration: until a permitted authorized feed exists, everything stays honestly labelled</li>
            </ul>
          </div>
        </div>
      )}
    </AppShell>
  );
}
