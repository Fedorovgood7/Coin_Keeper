import type { Account, Transaction } from '@/types';

export function formatMoney(amount: number, currency: string = 'RUB'): string {
  const symbols: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || currency;
  return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ' + symbol;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getDaysLeftInMonth(): number {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getTotalBalance(accounts: Account[]): number {
  return accounts.filter((a) => !a.isArchived).reduce((sum, a) => sum + a.balance, 0);
}

export function getTotalByType(transactions: Transaction[], type: string): number {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const date = tx.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  });
  return groups;
}
