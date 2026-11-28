import { useEffect, useState } from 'react';
import { ArrowRight, AudioLines, BookOpen, Check, CheckCheck, HelpCircle, Loader2, Pencil, Volume2, X } from 'lucide-react';
import type { CommittedReceipt } from '../hooks/useDeliveryFlow';
import { speakText, hasBrowserVoice } from '../services/speech';
import {
  formatLocalizedQuestion,
  formatLocalizedReadback,
  formatUnit,
  TRANSLATIONS,
} from '../i18n/translations';
import type {
  FlowState,
  LangCode,
  ParseResponse,
  PendingDraft,
  StockItem,
} from '../types/api';

interface PendingReceiptCardProps {
  flowState: FlowState;
  lang: LangCode;
  transcript: string;
  interimTranscript: string;
  draft: PendingDraft;
  parseResult: ParseResponse | null;
  stockItems: StockItem[];
  onClarifyPick: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onEditQuantities: (received: number, damaged: number) => void;
  isConfirming?: boolean;
  lastCommitted?: CommittedReceipt | null;
  onNextEntry?: () => void;
  onOpenStock?: () => void;
}

const WAVEFORM_BARS = [
  'wb-1', 'wb-3', 'wb-2', 'wb-4', 'wb-5', 'wb-3',
  'wb-1', 'wb-4', 'wb-2', 'wb-5', 'wb-3', 'wb-1',
  'wb-4', 'wb-2', 'wb-5', 'wb-3', 'wb-1',
];

function formatTwoDigits(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '--';
  return value < 10 && value >= 0 ? `0${value}` : String(value);
}

