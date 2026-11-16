import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShoppingBag, 
  Video, 
  Sparkles, 
  FileText, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { MBJCBPillars } from '../utils/cashbackCalculator';
import { CreditCard } from '../types';
import { formatVND } from '../utils/formatters';

interface MBJCBTrackerProps {
  pillars: MBJCBPillars;
  card: CreditCard;
  onViewPolicy: () => void;
  onAddTransaction: () => void;
}

export const MBJCBTracker: React.FC<MBJCBTrackerProps> = ({
  pillars,
  card,
  onViewPolicy,
  onAddTransaction,
}) => {
  const otherPct = Math.min(100, Math.round((pillars.otherSpent / pillars.otherTarget) * 100));
  const shopeePct = Math.min(100, Math.round((pillars.shopeeSpent / pillars.shopeeTarget) * 100));
  const tiktokPct = Math.min(100, Math.round((pillars.tiktokSpent / pillars.tiktokTarget) * 100));
  const cycleCapPct = Math.min(100, Math.round((pillars.totalCycleCashback / pillars.overallCap) * 100));
  const welcomeTxPct = Math.min(100, Math.round((pillars.welcomeTxCount / pillars.welcomeTxTarget) * 100));
  const welcomeSpendPct = Math.min(100, Math.round((pillars.welcomeSpent / pillars.welcomeSpendTarget) * 100));

  return (
    <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#10243e] to-[#071324] text-white border border-slate-700/80 shadow-md">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
            JCB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-white">
                Tiến trình Điều kiện Hoàn tiền MB JCB Platinum
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Chuẩn Thể lệ MB Bank
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Kiểm soát dòng tiền 3 trụ cột: Lĩnh vực khác (≥2M), Shopee (10%), TikTok Shop (10%) &amp; Thưởng chào mừng 500k
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewPolicy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium border border-white/15 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Xem Thể lệ PDF</span>
          </button>

          <button
            onClick={onAddTransaction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm chi tiêu</span>
          </button>
        </div>
      </div>

      {/* 3 Core Condition Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        {/* Pillar 1: Prerequisite (Lĩnh vực khác) */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          pillars.isOtherMet 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100' 
            : 'bg-amber-950/30 border-amber-500/40 text-amber-100'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className={`w-4 h-4 ${pillars.isOtherMet ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>1. ĐK TIÊN QUYẾT: Lĩnh vực khác</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
              pillars.isOtherMet ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'
            }`}>
              {pillars.isOtherMet ? 'ĐÃ ĐẠT ✅' : 'CHƯA ĐẠT ⚠️'}
            </span>
          </div>

          <div className="text-sm font-bold text-white mb-1">
            {formatVND(pillars.otherSpent)} <span className="text-xs font-normal text-slate-300">/ 2.000.000 ₫</span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden my-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${pillars.isOtherMet ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${otherPct}%` }}
            />
          </div>

          <p className="text-[11px] leading-tight text-slate-300">
            {pillars.isOtherMet ? (
              <span className="text-emerald-300">Đã mở khóa hoàn tiền cho Shopee &amp; TikTok Shop!</span>
            ) : (
              <span className="text-amber-300">Thiếu {formatVND(pillars.otherMissing)} để mở khóa hoàn 10% sàn.</span>
            )}
          </p>
        </div>

        {/* Pillar 2: Shopee */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          pillars.shopeeEarned > 0 
            ? 'bg-orange-950/40 border-orange-500/40 text-orange-100' 
            : 'bg-white/5 border-white/10 text-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#ff5722]" />
              <span>2. Mua hàng Shopee (Hoàn 10%)</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
              10%
            </span>
          </div>

          <div className="text-sm font-bold text-white mb-1">
            {formatVND(pillars.shopeeSpent)} <span className="text-xs font-normal text-slate-300">/ 2.000.000 ₫</span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden my-2">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${shopeePct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300">Hoàn tiền tính được:</span>
            <strong className="text-orange-400 font-bold">{formatVND(pillars.shopeeEarned)}</strong>
          </div>
        </div>

        {/* Pillar 3: TikTok Shop */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          pillars.tiktokEarned > 0 
            ? 'bg-blue-950/40 border-blue-500/40 text-blue-100' 
            : 'bg-white/5 border-white/10 text-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Video className="w-4 h-4 text-cyan-400" />
              <span>3. TikTok Shop (Hoàn 10%)</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              10%
            </span>
          </div>

          <div className="text-sm font-bold text-white mb-1">
            {formatVND(pillars.tiktokSpent)} <span className="text-xs font-normal text-slate-300">/ 2.000.000 ₫</span>
          </div>

          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden my-2">
            <div 
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${tiktokPct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300">Hoàn tiền tính được:</span>
            <strong className="text-cyan-300 font-bold">{formatVND(pillars.tiktokEarned)}</strong>
          </div>
        </div>
      </div>

      {/* Summary Strip: Cycle Total & Welcome Offer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/10">
        {/* Cycle Cap Meter */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Tổng tiền hoàn kỳ này (Trần 500k/kỳ):</span>
            <span className="font-bold text-emerald-400">
              {formatVND(pillars.totalCycleCashback)} / {formatVND(pillars.overallCap)} ({cycleCapPct}%)
            </span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${cycleCapPct}%` }}
            />
          </div>
        </div>

        {/* Welcome Bonus Progress */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ưu đãi chào mừng: Thưởng 500.000 ₫</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Đã đạt <strong>{pillars.welcomeTxCount}/{pillars.welcomeTxTarget} giao dịch</strong> &bull; Đã chi <strong>{formatVND(pillars.welcomeSpent)}/5.000.000 ₫</strong>
            </div>
          </div>

          <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase shrink-0 ${
            pillars.isWelcomeMet 
              ? 'bg-emerald-400 text-slate-950' 
              : 'bg-amber-400 text-slate-950'
          }`}>
            {pillars.isWelcomeMet ? 'Đủ ĐK Thưởng 🎉' : 'Đang tích lũy'}
          </span>
        </div>
      </div>

      {/* Auto-Debit & Statement Status Note */}
      {card.paymentMethod === 'auto_debit' && (
        <div className="mt-3 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Sao kê: <strong>Mùng 8</strong> hàng tháng &bull; Hạn trả: <strong>Ngày 23</strong> hàng tháng</span>
          </div>
          <div className="text-slate-300">
            Trích nợ tự động 100%: <strong className="font-mono text-white">{card.autoDebitAccount || '004131414 - PHAM THANH SON'}</strong>
          </div>
        </div>
      )}
    </div>
  );
};