import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Transaction, 
  SpendingCategory, 
  ViewTab, 
  DisplayOptions 
} from './types';
import { 
  loadCards, 
  saveCards, 
  loadTransactions, 
  saveTransactions, 
  loadCategories, 
  saveCategories,
  loadDisplayOptions, 
  saveDisplayOptions, 
  seedSampleData,
  seedMBJCBSampleFlow,
  resetToRealMBTransactions,
  isAppInitialized,
  markAppInitialized,
  clearAllUserData,
  loadUserProfile,
  saveUserProfile,
  loadInstallments
} from './utils/storage';
import { UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { StatementTab } from './components/StatementTab';
import { InstallmentsTab } from './components/InstallmentsTab';
import { ReportTab } from './components/ReportTab';
import { RecommenderTab } from './components/RecommenderTab';
import { LookupTab } from './components/LookupTab';
import { SettingsTab } from './components/SettingsTab';
import { TransactionModal } from './components/TransactionModal';
import { CardModal } from './components/CardModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SecurityLockModal } from './components/SecurityLockModal';
import { POPULAR_CARD_PRESETS } from './data/defaultCards';
import { 
  CloudSyncConfig, 
  loadCloudSyncConfig, 
  saveCloudSyncConfig, 
  uploadToCloud, 
  downloadFromCloud, 
  applySyncPayload 
} from './services/cloudSync';

const TAB_ROUTES: Record<ViewTab, string> = {
  overview: '#/',
  transactions: '#/transactions',
  lookup: '#/transactions',
  statements: '#/statements',
  installments: '#/installments',
  reports: '#/reports',
  recommender: '#/recommender',
  'manage-cards': '#/settings/cards',
  currency: '#/settings/currency',
  'cashback-policy': '#/settings/cashback',
  categories: '#/settings/categories',
  'toggle-cashbook': '#/settings/options',
};

function getTabFromHash(): ViewTab {
  if (typeof window === 'undefined') return 'overview';
  const hash = window.location.hash.toLowerCase();
  if (!hash || hash === '#/' || hash === '#/overview') return 'overview';
  if (hash.includes('instal') || hash.includes('tra-gop')) return 'installments';
  if (hash.includes('trans') || hash.includes('giao-dich') || hash.includes('lookup')) return 'transactions';
  if (hash.includes('statement') || hash.includes('sao-ke')) return 'statements';
  if (hash.includes('report') || hash.includes('bao-cao')) return 'reports';
  if (hash.includes('recom') || hash.includes('lua-chon')) return 'recommender';
  if (hash.includes('cards') || hash.includes('the')) return 'manage-cards';
  if (hash.includes('currency') || hash.includes('tien')) return 'currency';
  if (hash.includes('cashback') || hash.includes('hoan-tien')) return 'cashback-policy';
  if (hash.includes('cat') || hash.includes('danh-muc')) return 'categories';
  if (hash.includes('option') || hash.includes('cashbook') || hash.includes('thu-chi')) return 'toggle-cashbook';
  return 'overview';
}

export function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>(getTabFromHash);
  
  const handleSelectTab = (tab: ViewTab) => {
    setCurrentTab(tab);
    const targetHash = TAB_ROUTES[tab] || '#/';
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentTab(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Synchronously load data from localStorage on first render to prevent any race conditions or flicker
  const [cards, setCards] = useState<CreditCard[]>(() => {
    try {
      if (!isAppInitialized()) {
        const sample = seedSampleData();
        return sample.cards;
      }
      return loadCards();
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const loaded = loadTransactions();
      if (!loaded || loaded.length === 0) {
        return resetToRealMBTransactions();
      }
      return loaded;
    } catch {
      return resetToRealMBTransactions();
    }
  });

  const [categories, setCategories] = useState<SpendingCategory[]>(() => {
    try {
      return loadCategories();
    } catch {
      return [];
    }
  });

  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(() => loadDisplayOptions());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [preselectedCardId, setPreselectedCardId] = useState<string | undefined>();
  const [recommenderAmount, setRecommenderAmount] = useState<number | undefined>();
  const [recommenderCategoryId, setRecommenderCategoryId] = useState<string | undefined>();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [cloudSyncConfig, setCloudSyncConfig] = useState<CloudSyncConfig>(() => loadCloudSyncConfig());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [isSecurityLocked, setIsSecurityLocked] = useState<boolean>(() => loadUserProfile().isPinEnabled);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveUserProfile(updated);
    showSaveSuccess('Đã cập nhật hồ sơ chủ thẻ thành công!');
  };

  const showSaveSuccess = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Mark app initialized once mounted & pull latest cloud data if enabled
  useEffect(() => {
    markAppInitialized();

    // Check if user opened page with ?sync=KEY or #/?sync=KEY
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let syncParam = urlParams.get('sync');
      if (!syncParam && window.location.hash.includes('sync=')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          syncParam = hashParams.get('sync');
        }
      }

      if (syncParam && syncParam.trim().length >= 3) {
        const cleanKey = syncParam.trim().toLowerCase();
        downloadFromCloud(cleanKey).then((res) => {
          if (res.success && res.data) {
            applySyncPayload(res.data);
            const newCfg: CloudSyncConfig = {
              enabled: true,
              syncKey: cleanKey,
              autoSync: true,
              lastSyncedAt: res.data.updatedAt || new Date().toISOString(),
              lastSyncStatus: 'success',
            };
            saveCloudSyncConfig(newCfg);
            setCloudSyncConfig(newCfg);
            setCards(loadCards());
            setTransactions(loadTransactions());
            setCategories(loadCategories());
            setDisplayOptions(loadDisplayOptions());
            showSaveSuccess(`Đã tự động kết nối & đồng bộ với mã "${cleanKey}"!`);
          }
        });
        return;
      }
    } catch (e) {
      console.error('Failed to parse sync param from URL', e);
    }

    const cfg = loadCloudSyncConfig();
    if (cfg.enabled && cfg.syncKey && cfg.autoSync) {
      downloadFromCloud(cfg.syncKey).then((res) => {
        if (res.success && res.data) {
          const applied = applySyncPayload(res.data);
          if (applied) {
            setCards(loadCards());
            setTransactions(loadTransactions());
            setCategories(loadCategories());
            setDisplayOptions(loadDisplayOptions());
            setCloudSyncConfig(prev => ({
              ...prev,
              lastSyncedAt: res.data.updatedAt || new Date().toISOString(),
              lastSyncStatus: 'success',
            }));
          }
        } else if (!res.found) {
          // If the cloud blob doesn't exist yet, seed it immediately with local payload
          uploadToCloud(cfg.syncKey).then((upRes) => {
            if (upRes.success) {
              setCloudSyncConfig(prev => ({
                ...prev,
                lastSyncedAt: upRes.updatedAt || new Date().toISOString(),
                lastSyncStatus: 'success',
              }));
            }
          });
        }
      });
    }
  }, []);

  // Debounced auto-upload to cloud when local data changes
  useEffect(() => {
    if (!cloudSyncConfig.enabled || !cloudSyncConfig.autoSync || !cloudSyncConfig.syncKey) {
      return;
    }

    const timer = setTimeout(async () => {
      const res = await uploadToCloud(cloudSyncConfig.syncKey);
      if (res.success) {
        setCloudSyncConfig((prev) => {
          const next = {
            ...prev,
            lastSyncedAt: res.updatedAt || new Date().toISOString(),
            lastSyncStatus: 'success' as const,
          };
          saveCloudSyncConfig(next);
          return next;
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [cards, transactions, cloudSyncConfig.enabled, cloudSyncConfig.autoSync, cloudSyncConfig.syncKey]);

  const handleDataSynced = () => {
    setCards(loadCards());
    setTransactions(loadTransactions());
    setCategories(loadCategories());
    setDisplayOptions(loadDisplayOptions());
    setUserProfile(loadUserProfile());
    setCloudSyncConfig(loadCloudSyncConfig());
    showSaveSuccess('Đã đồng bộ dữ liệu đám mây thành công!');
  };

  // Save changes to localStorage
  const handleUpdateDisplayOptions = (newOptions: DisplayOptions) => {
    setDisplayOptions(newOptions);
    saveDisplayOptions(newOptions);
  };

  const handleSaveTransaction = (newTxData: Omit<Transaction, 'id'>, existingId?: string) => {
    if (existingId) {
      const updated = transactions.map(t => t.id === existingId ? { ...newTxData, id: existingId } : t);
      setTransactions(updated);
      saveTransactions(updated);
      showSaveSuccess('Đã cập nhật lại giao dịch thành công!');
    } else {
      const newTx: Transaction = {
        ...newTxData,
        id: `tx-${Date.now()}`,
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
      showSaveSuccess('Đã lưu giao dịch vào bộ nhớ trình duyệt!');
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    showSaveSuccess('Đã xóa giao dịch khỏi bộ nhớ!');
  };

  const handleSaveCard = (card: CreditCard) => {
    const exists = cards.some(c => c.id === card.id);
    let updated: CreditCard[];
    if (exists) {
      updated = cards.map(c => c.id === card.id ? card : c);
      showSaveSuccess(`Đã cập nhật thông tin thẻ ${card.cardName}!`);
    } else {
      updated = [...cards, card];
      showSaveSuccess(`Đã thêm mới thẻ ${card.cardName} vào bộ nhớ!`);
    }
    setCards(updated);
    saveCards(updated);
  };

  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = cards.find(c => c.id === cardId);
    if (window.confirm(`Bạn có chắc chắn muốn xóa thẻ "${cardToDelete?.bankName || ''} - ${cardToDelete?.cardName || ''}"? Dữ liệu sẽ được xóa vĩnh viễn khỏi bộ nhớ.`)) {
      const updatedCards = cards.filter(c => c.id !== cardId);
      const updatedTx = transactions.filter(t => t.cardId !== cardId);
      setCards(updatedCards);
      setTransactions(updatedTx);
      saveCards(updatedCards);
      saveTransactions(updatedTx);
      showSaveSuccess('Đã xóa thẻ khỏi bộ nhớ thành công!');
    }
  };

  const handleToggleCardActive = (cardId: string) => {
    const updated = cards.map(c => c.id === cardId ? { ...c, isActive: !c.isActive } : c);
    setCards(updated);
    saveCards(updated);
  };

  const handleSeedSampleData = () => {
    const sample = seedSampleData();
    setCards(sample.cards);
    setTransactions(sample.transactions);
    showSaveSuccess('Đã nạp lại dữ liệu mẫu vào bộ nhớ!');
  };

  const handleAddMBJCBCard = () => {
    const mbPreset = POPULAR_CARD_PRESETS.find(p => p.cardName === 'MB JCB Platinum');
    if (mbPreset) {
      const newCard: CreditCard = {
        id: `card-mb-jcb-${Date.now()}`,
        bankName: mbPreset.bankName!,
        cardName: mbPreset.cardName!,
        cardNumberLast4: '6868',
        cardType: 'jcb',
        creditLimit: mbPreset.creditLimit || 50000000,
        statementDay: mbPreset.statementDay || 8,
        paymentDueDaysAfter: 15,
        paymentDueDayFixed: 23,
        paymentMethod: 'auto_debit',
        autoDebitAccount: '004131414 - PHAM THANH SON',
        paymentRate: 'full',
        themeColor: mbPreset.themeColor || 'linear-gradient(135deg, #0b192c 0%, #1e3e62 50%, #000000 100%)',
        personalTargetSpend: 10000000,
        isActive: true,
        order: Date.now(),
        cashbackPolicy: mbPreset.cashbackPolicy!,
      };
      const updated = [newCard, ...cards];
      setCards(updated);
      saveCards(updated);
      showSaveSuccess('Đã thêm thẻ MB Bank JCB Platinum với thông tin trích nợ tự động!');
    }
  };

  const handleSeedMBJCBFlow = () => {
    const updatedTx = seedMBJCBSampleFlow();
    setTransactions(updatedTx);
    showSaveSuccess('Đã nạp 4 giao dịch mẫu MB JCB (Đạt chuẩn 3 điều kiện hoàn tiền)!');
  };

  const handleClearAllData = () => {
    if (window.confirm('Cảnh báo: Bạn có muốn xóa sạch toàn bộ thẻ và lịch sử giao dịch để bắt đầu lại từ đầu?')) {
      clearAllUserData();
      setCards([]);
      setTransactions([]);
      showSaveSuccess('Đã xóa sạch dữ liệu. Bạn có thể thêm thẻ mới!');
    }
  };

  const handleExportCSVReport = () => {
    const headers = ['Mã GD', 'Ngày', 'Thẻ', 'Danh mục', 'Số tiền (VNĐ)', 'Cashback (VNĐ)', 'Tỷ lệ %', 'Ghi chú'];
    const cardMap = new Map(cards.map(c => [c.id, `${c.bankName} ${c.cardName}`]));
    const catMap = new Map(categories.map(c => [c.id, c.name]));

    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${cardMap.get(t.cardId) || 'Thẻ'}"`,
      `"${catMap.get(t.categoryId) || 'Khác'}"`,
      t.amount,
      t.cashbackEarned,
      `${t.cashbackRate}%`,
      `"${t.note || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bao-cao-sao-ke-hoan-tien-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAddTxWithCard = (cardId?: string) => {
    setEditingTransaction(null);
    setPreselectedCardId(cardId);
    setRecommenderAmount(undefined);
    setRecommenderCategoryId(undefined);
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setPreselectedCardId(tx.cardId);
    setRecommenderAmount(undefined);
    setRecommenderCategoryId(undefined);
    setIsTransactionModalOpen(true);
  };

  const handleClearAllTransactions = () => {
    localStorage.setItem('hoantien_user_cleared_all_tx', 'true');
    setTransactions([]);
    saveTransactions([]);
    showSaveSuccess('Đã xóa toàn bộ lịch sử giao dịch!');
  };

  const handleLoadRealMBTransactions = () => {
    localStorage.removeItem('hoantien_user_cleared_all_tx');
    const realTxs = resetToRealMBTransactions();
    setTransactions(realTxs);
    showSaveSuccess('Đã nạp đầy đủ 79 giao dịch thực tế từ app MB Bank qua 4 chu kỳ!');
  };

  const handleOpenEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleRecommenderSelectCard = (cardId: string, amount?: number, categoryId?: string) => {
    setPreselectedCardId(cardId);
    setRecommenderAmount(amount);
    setRecommenderCategoryId(categoryId);
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col lg:flex-row antialiased text-slate-800 relative">
      {/* Toast Save Notification */}
      {saveToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#056c4c] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenNewTransaction={() => handleOpenAddTxWithCard()}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        userProfile={userProfile}
        onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
      />

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        <Header
          currentTab={currentTab}
          onOpenAddCard={() => {
            setEditingCard(null);
            setIsCardModalOpen(true);
          }}
          onExportReport={handleExportCSVReport}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
          cloudSyncConfig={cloudSyncConfig}
          userProfile={userProfile}
          onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
          onLockScreen={() => setIsSecurityLocked(true)}
          onSelectTab={handleSelectTab}
        />

        {/* Tab Router */}
        {currentTab === 'overview' && (
          <OverviewTab
            cards={cards}
            transactions={transactions}
            displayOptions={displayOptions}
            onUpdateDisplayOptions={handleUpdateDisplayOptions}
            onOpenAddCard={() => {
              setEditingCard(null);
              setIsCardModalOpen(true);
            }}
            onOpenAddTransaction={handleOpenAddTxWithCard}
            onEditCard={handleOpenEditCard}
            onSeedSampleData={handleSeedSampleData}
            onEditTransaction={handleOpenEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onViewAllTransactions={() => handleSelectTab('transactions')}
          />
        )}

        {(currentTab === 'transactions' || currentTab === 'lookup') && (
          <LookupTab
            cards={cards}
            categories={categories}
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddTransaction={() => handleOpenAddTxWithCard()}
            onEditTransaction={handleOpenEditTransaction}
            onClearAllTransactions={handleClearAllTransactions}
            onExportCSV={handleExportCSVReport}
            onLoadRealMBTransactions={handleLoadRealMBTransactions}
          />
        )}

        {currentTab === 'statements' && (
          <StatementTab
            cards={cards}
            transactions={transactions}
            onAddTransaction={handleOpenAddTxWithCard}
          />
        )}

        {currentTab === 'installments' && (
          <InstallmentsTab
            cards={cards}
            installments={loadInstallments()}
          />
        )}

        {currentTab === 'reports' && (
          <ReportTab
            cards={cards}
            transactions={transactions}
            categories={categories}
          />
        )}

        {currentTab === 'recommender' && (
          <RecommenderTab
            cards={cards}
            categories={categories}
            transactions={transactions}
            onSelectCardToPay={handleRecommenderSelectCard}
          />
        )}

        {(currentTab === 'manage-cards' ||
          currentTab === 'currency' ||
          currentTab === 'cashback-policy' ||
          currentTab === 'categories' ||
          currentTab === 'toggle-cashbook') && (
          <SettingsTab
            currentSubTab={currentTab}
            cards={cards}
            categories={categories}
            displayOptions={displayOptions}
            onUpdateDisplayOptions={handleUpdateDisplayOptions}
            onOpenAddCard={() => {
              setEditingCard(null);
              setIsCardModalOpen(true);
            }}
            onEditCard={handleOpenEditCard}
            onDeleteCard={handleDeleteCard}
            onToggleCardActive={handleToggleCardActive}
            onSeedSampleData={handleSeedSampleData}
            onDataImported={() => {
              setCards(loadCards());
              setTransactions(loadTransactions());
              showSaveSuccess('Đã khôi phục dữ liệu từ file!');
            }}
            onAddMBJCBCard={handleAddMBJCBCard}
            onSeedMBJCBFlow={handleSeedMBJCBFlow}
            cloudSyncConfig={cloudSyncConfig}
            onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
            onResetRealMBTransactions={handleLoadRealMBTransactions}
            onExportCSV={handleExportCSVReport}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
          setRecommenderAmount(undefined);
          setRecommenderCategoryId(undefined);
        }}
        cards={cards.filter(c => c.isActive)}
        categories={categories}
        onSave={handleSaveTransaction}
        preselectedCardId={preselectedCardId}
        initialAmount={recommenderAmount}
        initialCategoryId={recommenderCategoryId}
        editingTransaction={editingTransaction}
      />

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        editingCard={editingCard}
      />

      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => {
          setIsCloudSyncModalOpen(false);
          setCloudSyncConfig(loadCloudSyncConfig());
        }}
        onDataSynced={handleDataSynced}
      />

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        onLockScreen={() => {
          setIsUserProfileModalOpen(false);
          setIsSecurityLocked(true);
        }}
      />

      <SecurityLockModal
        isLocked={isSecurityLocked}
        userProfile={userProfile}
        onUnlock={() => setIsSecurityLocked(false)}
      />
    </div>
  );
}

export default App;
