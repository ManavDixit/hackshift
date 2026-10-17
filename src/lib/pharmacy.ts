import type { Lang } from './types';

/* ------------------------------------------------------------------ */
/* Demo pharmacy listings. In production this module is the seam a     */
/* real pharmacy API plugs into (searchPharmacyListings).              */
/* ------------------------------------------------------------------ */

export interface PharmacyListing {
  id: string;
  pharmacy: string;
  brand: string;
  genericName: string | null;
  ingredient: string;
  strength: string;
  strengthMg: number | null;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Cream' | 'Drops';
  release: 'Immediate' | 'Extended' | 'Unknown';
  packSize: number;
  packUnit: string;
  price: number;
  perUnit: number;
  availability: 'verified' | 'reported' | 'unknown';
  location: string;
  delivery: string | null;
  listingUrl: string | null;
  updated: string;
  updatedHoursAgo: number;
}

export interface EquivalenceGroup {
  key: string;
  listings: PharmacyListing[];
  differences: string[];
  isPrimary: boolean;
}

interface MedicineQuery {
  ingredient: string;
  strengthMg: number | null;
  form: string;
  packSize: number | null;
}

export interface PharmacySearchResult {
  query: MedicineQuery;
  groups: EquivalenceGroup[];
  comparable: PharmacyListing[];
  totalListings: number;
}

const L = (
  id: string,
  pharmacy: string,
  brand: string,
  genericName: string | null,
  ingredient: string,
  strengthMg: number | null,
  strength: string,
  form: PharmacyListing['form'],
  release: PharmacyListing['release'],
  packSize: number,
  packUnit: string,
  price: number,
  availability: PharmacyListing['availability'],
  location: string,
  delivery: string | null,
  listingUrl: string | null,
  updatedHoursAgo: number
): PharmacyListing => ({
  id,
  pharmacy,
  brand,
  genericName,
  ingredient,
  strengthMg,
  strength,
  form,
  release,
  packSize,
  packUnit,
  price,
  perUnit: Math.round((price / packSize) * 100) / 100,
  availability,
  location,
  delivery,
  listingUrl,
  updated: `Sample data · updated ${updatedHoursAgo}h ago`,
  updatedHoursAgo,
});

export const allListings: PharmacyListing[] = [
  // Atenolol 50mg tablet — primary comparable group
  L('p1', 'City Pharmacy (Central)', 'Atenol (reference)', null, 'Atenolol', 50, '50 mg', 'Tablet', 'Immediate', 14, 'tablets', 42, 'verified', 'Central District', 'Pickup in 2h', null, 6),
  L('p2', 'MedPlus Corner (North)', 'Aten 50', 'Atenolol', 'Atenolol', 50, '50 mg', 'Tablet', 'Immediate', 14, 'tablets', 28, 'verified', 'North Ring Road', 'Delivery in 4h', null, 3),
  L('p3', 'Wellness Chemist (Lakefront)', 'Tenoloc', 'Atenolol', 'Atenolol', 50, '50 mg', 'Tablet', 'Immediate', 14, 'tablets', 31, 'reported', 'Lakefront Area', null, null, 8),
  L('p4', 'Sehat Online Pharmacy', 'Atenolol 50 (generic)', 'Atenolol', 'Atenolol', 50, '50 mg', 'Tablet', 'Immediate', 14, 'tablets', 24, 'verified', 'Citywide delivery', 'Delivery in 6h', null, 2),
  // Different strength — must NOT merge into the 50mg group
  L('p5', 'City Pharmacy (Central)', 'Atenol 100', null, 'Atenolol', 100, '100 mg', 'Tablet', 'Immediate', 14, 'tablets', 58, 'verified', 'Central District', null, null, 6),
  // Extended release — separate group
  L('p6', 'Wellness Chemist (Lakefront)', 'Atenol-ER', null, 'Atenolol', 50, '50 mg', 'Tablet', 'Extended', 10, 'tablets', 66, 'unknown', 'Lakefront Area', null, null, 20),
  // Combination product — separate group
  L('p7', 'MedPlus Corner (North)', 'Atenol-LS (combination)', null, 'Atenolol + Amlodipine', null, '50 mg + 5 mg', 'Tablet', 'Immediate', 10, 'tablets', 89, 'reported', 'North Ring Road', null, null, 12),
  // Different pack size — separate group
  L('p8', 'Sehat Online Pharmacy', 'Aten 50 (30-pack)', 'Atenolol', 'Atenolol', 50, '50 mg', 'Tablet', 'Immediate', 30, 'tablets', 54, 'verified', 'Citywide delivery', 'Delivery in 6h', null, 5),
];

