import { ClipboardList, Mic, PackageCheck } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { LangCode } from '../types/api';

export type ActiveTab = 'intake' | 'stock' | 'history';

interface BottomNavProps {
  activeTab: ActiveTab;
  lang: LangCode;
  onSelectTab: (tab: ActiveTab) => void;
}

export function BottomNav({ activeTab, lang, onSelectTab }: BottomNavProps) {
  const t = TRANSLATIONS[lang];
  const tabs: { id: ActiveTab; label: string; icon: typeof Mic }[] = [
    { id: 'intake', label: t.speakTab, icon: Mic },
    { id: 'stock', label: t.stockTab, icon: PackageCheck },
    { id: 'history', label: t.historyTab, icon: ClipboardList },
  ];

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky bottom-0 z-20 bg-[#f5f3ed]/95 backdrop-blur-sm border-t border-[#dedad1] px-4 py-2"
    >
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-display text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#1c1b1b] text-[#c6f26a]'
                  : 'text-[#444748] hover:bg-[#eae8e2]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
