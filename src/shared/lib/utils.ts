const CK = (window as any).CK;

CK.EMOJIS = [
  '🏠','🍔','🚗','🎮','💊','📚','👕','🎁',
  '⚽','💄','📱','✈️','🔧','📞','☕','🎵',
  '💰','💳','🏦','📈','🎯','🛒','💡','🎓',
  '🏋️','🍕','🚌','🎬','🏥','📖','👟','🎂'
];

CK.COLORS = [
  '#fff4ed','#fef3c7','#edf7ef','#eef4ff',
  '#f3e8ff','#fce7f3','#fef2f2','#ecfdf5',
  '#fffbeb','#f0f9ff','#faf5ff','#fdf2f8'
];

CK.CHART_COLORS = ['#15191e','#ff5900','#8c8c8c','#dbdbdb','#b0b0b0','#1a8d3e','#d63030'];

CK.MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
CK.MONTHS_FULL = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
CK.WEEKDAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];

CK.FREQ_LABELS = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно'
};

CK.TYPE_LABELS = {
  card: 'Карта',
  cash: 'Наличные',
  savings: 'Накопительный'
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' ₽';
}

function formatDateShort(d: string): { day: string; month: string } {
  const date = new Date(d);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: CK.MONTHS[date.getMonth()]
  };
}

function formatDateFull(d: string): string {
  const parts = d.split('-');
  const day = parseInt(parts[2]);
  const month = CK.MONTHS_FULL[parseInt(parts[1]) - 1];
  const date = new Date(d);
  const weekday = CK.WEEKDAYS[date.getDay()];
  return weekday + ', ' + day + ' ' + month;
}

function parseAmount(value: string): number {
  return parseFloat((value || '').replace(/[^\d.]/g, '')) || 0;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getExpensesByCategory(transactions: any[], categories: any[]): any[] {
  const map: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
  });
  return Object.keys(map).map(catId => {
    const cat = categories.find(c => c.id === catId);
    return { category: cat, amount: map[catId] };
  }).filter(e => e.category).sort((a, b) => b.amount - a.amount);
}

function getTotalBalance(accounts: any[]): number {
  return accounts.reduce((s, a) => s + a.balance, 0);
}

function getTotalIncome(transactions: any[]): number {
  return transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
}

function getTotalExpense(transactions: any[]): number {
  return transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
}

function getBudgetStats(transactions: any[], budget: any): any {
  const totalExpense = getTotalExpense(transactions);
  const remaining = budget.monthly - totalExpense;
  const percent = budget.monthly > 0 ? Math.round((totalExpense / budget.monthly) * 100) : 0;
  return { totalExpense, remaining, percent };
}

function getSafePerDay(budgetRemaining: number): any {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(1, Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const perDay = Math.max(0, budgetRemaining) / daysLeft;
  return { perDay: Math.round(perDay), daysLeft };
}

function getRecurringPayments(transactions: any[]): any[] {
  return transactions
    .filter(t => t.recurring && t.type === 'expense')
    .sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate());
}

function getPieSegments(expenseByCategory: any[], maxSegments = 5): any {
  const totalExp = expenseByCategory.reduce((s, e) => s + e.amount, 0);
  const segments: any[] = [];
  let offset = 25;
  expenseByCategory.slice(0, maxSegments).forEach((entry, i) => {
    const pct = totalExp > 0 ? (entry.amount / totalExp) * 100 : 0;
    segments.push({ pct, offset, color: CK.CHART_COLORS[i % CK.CHART_COLORS.length] });
    offset -= pct;
  });
  return { segments, total: totalExp };
}

function filterTransactions(transactions: any[], filterType: string, filterCategory: string, filterAccount: string): any[] {
  return transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory && tx.categoryId !== filterCategory) return false;
    if (filterAccount && tx.accountId !== filterAccount) return false;
    return true;
  });
}

function groupByDate(transactions: any[]): any[] {
  const groups: Record<string, any[]> = {};
  transactions.forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(date => ({
    date,
    transactions: groups[date]
  }));
}