export function searchPharmacyListings(query: Partial<MedicineQuery>): PharmacySearchResult {
  const ingredient = (query.ingredient ?? '').toLowerCase().trim();
  const matches = allListings.filter((l) => {
    if (ingredient && !l.ingredient.toLowerCase().includes(ingredient) && !l.brand.toLowerCase().includes(ingredient)) return false;
    if (query.strengthMg != null && l.strengthMg !== query.strengthMg) return false;
    if (query.form && query.form !== 'Any' && l.form !== query.form) return false;
    return true;
  });

  // Group by full equivalence signature: ingredient + strength + form + release + pack.
  const groupMap = new Map<string, PharmacyListing[]>();
  for (const l of matches) {
    const key = [l.ingredient.toLowerCase(), l.strengthMg ?? l.strength, l.form.toLowerCase(), l.release.toLowerCase(), `${l.packSize}${l.packUnit}`].join('|');
    const arr = groupMap.get(key) ?? [];
    arr.push(l);
    groupMap.set(key, arr);
  }

  const groups: EquivalenceGroup[] = [...groupMap.entries()].map(([key, listings]) => {
    const differences: string[] = [];
    if (query.strengthMg != null && listings[0].strengthMg !== query.strengthMg) differences.push(`Strength differs: ${listings[0].strength}`);
    if (listings[0].release !== 'Immediate') differences.push(`Release type: ${listings[0].release}`);
    if (listings[0].ingredient.includes('+')) differences.push('Combination product — not a direct substitute');
    if (query.packSize != null && listings[0].packSize !== query.packSize) differences.push(`Pack size differs: ${listings[0].packSize} ${listings[0].packUnit}`);
    return {
      key,
      listings: [...listings].sort((a, b) => a.price - b.price),
      differences,
      isPrimary: differences.length === 0 && (listings[0].strengthMg == null || query.strengthMg == null || listings[0].strengthMg === query.strengthMg),
    };
  });

  // Primary group = exact match on every attribute we asked for.
  const primary = groups.find(
    (g) =>
      g.differences.length === 0 &&
      (query.strengthMg == null || g.listings[0].strengthMg === query.strengthMg) &&
      (query.packSize == null || g.listings[0].packSize === query.packSize)
  );

  groups.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return {
    query: {
      ingredient: query.ingredient ?? '',
      strengthMg: query.strengthMg ?? null,
      form: query.form ?? 'Any',
      packSize: query.packSize ?? null,
    },
    groups,
    comparable: primary?.listings ?? [],
    totalListings: matches.length,
  };
}

