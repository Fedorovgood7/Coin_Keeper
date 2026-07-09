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

export function formatMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getDaysLeftInMonth(): number {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getTotalBalance(accounts: { balance: number; isArchived?: boolean }[]): number {
  return accounts.filter((a) => !a.isArchived).reduce((sum, a) => sum + a.balance, 0);
}

export function getTotalByType(transactions: { type: string; amount: number }[], type: string): number {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

export function getSafePerDay(remaining: number): number {
  const daysLeft = getDaysLeftInMonth();
  return Math.round(remaining / daysLeft);
}

export function groupTransactionsByDate(transactions: { date: string }[]): Record<string, typeof transactions> {
  const groups: Record<string, typeof transactions> = {};
  transactions.forEach((tx) => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  return groups;
}

export function getDailyExpenses(transactions: { date: string; type: string; amount: number }[]): Record<string, number> {
  const map: Record<string, number> = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    map[t.date] = (map[t.date] || 0) + t.amount;
  });
  return map;
}

export function getExpensesByCategory(
  transactions: { type: string; categoryId: string; amount: number }[],
  categories: { id: string }[]
): { categoryId: string; amount: number }[] {
  const map: Record<string, number> = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
  });
  return Object.entries(map).map(([categoryId, amount]) => ({ categoryId, amount }));
}
