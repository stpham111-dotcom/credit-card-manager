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
  isAppInitialized,
  markAppInitialized,
  clearAllUserData
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { StatementTab } from './components/StatementTab';
import { ReportTab } from './components/ReportTab';
import { RecommenderTab } from './components/RecommenderTab';
import { LookupTab } from './components/LookupTab';
import { SettingsTab } from './components/SettingsTab';
import { TransactionModal } from './components/TransactionModal';
import { CardModal } from './components/CardModal';
import { POPULAR_CARD_PRESETS } from './data/defaultCards';

export function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  
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
      if (!isAppInitialized()) {
        return seedSampleData().transactions;
      }
      return loadTransactions();
    } catch {
      return [];
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
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showSaveSuccess = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Mark app initialized once mounted
  useEffect(() => {
    markAppInitialized();
  }, []);

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
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setPreselectedCardId(tx.cardId);
    setIsTransactionModalOpen(true);
  };

  const handleClearAllTransactions = () => {
    setTransactions([]);
    saveTransactions([]);
    showSaveSuccess('Đã xóa toàn bộ lịch sử giao dịch!');
  };

  const handleOpenEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleRecommenderSelectCard = (cardId: string) => {
    setPreselectedCardId(cardId);
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
        onSelectTab={setCurrentTab}
        onOpenNewTransaction={() => handleOpenAddTxWithCard()}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
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
            onViewAllTransactions={() => setCurrentTab('transactions')}
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
          />
        )}

        {currentTab === 'statements' && (
          <StatementTab
            cards={cards}
            transactions={transactions}
            onAddTransaction={handleOpenAddTxWithCard}
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
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        cards={cards.filter(c => c.isActive)}
        categories={categories}
        onSave={handleSaveTransaction}
        preselectedCardId={preselectedCardId}
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
    </div>
  );
}

export default App;
