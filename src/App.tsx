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
  loadDisplayOptions, 
  saveDisplayOptions, 
  seedSampleData,
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

export function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>(loadDisplayOptions());

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [preselectedCardId, setPreselectedCardId] = useState<string | undefined>();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedCards = loadCards();
    const loadedTx = loadTransactions();
    const loadedCats = loadCategories();

    if (loadedCards.length === 0) {
      // Auto-seed with realistic sample cards and transactions on first launch
      const sample = seedSampleData();
      setCards(sample.cards);
      setTransactions(sample.transactions);
      setCategories(loadedCats);
    } else {
      setCards(loadedCards);
      setTransactions(loadedTx);
      setCategories(loadedCats);
    }
  }, []);

  // Save changes to localStorage
  const handleUpdateDisplayOptions = (newOptions: DisplayOptions) => {
    setDisplayOptions(newOptions);
    saveDisplayOptions(newOptions);
  };

  const handleSaveTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleSaveCard = (card: CreditCard) => {
    const exists = cards.some(c => c.id === card.id);
    let updated: CreditCard[];
    if (exists) {
      updated = cards.map(c => c.id === card.id ? card : c);
    } else {
      updated = [...cards, card];
    }
    setCards(updated);
    saveCards(updated);
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thẻ này và các giao dịch liên quan?')) {
      const updatedCards = cards.filter(c => c.id !== cardId);
      const updatedTx = transactions.filter(t => t.cardId !== cardId);
      setCards(updatedCards);
      setTransactions(updatedTx);
      saveCards(updatedCards);
      saveTransactions(updatedTx);
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
    setPreselectedCardId(cardId);
    setIsTransactionModalOpen(true);
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
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col lg:flex-row antialiased text-slate-800">
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

        {currentTab === 'lookup' && (
          <LookupTab
            cards={cards}
            categories={categories}
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddTransaction={() => handleOpenAddTxWithCard()}
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
            }}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        cards={cards.filter(c => c.isActive)}
        categories={categories}
        onSave={handleSaveTransaction}
        preselectedCardId={preselectedCardId}
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
