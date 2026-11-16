import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Tag, Calendar, CreditCard as CardIcon } from 'lucide-react';
import { CreditCard, SpendingCategory, Transaction } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';

interface LookupTabProps {
  cards: CreditCard[];
  categories: SpendingCategory[];
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenAddTransaction: () => void;
}

export const LookupTab: React.FC<LookupTabProps> = ({
  cards,
  categories,
  transactions,
  onDeleteTransaction,
  onOpenAddTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        !searchTerm ||
        (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCard = selectedCardId === 'all' || t.cardId === selectedCardId;
      const matchCategory = selectedCategoryId === 'all' || t.categoryId === selectedCategoryId;

      return matchSearch && matchCard && matchCategory;
    }).sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [transactions, searchTerm, selectedCardId, selectedCategoryId]);

  const cardMap = useMemo(() => new Map(cards.map(c => [c.id, c])), [cards]);
  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo ghi chú, nhà hàng, đơn hàng..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
            />
          </div>

          {/* Filter card */}
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả thẻ tín dụng</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>
                {c.bankName} - {c.cardName}
              </option>
            ))}
          </select>

          {/* Filter category */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Tìm thấy <strong>{filteredTransactions.length}</strong> giao dịch</span>
          <button
            onClick={onOpenAddTransaction}
            className="text-xs font-semibold text-[#056c4c] hover:underline cursor-pointer"
          >
            + Nhập giao dịch mới
          </button>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Không tìm thấy giao dịch nào phù hợp bộ lọc.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const card = cardMap.get(tx.cardId);
              const cat = catMap.get(tx.categoryId);

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Category dot/icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-2xs"
                      style={{ backgroundColor: cat?.color || '#056c4c' }}
                    >
                      {cat?.name ? cat.name.charAt(0) : 'T'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {tx.note || cat?.name || 'Chi tiêu thẻ'}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {cat?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{formatDateVN(tx.date)}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">
                          {card?.bankName} ({card?.cardName})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-bold text-slate-900 block">
                        -{formatVND(tx.amount)}
                      </span>
                      <span className="text-xs font-semibold text-[#056c4c]">
                        +{formatVND(tx.cashbackEarned)} ({tx.cashbackRate}%)
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa giao dịch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
