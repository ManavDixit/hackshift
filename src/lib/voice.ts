import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { speechCode } from './languages';
import type { Lang } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type ListenState = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported' | 'error';

export function useSpeechRecognition(lang: Lang) {
  const [listenState, setListenState] = useState<ListenState>('idle');
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  const onFinalRef = useRef<((text: string) => void) | null>(null);

  const supported = useMemo(() => getRecognitionCtor() !== null, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setListenState('idle');
    setTranscript('');
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) {
        setListenState('unsupported');
        return;
      }
      onFinalRef.current = onFinal;
      finalRef.current = '';
      setTranscript('');
      setListenState('requesting');
      try {
        const rec = new Ctor();
        recRef.current = rec;
        rec.lang = speechCode(lang);
        rec.continuous = false;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.onstart = () => setListenState('listening');
        rec.onresult = (e: any) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalRef.current += r[0].transcript;
            else interim += r[0].transcript;
          }
          setTranscript((finalRef.current + ' ' + interim).trim());
        };
        rec.onerror = (e: any) => {
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setListenState('denied');
          else if (e.error === 'no-speech') setListenState('idle');
          else setListenState('error');
        };
        rec.onend = () => {
          const text = finalRef.current.trim();
          if (text && onFinalRef.current) onFinalRef.current(text);
          setListenState((s) => (s === 'listening' || s === 'requesting' ? 'idle' : s));
          setTranscript('');
        };
        rec.start();
      } catch {
        setListenState('error');
      }
    },
    [lang]
  );

  useEffect(
    () => () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
    },
    []
  );

  return { listenState, transcript, supported, start, stop };
}

export type SpeakState = 'idle' | 'loading' | 'speaking' | 'unavailable';

interface SpeakHandle {
  speak: (text: string, langCode: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  replay: () => void;
  speakState: SpeakState;
  voiceName: string | null;
  muted: boolean;
  setMuted: (m: boolean) => void;
  lastSpoken: string | null;
  /** Live 0..1 mouth amplitude driven by real playback events (word boundaries) */
  level: number;
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#`>]/g, '')
    .replace(/\s*•\s*/g, '. ')
    .replace(/\s*\n+\s*/g, '. ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useSpeechSynthesis(): SpeakHandle {
  const [speakState, setSpeakState] = useState<SpeakState>('idle');
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const iv = setInterval(() => setLevel((l) => (l > 0.02 ? l * 0.82 : 0)), 55);
    return () => {
      clearInterval(iv);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const pickVoice = useCallback(
    (langCode: string) => {
      const voices = window.speechSynthesis.getVoices();
      const exact = voices.find((v) => v.lang === langCode);
      if (exact) return exact;
      const base = langCode.split('-')[0];
      const loose = voices.find((v) => v.lang.startsWith(base));
      return loose ?? null;
    },
    []
  );

  const speak = useCallback(
    (text: string, langCode: string, onEnd?: () => void) => {
      if (!supported) {
        setSpeakState('unavailable');
        return;
      }
      const clean = cleanForSpeech(text);
      if (!clean) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      const voice = pickVoice(langCode);
      if (voice) {
        utter.voice = voice;
        setVoiceName(voice.name);
      } else {
        setVoiceName(null);
      }
      utter.lang = voice?.lang ?? langCode;
      utter.rate = 0.98;
      utter.pitch = 1.03;
      utter.onstart = () => setSpeakState('speaking');
      // Each word boundary is a real playback event — pulse the mouth on it.
      utter.onboundary = () => setLevel(0.55 + Math.random() * 0.45);
      utter.onend = () => {
        setSpeakState('idle');
        onEnd?.();
      };
      utter.onerror = () => setSpeakState('idle');
      utterRef.current = utter;
      setLastSpoken(text);
      if (muted) {
        setSpeakState('idle');
        onEnd?.();
        return;
      }
      window.speechSynthesis.speak(utter);
    },
    [muted, supported]
  );

  const stopSpeaking = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeakState('idle');
  }, [supported]);

  const replay = useCallback(() => {
    if (lastSpoken) speak(lastSpoken, utterRef.current?.lang ?? 'en-IN');
  }, [lastSpoken, speak]);

  return { speak, stopSpeaking, replay, speakState, voiceName, muted, setMuted, lastSpoken, level };
}
