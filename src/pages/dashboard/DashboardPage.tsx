import { useState, useMemo } from 'react';
import { useStore } from '@/shared/store';
import { formatMoney, getTotalByType, getExpensesByCategory, getDaysLeftInMonth } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';

type TabType = 'expense' | 'income';
type PeriodType = 'day' | 'week' | 'month' | 'year' | 'period';

export function DashboardPage() {
  const { accounts, transactions, categories, budget } = useStore();
  const [tab, setTab] = useState<TabType>('expense');
  const [period, setPeriod] = useState<PeriodType>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Filter transactions by date and account
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (selectedAccountId) {
      filtered = filtered.filter((t) => t.accountId === selectedAccountId || t.toAccountId === selectedAccountId);
    }

    if (period === 'day') {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((t) => t.date === dateStr);
    } else if (period === 'week') {
      const weekAgo = new Date(selectedDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((t) => new Date(t.date) >= weekAgo && new Date(t.date) <= selectedDate);
    } else if (period === 'month') {
      const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      filtered = filtered.filter((t) => t.date.startsWith(monthKey));
    } else if (period === 'year') {
      const year = selectedDate.getFullYear();
      filtered = filtered.filter((t) => t.date.startsWith(`${year}-`));
    } else if (period === 'period') {
      if (dateFrom) filtered = filtered.filter((t) => t.date >= dateFrom);
      if (dateTo) filtered = filtered.filter((t) => t.date <= dateTo);
    }

    return filtered;
  }, [transactions, selectedAccountId, selectedDate, period, dateFrom, dateTo]);

  const totalBalance = selectedAccount
    ? selectedAccount.balance
    : accounts.filter((a) => !a.isArchived).reduce((sum, a) => sum + a.balance, 0);

  const totalIncome = getTotalByType(filteredTransactions, 'income');
  const totalExpense = getTotalByType(filteredTransactions, 'expense');
  const displayAmount = tab === 'expense' ? totalExpense : totalIncome;

  // Categories filtered by tab
  const categoriesByTab = useMemo(() => {
    const filtered = filteredTransactions.filter((t) => t.type === tab);
    const byCategory: Record<string, number> = {};
    filtered.forEach((t) => {
      byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + t.amount;
    });
    const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
    return Object.entries(byCategory)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return { categoryId, amount, category, percent: total > 0 ? (amount / total) * 100 : 0 };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, tab]);

  const recurringPayments = useMemo(() => {
    return transactions
      .filter((t) => t.isRecurring && t.type === 'expense')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);
  }, [transactions]);

  const navigateDate = (direction: number) => {
    if (period === 'period') return;
    const newDate = new Date(selectedDate);
    if (period === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (period === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (period === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (period === 'year') {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }
    setSelectedDate(newDate);
  };

  const formatDateLabel = () => {
    if (period === 'period') {
      if (dateFrom && dateTo) {
        return `${new Date(dateFrom).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${new Date(dateTo).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
      }
      return 'Выберите период';
    }
    if (period === 'day') {
      return selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } else if (period === 'week') {
      const weekAgo = new Date(selectedDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return `${weekAgo.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
    } else if (period === 'month') {
      return selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    } else if (period === 'year') {
      return `${selectedDate.getFullYear()} год`;
    }
    return '';
  };

  const handlePeriodChange = (p: PeriodType) => {
    setPeriod(p);
    if (p === 'period') {
      const now = new Date();
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setDateFrom(monthAgo.toISOString().split('T')[0]);
      setDateTo(now.toISOString().split('T')[0]);
    }
  };

  // Donut chart
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const periods: PeriodType[] = ['day', 'week', 'month', 'year', 'period'];

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' }}>
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {selectedAccount ? selectedAccount.icon : '💳'} {selectedAccount ? selectedAccount.name : 'Все счета'} ▾
          </button>

          {/* Account selector dropdown */}
          {showAccountDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                background: 'white',
                borderRadius: 12,
                padding: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 100,
                minWidth: 200,
              }}
            >
              <button
                onClick={() => {
                  setSelectedAccountId(null);
                  setShowAccountDropdown(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: !selectedAccountId ? 'var(--bg)' : 'none',
                  border: 'none',
                  fontSize: 14,
                  borderRadius: 8,
                }}
              >
                Все счета
              </button>
              {activeAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    setShowAccountDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    background: selectedAccountId === acc.id ? 'var(--bg)' : 'none',
                    border: 'none',
                    fontSize: 14,
                    borderRadius: 8,
                  }}
                >
                  {acc.icon} {acc.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="header-balance">{formatMoney(totalBalance)}</div>

        <div style={{ display: 'flex', gap: 0 }}>
          <button
            onClick={() => setTab('expense')}
            style={{
              flex: 1,
              padding: '12px 0',
              borderBottom: tab === 'expense' ? '2px solid white' : 'none',
              fontWeight: 600,
              opacity: tab === 'expense' ? 1 : 0.5,
              color: 'white',
              background: 'none',
              fontSize: 14,
            }}
          >
            РАСХОДЫ
          </button>
          <button
            onClick={() => setTab('income')}
            style={{
              flex: 1,
              padding: '12px 0',
              borderBottom: tab === 'income' ? '2px solid white' : 'none',
              fontWeight: 600,
              opacity: tab === 'income' ? 1 : 0.5,
              color: 'white',
              background: 'none',
              fontSize: 14,
            }}
          >
            ДОХОДЫ
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="tabs" style={{ justifyContent: 'center', padding: '12px 20px' }}>
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`tab ${period === p ? 'active' : ''}`}
          >
            {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : p === 'year' ? 'Год' : 'Период'}
          </button>
        ))}
      </div>

      {/* Date navigation or period picker */}
      {period === 'period' ? (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 12, justifyContent: 'center' }}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
          />
          <span style={{ lineHeight: '36px', color: 'var(--text-secondary)' }}>–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
          />
        </div>
      ) : (
        <div className="period-selector">
          <span className="period-nav" onClick={() => navigateDate(-1)} style={{ cursor: 'pointer' }}>‹</span>
          <span className="period-label">{formatDateLabel()}</span>
          <span className="period-nav" onClick={() => navigateDate(1)} style={{ cursor: 'pointer' }}>›</span>
        </div>
      )}

      {/* Donut chart */}
      <div className="card">
        <div className="donut-chart">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="40" />
            {categoriesByTab.slice(0, 5).map((seg, i) => {
              const dashArray = (seg.percent / 100) * circumference;
              const dashOffset = -offset;
              offset += dashArray;
              return (
                <circle
                  key={i}
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="none"
                  stroke={seg.category?.color || '#999'}
                  strokeWidth="40"
                  strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 140 140)"
                />
              );
            })}
          </svg>
          <div className="donut-center">
            <div className="donut-amount">{formatMoney(displayAmount)}</div>
            <div className="donut-label">{tab === 'expense' ? 'расходы за период' : 'доходы за период'}</div>
          </div>
        </div>
      </div>

      {/* Categories list (filtered by tab, sorted by amount descending) */}
      {categoriesByTab.map((seg) => (
        <div className="card" key={seg.categoryId} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="category-icon" style={{ background: seg.category?.color || '#999' }}>
            {seg.category?.icon || ''}
          </div>
          <div style={{ flex: 1, marginLeft: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{seg.category?.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{Math.round(seg.percent)}%</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(seg.amount)}</div>
          </div>
        </div>
      ))}

      {categoriesByTab.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">{tab === 'expense' ? '' : '💸'}</div>
          <div className="empty-title">Нет {tab === 'expense' ? 'расходов' : 'доходов'}</div>
          <div className="empty-text">За выбранный период</div>
        </div>
      )}

      {/* Recurring payments */}
      {recurringPayments.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Ближайшие регулярные платежи</div>
            <Link to="/transactions" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none' }}>Все →</Link>
          </div>
          {recurringPayments.map((tx) => {
            const category = categories.find((c) => c.id === tx.categoryId);
            return (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', width: 60 }}>
                  {new Date(tx.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </div>
                <div className="category-icon" style={{ background: category?.color || '#999', width: 36, height: 36, fontSize: 18 }}>
                  {category?.icon || ''}
                </div>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{category?.name || tx.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {tx.periodicity === 'monthly' ? 'Ежемесячно' : tx.periodicity === 'weekly' ? 'Еженедельно' : 'Ежедневно'}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>-{formatMoney(tx.amount)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <Link to="/transactions/new" className="fab">+</Link>
    </div>
  );
}
