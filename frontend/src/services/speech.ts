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
