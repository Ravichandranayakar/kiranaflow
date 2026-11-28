/**
 * KiranaFlow — Central Delivery Flow Hook
 *
 * Enforces the strict state machine:
 *   IDLE → LISTENING → PROCESSING → NEEDS_CLARIFICATION / AWAITING_CONFIRMATION → COMMITTED → IDLE
 *
 * Single Source of Truth rule:
 *   Frontend NEVER parses transcripts or merges clarification turns locally.
 *   It sends { transcript, draft, lang, source } to FastAPI and renders the echoed draft.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  confirmDelivery,
  fetchHealth,
  fetchMovements,
  fetchStock,
  parseVoice,
} from '../services/api';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  playTone,
  speakText,
  stopSpeaking,
  type SpeechRecognitionLike,
} from '../services/speech';
import {
  EMPTY_DRAFT,
  type ConfirmResponse,
  type FlowState,
  type HealthResponse,
  type InputSource,
  type LangCode,
  type MovementRecord,
  type ParseResponse,
  type PendingDraft,
  type PendingEntry,
  type StockItem,
} from '../types/api';

export interface CommittedReceipt {
  entry: PendingEntry;
  response: ConfirmResponse;
}

export interface ToastNotice {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export function useDeliveryFlow() {
  const [lang, setLang] = useState<LangCode>('en');
  const [flowState, setFlowState] = useState<FlowState>('IDLE');
  const [draft, setDraft] = useState<PendingDraft>(EMPTY_DRAFT);
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastSource, setLastSource] = useState<InputSource>('voice');

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [micSupported] = useState<boolean>(() => isSpeechRecognitionSupported());
  const [micError, setMicError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [lastCommitted, setLastCommitted] = useState<CommittedReceipt | null>(null);
  const isConfirmingRef = useRef<boolean>(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const noSpeechTimeoutRef = useRef<number | null>(null);
  const manualStopRef = useRef<boolean>(false);
  const latestSpokenRef = useRef<string>('');
  const isStartingMicRef = useRef<boolean>(false);
  const draftRef = useRef<PendingDraft>(EMPTY_DRAFT);
  draftRef.current = draft;

  const langRef = useRef<LangCode>(lang);
  langRef.current = lang;

  const showToast = useCallback((type: ToastNotice['type'], message: string) => {
    setToast({ type, message });
    window.setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [h, s, m] = await Promise.all([fetchHealth(), fetchStock(), fetchMovements()]);
      setHealth(h);
      setStockItems(s.items);
      setLowStockCount(s.low_stock_count);
      setMovements(m);
    } catch {
      setHealth({
        status: 'unhealthy',
        database: 'unreachable',
        llm_parser: 'unavailable',
        default_language: 'en',
      });
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const buildEntryFromDraft = useCallback((d: PendingDraft): PendingEntry | null => {
    if (
      d.product_id === null ||
      !d.product_name ||
      d.received === null ||
      d.usable === null ||
      !d.idempotency_key
    ) {
      return null;
    }
    return {
      product_id: d.product_id,
      product_name: d.product_name,
      received: d.received,
      damaged: d.damaged ?? 0,
      usable: d.usable,
      unit: d.unit ?? 'packets',
      idempotency_key: d.idempotency_key,
    };
  }, []);

  const commitEntry = useCallback(
    async (
      entryToCommit: PendingEntry,
      rawText: string,
      sourceUsed: InputSource,
      wasCorrected: boolean,
    ) => {
      setFlowState('PROCESSING');
      try {
        const res = await confirmDelivery({
          entry: entryToCommit,
          raw_transcript: rawText,
          lang: langRef.current,
          source: sourceUsed,
          was_corrected: wasCorrected,
        });

        if (res.status === 'committed' || res.status === 'duplicate') {
          playTone('success');
          speakText(
            `Saved ${entryToCommit.usable} usable. Next item?`,
            langRef.current,
            isMuted,
          );
          setLastCommitted({ entry: entryToCommit, response: res });
          setFlowState('COMMITTED');
          setDraft(EMPTY_DRAFT);
          setParseResult(null);
          showToast('success', res.message);
          await refreshData();
        } else {
          setFlowState('ERROR');
          showToast('error', res.message);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save entry';
        setFlowState('AWAITING_CONFIRMATION');
        showToast('error', msg);
      }
    },
    [isMuted, refreshData, showToast],
  );

  const submitTranscript = useCallback(
    async (rawText: string, source: InputSource = 'text') => {
      const cleaned = rawText.trim();
      if (!cleaned) return;

      setTranscript(cleaned);
      setInterimTranscript('');
      setLastCommitted(null);
      setLastSource(source);
      setFlowState('PROCESSING');
      setMicError(null);

      try {
        const res = await parseVoice({
          transcript: cleaned,
          draft: draftRef.current,
          lang: langRef.current,
          source,
        });

        setDraft(res.draft);
        setParseResult(res);

        // Spoken confirm/cancel only accepted when backend detects it during awaiting_confirmation
        if (res.action === 'confirm' && res.entry) {
          await commitEntry(res.entry, cleaned, source, res.draft.was_corrected);
          return;
        }

        if (res.action === 'cancel') {
          stopSpeaking();
          setDraft(EMPTY_DRAFT);
          setParseResult(null);
          setFlowState('IDLE');
          showToast('warning', 'Pending delivery cancelled.');
          return;
        }

        if (res.status === 'complete' && res.draft.awaiting_confirmation) {
          setFlowState('AWAITING_CONFIRMATION');
          if (res.readback_text) {
            speakText(res.readback_text, langRef.current, isMuted);
          }
        } else if (res.status === 'clarify' || res.status === 'unknown') {
          setFlowState('NEEDS_CLARIFICATION');
          if (res.question) {
            speakText(res.question, langRef.current, isMuted);
          }
        } else if (res.status === 'error') {
          setFlowState('ERROR');
          if (res.question) {
            speakText(res.question, langRef.current, isMuted);
            showToast('warning', res.question);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to reach KiranaFlow backend';
        setFlowState('ERROR');
        showToast('error', msg);
      }
    },
    [commitEntry, isMuted, showToast],
  );

  const confirmCurrentDraft = useCallback(async () => {
    if (isConfirmingRef.current) return;
    const entry = parseResult?.entry ?? buildEntryFromDraft(draft);
    if (!entry) return;
    isConfirmingRef.current = true;
    setIsConfirming(true);
    try {
      await commitEntry(entry, transcript, lastSource, draft.was_corrected);
    } finally {
      isConfirmingRef.current = false;
      setIsConfirming(false);
    }
  }, [buildEntryFromDraft, commitEntry, draft, lastSource, parseResult, transcript]);

  const cancelCurrentDraft = useCallback(() => {
    stopSpeaking();
    setDraft(EMPTY_DRAFT);
    setParseResult(null);
    setLastCommitted(null);
    setTranscript('');
    setInterimTranscript('');
    setFlowState('IDLE');
    showToast('warning', 'Entry cleared.');
  }, [showToast]);

  const resetToIdle = useCallback(() => {
    stopSpeaking();
    setDraft(EMPTY_DRAFT);
    setParseResult(null);
    setLastCommitted(null);
    setTranscript('');
    setInterimTranscript('');
    setFlowState('IDLE');
  }, []);

  const adjustDraftQuantities = useCallback((received: number, damaged: number) => {
    if (received < 1 || damaged < 0 || damaged > received) return;
    const usable = received - damaged;
    setDraft((prev) => {
      const updated: PendingDraft = {
        ...prev,
        received,
        damaged,
        usable,
        was_corrected: true,
        awaiting_confirmation: prev.product_id !== null,
      };
      return updated;
    });
    setParseResult((prev) => {
      if (!prev || !prev.entry) return prev;
      return {
        ...prev,
        entry: {
          ...prev.entry,
          received,
          damaged,
          usable,
        },
        readback_text: `Updated to ${received} ${prev.entry.unit} of ${prev.entry.product_name}, ${damaged} damaged, ${usable} usable. Tap Confirm to save.`,
      };
    });
  }, []);

  const finalizeListening = useCallback(
    (spokenText: string) => {
      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      if (silenceTimeoutRef.current !== null) {
        window.clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      if (noSpeechTimeoutRef.current !== null) {
        window.clearTimeout(noSpeechTimeoutRef.current);
        noSpeechTimeoutRef.current = null;
      }
      recognitionRef.current = null;
      isStartingMicRef.current = false;
      manualStopRef.current = false;
      setInterimTranscript('');

      const cleaned = spokenText.trim();
      if (cleaned) {
        void submitTranscript(cleaned, 'voice');
      } else {
        setFlowState((prev) =>
          prev === 'LISTENING'
            ? draftRef.current.awaiting_confirmation
              ? 'AWAITING_CONFIRMATION'
              : 'IDLE'
            : prev,
        );
      }
    },
    [submitTranscript],
  );

  const stopListening = useCallback(() => {
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (noSpeechTimeoutRef.current !== null) {
      window.clearTimeout(noSpeechTimeoutRef.current);
      noSpeechTimeoutRef.current = null;
    }
    const recognition = recognitionRef.current;
    if (!recognition) {
      setFlowState(draftRef.current.awaiting_confirmation ? 'AWAITING_CONFIRMATION' : 'IDLE');
      return;
    }

    manualStopRef.current = true;
    try {
      recognition.stop();
    } catch {
      // ignore if already stopped
    }

    // Safety fallback: Chrome Web Speech API sometimes delays or drops onend on stop()
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current);
    }
    stopTimeoutRef.current = window.setTimeout(() => {
      if (recognitionRef.current === recognition) {
        try {
          recognition.abort();
        } catch {
          // ignore
        }
        finalizeListening(latestSpokenRef.current);
      }
    }, 250);
  }, [finalizeListening]);

  const toggleListening = useCallback(() => {
    if (flowState === 'LISTENING' || recognitionRef.current) {
      stopListening();
      return;
    }

    if (isStartingMicRef.current) {
      return;
    }

    if (!micSupported) {
      setMicError('Voice recognition is not supported in this browser — use the text input below.');
      return;
    }

    isStartingMicRef.current = true;
    stopSpeaking();
    setMicError(null);
    latestSpokenRef.current = '';
    manualStopRef.current = false;

    const recognition = createSpeechRecognition(langRef.current);
    if (!recognition) {
      isStartingMicRef.current = false;
      setMicError('Speech recognition unavailable — use the text input below.');
      return;
    }

    recognitionRef.current = recognition;
    let finalSpoken = '';

    recognition.onstart = () => {
      isStartingMicRef.current = false;
      playTone('start');
      setFlowState('LISTENING');
      setInterimTranscript('');

      // No audio heard within 4 s of mic open → show helpful error rather than hanging
      if (noSpeechTimeoutRef.current !== null) {
        window.clearTimeout(noSpeechTimeoutRef.current);
      }
      noSpeechTimeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current === recognition && !latestSpokenRef.current) {
          setMicError('No audio heard — check your microphone in Chrome or type below.');
          stopListening();
        }
      }, 4000);
    };

    // Track last seen transcript to detect genuinely new speech vs Chrome re-firing stale interim
    let lastSeenCombined = '';

    recognition.onresult = (event) => {
      if (noSpeechTimeoutRef.current !== null) {
        window.clearTimeout(noSpeechTimeoutRef.current);
        noSpeechTimeoutRef.current = null;
      }
      let interim = '';
      let finalChunk = '';
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk += `${text} `;
        } else {
          interim += text;
        }
      }
      const combined = `${finalChunk}${interim}`.trim();

      if (finalChunk.trim()) {
        finalSpoken = finalChunk.trim();
        latestSpokenRef.current = combined || finalSpoken;
        setTranscript(finalSpoken);
      } else if (interim.trim()) {
        latestSpokenRef.current = interim.trim();
      }
      setInterimTranscript(combined);

      // Only restart silence timer when Chrome delivers genuinely NEW transcript content.
      // Chrome fires onresult repeatedly with identical stale interim text — ignoring those
      // prevents the silence timer from resetting indefinitely and the mic from hanging.
      if (combined && combined !== lastSeenCombined) {
        lastSeenCombined = combined;
        if (silenceTimeoutRef.current !== null) {
          window.clearTimeout(silenceTimeoutRef.current);
        }
        // 1.5 s of silence after the last NEW syllable → auto-stop & submit
        silenceTimeoutRef.current = window.setTimeout(() => {
          if (recognitionRef.current === recognition) {
            stopListening();
          }
        }, 1500);
      }
    };

    recognition.onerror = (event) => {
      isStartingMicRef.current = false;
      if (event.error === 'aborted' && manualStopRef.current) {
        finalizeListening(finalSpoken || latestSpokenRef.current);
        return;
      }
      if (event.error === 'not-allowed') {
        setMicError('Microphone permission denied — use the text input below.');
      } else if (event.error === 'no-speech') {
        setMicError('No speech detected. Check your mic or type below.');
      } else if (event.error === 'network') {
        setMicError('Browser speech service unreachable (use Chrome or type below).');
      } else if (event.error !== 'aborted') {
        setMicError(`Mic error (${event.error}) — you can type below.`);
      }
      finalizeListening('');
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      finalizeListening(finalSpoken || latestSpokenRef.current);
    };

    try {
      recognition.start();
    } catch {
      isStartingMicRef.current = false;
      recognitionRef.current = null;
      setMicError('Could not start microphone — use text input below.');
      setFlowState('IDLE');
    }
  }, [finalizeListening, flowState, micSupported, stopListening]);

  return {
    lang,
    setLang,
    flowState,
    draft,
    parseResult,
    transcript,
    interimTranscript,
    health,
    stockItems,
    lowStockCount,
    movements,
    toast,
    isMuted,
    setIsMuted,
    micSupported,
    micError,
    isConfirming,
    lastCommitted,
    toggleListening,
    submitTranscript,
    confirmCurrentDraft,
    cancelCurrentDraft,
    resetToIdle,
    adjustDraftQuantities,
    refreshData,
  };
}
