import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { CreditCard, CardType, CategoryCashbackRule } from '../types';
import { POPULAR_CARD_PRESETS } from '../data/defaultCards';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { formatVND } from '../utils/formatters';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CreditCard) => void;
  editingCard?: CreditCard | null;
}

const COLOR_PRESETS = [
  { label: 'Deep Blue', value: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #0f172a 100%)' },
  { label: 'Emerald Forest', value: 'linear-gradient(135deg, #059669 0%, #0f766e 50%, #111827 100%)' },
  { label: 'Obsidian Black', value: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)' },
  { label: 'Ruby Crimson', value: 'linear-gradient(135deg, #be123c 0%, #881337 50%, #1c1917 100%)' },
  { label: 'Purple Royal', value: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 50%, #0f172a 100%)' },
  { label: 'Amber Gold', value: 'linear-gradient(135deg, #b45309 0%, #78350f 50%, #1c1917 100%)' },
];

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCard,
}) => {
  const [bankName, setBankName] = useState('VIB');
  const [cardName, setCardName] = useState('VIB Cash Back');
  const [cardType, setCardType] = useState<CardType>('mastercard');
  const [last4, setLast4] = useState('');
  const [limitStr, setLimitStr] = useState('50.000.000');
  const [statementDay, setStatementDay] = useState(20);
  const [dueDays, setDueDays] = useState(25);
  const [personalTargetStr, setPersonalTargetStr] = useState('');
  const [themeColor, setThemeColor] = useState(COLOR_PRESETS[0].value);

  // Cashback policy state
  const [overallCapStr, setOverallCapStr] = useState('600.000');
  const [minSpendStr, setMinSpendStr] = useState('5.000.000');
  const [defaultRate, setDefaultRate] = useState(0.5);
  const [categoryRules, setCategoryRules] = useState<CategoryCashbackRule[]>([
    { categoryId: 'dining', categoryName: 'Ẩm thực & Nhà hàng', percentage: 10, maxCashback: 300000 },
    { categoryId: 'supermarket', categoryName: 'Siêu thị & Tạp hóa', percentage: 5, maxCashback: 200000 },
  ]);

  useEffect(() => {
    if (editingCard) {
      setBankName(editingCard.bankName);
      setCardName(editingCard.cardName);
      setCardType(editingCard.cardType);
      setLast4(editingCard.cardNumberLast4 || '');
      setLimitStr(editingCard.creditLimit.toLocaleString('vi-VN'));
      setStatementDay(editingCard.statementDay);
      setDueDays(editingCard.paymentDueDaysAfter || 15);
      setPersonalTargetStr(editingCard.personalTargetSpend ? editingCard.personalTargetSpend.toLocaleString('vi-VN') : '');
      setThemeColor(editingCard.themeColor || COLOR_PRESETS[0].value);

      const p = editingCard.cashbackPolicy;
      setOverallCapStr(p.overallMaxCashback ? p.overallMaxCashback.toLocaleString('vi-VN') : '0');
      setMinSpendStr(p.minCycleSpendToQualify ? p.minCycleSpendToQualify.toLocaleString('vi-VN') : '0');
      setDefaultRate(p.defaultPercentage || 0.5);
      setCategoryRules(p.categoryRules || []);
    } else {
      // Reset to defaults
      setBankName('VIB');
      setCardName('VIB Cash Back');
      setCardType('mastercard');
      setLast4('');
      setLimitStr('50.000.000');
      setStatementDay(20);
      setDueDays(25);
      setPersonalTargetStr('');
      setThemeColor(COLOR_PRESETS[0].value);
      setOverallCapStr('600.000');
      setMinSpendStr('5.000.000');
      setDefaultRate(0.5);
      setCategoryRules([
        { categoryId: 'dining', categoryName: 'Ẩm thực & Nhà hàng', percentage: 10, maxCashback: 300000 },
        { categoryId: 'supermarket', categoryName: 'Siêu thị & Tạp hóa', percentage: 5, maxCashback: 200000 },
      ]);
    }
  }, [editingCard, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: Partial<CreditCard>) => {
    if (preset.bankName) setBankName(preset.bankName);
    if (preset.cardName) setCardName(preset.cardName);
    if (preset.cardType) setCardType(preset.cardType);
    if (preset.creditLimit) setLimitStr(preset.creditLimit.toLocaleString('vi-VN'));
    if (preset.statementDay) setStatementDay(preset.statementDay);
    if (preset.paymentDueDaysAfter) setDueDays(preset.paymentDueDaysAfter);
    if (preset.cashbackPolicy) {
      setOverallCapStr(preset.cashbackPolicy.overallMaxCashback.toLocaleString('vi-VN'));
      setMinSpendStr(preset.cashbackPolicy.minCycleSpendToQualify.toLocaleString('vi-VN'));
      setDefaultRate(preset.cashbackPolicy.defaultPercentage);
      setCategoryRules(preset.cashbackPolicy.categoryRules);
    }
  };

  const handleAddCategoryRule = () => {
    const existingIds = new Set(categoryRules.map(r => r.categoryId));
    const available = DEFAULT_CATEGORIES.find(c => !existingIds.has(c.id));
    if (available) {
      setCategoryRules([
        ...categoryRules,
        {
          categoryId: available.id,
          categoryName: available.name,
          percentage: 5,
          maxCashback: 200000,
        },
      ]);
    }
  };

  const handleRemoveCategoryRule = (index: number) => {
    setCategoryRules(categoryRules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseInt(limitStr.replace(/\D/g, ''), 10) || 10000000;
    const personalTarget = parseInt(personalTargetStr.replace(/\D/g, ''), 10) || undefined;
    const overallCap = parseInt(overallCapStr.replace(/\D/g, ''), 10) || 0;
    const minSpend = parseInt(minSpendStr.replace(/\D/g, ''), 10) || 0;

    const newCard: CreditCard = {
      id: editingCard?.id || `card-${Date.now()}`,
      bankName: bankName.trim(),
      cardName: cardName.trim(),
      cardType,
      cardNumberLast4: last4.trim() ? last4.trim().slice(-4) : undefined,
      creditLimit: limit,
      statementDay,
      paymentDueDaysAfter: dueDays,
      personalTargetSpend: personalTarget,
      themeColor,
      isActive: true,
      order: editingCard?.order || Date.now(),
      cashbackPolicy: {
        overallMaxCashback: overallCap,
        minCycleSpendToQualify: minSpend,
        defaultPercentage: defaultRate,
        categoryRules,
      },
    };

    onSave(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#edf8f2] text-[#056c4c] flex items-center justify-center">
              <CardIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingCard ? 'Chỉnh sửa thẻ tín dụng' : 'Thêm thẻ tín dụng mới'}
              </h2>
              <p className="text-xs text-slate-500">
                Cài đặt hạn mức, ngày chốt sao kê và chính sách hoàn tiền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick presets (only shown when adding new) */}
          {!editingCard && (
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Hoặc chọn nhanh mẫu thẻ phổ biến tại Việt Nam</span>
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {POPULAR_CARD_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    {p.bankName} {p.cardName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Basic info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#056c4c] border-b border-slate-100 pb-1.5">
              1. Thông tin cơ bản của thẻ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên Ngân hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="VD: VIB, Techcombank, VPBank..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên Thẻ tín dụng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="VD: Cash Back, Super Card, Step Up..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Loại thẻ
                </label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as CardType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="jcb">JCB</option>
                  <option value="napas">Napas</option>
                  <option value="amex">Amex</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  4 số cuối của thẻ
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="VD: 8892"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hạn mức tín dụng (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={limitStr}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setLimitStr(clean ? parseInt(clean, 10).toLocaleString('vi-VN') : '');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>
            </div>

            {/* Statement Day & Due date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ngày chốt sao kê
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={statementDay}
                    onChange={(e) => setStatementDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    hàng tháng
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Thời gian thanh toán
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={45}
                    required
                    value={dueDays}
                    onChange={(e) => setDueDays(parseInt(e.target.value, 10) || 15)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    ngày sau sao kê
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mục tiêu chi tiêu cá nhân (VNĐ)
                </label>
                <input
                  type="text"
                  value={personalTargetStr}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setPersonalTargetStr(clean ? parseInt(clean, 10).toLocaleString('vi-VN') : '');
                  }}
                  placeholder="VD: 15.000.000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>
            </div>

            {/* Color preview */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Màu sắc thẻ hiển thị
              </label>
              <div className="flex items-center gap-2.5">
                {COLOR_PRESETS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setThemeColor(c.value)}
                    className="w-9 h-6 rounded-md shadow-xs cursor-pointer relative transition-transform hover:scale-105"
                    style={{ background: c.value }}
                    title={c.label}
                  >
                    {themeColor === c.value && (
                      <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Cashback Policy */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#056c4c] border-b border-slate-100 pb-1.5">
              2. Chính sách hoàn tiền (Cashback)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Trần hoàn tiền tối đa / kỳ (VNĐ)
                </label>
                <input
                  type="text"
                  value={overallCapStr}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setOverallCapStr(clean ? parseInt(clean, 10).toLocaleString('vi-VN') : '0');
                  }}
                  placeholder="0 = Không giới hạn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Chi tiêu tối thiểu để được hoàn
                </label>
                <input
                  type="text"
                  value={minSpendStr}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setMinSpendStr(clean ? parseInt(clean, 10).toLocaleString('vi-VN') : '0');
                  }}
                  placeholder="0 = Không yêu cầu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tỷ lệ hoàn chi tiêu khác (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30 focus:border-[#056c4c]"
                />
              </div>
            </div>

            {/* Category-specific rules table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Tỷ lệ hoàn tiền theo từng danh mục
                </span>
                <button
                  type="button"
                  onClick={handleAddCategoryRule}
                  className="inline-flex items-center gap-1 text-xs text-[#056c4c] font-semibold hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm danh mục</span>
                </button>
              </div>

              <div className="space-y-2">
                {categoryRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex-1">
                      <select
                        value={rule.categoryId}
                        onChange={(e) => {
                          const cat = DEFAULT_CATEGORIES.find(c => c.id === e.target.value);
                          const updated = [...categoryRules];
                          updated[idx].categoryId = e.target.value;
                          if (cat) updated[idx].categoryName = cat.name;
                          setCategoryRules(updated);
                        }}
                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200"
                      >
                        {DEFAULT_CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={rule.percentage}
                          onChange={(e) => {
                            const updated = [...categoryRules];
                            updated[idx].percentage = parseFloat(e.target.value) || 0;
                            setCategoryRules(updated);
                          }}
                          className="w-full bg-white px-2 py-1.5 pr-6 rounded-lg border border-slate-200 text-right font-semibold"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="w-36">
                      <input
                        type="text"
                        placeholder="Trần hoàn VNĐ"
                        value={rule.maxCashback ? rule.maxCashback.toLocaleString('vi-VN') : ''}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, '');
                          const updated = [...categoryRules];
                          updated[idx].maxCashback = clean ? parseInt(clean, 10) : undefined;
                          setCategoryRules(updated);
                        }}
                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 font-medium text-right"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCategoryRule(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#056c4c] hover:bg-[#04593e] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {editingCard ? 'Cập nhật thẻ' : 'Lưu thẻ tín dụng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
