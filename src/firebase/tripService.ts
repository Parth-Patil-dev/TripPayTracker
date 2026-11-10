import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { TripData, TripMember, SavedTripInfo, ExpenseItem, ExpenseCategory } from '../types';

const SAVED_TRIPS_STORAGE_KEY = 'tripsplit_saved_trips';
const ACTIVE_TRIP_STORAGE_KEY = 'tripsplit_active_trip_id';
const USER_NAME_STORAGE_KEY = 'tripsplit_cached_username';

const AVATAR_COLORS = [
  '#0B0B0B',
  '#2563EB',
  '#7C3AED',
  '#059669',
  '#D97706',
  '#DC2626',
  '#0891B2',
  '#DB2777',
];

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid 0/O, 1/I confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Ensures anonymous authentication and verifies connection
 */
export async function ensureAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          resolve(cred.user);
        } catch (err) {
          unsubscribe();
          reject(err);
        }
      }
    });
  });
}

/**
 * Validates connection to Firestore at initial boot
 */
export async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connection issue. Retrying...');
    }
  }
}

// Local storage helpers
export function getSavedTrips(): SavedTripInfo[] {
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTripLocally(trip: SavedTripInfo) {
  try {
    const existing = getSavedTrips();
    const updated = [trip, ...existing.filter((t) => t.id !== trip.id)];
    localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_TRIP_STORAGE_KEY, trip.id);
  } catch (e) {
    console.error('Failed to save trip locally', e);
  }
}

export function removeSavedTrip(tripId: string) {
  try {
    const existing = getSavedTrips();
    const updated = existing.filter((t) => t.id !== tripId);
    localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(updated));
    if (localStorage.getItem(ACTIVE_TRIP_STORAGE_KEY) === tripId) {
      if (updated.length > 0) {
        localStorage.setItem(ACTIVE_TRIP_STORAGE_KEY, updated[0].id);
      } else {
        localStorage.removeItem(ACTIVE_TRIP_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error('Failed to remove trip locally', e);
  }
}

export function getActiveTripId(): string | null {
  return localStorage.getItem(ACTIVE_TRIP_STORAGE_KEY);
}

export function setActiveTripId(tripId: string) {
  localStorage.setItem(ACTIVE_TRIP_STORAGE_KEY, tripId);
}

export function getCachedUserName(): string {
  return localStorage.getItem(USER_NAME_STORAGE_KEY) || '';
}

export function setCachedUserName(name: string) {
  localStorage.setItem(USER_NAME_STORAGE_KEY, name);
}

/**
 * Creates a new trip with Creator as the first member
 */
export async function createTrip(
  name: string,
  baseCurrency: string = 'INR',
  creatorName: string
): Promise<TripData> {
  const user = await ensureAuth();
  const tripId = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const joinCode = generateJoinCode();

  const tripDocRef = doc(db, 'trips', tripId);
  const tripPayload = {
    name: name.trim(),
    baseCurrency: baseCurrency.toUpperCase().trim(),
    joinCode,
    createdAt: serverTimestamp(),
    createdByUid: user.uid,
  };

  try {
    await setDoc(tripDocRef, tripPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `trips/${tripId}`);
  }

  // Create creator member document
  const memberId = user.uid; // Use user.uid for direct deterministic identification
  const memberDocRef = doc(db, 'trips', tripId, 'members', memberId);
  const memberPayload = {
    name: creatorName.trim(),
    uid: user.uid,
    joinedAt: serverTimestamp(),
    role: 'Organizer',
  };

  try {
    await setDoc(memberDocRef, memberPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `trips/${tripId}/members/${memberId}`);
  }

  const tripData: TripData = {
    id: tripId,
    name: name.trim(),
    baseCurrency: baseCurrency.toUpperCase().trim(),
    joinCode,
    createdByUid: user.uid,
  };

  saveTripLocally({
    id: tripId,
    name: tripData.name,
    baseCurrency: tripData.baseCurrency,
    joinCode,
  });
  setCachedUserName(creatorName.trim());

  return tripData;
}

/**
 * Joins an existing trip using 6-character code
 */
export async function joinTripByCode(
  joinCode: string,
  memberName: string
): Promise<TripData> {
  const user = await ensureAuth();
  const cleanedCode = joinCode.toUpperCase().trim();
  const tripsRef = collection(db, 'trips');
  const q = query(tripsRef, where('joinCode', '==', cleanedCode));

  let querySnapshot;
  try {
    querySnapshot = await getDocs(q);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'trips');
  }

  if (querySnapshot.empty) {
    throw new Error(`Trip with join code "${cleanedCode}" was not found. Please double-check the code.`);
  }

  const tripDoc = querySnapshot.docs[0];
  const tripData = { id: tripDoc.id, ...tripDoc.data() } as TripData;

  // Add user to trip members
  const memberId = user.uid;
  const memberRef = doc(db, 'trips', tripData.id, 'members', memberId);

  try {
    await setDoc(
      memberRef,
      {
        name: memberName.trim(),
        uid: user.uid,
        joinedAt: serverTimestamp(),
        role: 'Member',
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `trips/${tripData.id}/members/${memberId}`);
  }

  saveTripLocally({
    id: tripData.id,
    name: tripData.name,
    baseCurrency: tripData.baseCurrency || 'INR',
    joinCode: tripData.joinCode,
  });
  setCachedUserName(memberName.trim());

  return tripData;
}

/**
 * Real-time listener for Trip details
 */
export function subscribeToTrip(
  tripId: string,
  onUpdate: (trip: TripData | null) => void
) {
  const tripRef = doc(db, 'trips', tripId);
  return onSnapshot(
    tripRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
      } else {
        onUpdate({ id: snapshot.id, ...snapshot.data() } as TripData);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `trips/${tripId}`);
    }
  );
}

