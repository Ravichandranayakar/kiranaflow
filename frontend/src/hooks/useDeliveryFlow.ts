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
  adjustStock,
  confirmDelivery,
  confirmDeliveryBatch,
  createProduct,
  deleteProduct,
  fetchHealth,
  fetchMovements,
  fetchStock,
  intakeVoice,
  parseVoice,
} from '../services/api';
import {
  isSpeechRecognitionSupported,
  pickRecordingFormat,
  playTone,
  speakText,
  stopSpeaking,
} from '../services/speech';
import {
  formatCommitSpeech,
  formatCommitSpeechFallback,
  formatLocalizedQuestion,
  formatLocalizedQuestionFallback,
  formatLocalizedReadback,
  formatLocalizedReadbackFallback,
} from '../i18n/translations';
import {
  EMPTY_DRAFT,
  type ConfirmBatchResponse,
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
  entries?: PendingEntry[];
  response: ConfirmResponse | ConfirmBatchResponse;
}

export interface ToastNotice {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export interface StoreProfile {
  shopName: string;
  ownerName: string;
  locationNote: string;
}

const PROFILE_STORAGE_KEY = 'kiranaflow_store_profile_v1';
const PREFS_STORAGE_KEY = 'kiranaflow_voice_prefs_v1';

const DEFAULT_STORE_PROFILE: StoreProfile = {
  shopName: '',
  ownerName: '',
  locationNote: '',
};

interface VoicePrefs {
  isMuted: boolean;
  autoFollowUpMic: boolean;
}

const DEFAULT_VOICE_PREFS: VoicePrefs = {
  isMuted: false,
  autoFollowUpMic: true,
};

function loadStoredProfile(): StoreProfile {
  if (typeof window === 'undefined') return DEFAULT_STORE_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_STORE_PROFILE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_STORE_PROFILE;
    const obj = parsed as Record<string, unknown>;
    return {
      shopName: typeof obj.shopName === 'string' ? obj.shopName : '',
      ownerName: typeof obj.ownerName === 'string' ? obj.ownerName : '',
      locationNote: typeof obj.locationNote === 'string' ? obj.locationNote : '',
    };
  } catch {
    return DEFAULT_STORE_PROFILE;
  }
}

