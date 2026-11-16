import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  Download, 
  ArrowUpDown, 
  ReceiptText, 
  Gift, 
  TrendingUp, 
  CreditCard as CardIcon,
  AlertCircle,
  Tag,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { CreditCard, SpendingCategory, Transaction } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';

interface LookupTabProps {
  cards: CreditCard[];
  categories: SpendingCategory[];
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenAddTransaction: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onClearAllTransactions?: () => void;
  onExportCSV?: () => void;
  onLoadRealMBTransactions?: () => void;
}

type SortField = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'cashback-desc';

export const LookupTab: React.FC<LookupTabProps> = ({
  cards,
  categories,
  transactions,
  onDeleteTransaction,
  onOpenAddTransaction,
  onEditTransaction,
  onClearAllTransactions,
  onExportCSV,
  onLoadRealMBTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [sortBy, setSortBy] = useState<SortField>('date-desc');

  const cardMap = useMemo(() => new Map(cards.map(c => [c.id, c])), [cards]);
  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchSearch =
          !searchTerm ||
          (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (t.mcc && t.mcc.includes(searchTerm)) ||
          t.amount.toString().includes(searchTerm.replace(/\D/g, ''));

        const matchCard = selectedCardId === 'all' || t.cardId === selectedCardId;
        const matchCategory = selectedCategoryId === 'all' || t.categoryId === selectedCategoryId;

        return matchSearch && matchCard && matchCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-asc':
            return a.date.localeCompare(b.date);
          case 'amount-desc':
            return b.amount - a.amount;
          case 'amount-asc':
            return a.amount - b.amount;
          case 'cashback-desc':
            return b.cashbackEarned - a.cashbackEarned;
          case 'date-desc':
          default:
            return b.date.localeCompare(a.date);
        }
      });
  }, [transactions, searchTerm, selectedCardId, selectedCategoryId, sortBy]);

  // Metrics on filtered list
  const totalFilteredAmount = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );
  const totalFilteredCashback = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + t.cashbackEarned, 0),
    [filteredTransactions]
  );

  const handleDeleteConfirm = (tx: Transaction) => {
    const card = cardMap.get(tx.cardId);
    const cat = catMap.get(tx.categoryId);
    const desc = tx.note || cat?.name || 'Chi tiêu thẻ';
    const msg = `Bạn có chắc chắn muốn xóa giao dịch này không?\n\n• Nội dung: ${desc}\n• Số tiền: ${formatVND(tx.amount)}\n• Thẻ: ${card?.bankName || ''} - ${card?.cardName || ''}\n• Ngày: ${formatDateVN(tx.date)}`;
    
    if (window.confirm(msg)) {
      onDeleteTransaction(tx.id);
    }
  };

  const handleClearAllConfirm = () => {
    if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn XÓA TOÀN BỘ lịch sử giao dịch không? Hành động này không thể hoàn tác.')) {
      if (onClearAllTransactions) {
        onClearAllTransactions();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#edf8f2] text-[#056c4c] flex items-center justify-center shrink-0 shadow-2xs">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Lịch sử &amp; Quản lý giao dịch
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xem lại toàn bộ lịch sử quẹt thẻ, chỉnh sửa thông tin hoặc xóa nhanh các giao dịch đã nhập nhầm.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onLoadRealMBTransactions && (
            <button
              onClick={onLoadRealMBTransactions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
              title="Khôi phục hoặc nạp toàn bộ 69 giao dịch sao kê thực tế từ app MB Bank"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Nạp 69 giao dịch MB Bank</span>
            </button>
          )}

          {onExportCSV && transactions.length > 0 && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất CSV</span>
            </button>
          )}

          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#056c4c] hover:bg-[#04593e] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm giao dịch mới</span>
          </button>
        </div>
      </div>

      {/* Metric summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Số giao dịch</span>
          <span className="text-xl font-bold text-slate-900">{filteredTransactions.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {filteredTransactions.length === transactions.length 
              ? 'Tất cả giao dịch trong bộ nhớ' 
              : `Lọc từ tổng số ${transactions.length} giao dịch`}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Tổng chi tiêu theo bộ lọc</span>
          <span className="text-xl font-bold text-slate-900">{formatVND(totalFilteredAmount)}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Dòng tiền quẹt thẻ</span>
        </div>

        <div className="bg-[#edf8f2] rounded-2xl p-4 border border-[#c3e9d2] shadow-2xs">
          <span className="text-xs text-[#056c4c] font-semibold block mb-1">Tiền hoàn (Cashback) nhận được</span>
          <span className="text-xl font-bold text-[#056c4c]">{formatVND(totalFilteredCashback)}</span>
          <span className="text-[11px] text-[#056c4c]/80 block mt-0.5">
            Tỷ lệ trung bình: {totalFilteredAmount > 0 ? ((totalFilteredCashback / totalFilteredAmount) * 100).toFixed(2) : 0}%
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ghi chú, số tiền..."
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
            <option value="all">Tất cả danh mục chi tiêu</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-700 cursor-pointer"
            >
              <option value="date-desc">Ngày: Mới nhất trước</option>
              <option value="date-asc">Ngày: Cũ nhất trước</option>
              <option value="amount-desc">Số tiền: Cao xuống thấp</option>
              <option value="amount-asc">Số tiền: Thấp lên cao</option>
              <option value="cashback-desc">Cashback: Cao xuống thấp</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Tìm thấy <strong>{filteredTransactions.length}</strong> giao dịch</span>

          {transactions.length > 0 && onClearAllTransactions && (
            <button
              onClick={handleClearAllConfirm}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline cursor-pointer"
            >
              Xóa toàn bộ lịch sử giao dịch
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ReceiptText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Chưa có giao dịch nào phù hợp với bộ lọc.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thử xóa bộ lọc tìm kiếm hoặc bấm nút "Thêm giao dịch mới" để bắt đầu ghi chép.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onLoadRealMBTransactions && (
                <button
                  onClick={onLoadRealMBTransactions}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Nạp 69 giao dịch từ ảnh sao kê MB Bank (kỳ này &amp; kỳ trước)</span>
                </button>
              )}
              <button
                onClick={onOpenAddTransaction}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#056c4c] text-white text-xs font-semibold shadow-xs cursor-pointer hover:bg-[#04593e] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nhập giao dịch thủ công</span>
              </button>
            </div>
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
                    {/* Category indicator icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-2xs"
                      style={{ backgroundColor: cat?.color || '#056c4c' }}
                    >
                      {cat?.name ? cat.name.charAt(0) : 'T'}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {tx.note || cat?.name || 'Chi tiêu thẻ'}
                        </span>
                        {tx.type === 'income' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                            TIỀN VÀO
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            TIỀN RA
                          </span>
                        )}
                        {tx.mcc && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-amber-300">
                            MCC {tx.mcc}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {cat?.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-600">{formatDateVN(tx.date)}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">
                          {card?.bankName} ({card?.cardName})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    {/* Amounts */}
                    <div className="text-left sm:text-right">
                      {tx.type === 'income' ? (
                        <span className="text-base font-bold text-emerald-600 block">
                          +{formatVND(tx.amount)}
                        </span>
                      ) : (
                        <span className="text-base font-bold text-slate-900 block">
                          -{formatVND(tx.amount)}
                        </span>
                      )}
                      {tx.type !== 'income' && tx.cashbackEarned > 0 && (
                        <span className="text-xs font-semibold text-[#056c4c]">
                          +{formatVND(tx.cashbackEarned)} ({tx.cashbackRate}%)
                        </span>
                      )}
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      {onEditTransaction && (
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa giao dịch nhập nhầm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteConfirm(tx)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa giao dịch này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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