/**
 * Real-time listener for Trip Members
 */
export function subscribeToMembers(
  tripId: string,
  currentUid: string,
  onUpdate: (members: TripMember[]) => void
) {
  const membersRef = collection(db, 'trips', tripId, 'members');
  return onSnapshot(
    membersRef,
    (snapshot) => {
      const list: TripMember[] = snapshot.docs.map((docSnap, index) => {
        const data = docSnap.data();
        const memberUid = data.uid || docSnap.id;
        const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
        const isCurrentUser = memberUid === currentUid;
        return {
          id: docSnap.id,
          name: data.name || 'Member',
          shortName: (data.name || 'Member').split(' ')[0],
          initials: getInitials(data.name || 'Member'),
          role: data.role || (isCurrentUser ? 'You' : 'Member'),
          uid: memberUid,
          joinedAt: data.joinedAt,
          avatarColor: color,
          isCurrentUser,
        };
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `trips/${tripId}/members`);
    }
  );
}

/**
 * Leave a trip
 */
export async function leaveTrip(tripId: string, memberId: string): Promise<void> {
  removeSavedTrip(tripId);
}

/**
 * Add a new expense (amount stored as integer minor units of trip's base currency)
 */
export async function addExpense(
  tripId: string,
  expense: {
    title: string;
    amount: number; // in base minor units (integer)
    category: ExpenseCategory;
    date: string;
    paidBy: string;
    currency?: string;
    originalAmount?: number;
    exchangeRate?: number;
    receiptImage?: string;
  }
): Promise<string> {
  const user = await ensureAuth();
  const expenseId = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const expenseRef = doc(db, 'trips', tripId, 'expenses', expenseId);

  const payload: any = {
    title: expense.title.trim(),
    amount: Math.round(expense.amount),
    category: expense.category,
    date: expense.date,
    paidBy: expense.paidBy,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  };

  if (expense.currency) {
    payload.currency = expense.currency.toUpperCase().trim();
  }
  if (typeof expense.originalAmount === 'number' && expense.originalAmount > 0) {
    payload.originalAmount = Math.round(expense.originalAmount);
  }
  if (typeof expense.exchangeRate === 'number' && expense.exchangeRate > 0) {
    payload.exchangeRate = Number(expense.exchangeRate);
  }
  if (expense.receiptImage && typeof expense.receiptImage === 'string') {
    payload.receiptImage = expense.receiptImage;
  }

  try {
    await setDoc(expenseRef, payload);
    return expenseId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `trips/${tripId}/expenses/${expenseId}`);
  }
}

