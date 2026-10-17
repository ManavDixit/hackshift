import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  IndianRupee,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { PROCEDURES, estimateFor, loadHospitals, type DbHospital, type ProcedureSlug } from '@/lib/hospitalData';
import { loadInsuranceProfile, saveInsuranceProfile, type InsuranceProfile } from '@/lib/healthData';
import { estimateOutOfPocket } from '@/lib/insuranceCalc';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

type Draft = Omit<InsuranceProfile, 'id'>;

const EMPTY_DRAFT: Draft = {
  insurer: '', policyName: '', policyType: 'Individual floater',
  coverageAmount: null, remainingLimit: null, deductible: 0, copayPercent: 0,
  roomRentLimit: null, exclusions: [], networkStatus: 'unknown',
  preauthRequired: false, validUntil: null, confirmed: false,
};

export function InsurancePage() {
  const { lang } = useApp();
  const hi = lang === 'hi';
  const [profile, setProfile] = useState<InsuranceProfile | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [hospitals, setHospitals] = useState<DbHospital[]>([]);
  const [hospitalSlug, setHospitalSlug] = useState<string>('');
  const [procedure, setProcedure] = useState<ProcedureSlug>('angioplasty');
  const [saving, setSaving] = useState(false);
  const [exclusionText, setExclusionText] = useState('');

  useEffect(() => {
    (async () => {
      const [p, h] = await Promise.all([loadInsuranceProfile(), loadHospitals()]);
      setOffline(p === null && h.hospitals.length === 0);
      if (p) {
        setProfile(p);
        setDraft({ ...p });
        setExclusionText(p.exclusions.join('\n'));
      }
      setHospitals(h.hospitals);
      setHospitalSlug(h.hospitals[0]?.slug ?? '');
      setLoading(false);
    })();
  }, []);

  const hospital = hospitals.find((h) => h.slug === hospitalSlug) ?? null;
  const estimate = hospital ? estimateFor(hospital, procedure) : null;

  const confirmedDraft: Draft | null = profile?.confirmed ? { ...profile } : null;
  const calc = useMemo(
    () => estimateOutOfPocket(
      estimate ? { estimateLow: estimate.totalLow, estimateHigh: estimate.totalHigh } : { estimateLow: 0, estimateHigh: 0 },
      confirmedDraft
    ),
    [estimate, confirmedDraft]
  );

  const handleSave = async (confirm: boolean) => {
    setSaving(true);
    const ok = await saveInsuranceProfile({
      ...draft,
      exclusions: exclusionText.split('\n').map((s) => s.trim()).filter(Boolean),
      confirmed: confirm,
    });
    if (ok) {
      const fresh = await loadInsuranceProfile();
      setProfile(fresh);
      if (fresh) setDraft({ ...fresh });
    }
    setSaving(false);
  };

  return (
    <AppShell
      title={hi ? 'बीमा और लागत अनुमानक' : 'Insurance & Cost Estimator'}
      subtitle={hi
        ? 'पुष्ट की गई पॉलिसी शर्तों से तीन अलग अनुमान — तय नियमों से गणना।'
        : 'Three separated estimates from your confirmed policy terms — fixed rules, no AI arithmetic.'}
    >
      {offline && !loading && (
        <Notice kind="warn">{hi ? 'डेटाबेस उपलब्ध नहीं।' : 'The database is not reachable right now.'}</Notice>
      )}

      {loading && <div className="card animate-pulse p-6"><div className="h-4 w-48 rounded bg-primary-50" /></div>}

      {!loading && !offline && (
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-display text-[16px] font-bold text-ink">{hi ? '1. अस्पताल और इलाज चुनें' : '1. Choose hospital and treatment'}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="ins-hosp">{hi ? 'अस्पताल' : 'Hospital'}</label>
                <select id="ins-hosp" className="input" value={hospitalSlug} onChange={(e) => setHospitalSlug(e.target.value)}>
                  {hospitals.map((h) => <option key={h.slug} value={h.slug}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="ins-proc">{hi ? 'इलाज' : 'Treatment'}</label>
                <select id="ins-proc" className="input" value={procedure} onChange={(e) => setProcedure(e.target.value as ProcedureSlug)}>
                  {PROCEDURES.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-[16px] font-bold text-ink">{hi ? '2. पॉलिसी विवरण' : '2. Policy details'}</h3>
              {profile ? (
                profile.confirmed
                  ? <span className="chip bg-mint text-teal-700"><ShieldCheck size={12} /> {hi ? 'पुष्ट — गणना सक्रिय' : 'Confirmed — calculations active'}</span>
                  : <span className="chip bg-peach text-coral-600"><ShieldAlert size={12} /> {hi ? 'पुष्टि बाकी' : 'Awaiting your confirmation'}</span>
              ) : (
                <span className="chip bg-canvas text-ink-soft border border-line">{hi ? 'कोई पॉलिसी नहीं' : 'No policy added'}</span>
              )}
            </div>
            <p className="mt-1 text-[12.5px] text-ink-soft">
              {hi
                ? 'गणना केवल आपकी पुष्ट किए गए मानों से होती है। अपुष्ट मान गणना में उपयोग नहीं होते।'
                : 'Calculations use only values you have confirmed. Unconfirmed entries never drive the math.'}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label" htmlFor="p-ins">Insurer</label>
                <input id="p-ins" className="input" value={draft.insurer} onChange={(e) => setDraft({ ...draft, insurer: e.target.value })} placeholder="e.g. Demo Insurance Co." />
              </div>
              <div>
                <label className="label" htmlFor="p-name">Policy name</label>
                <input id="p-name" className="input" value={draft.policyName} onChange={(e) => setDraft({ ...draft, policyName: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="p-type">Policy type</label>
                <select id="p-type" className="input" value={draft.policyType} onChange={(e) => setDraft({ ...draft, policyType: e.target.value })}>
                  {['Individual floater', 'Family floater', 'Group', 'Government scheme'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="p-cov">Coverage amount (₹)</label>
                <input id="p-cov" type="number" className="input" value={draft.coverageAmount ?? ''} onChange={(e) => setDraft({ ...draft, coverageAmount: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className="label" htmlFor="p-rem">Remaining limit (₹, if known)</label>
                <input id="p-rem" type="number" className="input" value={draft.remainingLimit ?? ''} onChange={(e) => setDraft({ ...draft, remainingLimit: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className="label" htmlFor="p-ded">Deductible (₹)</label>
                <input id="p-ded" type="number" className="input" value={draft.deductible || ''} onChange={(e) => setDraft({ ...draft, deductible: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label" htmlFor="p-copay">Co-pay (%)</label>
                <input id="p-copay" type="number" className="input" value={draft.copayPercent || ''} onChange={(e) => setDraft({ ...draft, copayPercent: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label" htmlFor="p-room">Room-rent limit (₹/day, if any)</label>
                <input id="p-room" type="number" className="input" value={draft.roomRentLimit ?? ''} onChange={(e) => setDraft({ ...draft, roomRentLimit: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className="label" htmlFor="p-net">Network status (as verified by you)</label>
                <select id="p-net" className="input" value={draft.networkStatus} onChange={(e) => setDraft({ ...draft, networkStatus: e.target.value })}>
                  <option value="unknown">Unknown</option>
                  <option value="verified_in_network">Verified in-network</option>
                  <option value="reported">Reported in-network</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="p-valid">Valid until</label>
                <input id="p-valid" type="date" className="input" value={draft.validUntil ?? ''} onChange={(e) => setDraft({ ...draft, validUntil: e.target.value || null })} />
              </div>
              <label className="flex items-end gap-2 pb-2 text-[13px] font-semibold text-ink">
                <input type="checkbox" className="h-4 w-4 accent-primary-500" checked={draft.preauthRequired} onChange={(e) => setDraft({ ...draft, preauthRequired: e.target.checked })} />
                Preauthorization required
              </label>
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="p-excl">Exclusions / non-payables (one per line)</label>
              <textarea id="p-excl" className="input min-h-20" value={exclusionText} onChange={(e) => setExclusionText(e.target.value)} />
            </div>
            <p className="mt-3 text-[11.5px] text-ink-faint">
              {hi
                ? 'डेमो मोड: पॉलिसी दस्तावेज़ अपलोड/OCR अभी कनेक्ट नहीं है — विवरण स्वयं भरें।'
                : 'Demo mode: policy-document upload and OCR are not connected yet — enter details manually.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary text-[13px]" onClick={() => handleSave(false)} disabled={saving}>
                {hi ? 'सहेजें (अपुष्ट)' : 'Save without confirming'}
              </button>
              <button className="btn-primary text-[13px]" onClick={() => handleSave(true)} disabled={saving}>
                <BadgeCheck size={15} /> {hi ? 'समीक्षा कर पुष्ट करें' : 'I have reviewed — confirm these values'}
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-[16px] font-bold text-ink">{hi ? '3. अनुमान' : '3. The estimates'}</h3>
            {!estimate && (
              <p className="mt-3 text-[13px] text-ink-soft">{hi ? 'अस्पताल चुनें।' : 'Select a hospital to see an estimate.'}</p>
            )}
            {estimate && (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-line bg-canvas p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{hi ? 'कुल खर्च (अनुमानित)' : 'Estimated total expense'}</p>
                    <p className="mt-1 font-display text-[17px] font-extrabold tabular-nums text-ink">{inr(estimate.totalLow)} – {inr(estimate.totalHigh)}</p>
                    <p className="mt-1 text-[11px] text-ink-faint">{hi ? 'वस्तुनिष्ठ शुल्कों का योग' : 'Sum of itemized hospital charges'}</p>
                  </div>
                  <div className="rounded-2xl border border-line bg-sky/50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary-600">{hi ? 'बीमा द्वारा संभावित भुगतान' : 'Potentially payable by insurance'}</p>
                    {calc.insurerPayable ? (
                      <p className="mt-1 font-display text-[17px] font-extrabold tabular-nums text-ink">{inr(calc.insurerPayable.low)} – {inr(calc.insurerPayable.high)}</p>
                    ) : (
                      <p className="mt-1 text-[13px] font-semibold text-ink-soft">{calc.status === 'needs-confirmation' ? (hi ? 'पुष्टि बाकी' : 'Confirm policy first') : (hi ? 'गणना संभव नहीं' : 'Cannot calculate yet')}</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-line bg-mint/40 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">{hi ? 'आपका अनुमानित भुगतान' : 'Estimated out-of-pocket'}</p>
                    {calc.outOfPocket ? (
                      <p className="mt-1 font-display text-[17px] font-extrabold tabular-nums text-ink">{inr(calc.outOfPocket.low)} – {inr(calc.outOfPocket.high)}</p>
                    ) : (
                      <p className="mt-1 text-[13px] font-semibold text-ink-soft">{hi ? 'पुष्टि बाकी' : 'Awaiting policy confirmation'}</p>
                    )}
                  </div>
                </div>

                {calc.status === 'calculated' && (
                  <div className="mt-5">
                    <p className="text-[13px] font-bold text-ink">{hi ? 'गणना कैसे हुई' : 'How this was calculated'}</p>
                    <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                      {calc.lines.map((l, i) => (
                        <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
                          <div>
                            <p className="text-[12.5px] font-semibold text-ink">{l.label}</p>
                            <p className="text-[11.5px] text-ink-faint">{l.detail}</p>
                          </div>
                          {l.kind === 'info' ? (
                            <span className="chip bg-canvas border border-line text-ink-faint"><AlertTriangle size={11} /> note</span>
                          ) : (
                            <span className="tabular-nums text-[12.5px] font-bold text-ink-soft">{inr(l.low)} – {inr(l.high)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1 text-[11.5px] text-ink-faint">
                      {calc.assumptions.map((a) => <p key={a}>• {a}</p>)}
                    </div>
                  </div>
                )}

                {calc.confirmationsNeeded.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-peach bg-peach/30 p-4">
                    <p className="text-[13px] font-bold text-ink">{hi ? 'अस्पताल/बीमा कंपनी से पुष्टि करनी बाकी' : 'Still to confirm with the hospital or insurer'}</p>
                    <ul className="mt-2 space-y-1 text-[12.5px] text-ink-soft">
                      {calc.confirmationsNeeded.map((c) => <li key={c} className="flex items-start gap-1.5"><AlertTriangle size={12} className="mt-0.5 shrink-0 text-coral-500" /> {c}</li>)}
                    </ul>
                  </div>
                )}

                <Notice kind="warn">
                  {hi
                    ? 'ये प्रारंभिक अनुमान हैं। MediLink बीमा क्लेम स्वीकृत या भुगतान की गारंटी नहीं देता। अंतिम भुगतान पॉलिसी शर्तों, अस्पताल बिलिंग, प्री-ऑथराइज़ेशन और बीमा कंपनी के निर्णय पर निर्भर करता है।'
                    : 'These are preliminary estimates. MediLink does not promise that an insurer will approve or pay a claim. Final payment depends on policy wording, hospital billing, preauthorization and insurer adjudication.'}
                </Notice>
              </>
            )}
          </div>

          {hospital && (
            <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-faint">
              <Building2 size={12} /> <IndianRupee size={12} /> {hospital.name} · {hospital.source} · sample data
            </p>
          )}
        </div>
      )}
    </AppShell>
  );
}
