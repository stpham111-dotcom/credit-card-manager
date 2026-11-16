import { 
  loadCards, 
  saveCards, 
  loadTransactions, 
  saveTransactions, 
  loadCategories, 
  saveCategories, 
  loadPaidStatus, 
  savePaidStatus, 
  loadDisplayOptions, 
  saveDisplayOptions, 
  loadInstallments, 
  saveInstallments,
  markAppInitialized
} from '../utils/storage';

const CLOUD_SYNC_KEY = 'hoantien_cloud_sync_config_v1';

export interface CloudSyncConfig {
  enabled: boolean;
  syncKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'syncing';
  lastErrorMessage?: string;
}

export const DEFAULT_CLOUD_SYNC_CONFIG: CloudSyncConfig = {
  enabled: false,
  syncKey: '',
  autoSync: true,
};

export function loadCloudSyncConfig(): CloudSyncConfig {
  try {
    const raw = localStorage.getItem(CLOUD_SYNC_KEY);
    if (!raw) return DEFAULT_CLOUD_SYNC_CONFIG;
    return { ...DEFAULT_CLOUD_SYNC_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CLOUD_SYNC_CONFIG;
  }
}

export function saveCloudSyncConfig(cfg: CloudSyncConfig) {
  try {
    localStorage.setItem(CLOUD_SYNC_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save cloud sync config', e);
  }
}

export function prepareSyncPayload() {
  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    cards: loadCards(),
    transactions: loadTransactions(),
    categories: loadCategories(),
    paidStatus: loadPaidStatus(),
    installments: loadInstallments(),
    displayOptions: loadDisplayOptions(),
  };
}

export function applySyncPayload(payload: any): boolean {
  try {
    if (!payload || typeof payload !== 'object') return false;

    if (Array.isArray(payload.cards)) {
      saveCards(payload.cards);
    }
    if (Array.isArray(payload.transactions)) {
      saveTransactions(payload.transactions);
    }
    if (Array.isArray(payload.categories)) {
      saveCategories(payload.categories);
    }
    if (payload.paidStatus && typeof payload.paidStatus === 'object') {
      savePaidStatus(payload.paidStatus);
    }
    if (Array.isArray(payload.installments)) {
      saveInstallments(payload.installments);
    }
    if (payload.displayOptions && typeof payload.displayOptions === 'object') {
      saveDisplayOptions(payload.displayOptions);
    }

    markAppInitialized();
    return true;
  } catch (e) {
    console.error('Failed to apply sync payload', e);
    return false;
  }
}

export async function uploadToCloud(
  syncKey: string,
  payload?: any
): Promise<{ success: boolean; error?: string; updatedAt?: string }> {
  try {
    const cleanKey = syncKey.trim().toLowerCase();
    if (!cleanKey || cleanKey.length < 3) {
      return { success: false, error: 'Mã đồng bộ phải có tối thiểu 3 ký tự' };
    }

    const dataPayload = payload || prepareSyncPayload();
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: cleanKey,
        payload: dataPayload,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Lỗi khi tải dữ liệu lên đám mây' };
    }

    return { success: true, updatedAt: json.updatedAt };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Không thể kết nối đến máy chủ đồng bộ' };
  }
}

export async function downloadFromCloud(
  syncKey: string
): Promise<{ success: boolean; error?: string; data?: any; found?: boolean }> {
  try {
    const cleanKey = syncKey.trim().toLowerCase();
    if (!cleanKey || cleanKey.length < 3) {
      return { success: false, error: 'Mã đồng bộ phải có tối thiểu 3 ký tự' };
    }

    const res = await fetch(`/api/sync?key=${encodeURIComponent(cleanKey)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { 
        success: false, 
        found: json.found ?? false,
        error: json.error || 'Không tìm thấy dữ liệu trên đám mây' 
      };
    }

    return { success: true, data: json.data, found: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Không thể kết nối đến máy chủ đồng bộ' };
  }
}
