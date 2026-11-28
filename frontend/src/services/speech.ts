/**
 * KiranaFlow — Browser Web Speech API & Audio Feedback Wrapper
 *
 * - Zero API keys required.
 * - Uses SpeechRecognition (en-IN / hi-IN / kn-IN) with graceful fallback detection.
 * - Requests WebRTC noiseSuppression, echoCancellation, autoGainControl on mic start.
 * - Uses window.speechSynthesis for spoken read-back, falling back gracefully
 *   if no Indian language voice is installed on the host OS.
 * - Plays subtle Web Audio confirmation chimes without external audio files.
 */

import type { LangCode } from '../types/api';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternativeLike;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((ev: Event) => void) | null;
  onaudiostart: ((ev: Event) => void) | null;
  onsoundstart: ((ev: Event) => void) | null;
  onspeechstart: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

const LANG_LOCALE_MAP: Record<LangCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
};

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Detect browser engine so we can surface actionable mic diagnostics on Windows. */
export function detectSpeechEnvironment(): { browser: string; warning: string | null } {
  if (typeof navigator === 'undefined') {
    return { browser: 'Unknown', warning: null };
  }
  const ua = navigator.userAgent;
  const hasBrave = Boolean((navigator as unknown as { brave?: unknown }).brave);
  if (hasBrave) {
    return {
      browser: 'Brave',
      warning: 'Brave blocks Google Web Speech servers by default — open in Google Chrome or type below.',
    };
  }
  if (/Edg\//i.test(ua)) {
    return {
      browser: 'Microsoft Edge',
      warning: 'Edge often blocks Chrome Web Speech API — open in Google Chrome or use text below.',
    };
  }
  if (/Firefox/i.test(ua)) {
    return {
      browser: 'Firefox',
      warning: 'Firefox does not support Web Speech API — open in Google Chrome or type below.',
    };
  }
  if (/Chrome/i.test(ua)) {
    return { browser: 'Google Chrome', warning: null };
  }
  return {
    browser: 'Embedded / Other Browser',
    warning: 'Speech recognition requires Google Chrome — open this URL in Chrome or type below.',
  };
}

export function createSpeechRecognition(lang: LangCode): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = LANG_LOCALE_MAP[lang];
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  return recognition;
}

/**
 * Hint browser audio stack to enable noise suppression, echo cancellation,
 * and automatic gain control before starting speech recognition.
 * Immediately stops the probe stream so SpeechRecognition owns the mic cleanly.
 */
export async function primeNoiseSuppressedMic(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      },
    });
    stream.getTracks().forEach((track) => track.stop());
  } catch {
    // Let SpeechRecognition surface permission errors if denied
  }
}

export function speakText(text: string, lang: LangCode, muted = false): void {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = LANG_LOCALE_MAP[lang];
    utterance.lang = targetLocale;
    utterance.rate = 0.98;

    // Pick matching voice if installed; otherwise let browser default voice speak cleanly
    const voices = window.speechSynthesis.getVoices();
    const exactMatch = voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase());
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
    if (exactMatch) {
      utterance.voice = exactMatch;
    } else if (prefixMatch) {
      utterance.voice = prefixMatch;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Never block the flow on TTS failures
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

let sharedAudioCtx: AudioContext | null = null;

/** Play a brief, pleasant two-tone Web Audio chime on commit or mic start. */
export function playTone(kind: 'start' | 'success'): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;

    const playBeep = (freq: number, offset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + offset);
      gain.gain.setValueAtTime(0.08, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + duration);
    };

    if (kind === 'start') {
      playBeep(587.33, 0, 0.09); // D5
    } else {
      playBeep(523.25, 0, 0.1); // C5
      playBeep(659.25, 0.1, 0.16); // E5
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
}
