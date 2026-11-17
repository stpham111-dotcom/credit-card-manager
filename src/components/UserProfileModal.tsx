import React, { useState } from 'react';
import { X, User, Shield, KeyRound, CreditCard as CardIcon, Check, Lock, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLockScreen: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onLockScreen,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [autoDebit, setAutoDebit] = useState(userProfile.autoDebitAccount);
  const [pinCode, setPinCode] = useState(userProfile.pinCode || '1111');
  const [isPinEnabled, setIsPinEnabled] = useState(userProfile.isPinEnabled);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...userProfile,
      name,
      email,
      phone,
      autoDebitAccount: autoDebit,
      pinCode: pinCode.trim() || '1111',
      isPinEnabled,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0b192c] to-[#1e3e62] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-amber-300 font-bold border border-white/20">
              PS
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Hồ Sơ Chủ Thẻ &amp; Bảo Mật</h3>
              <span className="text-[11px] text-emerald-300 font-medium">
                {userProfile.membershipTier || 'MB JCB Platinum Priority'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên chủ thẻ
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tài khoản trích nợ tự động (100%)
              </label>
              <input
                type="text"
                value={autoDebit}
                onChange={(e) => setAutoDebit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30"
                placeholder="VD: 004131414 - PHAM THANH SON"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email thông báo sao kê
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại liên kết
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/30"
              />
            </div>
          </div>

          {/* Security & PIN Settings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#056c4c]" />
                <span className="text-xs font-bold text-slate-900">Khóa bảo vệ bằng mã PIN</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinEnabled}
                  onChange={(e) => setIsPinEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#056c4c]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div>
                <span className="text-xs text-slate-600 block">Mã PIN mở khóa (4 số):</span>
                <span className="text-[11px] text-slate-400">Mặc định: 1111</span>
              </div>
              <input
                type="password"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                className="w-24 text-center font-mono font-bold text-base px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                placeholder="1111"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockScreen();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Khóa màn hình ngay</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#056c4c] hover:bg-[#04593e] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