/**
 * Update an existing expense created by the current user
 */
export async function updateExpense(
  tripId: string,
  expenseId: string,
  expense: {
    title: string;
    amount: number; // in base minor units (integer)
    category: ExpenseCategory;
    date: string;
    paidBy: string;
    currency?: string;
    originalAmount?: number;
    exchangeRate?: number;
    receiptImage?: string | null;
  }
): Promise<void> {
  const user = await ensureAuth();
  const expenseRef = doc(db, 'trips', tripId, 'expenses', expenseId);

  const payload: any = {
    title: expense.title.trim(),
    amount: Math.round(expense.amount),
    category: expense.category,
    date: expense.date,
    paidBy: expense.paidBy,
    createdBy: user.uid,
  };

  if (expense.currency) {
    payload.currency = expense.currency.toUpperCase().trim();
  }
  if (typeof expense.originalAmount === 'number' && expense.originalAmount > 0) {
    payload.originalAmount = Math.round(expense.originalAmount);
  }
  if (typeof expense.exchangeRate === 'number' && expense.exchangeRate > 0) {
    payload.exchangeRate = Number(expense.exchangeRate);
  }
  if (expense.receiptImage !== undefined) {
    payload.receiptImage = expense.receiptImage || null;
  }

  try {
    await updateDoc(expenseRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `trips/${tripId}/expenses/${expenseId}`);
  }
}

/**
 * Delete an expense created by the current user
 */
export async function deleteExpense(tripId: string, expenseId: string): Promise<void> {
  await ensureAuth();
  const expenseRef = doc(db, 'trips', tripId, 'expenses', expenseId);
  try {
    await deleteDoc(expenseRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `trips/${tripId}/expenses/${expenseId}`);
  }
}

/**
 * Real-time listener for trip expenses
 */
export function subscribeToExpenses(
  tripId: string,
  onUpdate: (expenses: ExpenseItem[]) => void
) {
  const expensesRef = collection(db, 'trips', tripId, 'expenses');
  return onSnapshot(
    expensesRef,
    (snapshot) => {
      const list: ExpenseItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || '',
          amount: typeof data.amount === 'number' ? Math.round(data.amount) : 0,
          category: (data.category as ExpenseCategory) || 'Other',
          date: data.date || new Date().toISOString().split('T')[0],
          paidBy: data.paidBy || '',
          createdBy: data.createdBy || '',
          createdAt: data.createdAt,
          currency: data.currency || undefined,
          originalAmount: typeof data.originalAmount === 'number' ? Math.round(data.originalAmount) : undefined,
          exchangeRate: typeof data.exchangeRate === 'number' ? data.exchangeRate : undefined,
          receiptImage: typeof data.receiptImage === 'string' ? data.receiptImage : undefined,
        };
      });

      // Sort descending by date, then by createdAt if available
      list.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.id.localeCompare(a.id);
      });

      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `trips/${tripId}/expenses`);
    }
  );
}

/**
 * Toggle live settlement state for a simplified debt repayment
 */
export async function setSettlementStatus(
  tripId: string,
  settlementId: string,
  isSettled: boolean,
  fromId: string,
  toId: string,
  amount: number
): Promise<void> {
  const user = await ensureAuth();
  const settlementRef = doc(db, 'trips', tripId, 'settlements', settlementId);
  try {
    await setDoc(
      settlementRef,
      {
        fromId,
        toId,
        amount,
        isSettled,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `trips/${tripId}/settlements/${settlementId}`);
  }
}

/**
 * Real-time listener for live settlement states
 */
export function subscribeToSettlements(
  tripId: string,
  onUpdate: (settlementsMap: Record<string, boolean>) => void
) {
  const settlementsRef = collection(db, 'trips', tripId, 'settlements');
  return onSnapshot(
    settlementsRef,
    (snapshot) => {
      const map: Record<string, boolean> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        map[d.id] = Boolean(data.isSettled);
      });
      onUpdate(map);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `trips/${tripId}/settlements`);
    }
  );
}


