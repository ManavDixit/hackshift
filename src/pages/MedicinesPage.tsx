import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ExternalLink,
  History,
  Info,
  Package,
  Search,
  ShieldAlert,
  Clock,
  BadgeCheck,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { HBarChart } from '@/components/Charts';
import { EmptyState, Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { phT, searchPharmacyListings, summarizePrices, type PharmacyListing } from '@/lib/pharmacy';
import { t } from '@/lib/i18n';

const inr = (n: number) => `₹${n.toFixed(n % 1 === 0 ? 0 : 2)}`;

const availChip = {
  verified: { cls: 'bg-mint text-teal-700', label: 'Verified in stock', icon: BadgeCheck },
  reported: { cls: 'bg-sky text-primary-700', label: 'Reported available', icon: Info },
  unknown: { cls: 'bg-peach text-coral-600', label: 'Availability unknown', icon: HelpCircle },
} as const;

export function MedicinesPage() {
  const { lang } = useApp();
  const s = t(lang);
  const p = phT(lang);

  const [q, setQ] = useState('');
  const [strength, setStrength] = useState('Any');
  const [form, setForm] = useState('Any');
  const [pack, setPack] = useState('Any');
  const [pin, setPin] = useState('');
  const [sort, setSort] = useState<'price' | 'pharmacy' | 'availability'>('price');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [selected, setSelected] = useState<PharmacyListing | null>(null);

  const result = useMemo(() => {
    if (!searched) return null;
    return searchPharmacyListings({
      ingredient: q,
      strengthMg: strength === 'Any' ? null : parseInt(strength, 10),
      form,
      packSize: pack === 'Any' ? null : parseInt(pack, 10),
    });
  }, [searched, q, strength, form, pack]);

  const summary = useMemo(() => (result ? summarizePrices(result.comparable) : null), [result]);

  const chart = useMemo(() => {
    if (!summary) return [];
    return result!.comparable.map((l) => ({
      label: `${l.brand} · ${l.pharmacy}`,
      value: l.price,
      color: l.price === summary.lowest ? 'linear-gradient(90deg,#14B8A6,#2EC4B0)' : undefined,
      note: l.price === summary.lowest ? 'Lowest comparable listed price' : undefined,
    }));
  }, [result, summary]);

  const unitChart = useMemo(() => {
    if (!summary) return [];
    return result!.comparable.map((l) => ({
      label: `${l.brand} (${l.packSize} ${l.packUnit})`,
      value: l.perUnit,
      color: l.perUnit === Math.min(...result!.comparable.map((x) => x.perUnit)) ? 'linear-gradient(90deg,#3978F6,#5D93F9)' : undefined,
    }));
  }, [result, summary]);

  const runSearch = () => {
    setError(false);
    setLoading(true);
    const term = q.trim();
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
      if (term) setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 4));
    }, 800);
  };

  const sortedGroups = useMemo(() => {
    if (!result) return [];
    const sortListings = (ls: PharmacyListing[]) =>
      [...ls].sort((a, b) => {
        if (sort === 'price') return a.price - b.price;
        if (sort === 'pharmacy') return a.pharmacy.localeCompare(b.pharmacy);
        const order = { verified: 0, reported: 1, unknown: 2 } as const;
        return order[a.availability] - order[b.availability];
      });
    return result.groups.map((g) => ({ ...g, listings: sortListings(g.listings) }));
  }, [result, sort]);

  return (
    <AppShell
      title={s.medicines}
      subtitle={lang === 'hi' ? 'फार्मेसियों में समतुल्य दवाओं की कीमतों की तुलना।' : 'Compare equivalent medicine prices across pharmacies.'}
    >
      <div className="mb-6">
        <h2 className="max-w-2xl font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">{p.heading}</h2>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">{p.sub}</p>
      </div>

      {/* Search panel */}
      <div className="card mb-5 p-5">
        <div className="grid gap-3 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="label" htmlFor="pm-q">{p.searchMed}</label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input id="pm-q" className="input pl-9" placeholder="e.g., Atenolol" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch()} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="pm-str">{p.strength}</label>
            <select id="pm-str" className="input" value={strength} onChange={(e) => setStrength(e.target.value)}>
              {['Any', '50', '100'].map((o) => <option key={o}>{o === 'Any' ? 'Any' : `${o} mg`}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pm-form">{p.form}</label>
            <select id="pm-form" className="input" value={form} onChange={(e) => setForm(e.target.value)}>
              {['Any', 'Tablet', 'Capsule', 'Syrup', 'Cream'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pm-pack">{p.pack}</label>
            <select id="pm-pack" className="input" value={pack} onChange={(e) => setPack(e.target.value)}>
              {['Any', '14', '30'].map((o) => <option key={o}>{o === 'Any' ? 'Any' : `${o} tablets`}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pm-pin">{p.location}</label>
            <input id="pm-pin" className="input" placeholder="110001" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={runSearch}>{p.search} <ArrowRight size={15} /></button>
          {recent.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-[11.5px] font-bold text-ink-faint"><History size={12} /> {p.recent}:</span>
              {recent.map((r) => (
                <button key={r} onClick={() => { setQ(r); setSearched(true); }} className="chip bg-canvas text-ink-soft hover:bg-primary-50">{r}</button>
              ))}
            </div>
          )}
        </div>
        {loading && (
          <div className="mt-4 animate-fade-in">
            <div className="h-2 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-primary-500 to-teal-400" />
            </div>
            <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">{p.loading}</p>
          </div>
        )}
        {error && <p className="mt-3 text-[12px] font-semibold text-coral-600">{p.error}</p>}
      </div>

      {searched && result && (
        <>
          {result.totalListings === 0 ? (
            <EmptyState icon={Package} title={p.empty} body={p.emptyBody} />
          ) : (
            <>
              {/* Summary */}
              {summary && (
                <div className="card mb-5 p-5">
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {[
                      [p.matching, String(summary.count), 'bg-sky text-primary-500'],
                      [p.lowest, inr(summary.lowest), 'bg-mint text-teal-600'],
                      [p.highest, inr(summary.highest), 'bg-peach text-coral-500'],
                      [p.diff, inr(summary.difference), 'bg-lavender text-violet-500'],
                      [p.verifiedPh, `${summary.verifiedCount} of ${summary.count}`, 'bg-mint text-teal-600'],
                    ].map(([label, value, tone]) => (
                      <div key={label}>
                        <span className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}><Package size={14} /></span>
                        <p className="font-display text-[20px] font-bold leading-none text-ink tabular-nums">{value}</p>
                        <p className="mt-1 text-[11px] font-bold text-ink-soft">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 flex items-start gap-1.5 border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-faint">
                    <Info size={12} className="mt-0.5 shrink-0" /> {p.diffBasis}
                  </p>
                </div>
              )}

              {/* Charts */}
              {summary && summary.count > 1 && (
                <div className="mb-5 grid gap-5 lg:grid-cols-2">
                  <div className="card p-5">
                    <h3 className="font-display text-[15px] font-bold text-ink">{lang === 'hi' ? 'तुलनीय कीमतें' : 'Comparable listed prices'}</h3>
                    <div className="mt-4"><HBarChart data={chart} unit="₹" /></div>
                  </div>
                  <div className="card p-5">
                    <h3 className="font-display text-[15px] font-bold text-ink">{lang === 'hi' ? 'प्रति टैबलेट कीमत' : 'Price per unit'}</h3>
                    <div className="mt-4"><HBarChart data={unitChart} unit="₹" /></div>
                  </div>
                </div>
              )}

              {/* Safety notice */}
              <div className="mb-5">
                <Notice kind="warn"><strong>{p.safety}</strong></Notice>
              </div>

              {/* Grouped results */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-bold text-ink">
                  {result.totalListings} {p.resultsFor} “{q || lang === 'hi' ? (q || 'सभी दवाएँ') : (q || 'all medicines')}” · <span className="font-semibold text-ink-faint">{p.demo}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] font-bold text-ink-faint">{p.sort}:</span>
                  {([['price', lang === 'hi' ? 'कीमत' : 'Price'], ['pharmacy', lang === 'hi' ? 'फार्मेसी' : 'Pharmacy'], ['availability', lang === 'hi' ? 'उपलब्धता' : 'Availability']] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setSort(k)} className={`rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition-colors ${sort === k ? 'bg-primary-50 text-primary-700' : 'text-ink-faint hover:text-ink'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {sortedGroups.map((g) => (
                  <div key={g.key}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className={`chip ${g.isPrimary ? 'bg-mint text-teal-700' : 'bg-peach text-coral-600'}`}>
                        {g.isPrimary ? <><Check size={12} /> {p.groupPrimary}</> : <><ShieldAlert size={12} /> {p.groupAlt}</>}
                      </span>
                      {!g.isPrimary && g.differences.length > 0 && (
                        <span className="text-[11.5px] font-semibold text-coral-600">{g.differences.join(' · ')}</span>
                      )}
                    </div>
                    <div className="card divide-y divide-line">
                      {g.listings.map((l) => {
                        const Av = availChip[l.availability];
                        return (
                          <div key={l.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-sky/30">
                            <div className="min-w-[180px] flex-1">
                              <p className="text-[13.5px] font-bold text-ink">{l.brand}</p>
                              <p className="text-[11.5px] font-medium text-ink-soft">
                                {l.ingredient} · {l.strength} · {l.form} · {l.packSize} {l.packUnit}
                              </p>
                              <p className="mt-0.5 text-[11px] text-ink-faint">{l.pharmacy} · {l.location}{l.delivery ? ` · ${l.delivery}` : ''} · <Clock size={9} className="inline" /> {l.updated}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-[16px] font-bold text-ink tabular-nums">{inr(l.price)}</p>
                              <p className="text-[10.5px] font-semibold text-ink-faint">{inr(l.perUnit)} / {l.packUnit.replace(/s$/, '')}</p>
                            </div>
                            <span className={`chip ${Av.cls}`}><Av.icon size={12} /> {Av.label}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => setSelected(l)} className="btn-secondary px-3 py-1.5 text-[12px]">{p.viewDetails}</button>
                              {l.listingUrl ? (
                                <a href={l.listingUrl} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-[12px]">{p.openListing} <ExternalLink size={12} /></a>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-medium text-ink-faint">{p.noUrl}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Details drawer */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/35 backdrop-blur-sm animate-fade-in" onClick={() => setSelected(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white p-6 shadow-lift animate-fade-in" role="dialog" aria-modal="true" aria-label={p.details}>
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-display text-[17px] font-bold text-ink">{p.details}</h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-ink-soft hover:bg-primary-50" aria-label="Close">✕</button>
            </div>
            <div className="space-y-2.5 text-[13px]">
              {[
                [lang === 'hi' ? 'दवा का नाम' : 'Medicine name', selected.brand],
                [lang === 'hi' ? 'जेनेरिक नाम' : 'Generic name', selected.genericName ?? (lang === 'hi' ? 'उपलब्ध नहीं' : 'Not provided')],
                [lang === 'hi' ? 'सक्रिय घटक' : 'Active ingredient', selected.ingredient],
                [lang === 'hi' ? 'मात्रा' : 'Strength', selected.strength],
                [lang === 'hi' ? 'खुराक का रूप' : 'Formulation', `${selected.form} · ${selected.release} release`],
                [lang === 'hi' ? 'पैक आकार' : 'Pack size', `${selected.packSize} ${selected.packUnit}`],
                [lang === 'hi' ? 'सूचीबद्ध कीमत' : 'Listed price', `${inr(selected.price)} (${inr(selected.perUnit)} ${p.perUnit})`],
                [lang === 'hi' ? 'फार्मेसी' : 'Pharmacy', `${selected.pharmacy} · ${selected.location}`],
                [lang === 'hi' ? 'स्रोत' : 'Source', selected.updated],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line/60 pb-2">
                  <span className="shrink-0 font-semibold text-ink-soft">{k}</span>
                  <span className="text-right font-bold text-ink">{v}</span>
                </div>
              ))}
            </div>
            {!selected.listingUrl && <p className="mt-3 text-[11.5px] font-medium text-ink-faint">{p.noUrl}</p>}
            <div className="mt-4 rounded-xl border border-coral-100 bg-peach/50 px-4 py-3">
              <p className="flex items-start gap-2 text-[12.5px] font-semibold leading-relaxed text-coral-700">
                <ShieldAlert size={15} className="mt-0.5 shrink-0" /> {p.safety}
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
