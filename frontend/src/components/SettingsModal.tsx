import { useState } from 'react';
import { KeyRound, Volume2, VolumeX, X } from 'lucide-react';
import { hasBrowserVoice } from '../services/speech';
import { TRANSLATIONS } from '../i18n/translations';
import type { HealthResponse, LangCode } from '../types/api';

interface SettingsModalProps {
  open: boolean;
  lang: LangCode;
  onClose: () => void;
  health: HealthResponse | null;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function SettingsModal({
  open,
  lang,
  onClose,
  health,
  isMuted,
  onToggleMute,
}: SettingsModalProps) {
  const [optionalKey, setOptionalKey] = useState<string>('');
  const t = TRANSLATIONS[lang];
  const hasVoice = lang === 'en' || hasBrowserVoice(lang);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="KiranaFlow Settings"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm bg-[#fbf9f3] border border-[#dedad1] rounded-xl shadow-xl overflow-hidden">
        <div className="bg-[#1c1b1b] text-white px-4 py-3 flex items-center justify-between">
          <span className="font-display text-sm font-semibold tracking-wide">
            {t.settingsTitle}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Audio Read-Back Toggle */}
          <div className="bg-white border border-[#dedad1] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[#b54a42]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#39734c]" />
                )}
                <div>
                  <p className="font-display text-xs font-semibold text-[#1b1c18]">
                    {t.spokenReadbackTitle}
                  </p>
                  <p className="text-[11px] text-[#747878]">
                    {t.ttsSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1 rounded font-display text-[11px] font-semibold ${
                  isMuted
                    ? 'bg-[#eae8e2] text-[#444748]'
                    : 'bg-[#c6f26a] text-[#141f00]'
                }`}
              >
                {isMuted ? t.mutedBtn : t.activeBtn}
              </button>
            </div>
            {!hasVoice && (
              <p className="text-[11px] text-[#7c4d19] bg-[#a56a2a]/10 px-2.5 py-1.5 rounded">
                {t.noOsVoiceNote}
              </p>
            )}
          </div>

          {/* Optional API Key Status */}
          <div className="bg-white border border-[#dedad1] rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#444748]" />
              <span className="font-display text-xs font-semibold text-[#1b1c18]">
                {t.optionalKeyTitle}
              </span>
            </div>
            <p className="text-[11px] text-[#39734c] font-medium bg-[#39734c]/10 px-2.5 py-1.5 rounded">
              {optionalKey.trim()
                ? t.customKeyActiveNote
                : `${t.keyNotSetPrefix} — ${health?.llm_parser ?? 'deterministic parser active'}.`}
            </p>
            <input
              type="password"
              value={optionalKey}
              onChange={(e) => setOptionalKey(e.target.value)}
              placeholder={t.keyPlaceholder}
              className="w-full px-3 py-2 rounded-lg bg-[#faf9f5] border border-[#dedad1] text-xs text-[#1b1c18]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
