/**
 * bloodBankData.ts
 *
 * SOURCE TRANSPARENCY:
 *  - Directory data is derived from the NHM / NIC Blood Bank Directory,
 *    a publicly available reference. It is NOT a live stock source.
 *  - Stock availability is NOT available via any public authorized API
 *    at this time. All stock fields are explicitly 'data_unavailable'.
 *  - For live stock: use e-RaktKosh (https://eraktkosh.mohfw.gov.in)
 *    directly. A formal API integration request to MoHFW/NIC is required
 *    before programmatic access to live data is possible.
 *
 * DATA FRESHNESS:
 *  DIRECTORY_DATE below is the date the static list was last manually reviewed.
 *  It does NOT reflect real-time stock.
 */

export const DIRECTORY_DATE = '2024-01-15'; // last manual review of the directory

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type BloodComponent =
  | 'whole_blood'
  | 'prbc'
  | 'platelets'
  | 'ffp'
  | 'cryoprecipitate';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const BLOOD_COMPONENTS: { value: BloodComponent; label: string; note: string }[] = [
  { value: 'whole_blood', label: 'Whole Blood', note: 'Used for acute blood loss, trauma' },
  { value: 'prbc', label: 'Packed Red Blood Cells (PRBC)', note: 'Most common component for anaemia, surgery' },
  { value: 'platelets', label: 'Platelets', note: 'Dengue, cancer treatment, surgery' },
  { value: 'ffp', label: 'Fresh Frozen Plasma (FFP)', note: 'Clotting disorders, liver disease' },
  { value: 'cryoprecipitate', label: 'Cryoprecipitate', note: 'Haemophilia, fibrinogen deficiency' },
];

export interface BloodBank {
  id: string;
  name: string;
  facilityType: 'government' | 'private' | 'charitable';
  address: string;
  district: string;
  state: string;
  pincode: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  sourceId: string | null;
  eraktkoshUrl: string; // verified e-RaktKosh public search URL
  directoryDate: string;
  components: BloodComponent[]; // components this bank is KNOWN to supply (directory info only)
}

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli',
  'Daman & Diu', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

/**
 * Static blood bank directory entries.
 *
 * These are representative entries for major government blood banks
 * drawn from public NHM/NIC listings. They are DIRECTORY records — not
 * stock records. Stock availability MUST be verified directly with the
 * facility or via eraktkosh.mohfw.gov.in.
 *
 * ⚠ Do not add entries unless they are from a verified public source.
 * ⚠ Never add stock quantity or availability_status = 'available' without
 *   a live authorized data source.
 */
