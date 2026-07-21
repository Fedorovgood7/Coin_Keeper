import { create } from 'zustand';
import type {
  User,
  Account,
  Category,
  Transaction,
  MonthlyBudget,
  CategoryLimit,
  Goal,
  RecurringPayment,
  DashboardData,
} from '@/types';
import {
  authService,
  accountsService,
  categoriesService,
  transactionsService,
  budgetService,
  dashboardService,
  goalsService,
  recurringService,
} from '@/services';
import { removeToken } from '@/api/client';

interface AppState {
  user: User | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  monthlyBudget: MonthlyBudget | null;
  categoryLimits: CategoryLimit[];
  goals: Goal[];
  recurring: RecurringPayment[];
  dashboard: DashboardData | null;

  loading: boolean;
  error: string | null;

  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  loadAccounts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTransactions: (params?: {
    dateFrom?: string;
    dateTo?: string;
    accountId?: string;
    categoryId?: string;
    type?: string;
  }) => Promise<void>;
  loadBudget: (month: string) => Promise<void>;
  loadGoals: () => Promise<void>;
  loadRecurring: () => Promise<void>;

  createAccount: (data: { name: string; type: string; currency: string; initialBalance: number }) => Promise<void>;
  updateAccount: (id: string, name: string) => Promise<void>;
  archiveAccount: (id: string) => Promise<void>;

  updateCategory: (id: string, data: { color?: string; icon?: string }) => Promise<void>;

  createTransaction: (data: {
    type: string;
    amount: number;
    accountId: string;
    toAccountId?: string;
    categoryId: string;
    date: string;
    comment?: string;
  }) => Promise<void>;
  updateTransaction: (id: string, data: {
    amount?: number;
    categoryId?: string;
    date?: string;
    comment?: string;
  }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  setCategoryLimit: (categoryId: string, month: string, limit: number) => Promise<void>;

  createGoal: (data: { title: string; targetAmount: number; deadline: string }) => Promise<void>;
  topupGoal: (id: string, amount: number, accountId: string) => Promise<void>;

  createRecurring: (data: {
    type: string;
    amount: number;
    accountId: string;
    toAccountId?: string;
    categoryId: string;
    periodicity: string;
    nextDate: string;
    comment?: string;
  }) => Promise<void>;

  clearError: () => void;
}

export const useStore = create<AppState>()((set, get) => ({
  user: null,
  accounts: [],
  categories: [],
  transactions: [],
  monthlyBudget: null,
  categoryLimits: [],
  goals: [],
  recurring: [],
  dashboard: null,

  loading: false,
  error: null,

  login: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.loginWithYandex(code);
      set({ user: result.user, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      removeToken();
      set({
        user: null,
        accounts: [],
        categories: [],
        transactions: [],
        monthlyBudget: null,
        categoryLimits: [],
        goals: [],
        recurring: [],
        dashboard: null,
      });
    }
  },

  loadProfile: async () => {
    set({ loading: true, error: null });
    try {
      const user = await authService.getProfile();
      set({ user, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  loadDashboard: async () => {
    try {
      const dashboard = await dashboardService.getData();
      set({ 
        dashboard: {
          ...dashboard,
          topCategories: dashboard.topCategories || [],
          upcomingRecurring: dashboard.upcomingRecurring || [],
        } 
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  loadAccounts: async () => {
    try {
      const accounts = await accountsService.getAll();
      set({ accounts });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  loadCategories: async () => {
    try {
      const categories = await categoriesService.getAll();
      set({ categories });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  loadTransactions: async (params) => {
    try {
      const transactions = await transactionsService.getAll(params);
      set({ transactions });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  loadBudget: async (month: string) => {
    try {
      const monthlyBudget = await budgetService.getMonthly(month);
      set({ monthlyBudget });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  loadGoals: async () => {
    try {
      const goals = await goalsService.getAll();
      set({ goals });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  loadRecurring: async () => {
    try {
      const recurring = await recurringService.getAll();
      set({ recurring });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  createAccount: async (data) => {
    set({ loading: true, error: null });
    try {
      await accountsService.create(data);
      await get().loadAccounts();
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  updateAccount: async (id, name) => {
    set({ loading: true, error: null });
    try {
      await accountsService.update(id, name);
      await get().loadAccounts();
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  archiveAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      await accountsService.archive(id);
      await get().loadAccounts();
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await categoriesService.update(id, data);
      await get().loadCategories();
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  createTransaction: async (data) => {
    set({ loading: true, error: null });
    try {
      await transactionsService.create(data);
      await Promise.all([get().loadTransactions(), get().loadAccounts(), get().loadDashboard()]);
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  updateTransaction: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await transactionsService.update(id, data);
      await Promise.all([get().loadTransactions(), get().loadAccounts(), get().loadDashboard()]);
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      await transactionsService.delete(id);
      await Promise.all([get().loadTransactions(), get().loadAccounts(), get().loadDashboard()]);
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  setCategoryLimit: async (categoryId, month, limit) => {
    set({ loading: true, error: null });
    try {
      await budgetService.setCategoryLimit(categoryId, month, limit);
      await get().loadBudget(month);
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  createGoal: async (data) => {
    set({ loading: true, error: null });
    try {
      await goalsService.create(data);
      await get().loadGoals();
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  topupGoal: async (id, amount, accountId) => {
    set({ loading: true, error: null });
    try {
      await goalsService.topup(id, amount, accountId);
      await Promise.all([get().loadGoals(), get().loadAccounts()]);
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  createRecurring: async (data) => {
    set({ loading: true, error: null });
    try {
      await recurringService.create(data);
      await get().loadRecurring();
      set({ loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