function getDayTotal(transactions: any[]): number {
  return transactions.reduce((s, tx) => {
    return tx.type === 'expense' ? s - tx.amount : tx.type === 'income' ? s + tx.amount : s;
  }, 0);
}

function exportCSV(transactions: any[], categories: any[], accounts: any[]): string {
  const headers = 'Дата,Тип,Категория,Счёт,Сумма,Комментарий\n';
  const rows = transactions.map(tx => {
    const cat = categories.find(c => c.id === tx.categoryId);
    const acc = accounts.find(a => a.id === tx.accountId);
    return tx.date + ',' + tx.type + ',' + (cat ? cat.name : '') + ',' + (acc ? acc.name : '') + ',' + tx.amount + ',"' + tx.description + '"';
  }).join('\n');
  return headers + rows;
}

function getAvgPerDay(totalExpense: number): number {
  const currentDay = new Date().getDate();
  return currentDay > 0 ? Math.round(totalExpense / currentDay) : 0;
}

function getDailyExpenses(transactions: any[]): string[] {
  const map: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    map[t.date] = (map[t.date] || 0) + t.amount;
  });
  return Object.keys(map).sort();
}

function getLinePath(dailyExpenses: string[], dailyMap: Record<string, number>, width = 600, height = 200): any {
  if (dailyExpenses.length === 0) return { line: '', area: '' };
  const maxVal = Math.max(...dailyExpenses.map(d => dailyMap[d]));
  const step = dailyExpenses.length > 1 ? width / (dailyExpenses.length - 1) : width;
  const points = dailyExpenses.map((d, i) => {
    const v = dailyMap[d];
    return { x: i * step, y: height - (maxVal > 0 ? (v / maxVal) * (height - 20) : 0) - 10 };
  });
  const line = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
  const area = line + ' L' + points[points.length - 1].x + ',' + height + ' L0,' + height + ' Z';
  return { line, area };
}

function getGoalDaysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getLimitStats(transactions: any[], limit: any): any {
  const spent = transactions
    .filter(t => t.type === 'expense' && t.categoryId === limit.categoryId)
    .reduce((s, t) => s + t.amount, 0);
  const pct = limit.limit > 0 ? Math.min(100, Math.round((spent / limit.limit) * 100)) : 0;
  return { spent, percent: pct, isOver: spent > limit.limit };
}

function getAvailableCategories(categories: any[], existingLimits: any[]): any[] {
  return categories.filter(c =>
    c.type === 'expense' && !existingLimits.some(l => l.categoryId === c.id)
  );
}

function validateTransaction(data: any): any {
  if (!data.amount || data.amount <= 0) return { valid: false, field: 'amount', error: 'Укажите сумму' };
  if (data.type !== 'transfer' && !data.categoryId) return { valid: false, field: 'category', error: 'Выберите категорию' };
  if (!data.accountId) return { valid: false, field: 'account', error: 'Выберите счёт' };
  return { valid: true };
}

CK.formatMoney = formatMoney;
CK.formatDateShort = formatDateShort;
CK.formatDateFull = formatDateFull;
CK.parseAmount = parseAmount;
CK.genId = genId;
CK.getExpensesByCategory = getExpensesByCategory;
CK.getTotalBalance = getTotalBalance;
CK.getTotalIncome = getTotalIncome;
CK.getTotalExpense = getTotalExpense;
CK.getBudgetStats = getBudgetStats;
CK.getSafePerDay = getSafePerDay;
CK.getRecurringPayments = getRecurringPayments;
CK.getPieSegments = getPieSegments;
CK.filterTransactions = filterTransactions;
CK.groupByDate = groupByDate;
CK.getDayTotal = getDayTotal;
CK.exportCSV = exportCSV;
CK.getAvgPerDay = getAvgPerDay;
CK.getDailyExpenses = getDailyExpenses;
CK.getLinePath = getLinePath;
CK.getGoalDaysLeft = getGoalDaysLeft;
CK.getLimitStats = getLimitStats;
CK.getAvailableCategories = getAvailableCategories;
CK.validateTransaction = validateTransaction;
