import { Settings, Store } from 'lucide-react';
import type { LangCode } from '../types/api';

interface HeaderProps {
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onOpenSettings: () => void;
}

const LANGUAGES: { code: LangCode; label: string; title: string }[] = [
  { code: 'en', label: 'E', title: 'English' },
  { code: 'hi', label: 'हि', title: 'Hindi' },
  { code: 'kn', label: 'ಕ', title: 'Kannada' },
];

export function Header({
  lang,
  onChangeLang,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 px-4 py-3.5 bg-[#f5f3ed] border-b border-[#dedad1]/60">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Kirana Store Brand Icon */}
        <div className="w-8 h-8 rounded-lg bg-[#1c1b1b] flex items-center justify-center shrink-0 shadow-sm">
          <Store className="w-4 h-4 text-[#c6f26a]" />
        </div>

        <span className="font-brand text-[20px] font-extrabold text-[#1b1c18] tracking-tight leading-none truncate">
          Kirana<span className="text-[#4b6700]">Flow</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div
          aria-label="Language selector"
          className="flex items-center gap-0.5 bg-[#eae8e2] p-1 rounded-lg"
          role="group"
        >
          {LANGUAGES.map((item) => {
            const active = lang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                title={item.title}
                aria-label={item.title}
                onClick={() => onChangeLang(item.code)}
                className={`min-w-[28px] px-2 py-1 rounded font-sans text-[11px] font-bold text-center whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#c6f26a] text-[#141f00]'
                    : 'text-[#444748] hover:text-[#1b1c18]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="p-1.5 rounded-lg bg-[#eae8e2] text-[#444748] hover:text-[#1b1c18] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
