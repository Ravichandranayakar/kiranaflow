import { Check } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { FlowState, LangCode } from '../types/api';

interface HeroBannerProps {
  flowState: FlowState;
  lang: LangCode;
}

export function HeroBanner({ flowState, lang }: HeroBannerProps) {
  const t = TRANSLATIONS[lang];

  if (flowState === 'LISTENING') {
    return (
      <section className="bg-[#1c1b1b] text-white px-5 pt-5 pb-7 flex flex-col gap-1.5 border-b border-[#2c2a2a]">
        <div className="flex items-center justify-between">
          <span className="font-display text-[10px] font-semibold text-[#858383] uppercase tracking-[0.14em]">
            {t.voiceInput}
          </span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#141f00] border border-[#c6f26a]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c6f26a] animate-ping" />
            <span className="font-display text-[9px] font-bold tracking-wider text-[#c6f26a] uppercase">
              {t.listeningNow}
            </span>
          </div>
        </div>
        <h1 className="font-display text-[30px] font-semibold text-white leading-[1.12] tracking-tight">
          {t.imListening}
          <br />
          <span className="font-serif text-[34px] italic text-[#c6f26a] font-normal leading-none">
            {t.speakNaturally}
          </span>
        </h1>
        <p className="text-[13px] text-[#858383] max-w-xs pt-1 leading-snug">
          {t.listeningSubtitle}
        </p>
      </section>
    );
  }

  if (flowState === 'PROCESSING') {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return (
      <section className="bg-[#1c1b1b] text-white px-5 pt-5 pb-7 flex flex-col gap-1.5 border-b border-[#2c2a2a]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] font-medium text-[#858383] uppercase tracking-[0.14em]">
            {t.processingEyebrow}
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c6f26a] text-[#141f00] shadow-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-[#141f00] ${
                prefersReducedMotion ? '' : 'animate-pulse'
              }`}
            />
            <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
              {t.pleaseWait}
            </span>
          </div>
        </div>
        <h1 className="font-display text-[30px] font-semibold text-white leading-[1.12] tracking-tight">
          {t.checkingYour}
          <br />
          <span className="font-serif text-[32px] italic text-[#c6f26a] font-normal leading-none">
            {t.wordsItalic}
          </span>
        </h1>
        <p className="text-[13px] text-[#858383] max-w-xs pt-1 leading-snug">
          {t.processingSubtitle}
        </p>
      </section>
    );
  }

  if (flowState === 'NEEDS_CLARIFICATION') {
    return (
      <section className="bg-[#1c1b1b] text-white px-5 pt-5 pb-7 flex flex-col gap-1.5 border-b border-[#2c2a2a]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] font-medium text-[#858383] uppercase tracking-[0.14em]">
            {t.quickClarification}
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#a56a2a]/25 border border-[#f5b841]/40 text-[#f5b841]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5b841]" />
            <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
              {t.actionNeeded}
            </span>
          </div>
        </div>
        <h1 className="font-display text-[30px] font-semibold text-white leading-[1.12] tracking-tight">
          {t.letsMakeSure}
          <br />
          <span className="font-serif text-[32px] italic text-[#c6f26a] font-normal leading-none">
            {t.oneDetailItalic}
          </span>
        </h1>
        <p className="text-[13px] text-[#a7a49e] max-w-xs pt-1 leading-snug">
          {t.clarifySubtitle}
        </p>
      </section>
    );
  }

  if (flowState === 'AWAITING_CONFIRMATION') {
    return (
      <section className="bg-[#1c1b1b] text-white px-5 pt-5 pb-7 flex flex-col gap-1.5 border-b border-[#2c2a2a]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] font-medium text-[#858383] uppercase tracking-[0.14em]">
            {t.reviewEntry}
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141f00] border border-[#c6f26a]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c6f26a] animate-pulse" />
            <span className="font-mono text-[9px] font-bold tracking-wider text-[#c6f26a] uppercase">
              {t.awaitingConfirmation}
            </span>
          </div>
        </div>
        <h1 className="font-display text-[30px] font-semibold text-white leading-[1.12] tracking-tight">
          {t.checkBefore}{' '}
          <span className="font-serif text-[32px] italic text-[#c6f26a] font-normal leading-none">
            {t.savingItalic}
          </span>
        </h1>
        <p className="text-[13px] text-[#858383] max-w-xs pt-1 leading-snug">
          {t.reviewSubtitle}
        </p>
      </section>
    );
  }

  if (flowState === 'COMMITTED') {
    return (
      <section className="bg-[#1c1b1b] text-white px-5 pt-5 pb-7 flex flex-col gap-3 border-b border-[#2c2a2a]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium text-[#858383] uppercase tracking-[0.14em]">
            {t.completedEyebrow}
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c6f26a] text-[#141f00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#141f00]" />
            <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
              {t.savedSuccessfully}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#c6f26a] text-[#141f00] flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#141f00]">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h1 className="font-display text-[28px] font-bold text-white leading-tight tracking-tight">
              {t.entrySaved}
            </h1>
            <p className="text-[13px] text-[#a7a49e] leading-snug mt-0.5">
              {t.stockRecordUpdated}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1c1b1b] text-white px-5 pt-5 pb-7 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10px] font-semibold text-[#c6f26a] uppercase tracking-[0.14em]">
          {t.kiranaAssistant}
        </span>
      </div>
      <h1 className="font-display text-[32px] font-semibold text-white leading-[1.06] tracking-tight">
        {t.tapAndSpeak}
      </h1>
      <p className="text-[13px] text-[#a7a49e] max-w-xs pt-1 leading-snug">
        {t.tapAndSpeakSubtitle}
      </p>
    </section>
  );
}
