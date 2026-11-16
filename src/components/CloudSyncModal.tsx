import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudCheck, 
  Upload, 
  Download, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Smartphone, 
  Laptop, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Sparkles
} from 'lucide-react';
import { 
  CloudSyncConfig, 
  loadCloudSyncConfig, 
  saveCloudSyncConfig, 
  uploadToCloud, 
  downloadFromCloud, 
  applySyncPayload,
  prepareSyncPayload 
} from '../services/cloudSync';
import { formatDateVN } from '../utils/formatters';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onDataSynced,
}) => {
  const [config, setConfig] = useState<CloudSyncConfig>(() => loadCloudSyncConfig());
  const [syncKeyInput, setSyncKeyInput] = useState<string>(config.syncKey || '');
  const [autoSyncInput, setAutoSyncInput] = useState<boolean>(config.autoSync);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = loadCloudSyncConfig();
      setConfig(current);
      setSyncKeyInput(current.syncKey || '');
      setAutoSyncInput(current.autoSync);
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateRandomKey = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let res = 'mb-son-';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSyncKeyInput(res);
  };

  const handlePushToCloud = async () => {
    const cleanKey = syncKeyInput.trim().toLowerCase();
    if (cleanKey.length < 3) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Mã đồng bộ có tối thiểu 3 ký tự' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Đang đẩy dữ liệu lên đám mây...' });

    const payload = prepareSyncPayload();
    const res = await uploadToCloud(cleanKey, payload);

    setIsLoading(false);
    if (res.success) {
      const updatedConfig: CloudSyncConfig = {
        enabled: true,
        syncKey: cleanKey,
        autoSync: autoSyncInput,
        lastSyncedAt: res.updatedAt || new Date().toISOString(),
        lastSyncStatus: 'success',
      };
      saveCloudSyncConfig(updatedConfig);
      setConfig(updatedConfig);
      setMessage({ 
        type: 'success', 
        text: `Đã lưu toàn bộ dữ liệu lên Đám mây với mã khóa "${cleanKey}". Bây giờ bạn có thể mở điện thoại và nhập mã này để tải về!` 
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Có lỗi xảy ra khi tải lên đám mây' });
    }
  };

  const handlePullFromCloud = async () => {
    const cleanKey = syncKeyInput.trim().toLowerCase();
    if (cleanKey.length < 3) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Mã đồng bộ có tối thiểu 3 ký tự' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Đang tải dữ liệu từ đám mây về thiết bị này...' });

    const res = await downloadFromCloud(cleanKey);

    setIsLoading(false);
    if (res.success && res.data) {
      const applied = applySyncPayload(res.data);
      if (applied) {
        const updatedConfig: CloudSyncConfig = {
          enabled: true,
          syncKey: cleanKey,
          autoSync: autoSyncInput,
          lastSyncedAt: res.data.updatedAt || new Date().toISOString(),
          lastSyncStatus: 'success',
        };
        saveCloudSyncConfig(updatedConfig);
        setConfig(updatedConfig);
        setMessage({ 
          type: 'success', 
          text: `Đồng bộ thành công! Toàn bộ thẻ, giao dịch và trả góp đã được nạp vào máy này.` 
        });
        onDataSynced();
      } else {
        setMessage({ type: 'error', text: 'Không thể áp dụng dữ liệu tải về.' });
      }
    } else {
      setMessage({ 
        type: 'error', 
        text: res.error || `Không tìm thấy dữ liệu trên đám mây với mã "${cleanKey}". Hãy kiểm tra lại mã hoặc bấm "Đẩy lên Đám mây" trước.` 
      });
    }
  };

  const handleSaveSettingsOnly = () => {
    const cleanKey = syncKeyInput.trim().toLowerCase();
    const updatedConfig: CloudSyncConfig = {
      ...config,
      enabled: cleanKey.length >= 3,
      syncKey: cleanKey,
      autoSync: autoSyncInput,
    };
    saveCloudSyncConfig(updatedConfig);
    setConfig(updatedConfig);
    setMessage({ type: 'success', text: 'Đã lưu cấu hình đồng bộ đám mây.' });
  };

  const handleDisableSync = () => {
    const updatedConfig: CloudSyncConfig = {
      enabled: false,
      syncKey: '',
      autoSync: false,
    };
    saveCloudSyncConfig(updatedConfig);
    setConfig(updatedConfig);
    setSyncKeyInput('');
    setMessage({ type: 'info', text: 'Đã tắt tính năng đồng bộ đám mây.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Tự động Đồng bộ Đám mây (Cloud Sync)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-300/30">
                  Realtime
                </span>
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Đồng bộ 2 chiều dữ liệu thẻ, giao dịch và trả góp giữa Điện thoại &amp; Máy tính
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Status Alert Banner */}
          {message && (
            <div className={`p-4 rounded-2xl text-xs flex items-start gap-3 border ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : message.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : message.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="leading-relaxed font-medium">
                {message.text}
              </div>
            </div>
          )}

          {/* Sync Key Input Group */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#056c4c]" />
                <span>Mã đồng bộ cá nhân của bạn (Sync Key):</span>
              </label>

              <button
                type="button"
                onClick={generateRandomKey}
                className="text-xs text-[#056c4c] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo mã ngẫu nhiên</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={syncKeyInput}
                onChange={(e) => setSyncKeyInput(e.target.value)}
                placeholder="Nhập mã bí mật của bạn, VD: phamthanhson hoặc mb-son-0764"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#056c4c]/20 focus:border-[#056c4c] text-sm font-mono text-slate-900 bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Mã này dùng để nhận diện và bảo mật dữ liệu của bạn trên đám mây. Bạn chỉ cần nhập đúng mã này trên cả Điện thoại và Máy tính.
            </p>

            {/* Auto sync checkbox */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={autoSyncInput}
                  onChange={(e) => setAutoSyncInput(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-[#056c4c] focus:ring-[#056c4c]"
                />
                <span>Tự động đồng bộ lên đám mây mỗi khi thêm/sửa giao dịch</span>
              </label>

              {config.enabled && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Đang hoạt động
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Push & Pull */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handlePushToCloud}
              disabled={isLoading || !syncKeyInput.trim()}
              className="px-4 py-3 rounded-2xl bg-[#056c4c] hover:bg-[#04593e] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>Đẩy dữ liệu máy này lên Đám mây (Push)</span>
            </button>

            <button
              onClick={handlePullFromCloud}
              disabled={isLoading || !syncKeyInput.trim()}
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Tải dữ liệu từ Đám mây về máy này (Pull)</span>
            </button>
          </div>

          {/* Sync status metadata */}
          {config.lastSyncedAt && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Đồng bộ gần nhất:</span>
              <strong className="text-slate-800 font-mono">
                {formatDateVN(config.lastSyncedAt.split('T')[0])} lúc {new Date(config.lastSyncedAt).toLocaleTimeString('vi-VN')}
              </strong>
            </div>
          )}

          {/* 3 Simple Steps Guide */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2.5 text-xs text-indigo-950">
            <h4 className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Cách đồng bộ giữa Điện thoại và Máy tính chỉ 3 bước:</span>
            </h4>

            <div className="space-y-2 text-slate-600 leading-relaxed pt-1">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span><strong>Trên thiết bị đã có dữ liệu (Máy tính):</strong> Nhập mã khóa bạn thích (VD: <code className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-800 font-mono">phamthanhson</code>) và bấm <strong>"Đẩy dữ liệu máy này lên Đám mây"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span><strong>Trên thiết bị cần đồng bộ (Điện thoại):</strong> Mở web trên điện thoại, bấm biểu tượng Đám mây ở góc trên, nhập đúng mã <code className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-800 font-mono">phamthanhson</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Bấm <strong>"Tải dữ liệu từ Đám mây về máy này"</strong>. Xong! Bật công tắc <em>Tự động đồng bộ</em> để mọi thay đổi từ nay về sau tự động ăn khớp tức thì!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {config.enabled ? (
            <button
              onClick={handleDisableSync}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Tắt tính năng đồng bộ
            </button>
          ) : (
            <span className="text-xs text-slate-400">Chưa kích hoạt đồng bộ</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSettingsOnly}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Lưu cấu hình
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
