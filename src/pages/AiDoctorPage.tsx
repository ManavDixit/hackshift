import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Info,
  Mic,
  MicOff,
  Package,
  Phone,
  Play,
  Send,
  ShieldCheck,
  Square,
  ThumbsDown,
  ThumbsUp,
  Copy,
  Volume2,
  VolumeX,
  FileText,
  Stethoscope,
  ListChecks,
} from 'lucide-react';
import { AiDoctor, type AvatarState } from '@/components/AiDoctor';
import { AppShell } from '@/components/AppShell';
import { Notice } from '@/components/Ui';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { labelForCode, speechCode, speechLanguages } from '@/lib/languages';
import { useSpeechRecognition, useSpeechSynthesis } from '@/lib/voice';
import {
  generateReply,
  newContext,
  welcomeFor,
  type ConversationContext,
} from '@/lib/conversation';

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  /** Prefill for pharmacy comparison, only when the user explicitly named a medicine */
  medicine?: string;
}

export function AiDoctorPage() {
  const { lang, setLang, navigate } = useApp();
  const s = t(lang);
  const hi = lang === 'hi';
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const ctxRef = useRef<ConversationContext>(newContext());
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { listenState, transcript, supported: micSupported, start, stop: stopListening } = useSpeechRecognition(lang);
  const { speak, stopSpeaking, replay, speakState, voiceName, muted, setMuted, level } = useSpeechSynthesis();

  const avatarState: AvatarState = useMemo(() => {
    if (listenState === 'listening' || listenState === 'requesting') return 'listening';
    if (speakState === 'speaking') return 'speaking';
    if (speakState === 'loading') return 'thinking';
    return messages.length <= 1 ? 'greeting' : 'idle';
  }, [listenState, speakState, messages.length]);

  const listening = listenState === 'listening' || listenState === 'requesting';

  useEffect(() => {
    setMessages([{ id: ++idRef.current, role: 'assistant', text: welcomeFor(lang), source: hi ? 'सामान्य स्वास्थ्य शिक्षा · सेहतसाथी' : 'Health education only · SehatSaathi' }]);
  }, [hi]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, transcript]);

  const respond = (text: string) => {
    setMessages((m) => [...m, { id: ++idRef.current, role: 'user', text }]);
    const ctx = ctxRef.current;
    const reply = generateReply(text, ctx, lang);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: ++idRef.current,
          role: 'assistant',
          text: reply.text,
          source: reply.urgent
            ? hi ? 'आपातकालीन मार्गदर्शन प्राथमिकता · सेहतसाथी' : 'Urgent-care guidance prioritized · SehatSaathi'
            : hi ? 'सामान्य स्वास्थ्य शिक्षा · प्रदर्शन उत्तर (डेमो)' : 'General health education · Illustrative response (demo)',
          medicine: reply.medicine,
        },
      ]);
      speak(reply.text, speechCode(lang));
    }, 600);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    respond(trimmed);
  };

  const onMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    stopSpeaking();
    start((finalText) => send(finalText));
  };

  const interrupt = () => {
    stopSpeaking();
    if (listening) stopListening();
  };

  const statusLabel =
    listenState === 'denied'
      ? hi ? 'माइक्रोफ़ोन की अनुमति नहीं मिली — कृपया ब्राउज़र सेटिंग्स में अनुमति दें, या टाइप करें।' : 'Microphone permission denied — allow access in browser settings, or use typing.'
      : listenState === 'unsupported'
        ? hi ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है — टाइपिंग पूरी तरह काम करती है।' : 'Voice input is not available in this browser — typing works fully.'
        : listenState === 'error'
          ? hi ? 'वॉइस इनपुट में समस्या हुई। फिर कोशिश करें या टाइप करें।' : 'Voice input hit a problem. Try again, or type instead.'
          : null;

  const voiceOutUnavailable = speakState === 'unavailable';

  const starters = hi
    ? ['Doctor, mujhe kal se headache ho raha hai', 'क्यों मुझे चक्कर आ रहे हैं?', 'मेरी रिपोर्ट समझाइए', 'डॉक्टर विज़िट के लिए तैयारी']
    : ['Can you explain why I might be feeling dizzy?', 'Doctor, I have a headache since yesterday', 'Help me understand my report', 'Prepare me for my doctor visit'];

  // Collapsible symptom summary derived from conversation memory.
  const remembered = ctxRef.current;
  const symptomList = [...remembered.symptoms];

  return (
    <AppShell title={`${s.aiDoctor} — SehatSaathi`}>
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Conversation */}
        <div className="lg:col-span-7">
          <div className="card flex h-[680px] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-teal-600">
                  <Stethoscope size={16} />
                </span>
                <div>
                  <p className="text-[13.5px] font-bold text-ink">SehatSaathi · सेहतसाथी</p>
                  <p className="text-[11px] font-semibold text-teal-600">
                    {listening ? (hi ? 'सुन रहा हूँ…' : 'Listening…') : speakState === 'speaking' ? (hi ? 'बोल रहा हूँ…' : 'Speaking…') : hi ? 'उपलब्ध' : 'Available'}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)} className="btn-secondary px-3 py-1.5 text-[12px]" aria-haspopup="listbox" aria-expanded={langOpen}>
                  {labelForCode(speechCode(lang))}
                </button>
                {langOpen && (
                  <div className="absolute right-0 z-20 mt-1.5 max-h-72 w-44 overflow-y-auto rounded-xl border border-line bg-white py-1.5 shadow-lift animate-fade-in" role="listbox">
                    {speechLanguages.map((l) => (
                      <button
                        key={l.code}
                        role="option"
                        aria-selected={speechCode(lang) === l.code}
                        onClick={() => {
                          setLang(l.code === 'hi-IN' ? 'hi' : 'en');
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[12.5px] font-semibold transition-colors hover:bg-primary-50 ${speechCode(lang) === l.code ? 'text-primary-700' : 'text-ink-soft'}`}
                      >
                        <span>{l.native}</span>
                        <span className="text-[10.5px] font-medium text-ink-faint">{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 animate-fade-up ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {m.role === 'assistant' && <AiDoctor size={40} state="idle" className="shrink-0" />}
                  <div className={`max-w-[82%] ${m.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block whitespace-pre-line rounded-2xl px-4 py-3 text-left text-[13.5px] leading-relaxed ${
                        m.role === 'user' ? 'rounded-tr-md bg-primary-500 font-medium text-white' : 'rounded-tl-md border border-line bg-white text-ink'
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Contextual pharmacy action — only when the user named a medicine */}
                    {m.role === 'assistant' && m.medicine && (
                      <button
                        onClick={() => navigate('medicines')}
                        className="mt-2 flex w-full items-center justify-between rounded-xl border border-teal-100 bg-mint/50 px-3.5 py-2.5 text-left transition-colors hover:bg-mint"
                      >
                        <span className="flex items-center gap-2 text-[12.5px] font-bold text-teal-700">
                          <Package size={14} /> {hi ? `${m.medicine} की कीमतों की तुलना करें` : `Compare prices for ${m.medicine}`}
                        </span>
                        <span className="text-[11px] font-semibold text-teal-600">{hi ? 'समीक्षा करें →' : 'Review →'}</span>
                      </button>
                    )}

                    {m.source && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-ink-faint">
                        <Info size={11} /> {m.source}
                      </p>
                    )}
                    {m.role === 'assistant' && m.id > 1 && (
                      <div className="mt-1.5 flex items-center gap-1 text-ink-faint">
                        <button
                          className="rounded-md p-1 hover:bg-primary-50 hover:text-primary-600"
                          aria-label={hi ? 'कॉपी करें' : 'Copy response'}
                          onClick={() => {
                            navigator.clipboard?.writeText(m.text).catch(() => {});
                            setCopied(m.id);
                            setTimeout(() => setCopied(null), 1500);
                          }}
                        >
                          <Copy size={13} className={copied === m.id ? 'text-teal-500' : ''} />
                        </button>
                        <button className="rounded-md p-1 hover:bg-primary-50 hover:text-primary-600" aria-label={hi ? 'उपयोगी' : 'Helpful'}><ThumbsUp size={13} /></button>
                        <button className="rounded-md p-1 hover:bg-primary-50 hover:text-coral-500" aria-label={hi ? 'उपयोगी नहीं' : 'Not helpful'}><ThumbsDown size={13} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {listening && transcript && (
                <div className="flex justify-end animate-fade-in">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md border border-dashed border-primary-300 bg-primary-50/60 px-4 py-3 text-left text-[13.5px] italic text-primary-800">
                    {transcript}
                  </div>
                </div>
              )}
            </div>

            {statusLabel && (
              <div className="border-t border-line bg-peach/50 px-5 py-2.5">
                <p className="text-[12px] font-semibold text-coral-700">{statusLabel}</p>
              </div>
            )}

            <div className="border-t border-line px-5 py-3">
              <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
                {starters.map((q) => (
                  <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink-soft transition-colors hover:border-primary-200 hover:text-primary-700">
                    {q}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onMic}
                  disabled={!micSupported}
                  aria-label={listening ? (hi ? 'रिकॉर्डिंग रोकें' : 'Stop recording') : hi ? 'बोलना शुरू करें' : 'Start speaking'}
                  className={`btn shrink-0 rounded-full p-3 ${listening ? 'animate-pulse bg-coral-500 text-white shadow-lift hover:bg-coral-600' : 'bg-teal-500 text-white shadow-card hover:bg-teal-600'} ${!micSupported ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {listening ? <Square size={16} /> : micSupported ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <input
                  className="input"
                  value={listening ? transcript || input : input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? (hi ? 'सुन रहा हूँ…' : 'Listening…') : s.inputPlaceholder}
                  aria-label={hi ? 'संदेश' : 'Message'}
                />
                <button type="submit" className="btn-primary shrink-0 px-4" disabled={!input.trim()}>
                  {hi ? 'भेजें' : 'Send'}
                </button>
              </form>
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMuted(!muted)} aria-label={muted ? (hi ? 'आवाज़ चालू करें' : 'Unmute voice') : hi ? 'आवाज़ बंद करें' : 'Mute voice'} className="btn-ghost px-2.5 py-1.5 text-[12px]">
                    {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    <span className="hidden sm:inline">{muted ? (hi ? 'म्यूट' : 'Muted') : hi ? 'आवाज़ चालू' : 'Voice on'}</span>
                  </button>
                  {speakState === 'speaking' && (
                    <button onClick={interrupt} className="btn bg-coral-500 px-3 py-1.5 text-[12px] text-white hover:bg-coral-600" aria-label={hi ? 'बोलना रोकें' : 'Stop speaking'}>
                      <Square size={13} /> {hi ? 'रोकें' : 'Stop'}
                    </button>
                  )}
                  <button onClick={replay} className="btn-ghost px-2.5 py-1.5 text-[12px]" aria-label={hi ? 'फिर से सुनें' : 'Replay audio'}>
                    <Play size={13} /> {hi ? 'फिर सुनें' : 'Replay'}
                  </button>
                </div>
                {speakState === 'speaking' && (
                  <div className="flex items-end gap-0.5" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="w-1 rounded-full bg-teal-400 transition-all duration-100" style={{ height: `${6 + Math.abs(Math.sin(Date.now() / 200 + i)) * level * 18 + 4}px` }} />
                    ))}
                  </div>
                )}
              </div>
              {(voiceOutUnavailable || !micSupported) && (
                <p className="mt-2 text-[11.5px] font-medium text-ink-faint">
                  {voiceOutUnavailable && (hi ? 'स्पीच आउटपुट इस ब्राउज़र में उपलब्ध नहीं है — लिखित उत्तर पूरी तरह काम करते हैं। ' : 'Speech output is not available in this browser — written responses work fully. ')}
                  {!micSupported && (hi ? 'वॉइस इनपुट समर्थित नहीं है — टाइपिंग का उपयोग करें।' : 'Voice input is unsupported here — please type.')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside className="space-y-4 lg:col-span-5">
          <div className="card relative overflow-hidden p-6 text-center">
            <div className="absolute inset-x-0 top-0 h-24 opacity-70" style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(20,184,166,0.14), transparent)' }} />
            <div className="relative flex justify-center">
              <AiDoctor size={170} state={avatarState} mouth={speakState === 'speaking' ? level : 0} />
            </div>
            <h3 className="relative font-display text-[16px] font-bold text-ink">{hi ? 'नमस्ते! मैं सेहतसाथी हूँ' : "Hi, I'm SehatSaathi"}</h3>
            <p className="relative mx-auto mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-ink-soft">
              {hi ? 'एक आभासी डॉक्टर की तरह बात कीजिए — बोलिए या टाइप कीजिए, मैं आपकी बातचीत याद रखता हूँ।' : 'Talk to me like a virtual doctor — speak or type, and I keep track of our conversation.'}
            </p>
            {voiceName && !muted && speakState !== 'unavailable' && (
              <p className="relative mt-2 text-[11px] font-semibold text-ink-faint">Voice: {voiceName} · {labelForCode(speechCode(lang))}</p>
            )}
          </div>

          {/* Collapsible symptom summary */}
          <div className="card p-5">
            <button onClick={() => setSummaryOpen(!summaryOpen)} className="flex w-full items-center justify-between text-left">
              <span className="flex items-center gap-2 text-[13.5px] font-bold text-ink"><ListChecks size={15} className="text-primary-500" /> {hi ? 'बातचीत का सार' : 'Conversation summary'}</span>
              <span className="text-[11px] font-bold text-ink-faint">{summaryOpen ? (hi ? 'छिपाएँ' : 'Hide') : hi ? 'दिखाएँ' : 'Show'}</span>
            </button>
            {summaryOpen && (
              <div className="mt-3 animate-fade-in text-[12.5px] leading-relaxed text-ink-soft">
                <p><strong className="text-ink">{hi ? 'लक्षण:' : 'Symptoms:'}</strong> {symptomList.length > 0 ? symptomList.join(', ') : (hi ? 'अभी कोई नहीं' : 'none yet')}</p>
                <p className="mt-1.5"><strong className="text-ink">{hi ? 'विषय:' : 'Current topic:'}</strong> {remembered.topic ? remembered.topic : (hi ? 'सामान्य परामर्श' : 'general consultation')}</p>
                <p className="mt-1.5"><strong className="text-ink">{hi ? 'भाषा शैली:' : 'Language style:'}</strong> {remembered.style}</p>
                <p className="mt-3 text-[11px] font-medium text-ink-faint">
                  {hi ? 'डेमो मोड — उत्तर दिखावटी हैं, कोई वास्तविक LLM जुड़ा नहीं है।' : 'Demo mode — responses are illustrative; no live AI service is connected.'}
                </p>
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="card p-5">
            <h4 className="flex items-center gap-2 text-[13.5px] font-bold text-ink"><FileText size={15} className="text-violet-500" /> {hi ? 'अगले कदम' : 'Suggested next steps'}</h4>
            <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-soft">
              {(hi
                ? ['कार्डियोलॉजी फ़ॉलो-अप बुक करें', 'लिपिड प्रोफ़ाइल के लिए लैब चुनें', 'दवा की कीमतों की तुलना करें']
                : ['Arrange your cardiology follow-up', 'Choose a lab for the lipid profile', 'Compare medicine prices']
              ).map((li) => (
                <li key={li} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" /> {li}</li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h4 className="flex items-center gap-2 text-[13.5px] font-bold text-ink"><ShieldCheck size={15} className="text-teal-500" /> {hi ? 'सुरक्षा और भरोसा' : 'Safety & trust'}</h4>
            <ul className="mt-2.5 space-y-2 text-[12.5px] leading-relaxed text-ink-soft">
              {(hi
                ? ['शिक्षा और मार्गदर्शन — निदान या पर्चा नहीं', 'आपातकालीन संकेत पर तुरंत 108/112 की सलाह', 'बातचीत आपकी सहमति के बिना संग्रहित नहीं होती']
                : ['Education and navigation only — never a diagnosis or prescription', 'Emergency signs trigger immediate 108/112 guidance', 'Conversations are not stored without your consent']
              ).map((li) => (
                <li key={li} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" /> {li}</li>
              ))}
            </ul>
          </div>

          <Notice kind="warn">
            {hi ? 'आपातकाल में तुरंत 108 / 112 पर कॉल करें या निकटतम अस्पताल जाएँ।' : 'In an emergency call 108 / 112 or go to the nearest hospital immediately.'}{' '}
            <span className="inline-flex items-center gap-1 font-bold"><Phone size={12} /> 108 / 112</span>
          </Notice>
        </aside>
      </div>
    </AppShell>
  );
}
