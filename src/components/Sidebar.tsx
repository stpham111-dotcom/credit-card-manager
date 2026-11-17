import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Star, 
  Search, 
  CreditCard, 
  Coins, 
  BadgePercent, 
  Tags, 
  Sliders, 
  Plus,
  Database,
  X,
  ReceiptText,
  Layers,
  ShieldCheck,
  User
} from 'lucide-react';
import { ViewTab, UserProfile } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewTransaction: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userProfile?: UserProfile;
  onOpenUserProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTransaction,
  isMobileOpen,
  onCloseMobile,
  userProfile,
  onOpenUserProfile,
}) => {
  const mainNavItems = [
    { id: 'overview' as ViewTab, label: 'Tổng quan', href: '#/', icon: LayoutDashboard },
    { id: 'transactions' as ViewTab, label: 'Lịch sử giao dịch', href: '#/transactions', icon: ReceiptText },
    { id: 'statements' as ViewTab, label: 'Sao kê & Hạn trả', href: '#/statements', icon: FileText },
    { id: 'installments' as ViewTab, label: 'Quản lý trả góp 0%', href: '#/installments', icon: Layers },
    { id: 'reports' as ViewTab, label: 'Báo cáo tài chính', href: '#/reports', icon: BarChart3 },
    { id: 'recommender' as ViewTab, label: 'Lựa chọn thẻ tối ưu', href: '#/recommender', icon: Star },
  ];

  const settingsNavItems = [
    { id: 'manage-cards' as ViewTab, label: 'Quản lý thẻ MB Bank', href: '#/settings/cards', icon: CreditCard },
    { id: 'currency' as ViewTab, label: 'Đơn vị tiền tệ', href: '#/settings/currency', icon: Coins },
    { id: 'cashback-policy' as ViewTab, label: 'Chính sách hoàn tiền', href: '#/settings/cashback', icon: BadgePercent },
    { id: 'categories' as ViewTab, label: 'Danh mục chi tiêu', href: '#/settings/categories', icon: Tags },
    { id: 'toggle-cashbook' as ViewTab, label: 'Cơ sở dữ liệu & Sao lưu', href: '#/settings/options', icon: Database },
  ];

  const handleNavClick = (tab: ViewTab, href: string) => {
    window.location.hash = href;
    onSelectTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/90 z-50 flex flex-col p-4 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between lg:hidden mb-2 pb-2 border-b border-slate-100">
          <span className="font-bold text-slate-800 text-sm">Menu Điều Hướng</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#056c4c] to-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 shrink-0">
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-slate-900 leading-none">
                CardMaster
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
              MB JCB Platinum Edition
            </span>
          </div>
        </div>

        {/* Primary Action Button: + Nhập giao dịch */}
        <div className="mb-4">
          <button
            onClick={() => {
              onOpenNewTransaction();
              if (isMobileOpen) onCloseMobile();
            }}
            className="w-full bg-[#056c4c] hover:bg-[#04593e] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nhập giao dịch mới</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 mb-5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id, item.href);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left cursor-pointer no-underline ${
                  isActive
                    ? 'bg-[#edf8f2] text-[#056c4c]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#056c4c]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* CÀI ĐẶT section header */}
        <div className="px-3.5 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Hệ thống &amp; Cài đặt
          </p>
        </div>

        {/* Settings Navigation */}
        <div className="space-y-0.5 overflow-y-auto flex-1 pr-1">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id, item.href);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer no-underline ${
                  isActive
                    ? 'bg-[#edf8f2] text-[#056c4c] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#056c4c]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* User Profile Card Footer */}
        {onOpenUserProfile && (
          <div 
            onClick={onOpenUserProfile}
            className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between gap-3 px-2 py-2 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
            title="Bấm để mở hồ sơ & bảo mật chủ thẻ"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0b192c] to-[#1e3e62] text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                PS
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {userProfile?.name || 'Phạm Thanh Sơn'}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {userProfile?.autoDebitAccount || '004131414 - MB Bank'}
                </p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Trạng thái trực tuyến" />
          </div>
        )}
      </aside>
    </>
  );
};
