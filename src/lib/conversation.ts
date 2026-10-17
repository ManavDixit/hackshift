import type { Lang } from './types';

/**
 * SehatSaathi conversational engine (demo).
 *
 * In production, `generateReply` is the seam where a server-side LLM call
 * plugs in (credentials stay on the server). The demo implementation is
 * deterministic, context-aware, and supports code-switching (Hinglish), but
 * it is NOT a real language model — the UI labels it as such.
 */

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface ConversationContext {
  /** Symptoms user has mentioned, lowercase */
  symptoms: Set<string>;
  /** Name if user introduced themselves */
  userName: string | null;
  /** Language style detected from user input */
  style: 'english' | 'hindi' | 'hinglish';
  /** Follow-up question pending an answer */
  pendingQuestion: string | null;
  /** Topic of current conversation */
  topic: string | null;
  /** Extracted medicine mention, if any */
  medicine: string | null;
}

export function newContext(): ConversationContext {
  return {
    symptoms: new Set(),
    userName: null,
    style: 'english',
    pendingQuestion: null,
    topic: null,
    medicine: null,
  };
}

/* ---------------------- language style detection ---------------------- */

const HINGLISH_MARKERS = [
  'mujhe', 'hai', 'hona', 'kya', 'nahi', 'raha', 'rahi', 'kal', 'se', 'mein', 'hain',
  'acha', 'theek', 'dard', 'buKhar', 'bukhar', 'sar', 'dawa', 'dawai',
];
const DEVANAGARI = /[\u0900-\u097F]/;

export function detectStyle(text: string): ConversationContext['style'] {
  if (DEVANAGARI.test(text)) return 'hindi';
  const words = text.toLowerCase().split(/\s+/);
  const hits = words.filter((w) => HINGLISH_MARKERS.includes(w)).length;
  if (hits >= 2 || /\b(aap|aapko|kal se|mujhe)\b/i.test(text)) return 'hinglish';
  return 'english';
}

/* --------------------------- topic detection --------------------------- */

interface TopicDef {
  id: string;
  patterns: RegExp;
  followUp: { en: string; hi: string; hinglish: string };
  base: { en: (name: string | null) => string; hi: (name: string | null) => string; hinglish: (name: string | null) => string };
  detail: { en: string; hi: string; hinglish: string };
  medicine?: string;
}

const namePart = (name: string | null) => (name ? `${name}, ` : '');

