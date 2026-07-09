import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, Category, Transaction, Budget, Goal, User } from '@/entities/types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Продукты', icon: '🛒', color: '#4a7fd9', type: 'expense' },
  { id: 'c2', name: 'Транспорт', icon: '🚌', color: '#4a9d8b', type: 'expense' },
  { id: 'c3', name: 'Кафе', icon: '☕', color: '#e8b84d', type: 'expense' },
  { id: 'c4', name: 'Дом', icon: '🏠', color: '#e88ba8', type: 'expense' },
  { id: 'c5', name: 'Кредиты', icon: '🏦', color: '#9b8bd9', type: 'expense' },
  { id: 'c6', name: 'Здоровье', icon: '💊', color: '#4a9d8b', type: 'expense' },
  { id: 'c7', name: 'Шопинг', icon: '🛍️', color: '#b8b8c8', type: 'expense' },
  { id: 'c8', name: 'Развлечения', icon: '', color: '#e8652d', type: 'expense' },
  { id: 'c9', name: 'Зарплата', icon: '💰', color: '#4a9d5b', type: 'income' },
  { id: 'c10', name: 'Фриланс', icon: '💻', color: '#4a7fd9', type: 'income' },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'a1', name: 'Основная карта', type: 'card', balance: 775800, currency: 'RUB', color: '#1a1f2e', icon: '💳', isArchived: false },
  { id: 'a2', name: 'Накопительный счёт', type: 'savings', balance: 512000, currency: 'RUB', color: '#4a9d5b', icon: '🐷', isArchived: false },
  { id: 'a3', name: 'Наличные', type: 'cash', balance: 18500, currency: 'RUB', color: '#e8b84d', icon: '💰', isArchived: false },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'expense', amount: 850, categoryId: 'c1', accountId: 'a1', date: '2026-06-22', description: 'Продукты', isRecurring: false },
  { id: 't2', type: 'expense', amount: 150, categoryId: 'c2', accountId: 'a1', date: '2026-06-22', description: 'Транспорт', isRecurring: false },
  { id: 't3', type: 'expense', amount: 650, categoryId: 'c3', accountId: 'a1', date: '2026-06-23', description: 'Кафе', isRecurring: false },
  { id: 't4', type: 'expense', amount: 14840, categoryId: 'c5', accountId: 'a1', date: '2026-06-25', description: 'Кредит', isRecurring: true, periodicity: 'monthly' },
  { id: 't5', type: 'income', amount: 85000, categoryId: 'c9', accountId: 'a1', date: '2026-06-25', description: 'Зарплата', isRecurring: true, periodicity: 'monthly' },
];

const DEFAULT_GOALS: Goal[] = [
  { id: 'g1', name: 'Отпуск', icon: '🏖️', color: '#4a7fd9', target: 80000, current: 45000, deadline: '2026-08-01' },
  { id: 'g2', name: 'Новый ноутбук', icon: '💻', color: '#9b8bd9', target: 120000, current: 62300, deadline: '2026-12-01' },
];

const DEFAULT_BUDGET: Budget = {
  monthly: 70000,
  limits: [
    { categoryId: 'c5', limit: 15000 },
    { categoryId: 'c1', limit: 18000 },
  ],
};

interface AppState {
  user: User | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budget: Budget;
  goals: Goal[];
  isAuth: boolean;

  login: (user: User) => void;
  logout: () => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  contributeToGoal: (id: string, amount: number, fromAccountId: string) => void;
  updateBudget: (budget: Budget) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
}

