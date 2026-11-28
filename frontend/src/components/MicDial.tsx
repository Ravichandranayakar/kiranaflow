import { useEffect, useState, type FormEvent } from 'react';
import { Check, Keyboard, Loader2, Mic, Send } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { FlowState, LangCode } from '../types/api';

interface MicDialProps {
  flowState: FlowState;
  lang: LangCode;
  micSupported: boolean;
  micError: string | null;
  onToggleMic: () => void;
  onSubmitText: (text: string) => void;
}

const DIAL_TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

export function MicDial({
  flowState,
  lang,
  micSupported,
  micError,
  onToggleMic,
  onSubmitText,
}: MicDialProps) {
  const t = TRANSLATIONS[lang];
  const isListening = flowState === 'LISTENING';
  const isProcessing = flowState === 'PROCESSING';
  const [showTextBox, setShowTextBox] = useState<boolean>(!micSupported);
  const [textValue, setTextValue] = useState<string>('');

  // Auto-open text fallback if mic error occurs or recording unsupported
  useEffect(() => {
    if (!micSupported || micError) {
      setShowTextBox(true);
    }
  }, [micSupported, micError]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!textValue.trim() || isProcessing) return;
    onSubmitText(textValue.trim());
    setTextValue('');
  };

  if (isProcessing) {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
      <section className="px-5 py-5 flex flex-col items-center justify-center gap-3 bg-[#eae8e2] mt-4 mx-5 rounded-xl shadow-sm">
        {/* Screen 3: Mechanical Processing Gauge (no clickable mic dial while processing) */}
        <div className="flex flex-col items-center justify-center my-1">
          <div className="relative w-[136px] h-[136px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#dedad1] pointer-events-none" />
            <div className="absolute inset-1.5 rounded-full border border-dashed border-[#c6f26a]/60 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none">
              {DIAL_TICKS.map((deg, idx) => {
                const isActive = idx % 2 === 0;
                return (
                  <span
                    key={deg}
                    style={{
                      transform: `rotate(${deg}deg)`,
                      transformOrigin: '50% 62px',
                    }}
                    className={`absolute w-[2px] h-[6px] left-1/2 top-1.5 -ml-[1px] rounded-full ${
                      isActive ? 'bg-[#c6f26a]' : 'bg-[#383737]'
                    }`}
                  />
                );
              })}
            </div>

            <div className="relative z-10 w-[82px] h-[82px] rounded-full bg-[#1c1b1b] p-2 flex items-center justify-center shadow-lg border border-[#2c2a2a]">
              <div className="w-10 h-10 rounded-full bg-[#141f00] flex items-center justify-center border border-[#c6f26a]/30">
                {prefersReducedMotion ? (
                  /* Static arc for prefers-reduced-motion */
                  <svg
                    className="w-5 h-5 text-[#c6f26a]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9" />
                  </svg>
                ) : (
                  <Loader2 className="w-5 h-5 text-[#c6f26a] animate-spin" />
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-2.5">
            <p className="font-display text-[14px] font-bold text-[#1b1c18] tracking-tight">
              {prefersReducedMotion ? t.checkingEntryShort : t.checkingEntryTitle}
            </p>
            <p className="text-[12px] text-[#444748] mt-0.5">
              {t.checkingEntrySubtitle}
            </p>
          </div>
        </div>

        {/* 3-Step Processing Progress Card (reflects real fetch state, zero artificial delay) */}
        <div className="w-full max-w-[320px] bg-white rounded-xl border border-[#dedad1] p-3.5 shadow-xs">
          <div className="flex flex-col gap-2.5 relative">
            <div className="absolute left-[9px] top-2.5 bottom-2.5 w-[2px] bg-[#eae8e2] z-0" />

            <div className="flex items-center gap-2.5 relative z-10">
              <span className="w-5 h-5 rounded-full bg-[#4b6700] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <div className="flex items-baseline justify-between w-full">
                <span className="text-[12px] font-medium text-[#1b1c18]">
                  {t.stepSpeechReceived}
                </span>
                <span className="font-mono text-[9px] uppercase text-[#4b6700] font-semibold">
                  {t.stepDone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 relative z-10">
              <span className="w-5 h-5 rounded-full bg-[#141f00] border border-[#c6f26a] flex items-center justify-center shrink-0">
                <span
                  className={`w-2 h-2 rounded-full bg-[#c6f26a] ${
                    prefersReducedMotion ? '' : 'animate-pulse'
                  }`}
                />
              </span>
              <div className="flex items-baseline justify-between w-full">
                <span className="text-[12px] font-bold text-[#1b1c18]">
                  {t.stepCheckingItems}
                </span>
                <span className="font-mono text-[9px] uppercase text-[#141f00] font-bold bg-[#c6f26a] px-1.5 py-0.5 rounded">
                  {t.stepActive}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 relative z-10">
              <span className="w-5 h-5 rounded-full bg-[#f0eee8] border border-[#dedad1] flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#858383]" />
              </span>
              <div className="flex items-baseline justify-between w-full">
                <span className="text-[12px] text-[#858383]">
                  {t.stepPreparingNext}
                </span>
                <span className="font-mono text-[9px] uppercase text-[#858383]">
                  {t.stepQueued}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-5 flex flex-col items-center justify-center gap-2.5 bg-[#eae8e2] mt-4 mx-5 rounded-xl shadow-sm overflow-hidden">
      {/* Mic Permission / Fallback Notice */}
      {(!micSupported || micError) && (
        <div className="w-full rounded-lg bg-[#a56a2a]/12 border border-[#a56a2a]/35 px-3 py-2 text-center">
          <p className="text-[11px] font-medium text-[#7c4d19]">
            {micError ?? 'Microphone recording is unavailable in this browser — use text input below.'}
          </p>
        </div>
      )}

      {/* Weighing-Scale Dial with Contained Chartreuse Waves */}
      <div
        className={`relative flex items-center justify-center ${
          isListening ? 'w-[180px] h-[180px]' : 'py-2'
        }`}
      >
        {isListening && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute w-[124px] h-[124px] rounded-full border-2 border-[#c6f26a] shadow-[0_0_12px_rgba(198,242,106,0.35)] kf-wave-ring motion-reduce:animate-none"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute w-[124px] h-[124px] rounded-full border-2 border-[#9dc643]/85 kf-wave-ring-delay-1 motion-reduce:animate-none"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute w-[124px] h-[124px] rounded-full border border-[#c6f26a]/75 bg-[#c6f26a]/10 kf-wave-ring-delay-2 motion-reduce:animate-none"
            />
          </>
        )}

        <button
          type="button"
          onClick={onToggleMic}
          disabled={isProcessing}
          aria-pressed={isListening}
          aria-label={isListening ? 'Stop recording' : 'Tap to speak'}
          className={`relative z-10 flex items-center justify-center shadow-lg active:scale-95 transition-all focus:outline-none ${
            isListening
              ? 'w-[124px] h-[124px] rounded-full bg-[#1c1b1b] border border-[#2c2a2a]'
              : 'w-36 h-36 rounded-2xl bg-[#1c1b1b]'
          } ${isProcessing ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
        >
          {isListening ? (
            <>
              {/* Screen 2: 12 radial ticks around circular dial */}
              <div className="absolute inset-0 pointer-events-none">
                {DIAL_TICKS.map((deg, idx) => {
                  const isActive = idx !== 6 && idx !== 7;
                  return (
                    <span
                      key={deg}
                      style={{
                        transform: `rotate(${deg}deg)`,
                        transformOrigin: '50% 56px',
                      }}
                      className={`absolute w-[2px] h-[6px] left-1/2 top-1 -ml-[1px] rounded-full ${
                        isActive ? 'bg-[#c6f26a]' : 'bg-[#383737]'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Central Chartreuse Hub with Solid Stop Square */}
              <div className="relative z-10 w-[76px] h-[76px] rounded-full bg-[#c6f26a] hover:bg-[#bbf055] flex items-center justify-center shadow-md border-2 border-[#141f00]/10">
                <div className="w-6 h-6 rounded-[5px] bg-[#141f00]" />
              </div>
            </>
          ) : (
            <>
              {/* Screen 1: Mechanical scale tick ring */}
              <svg
                className="absolute inset-0 w-full h-full text-[#c6f26a] opacity-85"
                fill="none"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  opacity="0.45"
                  r="52"
                  stroke="currentColor"
                  strokeDasharray="2 4"
                  strokeWidth="1"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  stroke="currentColor"
                  strokeDasharray="1 7"
                  strokeWidth="1.5"
                />
                <line stroke="currentColor" strokeWidth="2" x1="60" x2="60" y1="5" y2="12" />
                <line stroke="currentColor" strokeWidth="2" x1="60" x2="60" y1="108" y2="115" />
                <line stroke="currentColor" strokeWidth="2" x1="5" x2="12" y1="60" y2="60" />
                <line stroke="currentColor" strokeWidth="2" x1="108" x2="115" y1="60" y2="60" />
              </svg>

              <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#c6f26a] hover:bg-[#bbf055] text-[#141f00] flex items-center justify-center shadow-md">
                <Mic className="w-7 h-7 stroke-[2.2]" />
              </div>
            </>
          )}
        </button>
      </div>

      {/* Labels & Text Fallback Toggle */}
      <div className="flex flex-col items-center text-center gap-0.5">
        <span className="font-display text-xs font-semibold text-[#1b1c18] tracking-[0.12em] uppercase">
          {isListening
            ? t.listeningTapToStop
            : flowState === 'NEEDS_CLARIFICATION'
              ? t.tapToAnswer
              : t.tapToSpeak}
        </span>
        <span className="text-[12px] text-[#444748]">
          {isListening
            ? t.finishedSpeakingHint
            : flowState === 'NEEDS_CLARIFICATION'
              ? t.tapToAnswerHint
              : t.micStartsOnTap}
        </span>
        {!isListening && (
          <button
            type="button"
            onClick={() => setShowTextBox((v) => !v)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#dedad1] shadow-xs font-display text-xs font-semibold text-[#1b1c18] hover:border-[#1c1b1b] active:scale-[0.98] transition-all"
          >
            <Keyboard className="w-4 h-4 text-[#4b6700]" />
            <span>{showTextBox ? t.hideTextInput : t.orTypeInstead}</span>
          </button>
        )}
      </div>

      {/* Honest Editable Text Fallback */}
      {showTextBox && !isListening && (
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 pt-1">
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={t.typePlaceholder}
            className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-[#faf9f5] border border-[#dedad1] text-sm text-[#1b1c18] placeholder:text-[#747878] focus:outline-none focus:border-[#1c1b1b]"
          />
          <button
            type="submit"
            disabled={!textValue.trim() || isProcessing}
            aria-label="Send delivery text"
            className="px-3.5 py-2.5 rounded-lg bg-[#1c1b1b] text-[#c6f26a] font-display text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            {t.send}
          </button>
        </form>
      )}
    </section>
  );
}
