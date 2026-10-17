import {
  Building2,
  Droplets,
  FlaskConical,
  HeartPulse,
  Network,
  Pill,
  Stethoscope,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export interface AgentDef {
  id: string;
  name: string;
  nameHi: string;
  role: string;
  roleHi: string;
  icon: LucideIcon;
  accent: string;
  soft: string;
}

export const agents: AgentDef[] = [
  {
    id: 'orchestrator',
    name: 'MediLink Orchestrator',
    nameHi: 'MediLink समन्वयक',
    role: 'Coordinates every request, routes work, and guides escalation.',
    roleHi: 'हर अनुरोध का समन्वय करता है और कार्य रूट करता है।',
    icon: Network,
    accent: '#3978F6',
    soft: '#E9F2FF',
  },
  {
    id: 'hospital',
    name: 'Hospital Cost & Availability',
    nameHi: 'अस्पताल लागत और उपलब्धता',
    role: 'Compares hospital services, itemized costs, and room options.',
    roleHi: 'अस्पताल सेवाओं, लागत और कमरों की तुलना करता है।',
    icon: Building2,
    accent: '#2660DB',
    soft: '#E9F2FF',
  },
  {
    id: 'specialist',
    name: 'Specialist Finder',
    nameHi: 'विशेषज्ञ खोजकर्ता',
    role: 'Finds relevant specialists by specialty, location, and distance.',
    roleHi: 'विशेषता, स्थान और दूरी के अनुसार विशेषज्ञ खोजता है।',
    icon: Stethoscope,
    accent: '#7C63E8',
    soft: '#EEE9FF',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Comparison',
    nameHi: 'फार्मेसी तुलना',
    role: 'Compares equivalent medicine listings and highlights uncertainty.',
    roleHi: 'समतुल्य दवा सूचियों की तुलना करता है।',
    icon: Pill,
    accent: '#0D9488',
    soft: '#E6FAF7',
  },
  {
    id: 'blood',
    name: 'Virtual Blood Bank',
    nameHi: 'वर्चुअल रक्त बैंक',
    role: 'Supports blood-bank discovery, request tracking, and verification.',
    roleHi: 'रक्त बैंक खोज, अनुरोध ट्रैकिंग और सत्यापन में मदद करता है।',
    icon: Droplets,
    accent: '#E4593A',
    soft: '#FFF0E5',
  },
  {
    id: 'lab',
    name: 'Lab & Referral Coordinator',
    nameHi: 'लैब और रेफरल समन्वयक',
    role: 'Organizes diagnostic services and tracks pending tests.',
    roleHi: 'जांच सेवाओं को व्यवस्थित करता है और लंबित टेस्ट ट्रैक करता है।',
    icon: FlaskConical,
    accent: '#3978F6',
    soft: '#E9F2FF',
  },
  {
    id: 'doctor',
    name: 'Health Education Assistant',
    nameHi: 'स्वास्थ्य शिक्षा सहायक',
    role: 'Explains health terms and prepares questions — SehatSaathi.',
    roleHi: 'स्वास्थ्य शब्द समझाता है — सेहतसाथी।',
    icon: HeartPulse,
    accent: '#14B8A6',
    soft: '#DFF7EC',
  },
  {
    id: 'careloop',
    name: 'CareLoop Agent',
    nameHi: 'केयरलूप एजेंट',
    role: 'Organizes care plans, follow-ups, reminders, and documents.',
    roleHi: 'देखभाल योजनाएँ, फ़ॉलो-अप और रिमाइंडर व्यवस्थित करता है।',
    icon: Workflow,
    accent: '#6549CE',
    soft: '#F3F0FF',
  },
];