export function summarizePrices(listings: PharmacyListing[]) {
  const withPrice = listings.filter((l) => l.price > 0);
  if (withPrice.length === 0) return null;
  const prices = withPrice.map((l) => l.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  return {
    count: withPrice.length,
    lowest,
    highest,
    difference: highest - lowest,
    verifiedCount: withPrice.filter((l) => l.availability === 'verified').length,
    lowestListing: withPrice.find((l) => l.price === lowest)!,
    highestListing: withPrice.find((l) => l.price === highest)!,
  };
}

/* ---------------------------- i18n ---------------------------- */

const EN = {
  heading: 'Compare Medicine Prices. Make Informed Choices.',
  sub: 'Compare listed prices and availability for equivalent medicines across pharmacies. Review medicine details carefully and consult a qualified healthcare professional before changing a prescribed medicine.',
  safety:
    'Compare the complete medicine details, not just the name or price. Do not change the medicine prescribed to you without consulting a qualified healthcare professional.',
  searchMed: 'Medicine name or active ingredient',
  strength: 'Strength',
  form: 'Dosage form',
  pack: 'Pack size',
  location: 'Location or PIN code',
  search: 'Compare Prices',
  resultsFor: 'results for',
  diffBasis: 'Listed-price difference = highest comparable price − lowest comparable price. Not guaranteed savings — delivery fees and discounts may change the final amount.',
  groupPrimary: 'Confirmed equivalents',
  groupAlt: 'Not direct equivalents — review differences',
  sort: 'Sort',
  demo: 'Demo mode — sample pharmacy data. No live pharmacy search is connected.',
  viewDetails: 'Details',
  openListing: 'Open pharmacy listing',
  noUrl: 'Listing link not provided by source',
  details: 'Medicine details',
  differs: 'Differs from the main comparison group',
  perUnit: 'per tablet',
  matching: 'Matching listings',
  lowest: 'Lowest comparable price',
  highest: 'Highest comparable price',
  diff: 'Potential listed-price difference',
  verifiedPh: 'Pharmacies with verified availability',
  recent: 'Recent searches',
  empty: 'No listings found',
  emptyBody: 'Try the active ingredient (e.g. “Atenolol”) or widen the strength and form filters.',
  error: 'Search failed — please try again.',
  loading: 'Checking pharmacy listings…',
};

const HI: Partial<typeof EN> = {
  heading: 'दवा की कीमतों की तुलना करें। सूचित निर्णय लें।',
  sub: 'फार्मेसियों में समतुल्य दवाओं की सूचीबद्ध कीमतों और उपलब्धता की तुलना करें। निर्धारित दवा बदलने से पहले योग्य स्वास्थ्य पेशेवर से परामर्श करें।',
  safety: 'केवल नाम या कीमत नहीं — पूरे दवा विवरण की तुलना करें। बिना योग्य स्वास्थ्य पेशेवर से परामर्श अपनी निर्धारित दवा न बदलें।',
  searchMed: 'दवा का नाम या सक्रिय घटक',
  strength: 'मात्रा (स्ट्रेंथ)',
  form: 'खुराक का रूप',
  pack: 'पैक आकार',
  location: 'स्थान या पिन कोड',
  search: 'कीमतों की तुलना करें',
  resultsFor: 'परिणाम',
  diffBasis: 'कीमत अंतर = उच्चतम तुलनीय कीमत − न्यूनतम तुलनीय कीमत। यह गारंटीकृत बचत नहीं है — डिलीवरी शुल्क और छूट अंतिम राशि बदल सकते हैं।',
  groupPrimary: 'पुष्ट समतुल्य उत्पाद',
  groupAlt: 'सीधे समतुल्य नहीं — अंतर देखें',
  demo: 'डेमो मोड — नमूना फार्मेसी डेटा। कोई लाइव फार्मेसी खोज जुड़ी नहीं है।',
  details: 'दवा विवरण',
  perUnit: 'प्रति टैबलेट',
  matching: 'मेल खाती सूचियाँ',
  lowest: 'न्यूनतम तुलनीय कीमत',
  highest: 'उच्चतम तुलनीय कीमत',
  diff: 'संभावित कीमत अंतर',
  verifiedPh: 'सत्यापित उपलब्धता वाली फार्मेसियाँ',
  recent: 'हाल की खोजें',
  empty: 'कोई सूची नहीं मिली',
  emptyBody: 'सक्रिय घटक आज़माएँ (जैसे “Atenolol”) या फ़िल्टर चौड़े करें।',
  loading: 'फार्मेसी सूचियाँ जाँची जा रही हैं…',
};

export function phT(lang: Lang): typeof EN {
  return lang === 'hi' ? ({ ...EN, ...HI } as typeof EN) : EN;
}