const topics: TopicDef[] = [
  {
    id: 'headache',
    patterns: /headache|head ache|sar dard|सिरदर्द|सर दर्द|sir dard/i,
    medicine: undefined,
    followUp: {
      en: 'Can I ask — where is the pain exactly, and does light or noise make it worse?',
      hi: 'क्या मैं पूछ सकता हूँ — दर्द ठीक कहाँ हो रहा है, और रोशनी या शोर से बढ़ता है क्या?',
      hinglish: 'Ek chhota question — dard sir ke kis hisse mein ho raha hai, aur roshni ya shor se badhta hai kya?',
    },
    base: {
      en: (n) => `I understand — you've been having a headache since yesterday, ${n ? `${n}. ` : ''}that can be really uncomfortable.`,
      hi: (n) => `समझ गया — कल से सिरदर्द हो रहा है${n ? `, ${n}` : ''}। यह बहुत असहज करता है।`,
      hinglish: (n) => `Achha, samajh gaya. Aapko kal se headache ho raha hai${n ? `, ${n}` : ''}. Main aapse kuch chhote questions poochunga taaki main aapko sahi information de sakun.`,
    },
    detail: {
      en: 'Common causes include tension, dehydration, missed meals, or screen strain. Drinking water, resting in a dim room, and regular meals often help. See a clinician promptly if the pain is sudden and severe, or comes with fever, neck stiffness, vision changes, or weakness — those need in-person evaluation.',
      hi: 'सामान्य कारणों में तनाव, पानी की कमी, भोजन छूटना या स्क्रीन का तनाव शामिल हैं। पानी पीना, धुंधले कमरे में आराम और समय पर भोजन अक्सर मदद करता है। यदि दर्द अचानक और तेज़ हो, या बुखार, गर्दन में अकड़न, दृष्टि में बदलाव या कमज़ोरी के साथ हो, तो तुरंत डॉक्टर से मिलें।',
      hinglish: 'Common causes hain tension, dehydration, khana miss karna, ya screen strain. Paani piijiye, dim room mein aaram kijiye. Agar dard achanak bahut tez ho, ya fever, gardan mein akdan, ya weakness ke saath ho, toh turant doctor se milein.',
    },
  },
  {
    id: 'dizziness',
    patterns: /dizzy|dizziness|light ?headed|चक्कर/i,
    followUp: {
      en: 'When does it usually happen — on standing up quickly, or at random times? And any other symptoms with it?',
      hi: 'यह आमतौर पर कब होता है — तेज़ी से खड़े होने पर, या कभी भी? और साथ में कोई और लक्षण?',
      hinglish: 'Yeh usually kab hota hai — jaldi khade hone par, ya kabhi bhi? Aur saath mein koi aur symptom?',
    },
    base: {
      en: (n) => `Thanks for telling me about the dizziness${n ? `, ${n}` : ''}. It can happen for several everyday reasons.`,
      hi: (n) => `चक्कर आने की बात बताने के लिए धन्यवाद${n ? `, ${n}` : ''}। इसके कई सामान्य कारण हो सकते हैं।`,
      hinglish: (n) => `Theek hai${n ? `, ${n}` : ''}. Dizziness ke kaafi common reasons ho sakte hain, chaliye thoda detail mein dekhein.`,
    },
    detail: {
      en: 'Common causes include dehydration, standing up quickly, low blood sugar, or inner-ear issues. Sit or lie down when it happens, rise slowly, and keep hydrated. If it comes with chest pain, fainting, irregular heartbeat, or new weakness, seek urgent care — those signs need prompt in-person attention.',
      hi: 'सामान्य कारणों में पानी की कमी, तेज़ी से खड़े होना, लो ब्लड शुगर या भीतरी कान की समस्या शामिल हैं। जब हो तो बैठ या लेट जाएँ, धीरे उठें और पानी पिएँ। यदि सीने में दर्द, बेहोशी, अनियमित धड़कन या नई कमज़ोरी के साथ हो, तो तुरंत आपात देखभाल लें।',
      hinglish: 'Common causes: dehydration, jaldi khada hona, low blood sugar, ya inner ear issue. Jab ho, baith jaiye ya let jaiye, dheere uthe. Chest pain, behoshi, ya weakness ke saath ho toh urgent care lein.',
    },
  },
  {
    id: 'fever',
    patterns: /fever|temperature|बुखार|bukhar/i,
    followUp: {
      en: 'How high has the fever been, and is anything else bothering you — sore throat, cough, body ache?',
      hi: 'बुखार कितना रहा है, और कुछ और परेशान कर रहा है क्या — गले में दर्द, खांसी, बदन दर्द?',
      hinglish: 'Fever kitna raha hai, aur kuch aur hai kya — gala, khaansi, ya body ache?',
    },
    base: {
      en: (n) => `I see — fever since yesterday${n ? `, ${n}` : ''}. Let's understand it a bit better.`,
      hi: (n) => `समझ गया — कल से बुखार है${n ? `, ${n}` : ''}। थोड़ा और समझते हैं।`,
      hinglish: (n) => `Achha${n ? `, ${n}` : ''}, kal se fever hai. Thoda detail mein samajhte hain.`,
    },
    detail: {
      en: 'For mild fever, rest, fluids, and light clothing usually help, and it often settles in 2–3 days. Get seen promptly if fever stays above 3 days, climbs very high, or comes with breathlessness, rash, confusion, or persistent vomiting.',
      hi: 'हल्के बुखार में आराम, तरल और हल्के कपड़े आमतौर पर मदद करते हैं; अक्सर 2–3 दिन में ठीक हो जाता है। 3 दिन से अधिक रहे, बहुत बढ़ जाए, या सांस तकलीफ, रैश, भ्रम या लगातार उल्टी के साथ हो तो तुरंत मिलें।',
      hinglish: 'Mild fever mein rest, fluids aur light clothing madad karte hain — aksar 2-3 din mein set ho jata hai. 3 din se zyada rahe, bahut badh jaye, ya saans, rash, confusion ke saath ho toh turant milein.',
    },
  },
  {
    id: 'report',
    patterns: /report|lipid|hba1c|ecg|रिपोर्ट|जांच/i,
    followUp: {
      en: 'Which part would you like to start with — the numbers themselves, or what they mean for your care plan?',
      hi: 'कहाँ से शुरू करें — आंकड़े, या आपकी देखभाल योजना के लिए इनका मतलब?',
      hinglish: 'Kahan se shuru karein — numbers khud, ya aapke care plan ke liye inka matlab?',
    },
    base: {
      en: (n) => `Happy to walk through your report${n ? `, ${n}` : ''}. Let's take it step by step.`,
      hi: (n) => `आपकी रिपोर्ट समझाने में खुशी होगी${n ? `, ${n}` : ''}। चरण दर चरण देखते हैं।`,
      hinglish: (n) => `Bilkul${n ? `, ${n}` : ''}, report samjha deta hoon — step by step.`,
    },
    detail: {
      en: 'Your plan shows a lipid profile (blood fats, which help assess heart-health risk) due in 6 days, and a cardiology follow-up to arrange. A 9–12 hour fast is commonly asked for lipid tests — confirm when booking. You could ask your clinician: what target levels should I aim for, and how often should we re-test?',
      hi: 'आपकी योजना में 6 दिन में लिपिड प्रोफ़ाइल (रक्त वसा, हृदय-स्वास्थ्य जोखिम के लिए) और कार्डियोलॉजी फ़ॉलो-अप बाकी है। लिपिड जांच से पहले आमतौर पर 9–12 घंटे का उपवास कहा जाता है — बुकिंग पर पुष्टि करें। डॉक्टर से पूछें: लक्ष्य स्तर क्या हों और जांच कितनी बार कराएँ?',
      hinglish: 'Aapke plan mein 6 din mein lipid profile hai (blood fats — heart health ke liye), aur cardiology follow-up arrange karna hai. Lipid test se pehle aamtaur par 9-12 ghante fasting hoti hai — booking par confirm karein. Doctor se poochein: target levels kya hon aur re-test kitni baar?',
    },
  },
  {
    id: 'appointment',
    patterns: /appointment|visit|prepare|doctor visit|अपॉइंटमेंट|तैयारी/i,
    followUp: {
      en: 'Is this for the cardiology follow-up, or a different visit?',
      hi: 'यह कार्डियोलॉजी फ़ॉलो-अप के लिए है, या कोई और विज़िट?',
      hinglish: 'Yeh cardiology follow-up ke liye hai, ya koi aur visit?',
    },
    base: {
      en: (n) => `Good thinking to prepare${n ? `, ${n}` : ''}. A few minutes of planning makes the visit far more useful.`,
      hi: (n) => `तैयारी करना अच्छी सोच है${n ? `, ${n}` : ''}। थोड़ी योजना विज़िट को बहुत उपयोगी बना देती है।`,
      hinglish: (n) => `Achha kiya soch kar${n ? `, ${n}` : ''}. Thodi taiyari visit ko kaafi useful bana deti hai.`,
    },
    detail: {
      en: 'Bring your discharge summary, current medicine list, and latest lab reports. Prepare your top 3 questions in advance — for example: what target levels should I aim for, how often should we re-test, and what should I do if symptoms change?',
      hi: 'अपना डिस्चार्ज सारांश, वर्तमान दवा सूची और नवीनतम रिपोर्ट साथ लाएँ। अपने शीर्ष 3 प्रश्न पहले तैयार करें — जैसे: लक्ष्य स्तर क्या हों, जांच कितनी बार कराएँ, और लक्षण बदलने पर क्या करें?',
      hinglish: 'Discharge summary, current dawa list aur latest reports saath le jaiye. Top 3 questions pehle taiyar karein — jaise: target levels kya hon, re-test kitni baar, aur symptoms badlein toh kya karein?',
    },
  },
];

