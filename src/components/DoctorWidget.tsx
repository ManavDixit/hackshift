import { useMemo, useRef, useState } from 'react';
import { Maximize2, Mic, MicOff, Send, Square, Volume2, VolumeX, X, Package } from 'lucide-react';
import { AiDoctor, type AvatarState } from './AiDoctor';
import { useApp } from '@/lib/appContext';
import { speechCode } from '@/lib/languages';
import { useSpeechRecognition, useSpeechSynthesis } from '@/lib/voice';
import { generateReply, newContext, type ConversationContext } from '@/lib/conversation';

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  medicine?: string;
}

/** Compact floating SehatSaathi assistant — opens over any page without leaving it. */
export function DoctorWidget() {
  const { lang, setLang, navigate } = useApp();
  const hi = lang === 'hi';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const idRef = useRef(0);
  const ctxRef = useRef<ConversationContext>(newContext());

  const { listenState, transcript, supported: micSupported, start, stop: stopListening } = useSpeechRecognition(lang);
  const { speak, stopSpeaking, speakState, muted, setMuted, level } = useSpeechSynthesis();
  const listening = listenState === 'listening' || listenState === 'requesting';

  const avatarState: AvatarState = useMemo(() => {
    if (listening) return 'listening';
    if (speakState === 'speaking') return 'speaking';
    return messages.length === 0 ? 'greeting' : 'idle';
  }, [listening, speakState, messages.length]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    setMessages((m) => [...m, { id: ++idRef.current, role: 'user', text: trimmed }]);
    setTimeout(() => {
      const reply = generateReply(trimmed, ctxRef.current, lang);
      setMessages((m) => [...m, { id: ++idRef.current, role: 'assistant', text: reply.text, medicine: reply.medicine }]);
      speak(reply.text, speechCode(lang));
    }, 500);
  };

  const onMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    stopSpeaking();
    start((finalText) => send(finalText));
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white shadow-lift transition-transform hover:scale-105"
        aria-label={hi ? 'सेहतसाथी खोलें' : 'Open AI Doctor assistant'}
      >
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        <AiDoctor size={46} state="idle" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[440px] w-[min(340px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-fade-up">
      <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-sky to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <AiDoctor size={40} state={avatarState} mouth={speakState === 'speaking' ? level : 0} />
          <div>
            <p className="text-[12.5px] font-bold text-ink">SehatSaathi</p>
            <p className="text-[10.5px] font-semibold text-teal-600">
              {listening ? (hi ? 'सुन रहा हूँ…' : 'Listening…') : speakState === 'speaking' ? (hi ? 'बोल रहा हूँ…' : 'Speaking…') : hi ? 'उपलब्ध' : 'Available'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setMuted(!muted)} className="rounded-lg p-1.5 text-ink-faint hover:bg-primary-50 hover:text-primary-600" aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button onClick={() => { setOpen(false); stopSpeaking(); stopListening(); navigate('aidoctor'); }} className="rounded-lg p-1.5 text-ink-faint hover:bg-primary-50 hover:text-primary-600" aria-label={hi ? 'पूर्ण पेज खोलें' : 'Open full page'}>
            <Maximize2 size={15} />
          </button>
          <button onClick={() => { setOpen(false); stopSpeaking(); stopListening(); }} className="rounded-lg p-1.5 text-ink-faint hover:bg-primary-50 hover:text-ink" aria-label={hi ? 'बंद करें' : 'Close'}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
        {messages.length === 0 && (
          <div className="rounded-xl border border-line bg-canvas px-3.5 py-3 text-[12px] leading-relaxed text-ink-soft">
            {hi ? 'नमस्ते! मैं सेहतसाथी हूँ। स्वास्थ्य के बारे में पूछें — टाइप करें या माइक दबाएँ।' : "Hi! I'm SehatSaathi. Ask me anything about your health — type, or press the mic to talk."}
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${m.role === 'assistant' && m.medicine ? 'w-[85%]' : ''}`}>
              <div
                className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                  m.role === 'user' ? 'rounded-tr-sm bg-primary-500 font-medium text-white' : 'rounded-tl-sm border border-line bg-white text-ink'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'assistant' && m.medicine && (
                <button
                  onClick={() => { setOpen(false); stopSpeaking(); stopListening(); navigate('medicines'); }}
                  className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-teal-100 bg-mint/50 px-3 py-2 text-left text-[11.5px] font-bold text-teal-700 hover:bg-mint"
                >
                  <span className="flex items-center gap-1.5"><Package size={12} /> {hi ? `${m.medicine} की कीमतें` : `Compare ${m.medicine} prices`}</span>
                  <span>{hi ? 'खोलें →' : 'Open →'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {listening && transcript && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-dashed border-primary-300 bg-primary-50/60 px-3.5 py-2.5 text-[12.5px] italic text-primary-800">{transcript}</div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-1.5 border-t border-line px-3 py-2.5"
      >
        <button
          type="button"
          onClick={onMic}
          disabled={!micSupported}
          aria-label={listening ? 'Stop recording' : 'Start speaking'}
          className={`btn shrink-0 rounded-full p-2 ${listening ? 'animate-pulse bg-coral-500 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'} ${!micSupported ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {listening ? <Square size={13} /> : micSupported ? <Mic size={13} /> : <MicOff size={13} />}
        </button>
        <input
          className="input py-2 text-[12.5px]"
          value={listening ? transcript || input : input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? (hi ? 'सुन रहा हूँ…' : 'Listening…') : hi ? 'अपना सवाल लिखें…' : 'Type your question…'}
          aria-label={hi ? 'संदेश' : 'Message'}
        />
        <button type="submit" className="btn-primary shrink-0 rounded-full p-2.5" disabled={!input.trim()} aria-label="Send">
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
