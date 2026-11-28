import { memo } from 'react';
import { Clock } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { LangCode, MovementRecord } from '../types/api';

interface HistoryViewProps {
  movements: MovementRecord[];
  lang: LangCode;
}

export const HistoryView = memo(function HistoryView({ movements, lang }: HistoryViewProps) {
  const t = TRANSLATIONS[lang];

  return (
    <section className="px-5 py-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#444748]">
            {t.auditTrail}
          </p>
          <h2 className="font-display text-xl font-semibold text-[#1b1c18]">
            {t.movementHistory}
          </h2>
        </div>
        <span className="font-display text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#eae8e2] text-[#1b1c18]">
          {movements.length} Entries
        </span>
      </div>

      {movements.length === 0 ? (
        <div className="bg-white border border-[#dedad1] rounded-xl p-6 text-center space-y-1.5">
          <Clock className="w-6 h-6 text-[#747878] mx-auto" />
          <p className="font-display text-sm font-semibold text-[#1b1c18]">
            {t.noDeliveriesYet}
          </p>
          <p className="text-xs text-[#747878]">
            {t.noDeliveriesSubtitle}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {movements.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#dedad1] rounded-xl p-3.5 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-semibold text-[#1b1c18]">
                    {m.product_name}
                  </p>
                  <p className="text-[11px] text-[#747878]">
                    {new Date(m.confirmed_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-display text-xs font-semibold px-2 py-0.5 rounded bg-[#39734c]/15 text-[#39734c]">
                    +{m.usable_delta} usable
                  </span>
                  {m.damaged > 0 && (
                    <span className="font-display text-xs font-semibold px-2 py-0.5 rounded bg-[#b54a42]/15 text-[#b54a42]">
                      {m.damaged} dmg
                    </span>
                  )}
                </div>
              </div>

              {m.raw_transcript && (
                <p className="font-serif text-xs italic text-[#444748] bg-[#f5f3ed] px-2.5 py-1.5 rounded">
                  “{m.raw_transcript}”
                </p>
              )}

              <div className="flex items-center gap-1.5">
                <span className="font-display text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#eae8e2] text-[#444748]">
                  {m.lang}
                </span>
                <span className="font-display text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#eae8e2] text-[#444748]">
                  {m.source}
                </span>
                {m.was_corrected && (
                  <span className="font-display text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#c6f26a] text-[#141f00]">
                    CORRECTED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});
