import { useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import type { LangCode } from '../types/api';

interface ExampleItem {
  id: string;
  label: Record<LangCode, string>;
  transcript: string;
}

const EXAMPLES: ExampleItem[] = [
  {
    id: 'normal',
    label: {
      en: 'Normal entry',
      hi: 'सामान्य प्रविष्टि',
      kn: 'ಸಾಮಾನ್ಯ ನಮೂದು',
    },
    transcript: '24 milk packets bandide 2 odada ide',
  },
  {
    id: 'ambiguous',
    label: {
      en: '14 or 40?',
      hi: '14 या 40?',
      kn: '14 ಅಥವಾ 40?',
    },
    transcript: '14 milk packets',
  },
  {
    id: 'correct',
    label: {
      en: 'Self-correction',
      hi: 'स्वयं सुधार',
      kn: 'ತನ್ನಷ್ಟಕ್ಕೇ ತಿದ್ದುಪಡಿ',
    },
    transcript: '10 fortune oil illa illa 12 packets 1 leaky',
  },
  {
    id: 'unknown',
    label: {
      en: 'Unknown product',
      hi: 'अज्ञात उत्पाद',
      kn: 'ಅಪರಿಚಿತ ಸರಕು',
    },
    transcript: '10 packets amul butter',
  },
  {
    id: 'hindi',
    label: {
      en: 'Hindi sugar',
      hi: 'हिंदी चीनी',
      kn: 'ಹಿಂದಿ ಸಕ್ಕರೆ',
    },
    transcript: '10 cheeni 2 kharab',
  },
];

interface ExampleStripProps {
  lang: LangCode;
  onSelectExample: (transcript: string) => void;
  disabled?: boolean;
}

export function ExampleStrip({ lang, onSelectExample, disabled = false }: ExampleStripProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];

  return (
    <section className="px-5 pt-4 pb-6 flex flex-col gap-2">
      <span className="font-display text-[10px] font-semibold text-[#444748] uppercase tracking-[0.12em]">
        {t.tryTestCase}
      </span>
      <div className="flex flex-wrap gap-2 pb-1">
        {EXAMPLES.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setActiveId(item.id);
                onSelectExample(item.transcript);
              }}
              className={`px-3.5 py-2 rounded-lg flex items-center shadow-sm transition-colors border ${
                active
                  ? 'bg-[#1c1b1b] text-[#c6f26a] border-[#1c1b1b]'
                  : 'bg-white text-[#1b1c18] border-[#dedad1] hover:border-[#1c1b1b]'
              }`}
            >
              <span className="text-[13px] font-medium whitespace-nowrap">{item.label[lang]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
