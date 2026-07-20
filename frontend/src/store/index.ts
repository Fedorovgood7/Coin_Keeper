import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Account, Category, Transaction, Budget, Goal, RecurringPayment } from '@/types';

const genId = () => Math.random().toString(36).substr(2, 9);

interface AppState {
  user: User | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  recurring: RecurringPayment[];

  login: (user: User) => void;
  logout: () => void;

  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number, fromAccountId: string) => void;

  addRecurring: (recurring: Omit<RecurringPayment, 'id'>) => void;
  updateRecurring: (id: string, updates: Partial<RecurringPayment>) => void;
  deleteRecurring: (id: string) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Еда', emoji: '', color: '#ff7043', type: 'expense' },
  { id: 'cat_2', name: 'Транспорт', emoji: '🚗', color: '#4285f4', type: 'expense' },
  { id: 'cat_3', name: 'Развлечения', emoji: '🎬', color: '#e91e63', type: 'expense' },
  { id: 'cat_4', name: 'Здоровье', emoji: '💊', color: '#4caf50', type: 'expense' },
  { id: 'cat_5', name: 'Покупки', emoji: '🛍️', color: '#7e57c2', type: 'expense' },
  { id: 'cat_6', name: 'ЖКХ', emoji: '🏠', color: '#78909c', type: 'expense' },
  { id: 'cat_7', name: 'Кафе', emoji: '☕', color: '#26a69a', type: 'expense' },
  { id: 'cat_8', name: 'Связь', emoji: '📱', color: '#f4b400', type: 'expense' },
  { id: 'cat_9', name: 'Одежда', emoji: '👕', color: '#9c27b0', type: 'expense' },
  { id: 'cat_10', name: 'Спорт', emoji: '🏋️', color: '#00bcd4', type: 'expense' },
  { id: 'cat_11', name: 'Зарплата', emoji: '💼', color: '#4caf50', type: 'income' },
  { id: 'cat_12', name: 'Фриланс', emoji: '💻', color: '#26a69a', type: 'income' },
  { id: 'cat_13', name: 'Подарки', emoji: '🎁', color: '#e91e63', type: 'income' },
  { id: 'cat_14', name: 'Инвестиции', emoji: '📈', color: '#4285f4', type: 'income' },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_1', name: 'Наличные', type: 'cash', currency: 'RUB', balance: 15000, archived: false },
  { id: 'acc_2', name: 'Сберкарта', type: 'debit', currency: 'RUB', balance: 85400, archived: false },
  { id: 'acc_3', name: 'Тинькофф', type: 'credit', currency: 'RUB', balance: 32000, archived: false },
  { id: 'acc_4', name: 'Накопительный', type: 'savings', currency: 'RUB', balance: 150000, archived: false },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      accounts: DEFAULT_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      budgets: [],
      goals: [],
      recurring: [],

      login: (user) => set({ user }),
      logout: () => set({ user: null }),

      addAccount: (account) => set((state) => ({
        accounts: [...state.accounts, { ...account, id: genId() }],
      })),
      updateAccount: (id, updates) => set((state) => ({
        accounts: state.accounts.map((a) => a.id === id ? { ...a, ...updates } : a),
      })),
      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
      })),

      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: genId() }],
      })),
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      })),

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
            if (a.id === tx.targetAccountId) return { ...a, balance: a.balance + tx.amount };
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

        const reversedAccounts = state.accounts.map((a) => {
          if (oldTx.type === 'income' && a.id === oldTx.accountId) {
            return { ...a, balance: a.balance - oldTx.amount };
          }
          if (oldTx.type === 'expense' && a.id === oldTx.accountId) {
            return { ...a, balance: a.balance + oldTx.amount };
          }
          if (oldTx.type === 'transfer') {
            if (a.id === oldTx.accountId) return { ...a, balance: a.balance + oldTx.amount };
            if (a.id === oldTx.targetAccountId) return { ...a, balance: a.balance - oldTx.amount };
          }
          return a;
        });

        const updatedAccounts = reversedAccounts.map((a) => {
          const txType = updates.type || oldTx.type;
          const amount = updates.amount || oldTx.amount;
          const accountId = updates.accountId || oldTx.accountId;
          const targetAccountId = updates.targetAccountId || oldTx.targetAccountId;

          if (txType === 'income' && a.id === accountId) {
            return { ...a, balance: a.balance + amount };
          }
          if (txType === 'expense' && a.id === accountId) {
            return { ...a, balance: a.balance - amount };
          }
          if (txType === 'transfer') {
            if (a.id === accountId) return { ...a, balance: a.balance - amount };
            if (a.id === targetAccountId) return { ...a, balance: a.balance + amount };
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
            if (a.id === tx.targetAccountId) return { ...a, balance: a.balance - tx.amount };
          }
          return a;
        });

        return {
          transactions: state.transactions.filter((t) => t.id !== id),
          accounts: updatedAccounts,
        };
      }),

      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets, { ...budget, id: genId() }],
      })),
      updateBudget: (id, updates) => set((state) => ({
        budgets: state.budgets.map((b) => b.id === id ? { ...b, ...updates } : b),
      })),
      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: genId() }],
      })),
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g),
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      })),
      contributeToGoal: (id, amount, fromAccountId) => set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g
        ),
        accounts: state.accounts.map((a) =>
          a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
        ),
      })),

      addRecurring: (recurring) => set((state) => ({
        recurring: [...state.recurring, { ...recurring, id: genId() }],
      })),
      updateRecurring: (id, updates) => set((state) => ({
        recurring: state.recurring.map((r) => r.id === id ? { ...r, ...updates } : r),
      })),
      deleteRecurring: (id) => set((state) => ({
        recurring: state.recurring.filter((r) => r.id !== id),
      })),
    }),
    { name: 'coinkeeper-storage' }
  )
);