function loadStoredPrefs(): VoicePrefs {
  if (typeof window === 'undefined') return DEFAULT_VOICE_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_VOICE_PREFS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_VOICE_PREFS;
    const obj = parsed as Record<string, unknown>;
    return {
      isMuted: typeof obj.isMuted === 'boolean' ? obj.isMuted : false,
      autoFollowUpMic: typeof obj.autoFollowUpMic === 'boolean' ? obj.autoFollowUpMic : true,
    };
  } catch {
    return DEFAULT_VOICE_PREFS;
  }
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
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => loadStoredProfile());
  const [initialPrefs] = useState<VoicePrefs>(() => loadStoredPrefs());
  const [isMuted, setIsMutedState] = useState<boolean>(initialPrefs.isMuted);
  const [autoFollowUpMic, setAutoFollowUpMicState] = useState<boolean>(initialPrefs.autoFollowUpMic);
  const [micSupported] = useState<boolean>(() => isSpeechRecognitionSupported());
  const [micError, setMicError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [lastCommitted, setLastCommitted] = useState<CommittedReceipt | null>(null);
  const isConfirmingRef = useRef<boolean>(false);

  const recorderSessionRef = useRef<{ stop: (discard?: boolean) => void } | null>(null);
  const isStartingMicRef = useRef<boolean>(false);
  const flowStateRef = useRef<FlowState>(flowState);
  flowStateRef.current = flowState;
  const autoFollowUpRef = useRef<boolean>(autoFollowUpMic);
  autoFollowUpRef.current = autoFollowUpMic;

  const persistPrefs = useCallback((nextMuted: boolean, nextAutoFollowUp: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({ isMuted: nextMuted, autoFollowUpMic: nextAutoFollowUp }),
      );
    } catch {
      // Ignore storage quota / private mode restrictions
    }
  }, []);

  const setIsMuted = useCallback(
    (updater: boolean | ((prev: boolean) => boolean)) => {
      setIsMutedState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persistPrefs(next, autoFollowUpRef.current);
        return next;
      });
    },
    [persistPrefs],
  );

  const setAutoFollowUpMic = useCallback(
    (updater: boolean | ((prev: boolean) => boolean)) => {
      setAutoFollowUpMicState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persistPrefs(isMuted, next);
        return next;
      });
    },
    [isMuted, persistPrefs],
  );

  const updateStoreProfile = useCallback((next: StoreProfile) => {
    const cleaned: StoreProfile = {
      shopName: next.shopName.trim(),
      ownerName: next.ownerName.trim(),
      locationNote: next.locationNote.trim(),
    };
    setStoreProfile(cleaned);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(cleaned));
      } catch {
        // Ignore storage quota / private mode restrictions
      }
    }
  }, []);
  const startFollowUpMicRef = useRef<() => void>(() => {});
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

  const commitEntries = useCallback(
    async (
      entriesToCommit: PendingEntry[],
      rawText: string,
      sourceUsed: InputSource,
      wasCorrected: boolean,
    ) => {
      if (entriesToCommit.length === 0) return;
      setFlowState('PROCESSING');
      try {
        const res =
          entriesToCommit.length > 1
            ? await confirmDeliveryBatch({
                entries: entriesToCommit,
                raw_transcript: rawText,
                lang: langRef.current,
                source: sourceUsed,
                was_corrected: wasCorrected,
              })
            : await confirmDelivery({
                entry: entriesToCommit[0],
                raw_transcript: rawText,
                lang: langRef.current,
                source: sourceUsed,
                was_corrected: wasCorrected,
              });

        if (res.status === 'committed' || res.status === 'duplicate') {
          playTone('success');
          speakText(
            formatCommitSpeech(entriesToCommit, langRef.current),
            langRef.current,
            isMuted,
            undefined,
            formatCommitSpeechFallback(entriesToCommit, langRef.current),
          );
          setLastCommitted({
            entry: entriesToCommit[0],
            entries: entriesToCommit,
            response: res,
          });
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

  const applyParseResponse = useCallback(
    async (res: ParseResponse, cleaned: string, source: InputSource) => {
      if (res.raw_transcript) {
        setTranscript(res.raw_transcript);
      }
      setDraft(res.draft);
      setParseResult(res);

      // Spoken confirm/cancel only accepted when backend detects it during awaiting_confirmation
      if (res.action === 'confirm' && res.entry) {
        const toCommit =
          res.entries && res.entries.length > 0 ? res.entries : [res.entry];
        await commitEntries(toCommit, cleaned, source, res.draft.was_corrected);
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
        const entries =
          res.entries && res.entries.length > 0
            ? res.entries
            : res.entry
              ? [res.entry]
              : [];
        const spokenReadback =
          entries.length > 0
            ? formatLocalizedReadback(entries, langRef.current)
            : (res.readback_text ?? '');
        const fallbackReadback =
          entries.length > 0
            ? formatLocalizedReadbackFallback(entries, langRef.current)
            : (res.readback_text ?? undefined);
        if (spokenReadback || fallbackReadback) {
          speakText(
            spokenReadback || fallbackReadback || '',
            langRef.current,
            isMuted,
            source === 'voice' && autoFollowUpRef.current
              ? () => {
                  if (
                    flowStateRef.current === 'AWAITING_CONFIRMATION' &&
                    !isConfirmingRef.current
                  ) {
                    startFollowUpMicRef.current();
                  }
                }
              : undefined,
            fallbackReadback,
          );
        }
      } else if (res.status === 'clarify' || res.status === 'unknown') {
        setFlowState('NEEDS_CLARIFICATION');
        const spokenQ = formatLocalizedQuestion(res, res.draft, langRef.current);
        const fallbackQ = formatLocalizedQuestionFallback(res, res.draft, langRef.current) ?? undefined;
        if (spokenQ || fallbackQ) {
          speakText(
            spokenQ ?? fallbackQ ?? '',
            langRef.current,
            isMuted,
            source === 'voice' && res.status === 'clarify' && autoFollowUpRef.current
              ? () => {
                  if (flowStateRef.current === 'NEEDS_CLARIFICATION') {
                    startFollowUpMicRef.current();
                  }
                }
              : undefined,
            fallbackQ,
          );
        }
      } else if (res.status === 'error') {
        if (res.question_kind === 'noise' && !res.raw_transcript) {
          setMicError(res.question ?? 'Could not hear words clearly — try again or type below.');
          setFlowState(draftRef.current.awaiting_confirmation ? 'AWAITING_CONFIRMATION' : 'IDLE');
        } else {
          setFlowState('ERROR');
          if (res.question) {
            speakText(res.question, langRef.current, isMuted);
            showToast('warning', res.question);
          }
        }
      }
    },
    [commitEntries, isMuted, showToast],
  );

  const submitTranscript = useCallback(
    async (rawText: string, source: InputSource = 'text') => {
      stopSpeaking();
      recorderSessionRef.current?.stop(true);
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
        await applyParseResponse(res, cleaned, source);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to reach KiranaFlow backend';
        setFlowState('ERROR');
        showToast('error', msg);
      }
    },
    [applyParseResponse, showToast],
  );

  const confirmCurrentDraft = useCallback(async () => {
    stopSpeaking();
    recorderSessionRef.current?.stop(true);
    if (isConfirmingRef.current) return;
    const singleFallback = parseResult?.entry ?? buildEntryFromDraft(draft);
    const toCommit =
      parseResult?.entries && parseResult.entries.length > 0
        ? parseResult.entries
        : singleFallback
          ? [singleFallback]
          : [];
    if (toCommit.length === 0) return;
    isConfirmingRef.current = true;
    setIsConfirming(true);
    try {
      await commitEntries(toCommit, transcript, lastSource, draft.was_corrected);
    } finally {
      isConfirmingRef.current = false;
      setIsConfirming(false);
    }
  }, [buildEntryFromDraft, commitEntries, draft, lastSource, parseResult, transcript]);

  const adjustStockItem = useCallback(
    async (
      productId: number,
      usableDelta: number,
      damagedDelta: number,
      reason: string,
    ): Promise<boolean> => {
      try {
        const res = await adjustStock({
          product_id: productId,
          usable_delta: usableDelta,
          damaged_delta: damagedDelta,
          reason: reason.trim() || 'Manual stock adjustment',
        });
        playTone('success');
        showToast('success', res.message);
        await refreshData();
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to adjust stock';
        showToast('error', msg);
        return false;
      }
    },
    [refreshData, showToast],
  );

  const addCatalogProduct = useCallback(
    async (
      name: string,
      category: string,
      defaultUnit: string,
      usableStock: number,
      minThreshold: number,
      aliases: string[],
    ): Promise<boolean> => {
      try {
        const res = await createProduct({
          name,
          category,
          default_unit: defaultUnit,
          usable_stock: usableStock,
          min_threshold: minThreshold,
          aliases,
        });
        playTone('success');
        showToast('success', res.message);
        await refreshData();
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to add product';
        showToast('error', msg);
        return false;
      }
    },
    [refreshData, showToast],
  );

  const removeCatalogProduct = useCallback(
    async (productId: number): Promise<boolean> => {
      try {
        const res = await deleteProduct(productId);
        showToast('warning', res.message);
        await refreshData();
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to delete product';
        showToast('error', msg);
        return false;
      }
    },
    [refreshData, showToast],
  );

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
      const updatedEntry = {
        ...prev.entry,
        received,
        damaged,
        usable,
      };
      return {
        ...prev,
        entry: updatedEntry,
        readback_text: formatLocalizedReadback([updatedEntry], langRef.current),
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      recorderSessionRef.current?.stop(true);
      recorderSessionRef.current = null;
    };
  }, []);

  const restoreNonListeningState = useCallback(() => {
    setInterimTranscript('');
    setFlowState((prev) =>
      prev === 'LISTENING'
        ? draftRef.current.awaiting_confirmation
          ? 'AWAITING_CONFIRMATION'
          : 'IDLE'
        : prev,
    );
  }, []);

  const toggleListening = useCallback(
    async (silentNoVoice = false) => {
      // Second tap while active stops recording cleanly and kicks off transcription
      if (flowState === 'LISTENING' || recorderSessionRef.current) {
        recorderSessionRef.current?.stop(false);
        return;
      }

      if (isStartingMicRef.current) {
        return;
      }

      if (!micSupported) {
        setMicError('Microphone recording is unavailable in this browser — use text input below.');
        return;
      }

      isStartingMicRef.current = true;
      stopSpeaking();
      setMicError(null);
      setInterimTranscript('');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      isStartingMicRef.current = false;
      const msg = err instanceof Error ? err.message : 'Microphone permission denied';
      setMicError(`Could not access microphone (${msg}) — use text input below.`);
      return;
    }

    const { mimeType, filename } = pickRecordingFormat();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch {
      stream.getTracks().forEach((tr) => tr.stop());
      isStartingMicRef.current = false;
      setMicError('Audio recording format unsupported — use text input below.');
      return;
    }

    const chunks: BlobPart[] = [];
    let discardOutput = false;
    let stopped = false;
    let silenceTimer: number | null = null;
    let noVoiceTimer: number | null = null;
    let monitorInterval: number | null = null;
    let audioCtx: AudioContext | null = null;

    const releaseHardware = () => {
      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      if (noVoiceTimer !== null) {
        window.clearTimeout(noVoiceTimer);
        noVoiceTimer = null;
      }
      if (monitorInterval !== null) {
        window.clearInterval(monitorInterval);
        monitorInterval = null;
      }
      stream.getTracks().forEach((track) => track.stop());
      if (audioCtx && audioCtx.state !== 'closed') {
        void audioCtx.close().catch(() => {});
        audioCtx = null;
      }
    };

    const stopSession = (discard = false) => {
      if (stopped) return;
      stopped = true;
      discardOutput = discard;
      releaseHardware();
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          recorderSessionRef.current = null;
          restoreNonListeningState();
        }
      } else {
        recorderSessionRef.current = null;
        restoreNonListeningState();
      }
    };

    recorderSessionRef.current = { stop: stopSession };

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      recorderSessionRef.current = null;
      releaseHardware();
      setMicError('Microphone recording interrupted — tap mic again or type below.');
      restoreNonListeningState();
    };

    recorder.onstop = async () => {
      recorderSessionRef.current = null;
      releaseHardware();
      isStartingMicRef.current = false;
      setInterimTranscript('');

      if (discardOutput) {
        restoreNonListeningState();
        return;
      }

      const blob = new Blob(chunks, { type: mimeType || recorder.mimeType || 'audio/webm' });
      if (blob.size < 400) {
        restoreNonListeningState();
        return;
      }

      setFlowState('PROCESSING');
      setLastCommitted(null);
      setLastSource('voice');
      setTranscript('Listening done — checking words…');
      try {
        const res = await intakeVoice(blob, filename, draftRef.current, langRef.current);
        const textUsed = (res.raw_transcript || '').trim();
        await applyParseResponse(res, textUsed, 'voice');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to transcribe audio';
        setMicError(`${msg} — tap mic to retry or type below.`);
        setFlowState(draftRef.current.awaiting_confirmation ? 'AWAITING_CONFIRMATION' : 'IDLE');
      }
    };

    // Adaptive 12.5 Hz Web Audio VAD with 1.0s post-speech silence auto-stop (zero 60Hz re-renders)
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      try {
        audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const startMs = Date.now();
        let baselineSum = 0;
        let baselineCount = 0;
        let speechHeard = false;

        monitorInterval = window.setInterval(() => {
          if (stopped) return;
          analyser.getByteTimeDomainData(data);
          let maxDev = 0;
          for (let i = 0; i < data.length; i += 1) {
            const dev = Math.abs(data[i] - 128);
            if (dev > maxDev) maxDev = dev;
          }

          const elapsed = Date.now() - startMs;
          if (elapsed < 200) {
            baselineSum += maxDev;
            baselineCount += 1;
          } else {
            const noiseFloor = baselineCount > 0 ? baselineSum / baselineCount : 4;
            const threshold = Math.max(8, Math.min(28, noiseFloor * 2.1));
            if (maxDev > threshold) {
              if (!speechHeard) {
                speechHeard = true;
                setInterimTranscript('Hearing voice — pause 1s or tap stop when done');
                if (noVoiceTimer !== null) {
                  window.clearTimeout(noVoiceTimer);
                  noVoiceTimer = null;
                }
              }
              if (silenceTimer !== null) {
                window.clearTimeout(silenceTimer);
              }
              silenceTimer = window.setTimeout(() => {
                if (!stopped && speechHeard) {
                  stopSession(false);
                }
              }, 1000);
            }
          }
        }, 80);

        noVoiceTimer = window.setTimeout(() => {
          if (!stopped && !speechHeard) {
            if (!silentNoVoice) {
              setMicError('No voice detected — tap mic and speak, or type below.');
            }
            stopSession(true);
          }
        }, 7000);
      } catch {
        // If AudioContext fails, user can still stop manually with one tap
      }
    }

    try {
      recorder.start(250);
      isStartingMicRef.current = false;
      playTone('start');
      setFlowState('LISTENING');
    } catch {
      recorderSessionRef.current = null;
      releaseHardware();
      isStartingMicRef.current = false;
      setMicError('Could not start audio recorder — use text input below.');
      setFlowState('IDLE');
    }
  }, [applyParseResponse, flowState, micSupported, restoreNonListeningState]);

  startFollowUpMicRef.current = () => {
    if (
      flowStateRef.current !== 'LISTENING' &&
      !recorderSessionRef.current &&
      !isStartingMicRef.current &&
      micSupported
    ) {
      void toggleListening(true);
    }
  };

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
    storeProfile,
    updateStoreProfile,
    isMuted,
    setIsMuted,
    autoFollowUpMic,
    setAutoFollowUpMic,
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
    adjustStockItem,
    addCatalogProduct,
    removeCatalogProduct,
    refreshData,
  };
}