export function PendingReceiptCard({
  flowState,
  lang,
  transcript,
  interimTranscript,
  draft,
  parseResult,
  stockItems,
  onClarifyPick,
  onConfirm,
  onCancel,
  onEditQuantities,
  isConfirming = false,
  lastCommitted = null,
  onNextEntry,
  onOpenStock,
}: PendingReceiptCardProps) {
  const t = TRANSLATIONS[lang];
  const [isEditing, setIsEditing] = useState(false);
  const [editReceived, setEditReceived] = useState<string>('');
  const [editDamaged, setEditDamaged] = useState<string>('');

  const entry = parseResult?.entry;
  const received = entry?.received ?? draft.received;
  const damaged = entry?.damaged ?? draft.damaged;
  const usable = entry?.usable ?? draft.usable;
  const productName = entry?.product_name ?? draft.product_name;
  const unit = entry?.unit ?? draft.unit;
  const unitDisplay = formatUnit(unit, lang);
  const localizedQuestion = parseResult
    ? formatLocalizedQuestion(parseResult, draft, lang)
    : null;
  const readbackEntries =
    parseResult?.entries && parseResult.entries.length > 0
      ? parseResult.entries
      : entry
        ? [entry]
        : draft.product_id !== null && productName && received !== null && usable !== null
          ? [
              {
                product_id: draft.product_id,
                product_name: productName,
                received,
                damaged: damaged ?? 0,
                usable,
                unit: unit ?? 'packets',
                idempotency_key: draft.idempotency_key ?? '',
              },
            ]
          : [];
  const localizedReadback =
    readbackEntries.length > 0
      ? formatLocalizedReadback(readbackEntries, lang)
      : (parseResult?.readback_text ?? '');
  const browserHasVoice = lang === 'en' || hasBrowserVoice(lang);

  useEffect(() => {
    setIsEditing(false);
    setEditReceived(received !== null ? String(received) : '');
    setEditDamaged(damaged !== null ? String(damaged) : '0');
  }, [received, damaged, productName, flowState]);

  const hasActiveEntry =
    flowState === 'PROCESSING' ||
    flowState === 'NEEDS_CLARIFICATION' ||
    flowState === 'AWAITING_CONFIRMATION' ||
    draft.product_id !== null ||
    draft.received !== null;

  // Calm IDLE state: no state mixing, no "-- | -- | --" boxes, no fake entry numbers
  if (flowState === 'IDLE' && !hasActiveEntry) {
    return (
      <section className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-xl border border-[#dedad1] shadow-sm px-4 py-3.5">
          <span className="font-display text-[10px] font-semibold text-[#747878] uppercase tracking-[0.08em] block mb-1">
            {t.examplePhrase}
          </span>
          <p className="font-serif text-[17px] italic text-[#1b1c18] leading-snug">
            {t.exampleUtterance}
          </p>
        </div>
      </section>
    );
  }

  // LISTENING state: Screen 2 live voice status + waveform
  if (flowState === 'LISTENING') {
    return (
      <section className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl border border-[#dedad1] shadow-sm overflow-hidden">
          <div className="bg-[#eae8e2] px-4 py-2.5 flex items-center justify-between border-b border-[#dedad1]">
            <span className="font-display text-[10px] font-bold text-[#444748] uppercase tracking-[0.08em]">
              {t.liveTranscript}
            </span>
            <span className="font-display text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider bg-[#c6f26a] text-[#141f00] uppercase">
              {t.inProgress}
            </span>
          </div>
          <div className="p-4 pt-3.5 space-y-3">
            <div className="min-h-[54px]">
              <p className="font-serif text-[19px] italic text-[#1b1c18] leading-[1.38]">
                {interimTranscript || t.listeningPrompt}
                <span className="kf-blinking-cursor" />
              </p>
            </div>

            {/* Restrained Live Audio Waveform */}
            <div className="py-2.5 px-3 bg-[#fbf9f3] rounded-xl border border-[#eae8e2] flex items-center justify-between">
              <div className="flex items-center gap-1.5 h-8">
                {WAVEFORM_BARS.map((cls, idx) => (
                  <span key={idx} className={`w-[3px] rounded-full bg-[#c6f26a] ${cls}`} />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-display text-[#444748] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39734c]" />
                <span>LIVE MIC</span>
              </div>
            </div>

            <p className="text-[11px] text-[#444748]">
              {t.speechConverting}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // PROCESSING state: Screen 3 YOUR SPOKEN INPUT + RECEIVED card (real captured transcript, no fake stats)
  if (flowState === 'PROCESSING') {
    return (
      <section className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl border border-[#dedad1] shadow-sm overflow-hidden">
          <div className="bg-[#eae8e2] px-4 py-2.5 flex items-center justify-between border-b border-[#dedad1]">
            <span className="font-mono text-[10px] font-bold text-[#444748] uppercase tracking-[0.08em]">
              {t.yourSpokenInput}
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider bg-[#c6f26a] text-[#141f00] uppercase">
              {t.receivedBadge}
            </span>
          </div>
          <div className="p-4 pt-3.5">
            <div className="mb-3">
              <p className="font-serif text-[18px] italic text-[#1b1c18] leading-[1.38]">
                “{transcript || '…'}”
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#eae8e2] flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#4b6700]/15 text-[#4b6700] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span className="text-[11px] font-medium text-[#444748]">
                {t.speechCaptureComplete}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // NEEDS_CLARIFICATION state: Screen 4 (4A Variant + 4B Quantity main layout, plus 4C/4D/4E)
  if (flowState === 'NEEDS_CLARIFICATION' && parseResult) {
    const qKind = parseResult.question_kind ?? '';
    const isTeenTens = qKind === 'teen_tens' && Boolean(draft.teen_tens_options?.length);
    const isDamagedMissing = qKind === 'damaged_qty' || qKind === 'damaged' || qKind === 'missing_damaged';
    const isUnknownSku = qKind === 'unknown_sku' || parseResult.status === 'unknown';
    const hasCandidates = Boolean(parseResult.candidates && parseResult.candidates.length > 0);

    const receivedDisplay =
      received !== null
        ? `${received}${unit ? ` ${unitDisplay}` : ''}`
        : isTeenTens && draft.teen_tens_options
          ? `${draft.teen_tens_options.join(' / ')}?`
          : t.unspecifiedLabel;

    return (
      <section className="px-5 -mt-4 relative z-10 space-y-3">
        {/* Card 1: What I Understood (4A/4B summary card, zero fake confidence/batch numbers) */}
        <div className="bg-white rounded-2xl border border-[#dedad1] shadow-sm overflow-hidden">
          <div className="bg-[#eae8e2] px-4 py-2.5 flex items-center justify-between border-b border-[#dedad1]">
            <span className="font-mono text-[10px] font-bold text-[#444748] uppercase tracking-[0.08em]">
              {t.whatIUnderstood}
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider bg-[#a56a2a]/15 text-[#a56a2a] uppercase">
              {t.actionNeeded}
            </span>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-[#fbf9f3] border border-[#eae8e2] px-2.5 py-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#747878] block">
                  {t.productLabel}
                </span>
                <span
                  className={`font-display text-xs font-semibold block truncate mt-0.5 ${
                    productName ? 'text-[#1b1c18]' : 'text-[#a56a2a]'
                  }`}
                >
                  {productName ?? (isUnknownSku ? t.unmatchedLabel : t.unspecifiedLabel)}
                </span>
              </div>

              <div className="rounded-lg bg-[#fbf9f3] border border-[#eae8e2] px-2.5 py-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#747878] block">
                  {t.received}
                </span>
                <span
                  className={`font-display text-xs font-semibold block truncate mt-0.5 ${
                    received !== null ? 'text-[#1b1c18]' : 'text-[#a56a2a]'
                  }`}
                >
                  {receivedDisplay}
                </span>
              </div>

              <div className="rounded-lg bg-[#fbf9f3] border border-[#eae8e2] px-2.5 py-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#747878] block">
                  {t.damaged}
                </span>
                <span
                  className={`font-display text-xs font-semibold block truncate mt-0.5 ${
                    damaged !== null ? 'text-[#1b1c18]' : 'text-[#a56a2a]'
                  }`}
                >
                  {damaged !== null ? damaged : '?'}
                </span>
              </div>
            </div>

            {transcript && (
              <p className="font-serif text-[16px] italic text-[#444748] leading-snug pt-1 border-t border-[#eae8e2]">
                “{transcript}”
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Focused Clarification Prompt (4A / 4B / 4C / 4D / 4E) */}
        <div className="bg-white rounded-2xl border border-[#dedad1] shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#a56a2a]">
              <HelpCircle className="w-3.5 h-3.5" />
              {qKind ? qKind.replace(/_/g, ' ') : 'CLARIFY'}
            </span>
            <button
              type="button"
              onClick={onCancel}
              className="font-display text-[11px] font-semibold text-[#747878] hover:text-[#1b1c18] transition-colors"
            >
              {t.cancel}
            </button>
          </div>

          {(localizedQuestion ?? parseResult.question) && (
            <p className="font-display text-[16px] font-semibold text-[#1b1c18] leading-snug">
              {localizedQuestion ?? parseResult.question}
            </p>
          )}

          {/* 4B: Teen/Tens Side-by-Side Buttons (e.g. 14 vs 40) */}
          {isTeenTens && draft.teen_tens_options && (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {draft.teen_tens_options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onClarifyPick(String(opt))}
                  className="flex flex-col items-center justify-center py-3.5 px-3 rounded-xl bg-[#1c1b1b] text-[#c6f26a] hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                >
                  <span className="font-display text-2xl font-bold leading-none">{opt}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#c6f26a]/85 mt-1">
                    {unitDisplay}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 4A: Variant / Candidate Tap List */}
          {hasCandidates && parseResult.candidates && (
            <div className="flex flex-col gap-2 pt-1">
              {parseResult.candidates.map((cand) => (
                <button
                  key={cand.product_id}
                  type="button"
                  onClick={() => onClarifyPick(cand.product_name)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#fbf9f3] border border-[#dedad1] hover:border-[#1c1b1b] hover:bg-[#c6f26a]/25 text-left transition-colors"
                >
                  <span className="font-display text-sm font-semibold text-[#1b1c18]">
                    {cand.product_name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#444748] shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* 4C: Quick Damaged Count Pills */}
          {isDamagedMissing && (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onClarifyPick(String(n))}
                    className="px-3.5 py-2 rounded-lg bg-[#fbf9f3] border border-[#dedad1] font-display text-xs font-semibold text-[#1b1c18] hover:bg-[#c6f26a] hover:text-[#141f00] transition-colors"
                  >
                    {n === 0 ? `0 (${t.noneLabel})` : n}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#747878]">{t.damagedPausedNote}</p>
            </div>
          )}

          {/* Fallback when variant/unknown has zero candidates */}
          {!hasCandidates && !isTeenTens && !isDamagedMissing && !isUnknownSku && (
            <p className="text-xs text-[#747878] pt-1">{t.sayProductAgain}</p>
          )}

          {/* 4D: Unknown Product Catalogue Picker */}
          {isUnknownSku && stockItems.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {stockItems.map((item) => (
                  <button
                    key={item.product_id}
                    type="button"
                    onClick={() => onClarifyPick(item.product_name)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#fbf9f3] border border-[#dedad1] text-xs font-medium text-[#1b1c18] hover:bg-[#c6f26a] hover:text-[#141f00] transition-colors"
                  >
                    {item.product_name}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#747878]">{t.unknownNote}</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // COMMITTED state: Screen 6 Completed Entry Receipt (real ConfirmResponse, zero fake telemetry/images)
  if (flowState === 'COMMITTED' && lastCommitted) {
    const { entry: committedEntry } = lastCommitted;
    const committedBatch =
      lastCommitted.entries && lastCommitted.entries.length > 1 ? lastCommitted.entries : null;
    const totalBatchUsable = committedBatch
      ? committedBatch.reduce((sum, item) => sum + item.usable, 0)
      : committedEntry.usable;

    return (
      <section className="px-5 -mt-4 relative z-10 space-y-3.5 pb-4">
        <div className="bg-white rounded-2xl border border-[#dedad1] shadow-sm overflow-hidden">
          <div className="bg-[#eae8e2] px-4 py-2.5 flex items-center justify-between border-b border-[#dedad1]">
            <span className="font-mono text-[10px] font-bold text-[#1b1c18] uppercase tracking-[0.08em]">
              {committedBatch ? `${t.completedEntry} (${committedBatch.length})` : t.completedEntry}
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider bg-[#c6f26a] text-[#141f00] uppercase">
              {t.committedBadge}
            </span>
          </div>

          <div className="p-4 space-y-3.5">
            {committedBatch ? (
              <div className="space-y-2">
                {committedBatch.map((item) => (
                  <div
                    key={item.idempotency_key}
                    className="bg-[#faf9f5] border border-[#eae8e2] rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-[#1b1c18] truncate">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-[#747878]">
                        {item.received} {formatUnit(item.unit, lang)} {t.receivedWord}
                        {item.damaged > 0 ? ` • ${item.damaged} ${t.damagedWord}` : ''}
                      </p>
                    </div>
                    <span className="font-display text-sm font-extrabold text-[#39734c] shrink-0">
                      +{item.usable} {formatUnit(item.unit, lang)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h3 className="font-display text-lg font-bold text-[#1b1c18] tracking-tight">
                  {committedEntry.product_name}
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#faf9f5] border border-[#eae8e2] rounded-xl p-3">
                    <span className="font-mono text-[10px] font-semibold text-[#747878] uppercase block">
                      {t.received}
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-display text-xl font-bold text-[#1b1c18]">
                        {committedEntry.received}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-[#747878] uppercase">
                        {formatUnit(committedEntry.unit, lang)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-3 border ${
                      committedEntry.damaged > 0
                        ? 'bg-[#ffefeb] border-[#f3cecb]'
                        : 'bg-[#faf9f5] border-[#eae8e2]'
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase block ${
                        committedEntry.damaged > 0 ? 'text-[#b54a42]' : 'text-[#747878]'
                      }`}
                    >
                      {t.damaged}
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span
                        className={`font-display text-xl font-bold ${
                          committedEntry.damaged > 0 ? 'text-[#b54a42]' : 'text-[#444748]'
                        }`}
                      >
                        {formatTwoDigits(committedEntry.damaged)}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase ${
                          committedEntry.damaged > 0 ? 'text-[#b54a42]/80' : 'text-[#747878]'
                        }`}
                      >
                        {formatUnit(committedEntry.unit, lang)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bg-[#c6f26a] rounded-xl p-3.5 text-[#141f00] space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">
                {t.usableStockAdded}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold leading-none">
                  +{totalBatchUsable}
                </span>
                <span className="font-mono text-xs font-bold uppercase">
                  {committedBatch ? t.totalUnitsLabel : formatUnit(committedEntry.unit, lang)}
                </span>
              </div>
              <p className="text-[11px] text-[#141f00]/80 pt-1">
                {t.recordedInLedger}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[#444748]">
              <span className="w-5 h-5 rounded-full bg-[#39734c]/15 text-[#39734c] flex items-center justify-center shrink-0">
                <CheckCheck className="w-3.5 h-3.5" />
              </span>
              <p className="text-[11px] leading-snug">{t.savedToRecordsNote}</p>
            </div>
          </div>
        </div>

        {/* Screen 6 Thumb-Zone Actions */}
        <div className="space-y-2.5">
          {onNextEntry && (
            <button
              type="button"
              onClick={onNextEntry}
              className="w-full h-14 px-4 rounded-xl bg-[#c6f26a] hover:bg-[#bbf055] text-[#141f00] flex items-center justify-between border border-[#171717] shadow-[0_3px_0_0_#171717] active:translate-y-[2px] active:shadow-[0_1px_0_0_#171717] transition-all"
            >
              <div className="text-left">
                <span className="font-display text-sm font-bold uppercase tracking-wide block leading-none">
                  {t.nextEntry}
                </span>
                <span className="text-[11px] text-[#141f00]/80 block mt-1">
                  {t.nextEntryHint}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#141f00] text-[#c6f26a] flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          )}

          {onOpenStock && (
            <button
              type="button"
              onClick={onOpenStock}
              className="w-full py-3 px-4 rounded-xl bg-[#eae8e2] hover:bg-[#dedad1] text-[#1b1c18] font-display text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#444748]" />
              <span>{t.openStockLedger}</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  const badge = (() => {
    if (flowState === 'NEEDS_CLARIFICATION') {
      return { label: t.badgeClarify, cls: 'bg-[#a56a2a]/15 text-[#a56a2a]' };
    }
    if (flowState === 'AWAITING_CONFIRMATION') {
      return draft.was_corrected
        ? { label: t.badgeCorrected, cls: 'bg-[#c6f26a] text-[#141f00]' }
        : { label: t.badgeVerifySave, cls: 'bg-[#c6f26a] text-[#141f00]' };
    }
    if (flowState === 'COMMITTED') {
      return { label: t.badgeSaved, cls: 'bg-[#39734c] text-white' };
    }
    return { label: t.badgeReview, cls: 'bg-[#dedad1]/70 text-[#444748]' };
  })();

  const isClarifying =
    flowState === 'NEEDS_CLARIFICATION' &&
    parseResult &&
    (parseResult.status === 'clarify' || parseResult.status === 'unknown');

  const isAwaitingConfirm =
    flowState === 'AWAITING_CONFIRMATION' && draft.awaiting_confirmation;

  const multiEntries =
    parseResult?.entries && parseResult.entries.length > 1 ? parseResult.entries : null;

  const handleSaveEdit = () => {
    const rec = Number.parseInt(editReceived, 10);
    const dmg = Number.parseInt(editDamaged || '0', 10);
    if (Number.isNaN(rec) || rec < 1 || Number.isNaN(dmg) || dmg < 0 || dmg > rec) {
      return;
    }
    onEditQuantities(rec, dmg);
    setIsEditing(false);
  };

  return (
    <section className="px-5 -mt-4 relative z-10">
      <div className="bg-white rounded-xl border border-[#dedad1] shadow-md overflow-hidden">
        {/* Top strip */}
        <div className="bg-[#eae8e2] px-4 py-2 flex items-center justify-between">
          <span className="font-display text-[10px] font-semibold text-[#444748] uppercase tracking-[0.08em]">
            {t.pendingEntry}
          </span>
          <span
            className={`font-display text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider ${badge.cls}`}
          >
            {badge.label}
          </span>
        </div>

        <div className="px-4 py-3.5 flex flex-col gap-3">
          {/* Matched Product Pill */}
          {multiEntries ? (
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#eae8e2]">
              <span className="font-display text-xs font-semibold text-[#1b1c18]">
                {multiEntries.length} {t.deliveryItemsSuffix}
              </span>
              <span className="font-display text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#c6f26a] text-[#141f00] font-bold shrink-0">
                {t.batchBadge}
              </span>
            </div>
          ) : (
            productName && (
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#eae8e2]">
                <span className="font-display text-xs font-semibold text-[#1b1c18] truncate">
                  {productName}
                </span>
                {unit && (
                  <span className="font-display text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#f5f3ed] text-[#444748] shrink-0">
                    {unitDisplay}
                  </span>
                )}
              </div>
            )
          )}

          {/* Spoken / Typed Utterance */}
          {transcript && (
            <p className="font-serif text-[18px] italic text-[#1b1c18] leading-snug">
              “{transcript}”
            </p>
          )}

          {/* Clarification Prompt & One-Tap Options */}
          {isClarifying && (localizedQuestion ?? parseResult?.question) && (
            <div className="rounded-lg bg-[#a56a2a]/10 border border-[#a56a2a]/35 p-3 space-y-2.5">
              <p className="text-xs font-medium text-[#7c4d19] leading-snug">
                {localizedQuestion ?? parseResult?.question}
              </p>

              {parseResult?.question_kind === 'teen_tens' && draft.teen_tens_options && (
                <div className="flex flex-wrap gap-2">
                  {draft.teen_tens_options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onClarifyPick(String(opt))}
                      className="px-4 py-1.5 rounded-lg bg-[#1c1b1b] text-[#c6f26a] font-display text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      {opt} {unitDisplay}
                    </button>
                  ))}
                </div>
              )}

              {parseResult?.candidates && parseResult.candidates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {parseResult.candidates.map((cand) => (
                    <button
                      key={cand.product_id}
                      type="button"
                      onClick={() => onClarifyPick(cand.product_name)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#dedad1] text-xs font-medium text-[#1b1c18] hover:border-[#1c1b1b] transition-colors"
                    >
                      {cand.product_name}
                    </button>
                  ))}
                </div>
              )}

              {parseResult.question_kind === 'unknown_sku' && stockItems.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                  {stockItems.slice(0, 8).map((item) => (
                    <button
                      key={item.product_id}
                      type="button"
                      onClick={() => onClarifyPick(item.product_name)}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-white border border-[#dedad1] text-[11px] font-medium text-[#1b1c18] hover:bg-[#c6f26a] hover:text-[#141f00] transition-colors"
                    >
                      {item.product_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inline Edit Form or Screen 5 2-up + Usable Hero Metrics */}
          {isEditing ? (
            <div className="bg-[#faf9f5] border border-[#dedad1] rounded-lg p-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="font-display text-[10px] font-semibold text-[#444748] uppercase">
                    {t.received}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={editReceived}
                    onChange={(e) => setEditReceived(e.target.value)}
                    className="px-2.5 py-1.5 rounded bg-white border border-[#dedad1] text-sm font-semibold text-[#1b1c18]"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-display text-[10px] font-semibold text-[#b54a42] uppercase">
                    {t.damaged}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={editDamaged}
                    onChange={(e) => setEditDamaged(e.target.value)}
                    className="px-2.5 py-1.5 rounded bg-white border border-[#dedad1] text-sm font-semibold text-[#1b1c18]"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 py-1.5 rounded-lg bg-[#1c1b1b] text-white font-display text-xs font-semibold"
                >
                  {t.applyEdit}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#eae8e2] text-[#444748] font-display text-xs font-semibold"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : multiEntries ? (
            <div className="space-y-2.5 pt-0.5">
              <div className="space-y-2">
                {multiEntries.map((item, idx) => (
                  <div
                    key={item.idempotency_key}
                    className="bg-[#faf9f5] border border-[#dedad1] rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-xs font-bold text-[#1b1c18] truncate">
                        {idx + 1}. {item.product_name}
                      </p>
                      <p className="text-[11px] text-[#444748]">
                        {item.received} {formatUnit(item.unit, lang)} {t.receivedWord}
                        {item.damaged > 0 ? ` • ${item.damaged} ${t.damagedWord}` : ''}
                      </p>
                    </div>
                    <span className="font-display text-sm font-extrabold text-[#141f00] bg-[#c6f26a] px-2.5 py-1 rounded-lg shrink-0">
                      +{item.usable} {formatUnit(item.unit, lang)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-[#c6f26a] border border-[#b6e455] rounded-xl p-3 text-center">
                <span className="block font-display text-[10px] font-bold text-[#141f00] uppercase tracking-wider">
                  {t.usableToAdd} ({multiEntries.length})
                </span>
                <div className="font-display text-2xl font-extrabold text-[#141f00] leading-tight">
                  +{multiEntries.reduce((sum, i) => sum + i.usable, 0)} {t.totalUnitsLabel}
                </div>
                <p className="text-[11px] text-[#141f00]/80 pt-0.5">{t.usableNote}</p>
              </div>
            </div>
          ) : (
            (received !== null || damaged !== null || usable !== null) && (
              <div className="space-y-2.5 pt-0.5">
                {/* 2-up Received & Damaged */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#faf9f5] border border-[#dedad1] rounded-xl p-3 text-center space-y-0.5">
                    <span className="block font-display text-[10px] font-semibold text-[#444748] uppercase tracking-wider">
                      {t.received}
                    </span>
                    <div className="font-display text-2xl font-bold text-[#1b1c18] leading-tight">
                      {formatTwoDigits(received)}
                    </div>
                    {unit && (
                      <span className="block font-mono text-[10px] uppercase text-[#747878]">
                        {unitDisplay}
                      </span>
                    )}
                  </div>

                  <div
                    className={`rounded-xl p-3 text-center space-y-0.5 border ${
                      damaged && damaged > 0
                        ? 'bg-[#ffefeb] border-[#f3cecb]'
                        : 'bg-[#faf9f5] border-[#dedad1]'
                    }`}
                  >
                    <span
                      className={`block font-display text-[10px] font-semibold uppercase tracking-wider ${
                        damaged && damaged > 0 ? 'text-[#b54a42]' : 'text-[#444748]'
                      }`}
                    >
                      {t.damaged}
                    </span>
                    <div
                      className={`font-display text-2xl font-bold leading-tight ${
                        damaged && damaged > 0 ? 'text-[#b54a42]' : 'text-[#444748]'
                      }`}
                    >
                      {formatTwoDigits(damaged)}
                    </div>
                    {unit && (
                      <span
                        className={`block font-mono text-[10px] uppercase ${
                          damaged && damaged > 0 ? 'text-[#b54a42]/80' : 'text-[#747878]'
                        }`}
                      >
                        {unitDisplay}
                      </span>
                    )}
                  </div>
                </div>

                {/* Full-width Chartreuse Hero Metric: Usable to Add */}
                <div className="bg-[#c6f26a] border border-[#b6e455] rounded-xl p-3.5 text-center space-y-1">
                  <span className="block font-display text-[10px] font-bold text-[#141f00] uppercase tracking-wider">
                    {t.usableToAdd}
                  </span>
                  <div className="font-display text-3xl font-extrabold text-[#141f00] leading-none tracking-tight">
                    +{usable ?? 0}
                  </div>
                  {unit && (
                    <span className="block font-mono text-[11px] font-bold uppercase text-[#141f00]/85">
                      {unitDisplay}
                    </span>
                  )}
                  <p className="text-[11px] text-[#141f00]/80 pt-1 border-t border-[#141f00]/10">
                    {t.usableNote}
                  </p>
                </div>
              </div>
            )
          )}

          {/* Read-Back Banner with Replay Speaker */}
          {isAwaitingConfirm && localizedReadback && (
            <div className="bg-[#faf9f5] border border-[#dedad1] rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4b6700]" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#747878]">
                    {t.readBackLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => speakText(localizedReadback, lang)}
                  aria-label="Replay read-back"
                  className="w-7 h-7 rounded-full bg-[#eae8e2] border border-[#dedad1] flex items-center justify-center text-[#1b1c18] hover:bg-[#dedad1] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-serif italic text-[14px] text-[#1b1c18] leading-snug">
                “{localizedReadback}”
              </p>
              {!browserHasVoice && (
                <p className="text-[10px] text-[#7c4d19] leading-snug pt-0.5">
                  {t.noOsVoiceNote}
                </p>
              )}
            </div>
          )}

          {/* Screen 5 Primary CTA + Spoken Hint + 2-up Secondary Row */}
          {isAwaitingConfirm && !isEditing && (
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isConfirming}
                aria-busy={isConfirming}
                className={`w-full h-12 bg-[#c6f26a] text-[#141f00] font-display font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-[#171717] transition-all uppercase tracking-wide ${
                  isConfirming
                    ? 'opacity-70 cursor-wait shadow-none translate-y-[1px]'
                    : 'hover:bg-[#bbf055] shadow-[0px_3px_0px_0px_#171717] active:translate-y-[2px] active:shadow-[0px_1px_0px_0px_#171717]'
                }`}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.savingProgress}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    {multiEntries ? `${t.confirmAndSave} (${multiEntries.length})` : t.confirmAndSave}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-center">
                <AudioLines className="w-3.5 h-3.5 text-[#4b6700] shrink-0" />
                <span className="text-[11px] text-[#444748]">{t.confirmHintVoice}</span>
              </div>

              <div className={`grid ${multiEntries ? 'grid-cols-1' : 'grid-cols-2'} gap-2 pt-0.5`}>
                {!multiEntries && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="py-2.5 px-3 rounded-xl bg-white border border-[#dedad1] text-[#1b1c18] font-display text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#f5f3ed] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t.editDetails}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-2.5 px-3 rounded-xl border border-[#f3cecb] bg-[#ffefeb]/60 text-[#b54a42] font-display text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#ffefeb] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {t.cancelEntry}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
