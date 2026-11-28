import { useEffect, useState, type FormEvent } from 'react';
import { Check, CheckCircle2, Mic, Settings, Store, Volume2, VolumeX, X } from 'lucide-react';
import type { StoreProfile } from '../hooks/useDeliveryFlow';
import { hasBrowserVoice } from '../services/speech';
import { TRANSLATIONS } from '../i18n/translations';
import type { HealthResponse, LangCode } from '../types/api';

interface SettingsModalProps {
  open: boolean;
  lang: LangCode;
  onChangeLang: (lang: LangCode) => void;
  onClose: () => void;
  health: HealthResponse | null;
  storeProfile: StoreProfile;
  onSaveProfile: (next: StoreProfile) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  autoFollowUpMic: boolean;
  onToggleAutoFollowUp: () => void;
  stockCount: number;
  lowStockCount: number;
  movementCount: number;
}

const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export function SettingsModal({
  open,
  lang,
  onChangeLang,
  onClose,
  health,
  storeProfile,
  onSaveProfile,
  isMuted,
  onToggleMute,
  autoFollowUpMic,
  onToggleAutoFollowUp,
  stockCount,
  lowStockCount,
  movementCount,
}: SettingsModalProps) {
  const [shopName, setShopName] = useState<string>(storeProfile.shopName);
  const [ownerName, setOwnerName] = useState<string>(storeProfile.ownerName);
  const [locationNote, setLocationNote] = useState<string>(storeProfile.locationNote);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setShopName(storeProfile.shopName);
      setOwnerName(storeProfile.ownerName);
      setLocationNote(storeProfile.locationNote);
    } else {
      setSavedNotice(false);
    }
  }, [open, storeProfile]);

  const t = TRANSLATIONS[lang];
  const hasVoice = lang === 'en' || hasBrowserVoice(lang);
  const engineOnline = health?.status === 'healthy';

  if (!open) return null;

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      shopName,
      ownerName,
      locationNote,
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="KiranaFlow Store Profile and Settings"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-[#fbf9f3] border border-[#dedad1] rounded-2xl shadow-xl">
        {/* Top Modal Header with Profile + Gear Icon */}
        <div className="bg-[#1c1b1b] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#c6f26a]/15 border border-[#c6f26a]/30 flex items-center justify-center shrink-0">
              <Settings className="w-3.5 h-3.5 text-[#c6f26a]" />
            </div>
            <span className="font-display text-sm font-semibold tracking-wide truncate">
              {t.settingsTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Section 1: Store Profile + Quick Store Snapshot */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white border border-[#dedad1] rounded-xl p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1c1b1b] text-[#c6f26a] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xs font-bold text-[#1b1c18] truncate">
                    {storeProfile.shopName || t.storeProfileTitle}
                  </p>
                  <p className="text-[11px] text-[#747878] truncate">
                    {storeProfile.ownerName || t.storeProfileUnset}
                  </p>
                </div>
              </div>
              {savedNotice && (
                <span className="px-2 py-0.5 rounded-full bg-[#39734c]/15 text-[#244e32] font-display text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3" />
                  {t.profileSavedNote}
                </span>
              )}
            </div>

            {/* Live Store Summary Pills */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#faf9f5] border border-[#eae8e2] rounded-lg py-1.5 px-1">
                <span className="font-display text-sm font-extrabold text-[#1b1c18] block leading-tight">
                  {stockCount}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#747878]">{t.skusCountSuffix}</span>
              </div>
              <div className="bg-[#faf9f5] border border-[#eae8e2] rounded-lg py-1.5 px-1">
                <span
                  className={`font-display text-sm font-extrabold block leading-tight ${
                    lowStockCount > 0 ? 'text-[#a56a2a]' : 'text-[#1b1c18]'
                  }`}
                >
                  {lowStockCount}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#747878]">{t.lowFilter}</span>
              </div>
              <div className="bg-[#faf9f5] border border-[#eae8e2] rounded-lg py-1.5 px-1">
                <span className="font-display text-sm font-extrabold text-[#1b1c18] block leading-tight">
                  {movementCount}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#747878]">{t.entriesSuffix}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block space-y-1">
                <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-[#444748]">
                  {t.shopNameLabel}
                </span>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder={t.shopNamePlaceholder}
                  maxLength={60}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#faf9f5] border border-[#dedad1] text-xs text-[#1b1c18] focus:outline-none focus:border-[#1c1b1b]"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 items-end">
                <label className="block space-y-1">
                  <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-[#444748]">
                    {t.ownerNameLabel}
                  </span>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={t.ownerNamePlaceholder}
                    maxLength={40}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#faf9f5] border border-[#dedad1] text-xs text-[#1b1c18] focus:outline-none focus:border-[#1c1b1b]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-[#444748]">
                    {t.locationNoteLabel}
                  </span>
                  <input
                    type="text"
                    value={locationNote}
                    onChange={(e) => setLocationNote(e.target.value)}
                    placeholder={t.locationNotePlaceholder}
                    maxLength={50}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#faf9f5] border border-[#dedad1] text-xs text-[#1b1c18] focus:outline-none focus:border-[#1c1b1b]"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-[#1c1b1b] hover:bg-[#2f302c] text-[#c6f26a] font-display text-xs font-semibold transition-colors"
            >
              {t.saveProfileBtn}
            </button>
          </form>

          {/* Section 2: Voice & Language Controls */}
          <div className="bg-white border border-[#dedad1] rounded-xl p-3.5 space-y-3">
            <p className="font-display text-[11px] font-bold uppercase tracking-wider text-[#444748]">
              {t.voicePrefsTitle}
            </p>

            {/* App & Voice Language */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#747878] block">{t.preferredLangLabel}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => onChangeLang(opt.code)}
                    className={`py-1.5 px-2 rounded-lg font-display text-xs font-semibold border transition-colors ${
                      lang === opt.code
                        ? 'bg-[#c6f26a] text-[#141f00] border-[#171717]'
                        : 'bg-[#faf9f5] text-[#444748] border-[#dedad1] hover:text-[#1b1c18]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spoken Read-Back Toggle */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#eae8e2]">
              <div className="flex items-center gap-2.5 min-w-0">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[#b54a42] shrink-0" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#39734c] shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-display text-xs font-semibold text-[#1b1c18]">
                    {t.spokenReadbackTitle}
                  </p>
                  <p className="text-[11px] text-[#747878] leading-snug">{t.ttsSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1 rounded-lg font-display text-[11px] font-semibold shrink-0 ${
                  isMuted
                    ? 'bg-[#eae8e2] text-[#444748]'
                    : 'bg-[#c6f26a] text-[#141f00]'
                }`}
              >
                {isMuted ? t.mutedBtn : t.activeBtn}
              </button>
            </div>

            {!hasVoice && (
              <p className="text-[11px] text-[#7c4d19] bg-[#a56a2a]/10 px-2.5 py-1.5 rounded-lg leading-snug">
                {t.noOsVoiceNote}
              </p>
            )}

            {/* Auto Follow-Up Mic Toggle */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#eae8e2]">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mic
                  className={`w-4 h-4 shrink-0 ${
                    autoFollowUpMic ? 'text-[#4b6700]' : 'text-[#747878]'
                  }`}
                />
                <div className="min-w-0">
                  <p className="font-display text-xs font-semibold text-[#1b1c18]">
                    {t.autoFollowUpTitle}
                  </p>
                  <p className="text-[11px] text-[#747878] leading-snug">
                    {t.autoFollowUpSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleAutoFollowUp}
                className={`px-3 py-1 rounded-lg font-display text-[11px] font-semibold shrink-0 ${
                  autoFollowUpMic
                    ? 'bg-[#c6f26a] text-[#141f00]'
                    : 'bg-[#eae8e2] text-[#444748]'
                }`}
              >
                {autoFollowUpMic ? t.onBtn : t.offBtn}
              </button>
            </div>
          </div>

          {/* Section 3: Calm Offline Engine Status Strip (zero API key required) */}
          <div
            className={`rounded-xl border px-3.5 py-2.5 flex items-start gap-2.5 ${
              engineOnline
                ? 'bg-[#39734c]/10 border-[#39734c]/30 text-[#244e32]'
                : 'bg-[#a56a2a]/10 border-[#a56a2a]/30 text-[#7c4d19]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-xs font-bold leading-snug">{t.engineReadyTitle}</p>
              <p className="text-[11px] opacity-90 leading-snug mt-0.5">
                {engineOnline ? t.engineReadyDesc : t.engineConnectingDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
