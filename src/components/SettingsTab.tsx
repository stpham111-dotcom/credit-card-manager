import React, { useState } from 'react';
import { 
  CreditCard as CardIcon, 
  Trash2, 
  Edit3, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles,
  Tag,
  Coins,
  FileText,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { CreditCard, SpendingCategory, ViewTab, DisplayOptions } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { formatVND } from '../utils/formatters';
import { MBJCBPolicyModal } from './MBJCBPolicyModal';

interface SettingsTabProps {
  currentSubTab: ViewTab;
  cards: CreditCard[];
  categories: SpendingCategory[];
  displayOptions?: DisplayOptions;
  onUpdateDisplayOptions?: (options: DisplayOptions) => void;
  onOpenAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onToggleCardActive: (id: string) => void;
  onSeedSampleData: () => void;
  onDataImported: () => void;
  onAddMBJCBCard?: () => void;
  onSeedMBJCBFlow?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentSubTab,
  cards,
  categories,
  displayOptions,
  onUpdateDisplayOptions,
  onOpenAddCard,
  onEditCard,
  onDeleteCard,
  onToggleCardActive,
  onSeedSampleData,
  onDataImported,
  onAddMBJCBCard,
  onSeedMBJCBFlow,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  const handleExport = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoantien-credit-cards-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus('Khôi phục dữ liệu thành công!');
        onDataImported();
      } else {
        setImportStatus('File sao lưu không hợp lệ.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* 1. Manage Cards */}
      {(currentSubTab === 'manage-cards' || currentSubTab === 'toggle-cashbook') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Danh sách thẻ tín dụng</h3>
              <p className="text-xs text-slate-500">Quản lý các thẻ, hạn mức và trạng thái hoạt động</p>
            </div>

            <button
              onClick={onOpenAddCard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#056c4c] hover:bg-[#04593e] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm thẻ mới</span>
            </button>
          </div>

          {/* MB Bank JCB Platinum Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0b192c] via-[#1e3e62] to-[#000000] text-white border border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-8 rounded-lg bg-white/10 backdrop-blur-xs text-[10px] font-bold flex items-center justify-center border border-white/20 shrink-0 text-amber-300">
                MB JCB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">Chính sách Thẻ MB Bank JCB Platinum</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CHUẨN MB BANK PDF
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  • <strong>Ưu đãi chào mừng:</strong> Hoàn 500.000 ₫ khi đạt 5 GD & chi &ge; 5 triệu trong 60 ngày<br />
                  • <strong>Hoàn 10% Shopee & 10% TikTok Shop:</strong> Tối đa 500.000 ₫/kỳ khi chi &ge; 2M mỗi sàn<br />
                  • <strong>Điều kiện tiên quyết:</strong> Chi tiêu <strong>Lĩnh vực khác &ge; 2.000.000 ₫</strong> trong kỳ sao kê
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Xem Thể lệ PDF</span>
              </button>

              {onSeedMBJCBFlow && (
                <button
                  type="button"
                  onClick={onSeedMBJCBFlow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  title="Nạp 4 giao dịch mẫu cho thẻ MB JCB đạt chuẩn 3 điều kiện"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Nạp dòng tiền mẫu MB JCB</span>
                </button>
              )}

              {onAddMBJCBCard && (
                <button
                  type="button"
                  onClick={onAddMBJCBCard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thẻ này</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {cards.map((card) => (
              <div
                key={card.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-8 rounded-lg shadow-2xs flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: card.themeColor }}
                  >
                    {card.bankName}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {card.bankName} - {card.cardName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Hạn mức: <strong>{formatVND(card.creditLimit)}</strong> • Ngày sao kê: ngày {card.statementDay}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onToggleCardActive(card.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      card.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {card.isActive ? 'Đang dùng' : 'Tạm ẩn'}
                  </button>

                  <button
                    onClick={() => onEditCard(card)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Chỉnh sửa thẻ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteCard(card.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Xóa thẻ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Cashback Policy Details */}
      {(currentSubTab === 'cashback-policy' || currentSubTab === 'toggle-cashbook') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chính sách hoàn tiền từng thẻ</h3>
            <p className="text-xs text-slate-500">
              Chi tiết % hoàn và trần theo danh mục ẩm thực, mua sắm online, siêu thị...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div key={card.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800">
                    {card.bankName} - {card.cardName}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold">
                    Trần: {card.cashbackPolicy.overallMaxCashback ? formatVND(card.cashbackPolicy.overallMaxCashback) : 'Vô hạn'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {card.cashbackPolicy.categoryRules.map((r, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span>{r.categoryName}</span>
                      <span className="font-bold text-[#056c4c]">
                        {r.percentage}% {r.maxCashback ? `(Max ${formatVND(r.maxCashback)})` : ''}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-slate-400 px-2 pt-1 text-[11px]">
                    <span>Chi tiêu khác:</span>
                    <span>{card.cashbackPolicy.defaultPercentage || 0.5}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Categories */}
      {currentSubTab === 'categories' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Danh mục chi tiêu có sẵn</h3>
            <p className="text-xs text-slate-500">Các nhóm danh mục chuẩn để tính tỷ lệ hoàn tiền</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{cat.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Currency Settings */}
      {currentSubTab === 'currency' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Đơn vị tiền tệ hiển thị</h3>
              <p className="text-xs text-slate-500">Mặc định ứng dụng sử dụng Việt Nam Đồng (VNĐ - ₫)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-slate-800">Việt Nam Đồng (VNĐ)</span>
                <span className="text-xs text-slate-400 block">Ký hiệu: đ, ₫</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#edf8f2] text-[#056c4c]">
                Đang kích hoạt
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Toggle Cashbook / Display Options */}
      {currentSubTab === 'toggle-cashbook' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-[#056c4c]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Bật / Tắt hiển thị tính năng &amp; Sổ thu chi</h3>
              <p className="text-xs text-slate-500">Tùy biến các khối thông tin bạn muốn xem trên giao diện ứng dụng</p>
            </div>
          </div>

          {displayOptions && onUpdateDisplayOptions && (
            <div className="space-y-3 max-w-xl">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Hiển thị tiến độ &amp; mục tiêu cá nhân</span>
                  <span className="text-[11px] text-slate-400">Xem tiến độ chi tiêu theo hạn mức và mục tiêu tháng</span>
                </div>
                <input
                  type="checkbox"
                  checked={displayOptions.showPersonalTarget}
                  onChange={(e) => onUpdateDisplayOptions({ ...displayOptions, showPersonalTarget: e.target.checked })}
                  className="rounded text-[#056c4c] focus:ring-[#056c4c] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Hiển thị số tiền hoàn (cashback) ước tính</span>
                  <span className="text-[11px] text-slate-400">Tự động tính tiền hoàn theo từng danh mục</span>
                </div>
                <input
                  type="checkbox"
                  checked={displayOptions.showEstimatedCashback}
                  onChange={(e) => onUpdateDisplayOptions({ ...displayOptions, showEstimatedCashback: e.target.checked })}
                  className="rounded text-[#056c4c] focus:ring-[#056c4c] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Hiển thị danh mục chi tiêu hoàn tiền</span>
                  <span className="text-[11px] text-slate-400">Xem phân tích % hoàn theo từng nhóm ngành hàng</span>
                </div>
                <input
                  type="checkbox"
                  checked={displayOptions.showCategoryCashback}
                  onChange={(e) => onUpdateDisplayOptions({ ...displayOptions, showCategoryCashback: e.target.checked })}
                  className="rounded text-[#056c4c] focus:ring-[#056c4c] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Hiển thị điều khoản và chính sách thẻ</span>
                  <span className="text-[11px] text-slate-400">Hiển thị các quy định hoàn tiền và trần chiết khấu</span>
                </div>
                <input
                  type="checkbox"
                  checked={displayOptions.showCardTerms}
                  onChange={(e) => onUpdateDisplayOptions({ ...displayOptions, showCardTerms: e.target.checked })}
                  className="rounded text-[#056c4c] focus:ring-[#056c4c] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Hiển thị sao kê kỳ trước</span>
                  <span className="text-[11px] text-slate-400">Xem lại dữ liệu chu kỳ trước để so sánh</span>
                </div>
                <input
                  type="checkbox"
                  checked={displayOptions.showPreviousStatement}
                  onChange={(e) => onUpdateDisplayOptions({ ...displayOptions, showPreviousStatement: e.target.checked })}
                  className="rounded text-[#056c4c] focus:ring-[#056c4c] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* 6. Data Backup & Local Storage */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Sao lưu, Khôi phục & Bảo mật dữ liệu</h3>
          <p className="text-xs text-slate-500">
            Dữ liệu được lưu trữ trực tiếp trên trình duyệt của bạn (LocalStorage), tuyệt đối bảo mật, không tải lên bất kỳ máy chủ bên thứ 3 nào.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất file sao lưu (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Khôi phục từ file JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={onSeedSampleData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Nạp lại dữ liệu thẻ & giao dịch mẫu</span>
          </button>
        </div>
      </div>

      {/* MB Bank JCB Policy Modal */}
      <MBJCBPolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />
    </div>
  );
};
