import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  formatDate,
  formatDateShort,
  getDaysLeftInMonth,
  getTotalBalance,
  getTotalByType,
  getCurrentMonth,
} from '@/utils';

describe('formatMoney', () => {
  it('formats RUB correctly', () => {
    expect(formatMoney(1000)).toContain('1');
    expect(formatMoney(1000)).toContain('000');
    expect(formatMoney(1000)).toContain('₽');
    expect(formatMoney(0)).toContain('0');
  });

  it('formats USD correctly', () => {
    expect(formatMoney(1000, 'USD')).toContain('$');
  });

  it('formats EUR correctly', () => {
    expect(formatMoney(1000, 'EUR')).toContain('€');
  });
});

describe('formatDate', () => {
  it('formats date in Russian locale', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('15');
    expect(result).toContain('января');
    expect(result).toContain('2024');
  });
});

describe('formatDateShort', () => {
  it('formats date short in Russian locale', () => {
    const result = formatDateShort('2024-01-15');
    expect(result).toContain('15');
    expect(result).toContain('янв');
  });
});

describe('getDaysLeftInMonth', () => {
  it('returns positive number', () => {
    const result = getDaysLeftInMonth();
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(31);
  });
});

describe('getTotalBalance', () => {
  it('sums non-archived accounts', () => {
    const accounts = [
      { id: '1', name: 'A', type: 'card' as const, currency: 'RUB' as const, balance: 1000, initialBalance: 0, isArchived: false, createdAt: '' },
      { id: '2', name: 'B', type: 'cash' as const, currency: 'RUB' as const, balance: 500, initialBalance: 0, isArchived: false, createdAt: '' },
      { id: '3', name: 'C', type: 'card' as const, currency: 'RUB' as const, balance: 2000, initialBalance: 0, isArchived: true, createdAt: '' },
    ];
    expect(getTotalBalance(accounts)).toBe(1500);
  });

  it('returns 0 for empty array', () => {
    expect(getTotalBalance([])).toBe(0);
  });
});

describe('getTotalByType', () => {
  it('sums transactions by type', () => {
    const transactions = [
      { id: '1', type: 'income' as const, amount: 1000, accountId: 'a', categoryId: 'c', date: '', comment: '', createdAt: '' },
      { id: '2', type: 'income' as const, amount: 500, accountId: 'a', categoryId: 'c', date: '', comment: '', createdAt: '' },
      { id: '3', type: 'expense' as const, amount: 300, accountId: 'a', categoryId: 'c', date: '', comment: '', createdAt: '' },
    ];
    expect(getTotalByType(transactions, 'income')).toBe(1500);
    expect(getTotalByType(transactions, 'expense')).toBe(300);
  });
});

describe('getCurrentMonth', () => {
  it('returns YYYY-MM format', () => {
    const result = getCurrentMonth();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });
});