export const BLOOD_BANK_DIRECTORY: BloodBank[] = [
  {
    id: 'bb-dl-aiims-001',
    name: 'AIIMS Blood Bank',
    facilityType: 'government',
    address: 'All India Institute of Medical Sciences, Ansari Nagar, New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    pincode: '110029',
    phone: '011-26588500',
    lat: 28.5672,
    lng: 77.2100,
    sourceId: 'NHM-DL-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/transactions/hsbcstock.cnt?stateCode=07&districtCode=',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
  {
    id: 'bb-dl-safdarjung-001',
    name: 'Safdarjung Hospital Blood Bank',
    facilityType: 'government',
    address: 'Safdarjung Hospital, Ring Road, New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    pincode: '110029',
    phone: '011-26730000',
    lat: 28.5695,
    lng: 77.2040,
    sourceId: 'NHM-DL-002',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp'],
  },
  {
    id: 'bb-mh-kem-001',
    name: 'KEM Hospital Blood Bank',
    facilityType: 'government',
    address: 'King Edward Memorial Hospital, Parel, Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400012',
    phone: '022-24136051',
    lat: 18.9936,
    lng: 72.8407,
    sourceId: 'NHM-MH-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
  {
    id: 'bb-mh-jj-001',
    name: 'J.J. Hospital Blood Bank',
    facilityType: 'government',
    address: 'Sir J.J. Group of Hospitals, Byculla, Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400008',
    phone: '022-23735555',
    lat: 18.9721,
    lng: 72.8347,
    sourceId: 'NHM-MH-002',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp'],
  },
  {
    id: 'bb-ka-Victoria-001',
    name: 'Victoria Hospital Blood Bank (BMCRI)',
    facilityType: 'government',
    address: 'Bangalore Medical College & Research Institute, Fort, Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pincode: '560002',
    phone: '080-26706928',
    lat: 12.9760,
    lng: 77.5780,
    sourceId: 'NHM-KA-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
  {
    id: 'bb-tn-GH-001',
    name: 'Government General Hospital Blood Bank',
    facilityType: 'government',
    address: 'Government General Hospital, Park Town, Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600003',
    phone: '044-25305000',
    lat: 13.0798,
    lng: 80.2762,
    sourceId: 'NHM-TN-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
  {
    id: 'bb-wb-sskm-001',
    name: 'SSKM Hospital Blood Bank (IPGMER)',
    facilityType: 'government',
    address: 'Seth Sukhlal Karnani Memorial Hospital, Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    pincode: '700020',
    phone: '033-22041384',
    lat: 22.5253,
    lng: 88.3418,
    sourceId: 'NHM-WB-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp'],
  },
  {
    id: 'bb-ts-nims-001',
    name: 'Nizam\'s Institute of Medical Sciences Blood Bank (NIMS)',
    facilityType: 'government',
    address: 'Nizam\'s Institute of Medical Sciences, Punjagutta, Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500082',
    phone: '040-23489000',
    lat: 17.4239,
    lng: 78.4476,
    sourceId: 'NHM-TS-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
  {
    id: 'bb-rj-smshosp-001',
    name: 'SMS Hospital Blood Bank',
    facilityType: 'government',
    address: 'Sawai Man Singh Hospital, Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302004',
    phone: '0141-2518888',
    lat: 26.8993,
    lng: 75.8078,
    sourceId: 'NHM-RJ-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp'],
  },
  {
    id: 'bb-gj-civil-001',
    name: 'Civil Hospital Blood Bank',
    facilityType: 'government',
    address: 'Civil Hospital, Asarwa, Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380016',
    phone: '079-22681411',
    lat: 23.0489,
    lng: 72.5987,
    sourceId: 'NHM-GJ-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
  {
    id: 'bb-up-kgmu-001',
    name: 'King George\'s Medical University Blood Bank (KGMU)',
    facilityType: 'government',
    address: 'King George\'s Medical University, Shah Mina Road, Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226003',
    phone: '0522-2257540',
    lat: 26.8573,
    lng: 80.9424,
    sourceId: 'NHM-UP-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
  {
    id: 'bb-pb-pgimer-001',
    name: 'PGIMER Blood Bank',
    facilityType: 'government',
    address: 'Post Graduate Institute of Medical Education & Research, Chandigarh',
    district: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '160012',
    phone: '0172-2755255',
    lat: 30.7649,
    lng: 76.7768,
    sourceId: 'NHM-CH-001',
    eraktkoshUrl: 'https://eraktkosh.mohfw.gov.in',
    directoryDate: DIRECTORY_DATE,
    components: ['whole_blood', 'prbc', 'platelets', 'ffp', 'cryoprecipitate'],
  },
];

export interface SearchQuery {
  state: string;
  district: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number | null;
  pincode: string;
  urgency: 'emergency' | 'within_24h' | 'within_3d' | 'planned';
}

export function searchBloodBanks(query: SearchQuery): BloodBank[] {
  return BLOOD_BANK_DIRECTORY.filter((bb) => {
    const stateMatch = !query.state || bb.state === query.state;
    const districtMatch = !query.district || bb.district.toLowerCase().includes(query.district.toLowerCase());
    const pincodeMatch = !query.pincode || (bb.pincode ?? '').startsWith(query.pincode.slice(0, 3));
    const componentMatch = bb.components.includes(query.component);
    return stateMatch && districtMatch && componentMatch && pincodeMatch;
  });
}

/** Build a deep-link to e-RaktKosh for a given state / blood group */
export function buildEraktkoshUrl(state?: string, bloodGroup?: BloodGroup): string {
  // e-RaktKosh does not have a publicly documented URL parameter schema
  // for pre-filtering, so we link to the portal home for now.
  return 'https://eraktkosh.mohfw.gov.in';
}
