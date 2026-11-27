import { useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { LangCode, StockItem } from '../types/api';

interface StockViewProps {
  items: StockItem[];
  lowStockCount: number;
  lang: LangCode;
}

type FilterMode = 'all' | 'low' | 'damaged';

export function StockView({ items, lowStockCount, lang }: StockViewProps) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const t = TRANSLATIONS[lang];

  const damagedCount = items.filter((i) => i.damaged_stock > 0).length;

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

      {/* Stock List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#dedad1] rounded-xl p-6 text-center text-sm text-[#747878]">
            No items match this filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.product_id}
              className="bg-white border border-[#dedad1] rounded-xl p-3.5 flex items-center justify-between gap-3"
            >
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

              <div className="flex items-center gap-3 shrink-0">
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
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