const genId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      accounts: DEFAULT_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      transactions: DEFAULT_TRANSACTIONS,
      budget: DEFAULT_BUDGET,
      goals: DEFAULT_GOALS,
      isAuth: false,

      login: (user) => set({
        isAuth: true,
        user,
      }),

      logout: () => set({ isAuth: false, user: null }),

      addTransaction: (tx) => set((state) => {
        const newTx = { ...tx, id: genId() };
        const updatedAccounts = state.accounts.map((a) => {
          if (tx.type === 'income' && a.id === tx.accountId) {
            return { ...a, balance: a.balance + tx.amount };
          }
          if (tx.type === 'expense' && a.id === tx.accountId) {
            return { ...a, balance: a.balance - tx.amount };
          }
          if (tx.type === 'transfer') {
            if (a.id === tx.accountId) return { ...a, balance: a.balance - tx.amount };
            if (a.id === tx.toAccountId) return { ...a, balance: a.balance + tx.amount };
          }
          return a;
        });
        return {
          transactions: [newTx, ...state.transactions],
          accounts: updatedAccounts,
        };
      }),

      updateTransaction: (id, updates) => set((state) => {
        const oldTx = state.transactions.find((t) => t.id === id);
        if (!oldTx) return state;

        // Reverse old transaction effects
        const reversedAccounts = state.accounts.map((a) => {
          if (oldTx.type === 'income' && a.id === oldTx.accountId) {
            return { ...a, balance: a.balance - oldTx.amount };
          }
          if (oldTx.type === 'expense' && a.id === oldTx.accountId) {
            return { ...a, balance: a.balance + oldTx.amount };
          }
          if (oldTx.type === 'transfer') {
            if (a.id === oldTx.accountId) return { ...a, balance: a.balance + oldTx.amount };
            if (a.id === oldTx.toAccountId) return { ...a, balance: a.balance - oldTx.amount };
          }
          return a;
        });

        // Apply new transaction effects
        const updatedAccounts = reversedAccounts.map((a) => {
          if (updates.type === 'income' && a.id === (updates.accountId || oldTx.accountId)) {
            return { ...a, balance: a.balance + (updates.amount || oldTx.amount) };
          }
          if (updates.type === 'expense' && a.id === (updates.accountId || oldTx.accountId)) {
            return { ...a, balance: a.balance - (updates.amount || oldTx.amount) };
          }
          if (updates.type === 'transfer') {
            const fromId = updates.accountId || oldTx.accountId;
            const toId = updates.toAccountId || oldTx.toAccountId;
            if (a.id === fromId) return { ...a, balance: a.balance - (updates.amount || oldTx.amount) };
            if (a.id === toId) return { ...a, balance: a.balance + (updates.amount || oldTx.amount) };
          }
          return a;
        });

        return {
          transactions: state.transactions.map((t) => t.id === id ? { ...t, ...updates } : t),
          accounts: updatedAccounts,
        };
      }),

      deleteTransaction: (id) => set((state) => {
        const tx = state.transactions.find((t) => t.id === id);
        if (!tx) return state;

        const updatedAccounts = state.accounts.map((a) => {
          if (tx.type === 'income' && a.id === tx.accountId) {
            return { ...a, balance: a.balance - tx.amount };
          }
          if (tx.type === 'expense' && a.id === tx.accountId) {
            return { ...a, balance: a.balance + tx.amount };
          }
          if (tx.type === 'transfer') {
            if (a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
            if (a.id === tx.toAccountId) return { ...a, balance: a.balance - tx.amount };
          }
          return a;
        });

        return {
          transactions: state.transactions.filter((t) => t.id !== id),
          accounts: updatedAccounts,
        };
      }),

      addAccount: (acc) => set((state) => ({
        accounts: [...state.accounts, { ...acc, id: genId() }],
      })),

      updateAccount: (id, updates) => set((state) => ({
        accounts: state.accounts.map((a) => a.id === id ? { ...a, ...updates } : a),
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: genId() }],
      })),

      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),

      contributeToGoal: (id, amount, fromAccountId) => set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g
        ),
        accounts: state.accounts.map((a) =>
          a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
        ),
      })),

      updateBudget: (budget) => set({ budget }),

      addCategory: (cat) => set((state) => ({
        categories: [...state.categories, { ...cat, id: genId() }],
      })),
    }),
    { name: 'coinkeeper-storage' }
  )
);
