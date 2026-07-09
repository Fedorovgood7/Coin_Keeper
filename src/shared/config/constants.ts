const CK = (window as any).CK;

CK.DEFAULT_CATEGORIES = [
  { id: 'c1', name: 'Жильё', emoji: '🏠', color: '#f5f5f5', type: 'expense' },
  { id: 'c2', name: 'Еда', emoji: '🍔', color: '#fff4ed', type: 'expense' },
  { id: 'c3', name: 'Транспорт', emoji: '🚗', color: '#f5f5f5', type: 'expense' },
  { id: 'c4', name: 'Развлечения', emoji: '🎮', color: '#f5f5f5', type: 'expense' },
  { id: 'c5', name: 'Здоровье', emoji: '💊', color: '#edf7ef', type: 'expense' },
  { id: 'c6', name: 'Образование', emoji: '📚', color: '#eef4ff', type: 'expense' },
  { id: 'c7', name: 'Одежда', emoji: '👕', color: '#f3e8ff', type: 'expense' },
  { id: 'c8', name: 'Подарки', emoji: '🎁', color: '#fce7f3', type: 'expense' },
  { id: 'c9', name: 'Спорт', emoji: '⚽', color: '#edf7ef', type: 'expense' },
  { id: 'c10', name: 'Красота', emoji: '💄', color: '#fce7f3', type: 'expense' },
  { id: 'c11', name: 'Подписка', emoji: '📱', color: '#eef4ff', type: 'expense' },
  { id: 'c12', name: 'Прочее', emoji: '🛒', color: '#f5f5f5', type: 'expense' },
  { id: 'c13', name: 'Зарплата', emoji: '💰', color: '#edf7ef', type: 'income' },
  { id: 'c14', name: 'Фриланс', emoji: '💳', color: '#eef4ff', type: 'income' },
  { id: 'c15', name: 'Инвестиции', emoji: '📈', color: '#fef3c7', type: 'income' },
  { id: 'c16', name: 'Другой доход', emoji: '🎯', color: '#f5f5f5', type: 'income' }
];

CK.DEFAULT_ACCOUNTS = [
  { id: 'a1', name: 'Основная карта', type: 'card', balance: 245300, currency: 'RUB', number: '•• 4532', archived: false },
  { id: 'a2', name: 'Накопительный счёт', type: 'savings', balance: 512000, currency: 'RUB', archived: false },
  { id: 'a3', name: 'Наличные', type: 'cash', balance: 18500, currency: 'RUB', archived: false }
];

CK.DEFAULT_TRANSACTIONS = [
  { id: 't1', type: 'income', amount: 150000, categoryId: 'c13', accountId: 'a1', description: 'Зарплата за июнь', date: '2026-06-25', recurring: false },
  { id: 't2', type: 'income', amount: 30000, categoryId: 'c14', accountId: 'a1', description: 'Проект для клиента', date: '2026-06-20', recurring: false },
  { id: 't3', type: 'expense', amount: 35000, categoryId: 'c1', accountId: 'a1', description: 'Аренда квартиры', date: '2026-06-01', recurring: true, frequency: 'monthly' },
  { id: 't4', type: 'expense', amount: 5200, categoryId: 'c2', accountId: 'a1', description: 'Продукты Недели', date: '2026-06-22', recurring: false },
  { id: 't5', type: 'expense', amount: 3800, categoryId: 'c2', accountId: 'a3', description: 'Рестораны', date: '2026-06-18', recurring: false },
  { id: 't6', type: 'expense', amount: 2100, categoryId: 'c3', accountId: 'a1', description: 'Метро и такси', date: '2026-06-15', recurring: false },
  { id: 't7', type: 'expense', amount: 1200, categoryId: 'c11', accountId: 'a1', description: 'Интернет + ТВ', date: '2026-06-05', recurring: true, frequency: 'monthly' },
  { id: 't8', type: 'expense', amount: 299, categoryId: 'c11', accountId: 'a1', description: 'Яндекс Плюс', date: '2026-06-10', recurring: true, frequency: 'monthly' },
  { id: 't9', type: 'expense', amount: 600, categoryId: 'c11', accountId: 'a1', description: 'Мобильная связь', date: '2026-06-15', recurring: true, frequency: 'monthly' },
  { id: 't10', type: 'expense', amount: 8500, categoryId: 'c4', accountId: 'a1', description: 'Концерт', date: '2026-06-12', recurring: false },
  { id: 't11', type: 'expense', amount: 4200, categoryId: 'c7', accountId: 'a1', description: 'Одежда', date: '2026-06-08', recurring: false },
  { id: 't12', type: 'transfer', amount: 50000, categoryId: '', accountId: 'a1', toAccountId: 'a2', description: 'Перевод на накопительный', date: '2026-06-20', recurring: false }
];

CK.DEFAULT_GOALS = [
  { id: 'g1', name: 'Отпуск в Турции', emoji: '✈️', color: '#eef4ff', target: 150000, current: 87000, deadline: '2026-08-15' },
  { id: 'g2', name: 'Новый ноутбук', emoji: '💻', color: '#f3e8ff', target: 120000, current: 45000, deadline: '2026-10-01' }
];

CK.DEFAULT_BUDGET = {
  monthly: 160000,
  limits: [
    { categoryId: 'c1', limit: 40000 },
    { categoryId: 'c2', limit: 30000 },
    { categoryId: 'c3', limit: 30000 },
    { categoryId: 'c4', limit: 15000 },
    { categoryId: 'c12', limit: 20000 }
  ]
};