const GREETING = /(^|\s)(hi|hello|namaste|namaskar|hey|नमस्ते|नमस्कार|salaam|सलाम)(\s|$|[!.?])/i;
const THANKS = /thank|thanks|shukriya|dhanyavad|धन्यवाद|शुक्रिया/i;
const MORE = /more detail|explain more|tell me more|और बताइए|detail mein|in detail/i;
const NAME_CAPTURE = /(?:my name is|i am|i'm|mera naam|मेरा नाम)\s+([a-zA-Z\u0900-\u097F]+)/i;

export interface Reply {
  text: string;
  /** Medicine to prefill pharmacy search with, when explicitly mentioned */
  medicine?: string;
  urgent?: boolean;
}

export function generateReply(input: string, ctx: ConversationContext, lang: Lang): Reply {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Language style: keep the user's own style; fall back to their chosen language.
  const style = detectStyle(text) === 'english' && lang === 'hi' ? 'hindi' : detectStyle(text);
  ctx.style = style;
  const say = (v: { en: string; hi: string; hinglish: string }) => (style === 'hindi' ? v.hi : style === 'hinglish' ? v.hinglish : v.en);

  // Memory: capture name.
  const nameMatch = text.match(NAME_CAPTURE);
  if (nameMatch) ctx.userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
  const n = ctx.userName;

  // Follow-up answer handling: pending symptom question.
  if (ctx.pendingQuestion) {
    const pending = ctx.pendingQuestion;
    ctx.pendingQuestion = null;
    const topic = topics.find((t) => t.id === ctx.topic);
    if (topic) {
      // Store the answer as context ("dard sir ke peeche" etc.) and give next steps.
      const summary = say({
        en: `Got it. So ${ctx.symptoms.size ? [...ctx.symptoms].join(', ') : 'the symptoms'} you described, with what you just told me — here's the practical picture.`,
        hi: 'समझ गया। आपने जो बताया, उसके आधार पर व्यावहारिक स्थिति यह है।',
        hinglish: 'Theek hai, note kar liya. Aapne jo bataya, uske hisaab se picture yeh hai.',
      });
      return { text: `${summary}\n\n${topic.detail.en === topic.detail.hi ? topic.detail[style === 'hindi' ? 'hi' : style === 'hinglish' ? 'hinglish' : 'en'] : ''}${topicDetail(topic, style)}\n\n${say({
        en: 'Would you like me to explain anything from that in more detail, or help with something else?',
        hi: 'क्या मैं इसमें से किसी बात को और विस्तार से समझाऊँ, या किसी और चीज़ में मदद करूँ?',
        hinglish: 'Isme se kuch aur detail mein samjhaun, ya kisi aur cheez mein help karun?',
      })}` };
    }
    void pending;
  }

  // Greeting.
  if (GREETING.test(text) && text.length < 40) {
    ctx.pendingQuestion = null;
    return {
      text: say({
        en: `Hello${n ? `, ${n}` : ''}! Good to see you. What's on your mind today — a symptom, a report, or your care plan?`,
        hi: `नमस्ते${n ? `, ${n}` : ''}! आज क्या बात करनी है — कोई लक्षण, रिपोर्ट, या देखभाल योजना?`,
        hinglish: `Hello${n ? `, ${n}` : ''}! Boliye, aaj kya baat karni hai — koi symptom, report, ya care plan?`,
      }),
    };
  }

  // Thanks.
  if (THANKS.test(text) && text.length < 50) {
    return {
      text: say({
        en: `Anytime${n ? `, ${n}` : ''}. I'm here whenever you need me — take care!`,
        hi: `कभी भी${n ? `, ${n}` : ''}। जब ज़रूरत हो, मैं यहीं हूँ — अपना ख्याल रखिए!`,
        hinglish: `Anytime${n ? `, ${n}` : ''}. Jab bhi zaroorat ho, main yahin hoon — apna khayal rakhiye!`,
      }),
    };
  }

  // "More detail" request on last topic.
  if (MORE.test(lower) && ctx.topic) {
    const topic = topics.find((t) => t.id === ctx.topic);
    if (topic) return { text: topicDetail(topic, style) };
  }

  // Topic match.
  for (const topic of topics) {
    if (topic.patterns.test(text)) {
      ctx.topic = topic.id;
      ctx.pendingQuestion = topic.id;
      if (topic.medicine) ctx.medicine = topic.medicine;
      // Extract medicine mentions for pharmacy prefill (explicit only).
      const medMatch = text.match(/\b(atenolol|metformin|amlodipine|paracetamol|amoxicillin|atorvastatin)\b/i);
      const med = medMatch ? medMatch[1] : undefined;
      if (med) ctx.medicine = med;
      return {
        text: `${topic.base[style === 'hindi' ? 'hi' : style === 'hinglish' ? 'hinglish' : 'en'](n)}\n\n${say(topic.followUp)}`,
        medicine: med,
      };
    }
  }

  // Fallback: acknowledge + ask a clarifying question (never a canned repeat).
  return {
    text: say({
      en: `I hear you${n ? `, ${n}` : ''}. To point you the right way — is this about a symptom you're feeling, a report you'd like to understand, or arranging your next care step?`,
      hi: `मैं आपकी बात समझ रहा हूँ${n ? `, ${n}` : ''}। सही दिशा बताने के लिए — यह किसी लक्षण के बारे में है, समझने की रिपोर्ट, या अगले कदम की व्यवस्था?`,
      hinglish: `Main sun raha hoon${n ? `, ${n}` : ''}. Sahi direction ke liye — yeh kisi symptom ke baare mein hai, samajhne wali report, ya agle care step ki vyavastha?`,
    }),
  };
}

function topicDetail(topic: TopicDef, style: ConversationContext['style']): string {
  return style === 'hindi' ? topic.detail.hi : style === 'hinglish' ? topic.detail.hinglish : topic.detail.en;
}

export function welcomeFor(lang: Lang): string {
  return lang === 'hi'
    ? 'नमस्ते! मैं आपका MediLink एआय डॉक्टर हूँ।\n\nमैं स्वास्थ्य जानकारी समझने, आपकी चिंताएँ बताने और डॉक्टर से बातचीत की तैयारी में मदद करता हूँ। आप हिंदी, अंग्रेज़ी या दोनों में बात कर सकते हैं — बस माइक दबाएँ या टाइप करें।'
    : "Hello! I'm your MediLink AI Doctor.\n\nI'm here to help you understand health information, discuss your concerns, and prepare for conversations with healthcare professionals. You can talk in English, Hindi, or mix the two — just press the mic, or type.";
}
