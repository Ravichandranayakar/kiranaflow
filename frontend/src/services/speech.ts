/**
 * KiranaFlow — Cross-Browser Audio Capture, TTS Read-Back & Chimes
 *
 * - Zero API keys required.
 * - Uses standard MediaRecorder + WebRTC getUserMedia (works across Chrome, Brave, Firefox, Edge).
 * - Audio uploads to FastAPI /api/voice/transcribe (offline faster-whisper STT).
 * - Uses window.speechSynthesis for spoken read-back and Web Audio for feedback chimes.
 */

import type { LangCode } from '../types/api';

const LANG_LOCALE_MAP: Record<LangCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
};

let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) {
      cachedVoices = list;
    }
  } catch {
    // ignore
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  try {
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  } catch {
    // ignore
  }
}

export function hasBrowserVoice(lang: LangCode): boolean {
  const voices = refreshVoices();
  const target = LANG_LOCALE_MAP[lang].toLowerCase();
  return voices.some(
    (v) => v.lang.toLowerCase() === target || v.lang.toLowerCase().startsWith(`${lang}-`) || v.lang.toLowerCase() === lang,
  );
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return typeof navigator.mediaDevices !== 'undefined' && typeof MediaRecorder !== 'undefined';
}

export function pickRecordingFormat(): { mimeType: string; filename: string } {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return { mimeType: '', filename: 'recording.webm' };
  }
  const candidates: { mimeType: string; filename: string }[] = [
    { mimeType: 'audio/webm;codecs=opus', filename: 'recording.webm' },
    { mimeType: 'audio/webm', filename: 'recording.webm' },
    { mimeType: 'audio/ogg;codecs=opus', filename: 'recording.ogg' },
    { mimeType: 'audio/ogg', filename: 'recording.ogg' },
    { mimeType: 'audio/mp4', filename: 'recording.mp4' },
  ];
  return (
    candidates.find((c) => MediaRecorder.isTypeSupported(c.mimeType)) ?? {
      mimeType: '',
      filename: 'recording.webm',
    }
  );
}

let activeSpeakTimer: number | null = null;
let speakDispatchTimer: number | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeSpeakSeq = 0;

function clearSpeakTimers() {
  if (typeof window === 'undefined') return;
  if (activeSpeakTimer !== null) {
    window.clearTimeout(activeSpeakTimer);
    activeSpeakTimer = null;
  }
  if (speakDispatchTimer !== null) {
    window.clearTimeout(speakDispatchTimer);
    speakDispatchTimer = null;
  }
}

export function speakText(
  text: string,
  lang: LangCode,
  muted = false,
  onDone?: () => void,
  fallbackText?: string,
): void {
  const seq = ++activeSpeakSeq;
  clearSpeakTimers();
  let completed = false;

  const finish = (delayMs = 0) => {
    if (completed || seq !== activeSpeakSeq || !onDone || typeof window === 'undefined') return;
    completed = true;
    clearSpeakTimers();
    if (delayMs > 0) {
      activeSpeakTimer = window.setTimeout(() => {
        activeSpeakTimer = null;
        if (seq === activeSpeakSeq) {
          onDone();
        }
      }, delayMs);
    } else {
      onDone();
    }
  };

  const primaryTrimmed = text.trim();
  const fallbackTrimmed = fallbackText?.trim() ?? '';
  if (
    muted ||
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    (!primaryTrimmed && !fallbackTrimmed)
  ) {
    finish(150);
    return;
  }

  try {
    const synth = window.speechSynthesis;
    const voices = refreshVoices();
    const targetLocale = LANG_LOCALE_MAP[lang];
    const exactMatch = voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase());
    const prefixMatch = voices.find(
      (v) => v.lang.toLowerCase().startsWith(`${lang}-`) || v.lang.toLowerCase() === lang,
    );
    const nativeVoice = exactMatch ?? prefixMatch ?? null;
    const fallbackVoice =
      voices.find((v) => v.lang.toLowerCase() === 'en-in') ??
      voices.find((v) => v.lang.toLowerCase().startsWith('en-')) ??
      voices.find((v) => v.default) ??
      null;

    // On devices without hi-IN/kn-IN OS voices, speak Romanized fallback via an English voice
    const useNativeScript = lang === 'en' || nativeVoice !== null || !fallbackTrimmed;
    const initialText = useNativeScript ? primaryTrimmed : fallbackTrimmed;
    const initialVoice = useNativeScript ? (nativeVoice ?? fallbackVoice) : fallbackVoice;
    const initialLocale = useNativeScript
      ? (nativeVoice?.lang || targetLocale)
      : (fallbackVoice?.lang || 'en-IN');
    const canRetryFallback =
      lang !== 'en' && useNativeScript && Boolean(fallbackTrimmed) && fallbackTrimmed !== primaryTrimmed;

    const dispatchUtterance = (
      spoken: string,
      voice: SpeechSynthesisVoice | null,
      utterLang: string,
      allowFallbackRetry: boolean,
    ) => {
      if (seq !== activeSpeakSeq) return;
      const startedAt = Date.now();
      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.lang = utterLang;
      utterance.rate = 0.98;
      if (voice) {
        utterance.voice = voice;
      }
      // Keep a module reference so Chromium does not GC the utterance before onend
      activeUtterance = utterance;

      if (onDone) {
        const initialWaitMs = Math.min(20000, Math.max(9000, spoken.length * 115));
        const scheduleSafetyCheck = (waitMs: number) => {
          if (activeSpeakTimer !== null) window.clearTimeout(activeSpeakTimer);
          activeSpeakTimer = window.setTimeout(() => {
            if (seq !== activeSpeakSeq) return;
            if (synth.speaking || synth.pending) {
              scheduleSafetyCheck(2500);
              return;
            }
            finish(0);
          }, waitMs);
        };
        scheduleSafetyCheck(initialWaitMs);
      }

      utterance.onend = () => {
        if (seq !== activeSpeakSeq || activeUtterance !== utterance) return;
        activeUtterance = null;
        finish(500);
      };

      utterance.onerror = (event) => {
        if (seq !== activeSpeakSeq || activeUtterance !== utterance) return;
        activeUtterance = null;
        const errCode = (event as { error?: string } | undefined)?.error;
        if (errCode === 'canceled' || errCode === 'interrupted') {
          clearSpeakTimers();
          return;
        }
        if (allowFallbackRetry && fallbackTrimmed) {
          dispatchUtterance(
            fallbackTrimmed,
            fallbackVoice,
            fallbackVoice?.lang || 'en-IN',
            false,
          );
          return;
        }
        if (onDone && Date.now() - startedAt > 350) {
          finish(350);
        } else {
          clearSpeakTimers();
        }
      };

      if (synth.paused) {
        synth.resume();
      }
      synth.speak(utterance);
    };

    const startPrimary = () =>
      dispatchUtterance(initialText, initialVoice, initialLocale, canRetryFallback);

    if (synth.speaking || synth.pending) {
      synth.cancel();
      speakDispatchTimer = window.setTimeout(() => {
        speakDispatchTimer = null;
        startPrimary();
      }, 60);
    } else {
      startPrimary();
    }
  } catch {
    clearSpeakTimers();
  }
}

export function stopSpeaking(): void {
  activeSpeakSeq += 1;
  activeUtterance = null;
  clearSpeakTimers();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }
  }
}

let sharedAudioCtx: AudioContext | null = null;

/** Play a brief, pleasant two-tone Web Audio chime on commit or mic start. */
export function playTone(kind: 'start' | 'success'): void {
  if (typeof window === 'undefined') return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
