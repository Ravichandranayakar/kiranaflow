import { useState } from 'react';
import { AlertTriangle, Check, Copy, Package, SlidersHorizontal, X } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { LangCode, StockItem } from '../types/api';

interface StockViewProps {
  items: StockItem[];
  lowStockCount: number;
  lang: LangCode;
  onAdjustStock: (
    productId: number,
    usableDelta: number,
    damagedDelta: number,
    reason: string,
  ) => Promise<boolean>;
}

type FilterMode = 'all' | 'low' | 'damaged';

export function StockView({ items, lowStockCount, lang, onAdjustStock }: StockViewProps) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [usableDelta, setUsableDelta] = useState<string>('0');
  const [damagedDelta, setDamagedDelta] = useState<string>('0');
  const [reason, setReason] = useState<string>('Opening / manual stock update');
  const [savingAdjust, setSavingAdjust] = useState<boolean>(false);
  const t = TRANSLATIONS[lang];

  const openAdjust = (item: StockItem) => {
    if (editingId === item.product_id) {
      setEditingId(null);
      return;
    }
    setEditingId(item.product_id);
    setUsableDelta('0');
    setDamagedDelta('0');
    setReason('Opening / manual stock update');
  };

  const applyAdjust = async (item: StockItem) => {
    const uDelta = Number.parseInt(usableDelta || '0', 10);
    const dDelta = Number.parseInt(damagedDelta || '0', 10);
    if (Number.isNaN(uDelta) || Number.isNaN(dDelta) || (uDelta === 0 && dDelta === 0)) {
      return;
    }
    setSavingAdjust(true);
    try {
      const ok = await onAdjustStock(item.product_id, uDelta, dDelta, reason);
      if (ok) {
        setEditingId(null);
      }
    } finally {
      setSavingAdjust(false);
    }
  };

  const lowItems = items.filter((i) => i.is_low);
  const damagedCount = items.filter((i) => i.damaged_stock > 0).length;

  const handleCopyReorder = async () => {
    if (lowItems.length === 0) return;
    const lines = [
      'Namaste, please send stock for:',
      ...lowItems.map((i) => `- ${i.product_name} (only ${i.usable_stock} left)`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard unavailable in non-HTTPS contexts
    }
  };

  const filtered = items.filter((item) => {
    if (filter === 'low') return item.is_low;
    if (filter === 'damaged') return item.damaged_stock > 0;
    return true;
  });

  return (
    <section className="px-5 py-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#444748]">
            {t.liveInventory}
          </p>
          <h2 className="font-display text-xl font-semibold text-[#1b1c18]">
            {t.shopStockLedger}
          </h2>
        </div>
        <span className="font-display text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#eae8e2] text-[#1b1c18]">
          {items.length} SKUs
        </span>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 bg-[#eae8e2] p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded font-display text-[11px] font-semibold transition-colors ${
            filter === 'all' ? 'bg-[#1c1b1b] text-[#c6f26a]' : 'text-[#444748]'
          }`}
        >
          {t.allFilter} ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('low')}
          className={`flex-1 py-1.5 rounded font-display text-[11px] font-semibold transition-colors ${
            filter === 'low' ? 'bg-[#a56a2a] text-white' : 'text-[#444748]'
          }`}
        >
          {t.lowFilter} ({lowStockCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('damaged')}
          className={`flex-1 py-1.5 rounded font-display text-[11px] font-semibold transition-colors ${
            filter === 'damaged' ? 'bg-[#b54a42] text-white' : 'text-[#444748]'
          }`}
        >
          {t.damagedFilter} ({damagedCount})
        </button>
      </div>

      {/* Shareable Reorder Draft (never auto-orders) */}
      {lowItems.length > 0 && (
        <button
          type="button"
          onClick={() => void handleCopyReorder()}
          className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#dedad1] hover:border-[#1c1b1b] flex items-center justify-center gap-2 font-display text-xs font-semibold text-[#1b1c18] shadow-xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#39734c]" />
              <span className="text-[#39734c]">{t.reorderCopied}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#4b6700]" />
              <span>{t.draftReorder} ({lowItems.length})</span>
            </>
          )}
        </button>
      )}

      {/* Stock List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#dedad1] rounded-xl p-6 text-center text-sm text-[#747878]">
            No items match this filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isEditing = editingId === item.product_id;
            const parsedU = Number.parseInt(usableDelta || '0', 10) || 0;
            const parsedD = Number.parseInt(damagedDelta || '0', 10) || 0;
            const nextUsable = item.usable_stock + parsedU;
            const nextDamaged = item.damaged_stock + parsedD;
            const invalidNegative = nextUsable < 0 || nextDamaged < 0;

            return (
              <div
                key={item.product_id}
                className="bg-white border border-[#dedad1] rounded-xl p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#444748] shrink-0" />
                      <p className="font-display text-sm font-semibold text-[#1b1c18] truncate">
                        {item.product_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-display text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#f5f3ed] text-[#444748]">
                        {item.category}
                      </span>
                      {item.is_low && (
                        <span className="inline-flex items-center gap-1 font-display text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#a56a2a]/15 text-[#a56a2a]">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Low (&lt;{item.min_threshold})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <span className="block font-display text-[9px] font-semibold text-[#39734c] uppercase">
                        Usable
                      </span>
                      <span className="font-display text-lg font-semibold text-[#1b1c18]">
                        {item.usable_stock}
                      </span>
                    </div>
                    <div className="text-right pl-2 border-l border-[#eae8e2]">
                      <span className="block font-display text-[9px] font-semibold text-[#b54a42] uppercase">
                        Return
                      </span>
                      <span
                        className={`font-display text-lg font-semibold ${
                          item.damaged_stock > 0 ? 'text-[#b54a42]' : 'text-[#747878]'
                        }`}
                      >
                        {item.damaged_stock}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAdjust(item)}
                      aria-label={`Adjust stock for ${item.product_name}`}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isEditing
                          ? 'bg-[#1c1b1b] text-[#c6f26a] border-[#1c1b1b]'
                          : 'bg-[#f5f3ed] text-[#444748] border-[#dedad1] hover:border-[#1c1b1b]'
                      }`}
                    >
                      {isEditing ? (
                        <X className="w-3.5 h-3.5" />
                      ) : (
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="bg-[#fbf9f3] border border-[#eae8e2] rounded-xl p-3 space-y-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {[-5, -1, 1, 5, 10, 20].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() =>
                            setUsableDelta((prev) =>
                              String((Number.parseInt(prev || '0', 10) || 0) + step),
                            )
                          }
                          className={`px-2.5 py-1 rounded-md font-display text-[11px] font-semibold border ${
                            step < 0
                              ? 'bg-[#ffefeb]/70 border-[#f3cecb] text-[#b54a42]'
                              : 'bg-white border-[#dedad1] text-[#1b1c18] hover:bg-[#c6f26a]/40'
                          }`}
                        >
                          {step > 0 ? `+${step}` : step}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] uppercase text-[#39734c] font-bold">
                          Usable (+/-) → {nextUsable}
                        </span>
                        <input
                          type="number"
                          value={usableDelta}
                          onChange={(e) => setUsableDelta(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dedad1] text-xs font-semibold text-[#1b1c18]"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] uppercase text-[#b54a42] font-bold">
                          Return (+/-) → {nextDamaged}
                        </span>
                        <input
                          type="number"
                          value={damagedDelta}
                          onChange={(e) => setDamagedDelta(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dedad1] text-xs font-semibold text-[#1b1c18]"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason (e.g. Sold, Opening stock, Returned)"
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white border border-[#dedad1] text-xs text-[#1b1c18]"
                      />
                      <button
                        type="button"
                        disabled={
                          savingAdjust ||
                          invalidNegative ||
                          (parsedU === 0 && parsedD === 0)
                        }
                        onClick={() => void applyAdjust(item)}
                        className="px-3 py-1.5 rounded-lg bg-[#1c1b1b] text-[#c6f26a] font-display text-xs font-semibold disabled:opacity-40 shrink-0"
                      >
                        {savingAdjust ? 'Saving…' : 'Update'}
                      </button>
                    </div>

                    {invalidNegative && (
                      <p className="text-[11px] font-medium text-[#b54a42]">
                        Cannot reduce stock below 0.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
