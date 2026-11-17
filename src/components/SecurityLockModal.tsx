import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, KeyRound, AlertCircle, Fingerprint } from 'lucide-react';
import { UserProfile } from '../types';

interface SecurityLockModalProps {
  isLocked: boolean;
  userProfile: UserProfile;
  onUnlock: () => void;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  isLocked,
  userProfile,
  onUnlock,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLocked) return null;

  const targetPin = userProfile.pinCode || '1111';

  const handleKeyPress = (digit: string) => {
    if (pinInput.length >= 4) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);
    setErrorMsg(null);

    if (nextPin.length === 4) {
      if (nextPin === targetPin || nextPin === '1111') {
        setTimeout(() => {
          setPinInput('');
          onUnlock();
        }, 150);
      } else {
        setTimeout(() => {
          setErrorMsg('Mã PIN không chính xác. Mã mặc định là 1111.');
          setPinInput('');
        }, 200);
      }
    }
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg(null);
  };

  const handleDeleteOne = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  const handleQuickUnlock = () => {
    setPinInput('');
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#056c4c] to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Bảo Mật Tài Chính
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Xin chào <strong>{userProfile.name}</strong>, vui lòng nhập mã PIN để mở khóa sổ sao kê thẻ tín dụng.
        </p>

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-3.5 my-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-[#056c4c] scale-110 shadow-sm shadow-[#056c4c]/40'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl mb-4 w-full">
            {errorMsg}
          </div>
        )}

        {/* 10-Digit Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xl font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-600 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
          >
            Xóa
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 text-xl font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDeleteOne}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 text-sm font-semibold transition-all flex items-center justify-center cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* Quick unlock helper */}
        <div className="pt-2 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-400">
          <span>Mã mặc định: <strong className="text-slate-700">1111</strong></span>
          <button
            type="button"
            onClick={handleQuickUnlock}
            className="text-[#056c4c] hover:underline font-bold cursor-pointer"
          >
            Mở khóa ngay
          </button>
        </div>
      </div>
    </div>
  );
};
