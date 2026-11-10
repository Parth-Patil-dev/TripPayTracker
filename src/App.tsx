/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TripData, 
  TripMember, 
  ExpenseItem, 
  TabType, 
  SavedTripInfo,
  ExpenseCategory,
  getCurrencySymbol
} from './types';
import { 
  ensureAuth, 
  validateFirestoreConnection, 
  getSavedTrips, 
  removeSavedTrip, 
  getActiveTripId, 
  setActiveTripId,
  createTrip,
  joinTripByCode,
  subscribeToTrip,
  subscribeToMembers,
  subscribeToExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  subscribeToSettlements,
  setSettlementStatus,
  getCachedUserName
} from './firebase/tripService';
import { HeaderPanel } from './components/HeaderPanel';
import { BottomTabBar } from './components/BottomTabBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ExpenseBottomSheet } from './components/ExpenseBottomSheet';
import { ShareTripModal } from './components/ShareTripModal';
import { TripSwitcherModal } from './components/TripSwitcherModal';
import { TripWelcomeScreen } from './components/TripWelcomeScreen';
import { OverviewScreen } from './screens/OverviewScreen';
import { ExpensesScreen } from './screens/ExpensesScreen';
import { BalancesScreen } from './screens/BalancesScreen';
import { SettleUpScreen } from './screens/SettleUpScreen';
import { calculateDebtSettlements, CalculatedSettlement } from './utils/debtCalculator';

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [cachedUserName, setCachedNameState] = useState<string>('');

  const [savedTrips, setSavedTrips] = useState<SavedTripInfo[]>([]);
  const [activeTripId, setActiveTripIdState] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null);
  const [members, setMembers] = useState<TripMember[]>([]);

  // Real-time expenses and settlements from Firestore
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [settlementsMap, setSettlementsMap] = useState<Record<string, boolean>>({});

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isShareTripOpen, setIsShareTripOpen] = useState(false);
  const [isTripSwitcherOpen, setIsTripSwitcherOpen] = useState(false);
  const [showDirectCreateOrJoin, setShowDirectCreateOrJoin] = useState<'create' | 'join' | null>(null);

  // Initialize Firebase anonymous auth, saved trips, and connection check
  useEffect(() => {
    async function init() {
      try {
        validateFirestoreConnection();
        const user = await ensureAuth();
        setCurrentUid(user.uid);

        const loadedSaved = getSavedTrips();
        setSavedTrips(loadedSaved);

        const cachedName = getCachedUserName();
        setCachedNameState(cachedName);

        // Check if there is an invite code in URL search params (e.g. ?code=XXXXXX)
        const urlParams = new URLSearchParams(window.location.search);
        const urlCode = urlParams.get('code');

        const storedActiveId = getActiveTripId();
        if (storedActiveId && loadedSaved.some((t) => t.id === storedActiveId)) {
          setActiveTripIdState(storedActiveId);
        } else if (loadedSaved.length > 0) {
          setActiveTripIdState(loadedSaved[0].id);
          setActiveTripId(loadedSaved[0].id);
        } else if (urlCode) {
          setShowDirectCreateOrJoin('join');
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setAuthReady(true);
      }
    }
    init();
  }, []);

  // Real-time Firestore subscription to active trip
  useEffect(() => {
    if (!activeTripId || !authReady) {
      setActiveTrip(null);
      return;
    }

    const unsubscribe = subscribeToTrip(activeTripId, (trip) => {
      if (!trip) {
        // If trip was deleted or not found
        removeSavedTrip(activeTripId);
        setSavedTrips(getSavedTrips());
        const remaining = getSavedTrips();
        if (remaining.length > 0) {
          setActiveTripIdState(remaining[0].id);
        } else {
          setActiveTripIdState(null);
        }
      } else {
        setActiveTrip(trip);
      }
    });

    return () => unsubscribe();
  }, [activeTripId, authReady]);

  // Real-time Firestore subscription to members
  useEffect(() => {
    if (!activeTripId || !authReady || !currentUid) {
      setMembers([]);
      return;
    }

    const unsubscribe = subscribeToMembers(activeTripId, currentUid, (loadedMembers) => {
      setMembers(loadedMembers);
    });

    return () => unsubscribe();
  }, [activeTripId, authReady, currentUid]);

  // Real-time Firestore subscription to expenses (instant updates on every phone)
  useEffect(() => {
    if (!activeTripId || !authReady) {
      setExpenses([]);
      return;
    }

    const unsubscribe = subscribeToExpenses(activeTripId, (loadedExpenses) => {
      setExpenses(loadedExpenses);
    });

    return () => unsubscribe();
  }, [activeTripId, authReady]);

  // Real-time Firestore subscription to live settlement states
  useEffect(() => {
    if (!activeTripId || !authReady) {
      setSettlementsMap({});
      return;
    }

    const unsubscribe = subscribeToSettlements(activeTripId, (map) => {
      setSettlementsMap(map);
    });

    return () => unsubscribe();
  }, [activeTripId, authReady]);

  // Dynamic currency symbol for current trip (default INR: ₹)
  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(activeTrip?.baseCurrency || 'INR');
  }, [activeTrip?.baseCurrency]);

  // Calculate dynamic settlements (greedy cash flow minimization using integer minor units)
  const settlements = useMemo(() => {
    if (members.length <= 1 || expenses.length === 0) return [];
    return calculateDebtSettlements(members, expenses);
  }, [members, expenses]);

  // Handle creating a new trip
  const handleCreateTrip = async (name: string, currency: string, creatorName: string) => {
    const newTrip = await createTrip(name, currency, creatorName);
    const updatedSaved = getSavedTrips();
    setSavedTrips(updatedSaved);
    setActiveTripIdState(newTrip.id);
    setActiveTrip(newTrip);
    setCachedNameState(creatorName);
    setShowDirectCreateOrJoin(null);
    setActiveTab('overview');
  };

  // Handle joining an existing trip
  const handleJoinTrip = async (code: string, memberName: string) => {
    const joinedTrip = await joinTripByCode(code, memberName);
    const updatedSaved = getSavedTrips();
    setSavedTrips(updatedSaved);
    setActiveTripIdState(joinedTrip.id);
    setActiveTrip(joinedTrip);
    setCachedNameState(memberName);
    setShowDirectCreateOrJoin(null);
    setActiveTab('overview');
  };

  // Handle switching active trip
  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    setActiveTripIdState(tripId);
    setActiveTab('overview');
  };

  // Handle leaving a trip
  const handleLeaveTrip = (tripId: string) => {
    removeSavedTrip(tripId);
    const updated = getSavedTrips();
    setSavedTrips(updated);
    if (activeTripId === tripId) {
      if (updated.length > 0) {
        setActiveTripIdState(updated[0].id);
      } else {
        setActiveTripIdState(null);
        setActiveTrip(null);
      }
    }
  };

  // Handle adding or updating expense in Firestore
  const handleSaveExpense = async (expenseData: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    paidBy: string;
    currency?: string;
    originalAmount?: number;
    exchangeRate?: number;
    receiptImage?: string;
  }) => {
    if (!activeTrip) return;

    if (editingExpense) {
      await updateExpense(activeTrip.id, editingExpense.id, expenseData);
      setEditingExpense(null);
    } else {
      await addExpense(activeTrip.id, expenseData);
    }
  };

  // Handle deleting expense in Firestore
  const handleDeleteExpense = async (expenseId: string) => {
    if (!activeTrip) return;
    await deleteExpense(activeTrip.id, expenseId);
    setEditingExpense(null);
  };

  // Toggle settlement status synced live in Firestore
  const handleToggleSettlement = async (
    settlementId: string,
    isSettled: boolean,
    fromId: string,
    toId: string,
    amount: number
  ) => {
    if (!activeTrip) return;
    await setSettlementStatus(activeTrip.id, settlementId, isSettled, fromId, toId, amount);
  };

  // Open add sheet
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  };

  // Open edit sheet
  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  // Loading Screen
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F4F4F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-[24px] bg-[#C4F96B] flex items-center justify-center text-[#0B0B0B] shadow-lg animate-pulse">
            <span className="text-2xl font-black">⚡</span>
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#3F6212] border-2 border-white animate-ping" />
        </div>
        <h2 className="text-base font-extrabold text-[#0B0B0B] tracking-tight">
          Opening TripSplit
        </h2>
        <p className="text-xs text-black/50 mt-1 max-w-xs">
          Loading offline cache &amp; real-time session
        </p>
      </div>
    );
  }

  // If user has no trip or is on create/join screen
  if (!activeTripId || !activeTrip || showDirectCreateOrJoin) {
    return (
      <div className="min-h-screen bg-[#EBEBE8] sm:py-6 flex justify-center items-start selection:bg-[#C4F96B]">
        {/* Offline Connectivity Notification */}
        <OfflineIndicator />

        <div className="w-full max-w-md min-h-screen sm:min-h-[844px] bg-[#F4F4F2] sm:rounded-[36px] sm:shadow-2xl overflow-hidden relative flex flex-col sm:border sm:border-black/10">
          <TripWelcomeScreen
            onCreateTrip={handleCreateTrip}
            onJoinTrip={handleJoinTrip}
            defaultUserName={cachedUserName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBEBE8] sm:py-6 flex justify-center items-start selection:bg-[#C4F96B]">
      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* Mobile-first Phone Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] bg-[#F4F4F2] sm:rounded-[36px] sm:shadow-2xl overflow-hidden relative flex flex-col sm:border sm:border-black/10">
        
        {/* Lime Rounded Header Panel with Trip Switcher, Join Code, and Live Avatars */}
        <HeaderPanel
          tripName={activeTrip.name}
          baseCurrency={activeTrip.baseCurrency}
          joinCode={activeTrip.joinCode}
          members={members}
          onOpenTripSwitcher={() => setIsTripSwitcherOpen(true)}
          onOpenInvite={() => setIsShareTripOpen(true)}
        />

        {/* In-App PWA Install Banner */}
        <PWAInstallBanner />

        {/* Main Tab View Area */}
        <main className="flex-1 w-full">
          {activeTab === 'overview' && (
            <OverviewScreen
              tripName={activeTrip.name}
              expenses={expenses}
              members={members}
              currencySymbol={currencySymbol}
              onOpenAddExpense={handleOpenAddExpense}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesScreen
              expenses={expenses}
              members={members}
              currentUid={currentUid}
              tripName={activeTrip.name}
              baseCurrency={activeTrip.baseCurrency}
              currencySymbol={currencySymbol}
              onOpenAddExpense={handleOpenAddExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'balances' && (
            <BalancesScreen
              members={members}
              expenses={expenses}
              currencySymbol={currencySymbol}
              onNavigateToSettle={() => setActiveTab('settle')}
            />
          )}

          {activeTab === 'settle' && (
            <SettleUpScreen
              members={members}
              settlements={settlements}
              settlementsMap={settlementsMap}
              currencySymbol={currencySymbol}
              onToggleSettlement={handleToggleSettlement}
              onOpenAddExpense={handleOpenAddExpense}
            />
          )}
        </main>

        {/* 4-Tab Bottom Navigation Bar & Floating Black Circular "+" Button */}
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenAddExpense={handleOpenAddExpense}
          expenseCount={expenses.length}
        />

        {/* Add / Edit Expense Bottom Sheet */}
        <ExpenseBottomSheet
          isOpen={isAddExpenseOpen}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setEditingExpense(null);
          }}
          members={members}
          currentUid={currentUid}
          baseCurrency={activeTrip.baseCurrency}
          currencySymbol={currencySymbol}
          initialExpense={editingExpense}
          onSaveExpense={handleSaveExpense}
          onDeleteExpense={handleDeleteExpense}
        />

        {/* Share Trip & Family Members Modal */}
        <ShareTripModal
          isOpen={isShareTripOpen}
          onClose={() => setIsShareTripOpen(false)}
          tripName={activeTrip.name}
          joinCode={activeTrip.joinCode}
          baseCurrency={activeTrip.baseCurrency}
          members={members}
        />

        {/* Trip Switcher Modal */}
        <TripSwitcherModal
          isOpen={isTripSwitcherOpen}
          onClose={() => setIsTripSwitcherOpen(false)}
          savedTrips={savedTrips}
          activeTripId={activeTrip.id}
          onSelectTrip={handleSelectTrip}
          onOpenCreate={() => {
            setShowDirectCreateOrJoin('create');
          }}
          onOpenJoin={() => {
            setShowDirectCreateOrJoin('join');
          }}
          onLeaveTrip={handleLeaveTrip}
        />
      </div>
    </div>
  );
}
