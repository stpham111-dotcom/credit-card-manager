import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Menu, Cloud, Bell, Lock, User, AlertTriangle, Clock, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';
import { ViewTab, UserProfile, FintechAlert } from '../types';
import { CloudSyncConfig } from '../services/cloudSync';

interface HeaderProps {
  currentTab: ViewTab;
  onOpenAddCard: () => void;
  onExportReport: () => void;
  onOpenMobileMenu: () => void;
  onOpenCloudSync?: () => void;
  cloudSyncConfig?: CloudSyncConfig;
  userProfile?: UserProfile;
  onOpenUserProfile?: () => void;
  onLockScreen?: () => void;
  onSelectTab?: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenAddCard,
  onExportReport,
  onOpenMobileMenu,
  onOpenCloudSync,
  cloudSyncConfig,
  userProfile,
  onOpenUserProfile,
  onLockScreen,
  onSelectTab,
}) => {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alerts: FintechAlert[] = [
    {
      id: 'alert-overdue-cycle-2',
      type: 'danger',
      title: 'Quá hạn thanh toán Kỳ 2 (T10)',
      message: 'Dư nợ 2.007.296 ₫ kỳ 09/09–08/10 đã quá hạn thanh toán ngày 23/10. Vui lòng thanh toán sớm để tránh phí phạt CIC.',
      date: 'Quá hạn',
      isRead: false,
      linkTab: 'statements',
    },
    {
      id: 'alert-due-cycle-3',
      type: 'warning',
      title: 'Hạn thanh toán Kỳ 3 sắp tới (23/11)',
      message: 'Kỳ sao kê vừa chốt 08/11 có dư nợ 374.754 ₫ đến hạn ngày 23/11/2026 (còn 6 ngày). Tài khoản trích nợ: 004131414.',
      date: 'Hạn 23/11',
      isRead: false,
      linkTab: 'statements',
    },
    {
      id: 'alert-uniqlo',
      type: 'info',
      title: 'Khoản trả góp UNIQLO 0% (Kỳ 1/6)',
      message: 'Đã hạch toán kỳ 1: Gốc 196.167 ₫ + Phí 56.496 ₫. Dư nợ trả góp còn lại: 980.833 ₫.',
      date: '04/11/2026',
      isRead: false,
      linkTab: 'installments',
    },
  ];

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const getTabTitles = () => {
    switch (currentTab) {
      case 'overview':
        return {
          title: 'Tổng quan thẻ tín dụng',
          subtitle: `Số liệu tính theo kỳ sao kê hiện tại của từng thẻ • Cập nhật ${new Date().toLocaleDateString('vi-VN')}`,
        };
      case 'statements':
        return {
          title: 'Quản lý sao kê & Hạn mức',
          subtitle: 'Theo dõi chu kỳ thanh toán, ngày đến hạn và dư nợ sao kê các thẻ',
        };
      case 'installments':
        return {
          title: 'Quản lý Trả góp 0% Lãi suất',
          subtitle: 'Theo dõi hợp đồng trả góp UNIQLO 6 tháng, lịch thanh toán từng kỳ và dư nợ giữ hạn mức',
        };
      case 'reports':
        return {
          title: 'Báo cáo chi tiêu & Dòng tiền',
          subtitle: 'Phân tích tổng hợp dòng tiền chi tiêu, hiệu suất hoàn tiền và đối soát 4 kỳ sao kê',
        };
      case 'recommender':
        return {
          title: 'Lựa chọn thẻ thông minh',
          subtitle: 'Nhập khoản chi tiêu sắp tới để tìm thẻ cho tỷ lệ hoàn tiền cao nhất và còn hạn mức',
        };
      case 'transactions':
      case 'lookup':
        return {
          title: 'Lịch sử & Quản lý giao dịch',
          subtitle: 'Xem lại toàn bộ 79 lần quẹt thẻ thực tế MB Bank, đối soát theo từng ngày và từng kỳ',
        };
      case 'manage-cards':
        return {
          title: 'Quản lý thẻ tín dụng',
          subtitle: 'Thẻ MB JCB Platinum 45 triệu, tài khoản trích nợ tự động 004131414',
        };
      case 'cashback-policy':
        return {
          title: 'Chính sách hoàn tiền MB JCB',
          subtitle: 'Hoàn 10% Shopee & TikTok Shop (tối đa 500k), điều kiện chi tiêu khác ≥ 2 triệu',
        };
      case 'categories':
        return {
          title: 'Danh mục chi tiêu',
          subtitle: 'Quản lý các nhóm chi tiêu để phân loại giao dịch chính xác',
        };
      case 'currency':
        return {
          title: 'Cài đặt đơn vị tiền tệ',
          subtitle: 'Định dạng hiển thị tiền tệ Việt Nam Đồng (VNĐ - ₫)',
        };
      case 'toggle-cashbook':
        return {
          title: 'Cơ sở dữ liệu & Cài đặt hệ thống',
          subtitle: 'Đồng bộ Đám mây Netlify Blobs, sao lưu JSON/CSV và bảo mật mã PIN',
        };
      default:
        return {
          title: 'Quản lý thẻ tín dụng',
          subtitle: 'Tối ưu dòng tiền và hoàn tiền thẻ tín dụng',
        };
    }
  };

  const { title, subtitle } = getTabTitles();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 pt-2 border-b border-slate-200/80 mb-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 mt-0.5 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
        {/* Cloud Sync Status Pill */}
        {onOpenCloudSync && (
          <button
            onClick={onOpenCloudSync}
            className={`inline-flex items-center gap-1.5 px-3 py-2 border text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer ${
              cloudSyncConfig?.enabled
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title={`Đám mây: ${cloudSyncConfig?.enabled ? 'Đã kết nối (' + (cloudSyncConfig.syncKey || 'stpham') + ')' : 'Chưa bật'}`}
          >
            <Cloud className={`w-3.5 h-3.5 ${cloudSyncConfig?.enabled ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{cloudSyncConfig?.enabled ? 'Đám mây: Đã kết nối' : 'Đồng bộ'}</span>
            {cloudSyncConfig?.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse ml-0.5" />
            )}
          </button>
        )}

        {/* Notifications Bell with Popover */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-2xs cursor-pointer transition-colors"
            title="Trung tâm thông báo tài chính"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Thông báo nhắc nợ &amp; Sao kê</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  {unreadCount} cần chú ý
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => {
                      if (a.linkTab && onSelectTab) onSelectTab(a.linkTab);
                      setIsAlertsOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      a.type === 'danger'
                        ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/60'
                        : a.type === 'warning'
                        ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60'
                        : 'bg-blue-50/60 border-blue-200 hover:bg-blue-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{a.title}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{a.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {a.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Lock Screen Button */}
        {onLockScreen && (
          <button
            onClick={onLockScreen}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-2xs cursor-pointer transition-colors"
            title="Khóa bảo mật màn hình ngay"
          >
            <Lock className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* User Profile Avatar Pill */}
        {onOpenUserProfile && (
          <button
            onClick={onOpenUserProfile}
            className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer transition-colors"
            title="Xem hồ sơ & cài đặt tài khoản chủ thẻ"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0b192c] to-[#1e3e62] text-amber-300 text-[10px] font-bold flex items-center justify-center">
              PS
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {userProfile?.name || 'Phạm Thanh Sơn'}
              </span>
              <span className="text-[10px] text-slate-400 block leading-none">
                {userProfile?.autoDebitAccount?.split(' - ')[0] || '004131414'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        )}

        {/* Action: Xuất báo cáo */}
        <button
          onClick={onExportReport}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Xuất báo cáo</span>
        </button>

        {/* Action: Thêm thẻ */}
        <button
          onClick={onOpenAddCard}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#056c4c] hover:bg-[#04593e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm thẻ</span>
        </button>
      </div>
    </header>
  );
};
