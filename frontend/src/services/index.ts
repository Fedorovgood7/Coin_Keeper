import * as authApi from '@/api/auth';
import * as accountsApi from '@/api/accounts';
import * as categoriesApi from '@/api/categories';
import * as transactionsApi from '@/api/transactions';
import * as budgetApi from '@/api/budget';
import * as dashboardApi from '@/api/dashboard';
import * as analyticsApi from '@/api/analytics';
import * as goalsApi from '@/api/goals';
import * as recurringApi from '@/api/recurring';
import * as exportApi from '@/api/export';
import { setToken, removeToken } from '@/api/client';
import type {
  User,
  Account,
  Category,
  Transaction,
  MonthlyBudget,
  CategoryLimit,
  SafeDailyAmount,
  Goal,
  RecurringPayment,
  DashboardData,
  CategoryStatItem,
  DailyStatItem,
  IncomeExpenseComparison,
} from '@/types';

export const authService = {
  async loginWithYandex(code: string): Promise<{ token: string; user: User }> {
    const result = await authApi.loginWithYandex(code);
    console.log('[auth] login response:', result);
    if (!result.token) {
      console.error('[auth] no token in response:', result);
    }
    setToken(result.token);
    return result;
  },

  async getProfile(): Promise<User> {
    return authApi.getProfile();
  },

  async logout(): Promise<void> {
    await authApi.logout();
    removeToken();
  },
};

export const accountsService = {
  async getAll(): Promise<Account[]> {
    return accountsApi.getAccounts();
  },

  async create(data: { name: string; type: string; currency: string; initialBalance: number }): Promise<Account> {
    return accountsApi.createAccount(data);
  },

  async update(id: string, name: string): Promise<Account> {
    return accountsApi.updateAccount(id, name);
  },

  async archive(id: string): Promise<Account> {
    return accountsApi.archiveAccount(id);
  },
};

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    return categoriesApi.getCategories();
  },

  async update(id: string, data: { color?: string; icon?: string }): Promise<Category> {
    return categoriesApi.updateCategory(id, data);
  },
};

export const transactionsService = {
  async getAll(params?: {
    dateFrom?: string;
    dateTo?: string;
    accountId?: string;
    categoryId?: string;
    type?: string;
  }): Promise<Transaction[]> {
    return transactionsApi.getTransactions(params);
  },

  async create(data: {
    type: string;
    amount: number;
    accountId: string;
    toAccountId?: string;
    categoryId: string;
    date: string;
    comment?: string;
  }): Promise<Transaction> {
    return transactionsApi.createTransaction(data);
  },

  async update(id: string, data: {
    amount?: number;
    categoryId?: string;
    date?: string;
    comment?: string;
  }): Promise<Transaction> {
    return transactionsApi.updateTransaction(id, data);
  },

  async delete(id: string): Promise<void> {
    return transactionsApi.deleteTransaction(id);
  },
};

export const budgetService = {
  async getMonthly(month: string): Promise<MonthlyBudget> {
    return budgetApi.getMonthlyBudget(month);
  },

  async setCategoryLimit(categoryId: string, month: string, limit: number): Promise<CategoryLimit> {
    return budgetApi.setCategoryLimit(categoryId, month, limit);
  },

  async getSafeDailyAmount(month: string): Promise<SafeDailyAmount> {
    return budgetApi.getSafeDailyAmount(month);
  },
};

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    return dashboardApi.getDashboard();
  },
};

export const analyticsService = {
  async getCategoryStats(month: string): Promise<{ month: string; categories: CategoryStatItem[]; total: number }> {
    return analyticsApi.getCategoryStats(month);
  },

  async getDailyStats(month: string): Promise<{ month: string; days: DailyStatItem[] }> {
    return analyticsApi.getDailyStats(month);
  },

  async getIncomeExpenseComparison(month: string): Promise<IncomeExpenseComparison> {
    return analyticsApi.getIncomeExpenseComparison(month);
  },
};

export const goalsService = {
  async getAll(): Promise<Goal[]> {
    return goalsApi.getGoals();
  },

  async create(data: { title: string; targetAmount: number; deadline: string }): Promise<Goal> {
    return goalsApi.createGoal(data);
  },

  async topup(id: string, amount: number, accountId: string): Promise<Goal> {
    return goalsApi.topupGoal(id, amount, accountId);
  },
};

export const recurringService = {
  async getAll(): Promise<RecurringPayment[]> {
    return recurringApi.getRecurringPayments();
  },

  async create(data: {
    type: string;
    amount: number;
    accountId: string;
    toAccountId?: string;
    categoryId: string;
    periodicity: string;
    nextDate: string;
    comment?: string;
  }): Promise<RecurringPayment> {
    return recurringApi.createRecurring(data);
  },

  async generate(): Promise<void> {
    return recurringApi.generateRecurringTransactions();
  },
};

export const exportService = {
  csv(params?: { dateFrom?: string; dateTo?: string }): string {
    return exportApi.exportCSV(params);
  },
};
