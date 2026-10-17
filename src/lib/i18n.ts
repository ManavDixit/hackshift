const EN = {
  tagline: 'The Connected Healthcare Hub',
  findCare: 'Find Care',
  heroTitle: 'Healthcare, connected. Care, continued.',
  aiDoctor: 'AI Doctor',
  overview: 'Overview',
  findHospitals: 'Find Hospitals',
  costEstimator: 'Cost Estimator',
  findSpecialists: 'Find Specialists',
  medicines: 'Medicines',
  bloodBank: 'Blood Bank',
  labsReferrals: 'Labs & Referrals',
  myCarePlan: 'My Care Plan',
  careloop: 'CareLoop',
  mediCoverAI: 'MediCover AI',
  healthRecords: 'Health Records',
  settings: 'Settings & Privacy',
  notifications: 'Notifications',
  goodMorning: 'Good morning',
  sampleNote: 'Sample data for demonstration',
  inputPlaceholder: 'Ask about your health, reports, or next steps…',
  disclaimer:
    'General health education and navigation only — not a diagnosis or prescription. For emergencies, call your local emergency number.',
  welcomeMsg:
    "Hello! I'm your MediLink AI Doctor. I can help explain health information, organize your care journey, and prepare questions for your healthcare professional. How can I help today?",
};

import type { Lang } from './types';

const HI: Partial<typeof EN> = {
  tagline: 'जुड़ा हुआ स्वास्थ्य केंद्र',
  findCare: 'देखभाल खोजें',
  heroTitle: 'स्वास्थ्य सेवा, जुड़ी हुई। देखभाल, जारी।',
  aiDoctor: 'एआय डॉक्टर',
  overview: 'अवलोकन',
  findHospitals: 'अस्पताल खोजें',
  costEstimator: 'लागत अनुमानक',
  findSpecialists: 'विशेषज्ञ खोजें',
  medicines: 'दवाइयाँ',
  bloodBank: 'रक्त बैंक',
  labsReferrals: 'लैब और रेफरल',
  myCarePlan: 'मेरी देखभाल योजना',
  careloop: 'केयरलूप',
  mediCoverAI: 'मेडिकवर एआय',
  healthRecords: 'स्वास्थ्य रिकॉर्ड',
  settings: 'सेटिंग्स और गोपनीयता',
  notifications: 'सूचनाएँ',
  goodMorning: 'सुप्रभात',
  sampleNote: 'प्रदर्शन के लिए नमूना डेटा',
  inputPlaceholder: 'अपने स्वास्थ्य, रिपोर्ट या अगले कदमों के बारे में पूछें…',
  disclaimer:
    'यह केवल सामान्य स्वास्थ्य शिक्षा और मार्गदर्शन है — निदान या पर्चा नहीं। आपात स्थिति में अपनी स्थानीय आपातकालीन सेवा को कॉल करें।',
  welcomeMsg:
    'नमस्ते! मैं आपका MediLink एआय डॉक्टर हूँ। मैं स्वास्थ्य जानकारी समझाने, आपकी देखभाल यात्रा व्यवस्थित करने और आपके डॉक्टर के लिए प्रश्न तैयार करने में मदद कर सकता हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?',
};

export function t(lang: Lang): typeof EN {
  return lang === 'hi' ? ({ ...EN, ...HI } as typeof EN) : EN;
}
