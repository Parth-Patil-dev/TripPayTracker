import { TripMember, ExpenseItem, DebtSettlement } from '../types';

export const MOCK_TRIP = {
  id: 'trip-swiss-alps-2026',
  name: "Swiss Alps Adventure '26",
  subtitle: '4 travelers • Day 4 of 8 • Interlaken & Zermatt',
  currencySymbol: '$',
  totalBudget: 6500,
};

export const MOCK_MEMBERS: TripMember[] = [
  {
    id: 'm-1',
    name: 'Alex (You)',
    shortName: 'Alex',
    initials: 'AL',
    role: 'You',
    avatarColor: '#0B0B0B',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    isCurrentUser: true,
  },
  {
    id: 'm-2',
    name: 'Sarah Miller',
    shortName: 'Sarah',
    initials: 'SM',
    role: 'Sister',
    avatarColor: '#7C3AED',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'm-3',
    name: 'Marcus Miller',
    shortName: 'Marcus',
    initials: 'MM',
    role: 'Dad',
    avatarColor: '#2563EB',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'm-4',
    name: 'Elena Miller',
    shortName: 'Elena',
    initials: 'EM',
    role: 'Mom',
    avatarColor: '#059669',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
  },
];

export const MOCK_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'Glacier Express Scenic Train',
    amount: 54000,
    paidBy: 'm-1',
    createdBy: 'm-1',
    category: 'Travel',
    date: '2026-06-18',
  },
  {
    id: 'exp-2',
    title: 'Alpine Fondue & Wine Dinner',
    amount: 28550,
    paidBy: 'm-3',
    createdBy: 'm-3',
    category: 'Food',
    date: '2026-06-18',
  },
  {
    id: 'exp-3',
    title: 'Matterhorn Cable Car Passes',
    amount: 41000,
    paidBy: 'm-4',
    createdBy: 'm-4',
    category: 'Tickets',
    date: '2026-06-17',
  },
  {
    id: 'exp-4',
    title: 'Mountain Chalet Lodge (4 nights)',
    amount: 184000,
    paidBy: 'm-1',
    createdBy: 'm-1',
    category: 'Stay',
    date: '2026-06-16',
  },
  {
    id: 'exp-5',
    title: 'Highway Fuel & Tolls',
    amount: 14200,
    paidBy: 'm-2',
    createdBy: 'm-2',
    category: 'Fuel',
    date: '2026-06-16',
  },
  {
    id: 'exp-6',
    title: 'Swiss Army Knives & Souvenirs',
    amount: 19500,
    paidBy: 'm-3',
    createdBy: 'm-3',
    category: 'Shopping',
    date: '2026-06-15',
  },
  {
    id: 'exp-7',
    title: 'Lake Thun Boat Cruise',
    amount: 16000,
    paidBy: 'm-4',
    createdBy: 'm-4',
    category: 'Tickets',
    date: '2026-06-15',
  },
];

export const MOCK_CHART_DATA = [
  { day: 'Day 1', label: 'Jun 15', amount: 355, cumulative: 355 },
  { day: 'Day 2', label: 'Jun 16', amount: 1982.3, cumulative: 2337.3 },
  { day: 'Day 3', label: 'Jun 17', amount: 410, cumulative: 2747.3 },
  { day: 'Day 4', label: 'Today', amount: 825.5, cumulative: 3572.8 },
];

export const MOCK_DEBTS: DebtSettlement[] = [
  {
    id: 'debt-1',
    fromId: 'm-2', // Sarah
    toId: 'm-1', // Alex
    amount: 485.20,
    status: 'pending',
  },
  {
    id: 'debt-2',
    fromId: 'm-3', // Marcus
    toId: 'm-1', // Alex
    amount: 195.60,
    status: 'pending',
  },
  {
    id: 'debt-3',
    fromId: 'm-4', // Elena
    toId: 'm-1', // Alex
    amount: 142.10,
    status: 'pending',
  },
];
