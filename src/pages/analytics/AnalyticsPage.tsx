import { useState, useMemo } from 'react';
import { useStore } from '@/shared/store';
import { formatMoney, getTotalByType, getExpensesByCategory, getDailyExpenses } from '@/shared/lib/utils';

type Period = 'week' | 'month' | 'quarter' | 'year';
type DynamicsFilter = 'all' | 'income' | 'expense';

export function AnalyticsPage() {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<Period>('month');
  const [dynamicsFilter, setDynamicsFilter] = useState<DynamicsFilter>('all');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate date range based on period
  const getDateRange = useMemo(() => {
    const now = selectedDate;
    let from: Date;
    let to: Date;

    switch (period) {
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        from = new Date(now.getFullYear(), now.getMonth(), diff);
        to = new Date(from);
        to.setDate(to.getDate() + 6);
        to.setHours(23, 59, 59);
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        to = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  }, [period, selectedDate]);

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.date >= getDateRange.from && t.date <= getDateRange.to);
  }, [transactions, getDateRange]);

  const totalIncome = getTotalByType(filteredTransactions, 'income');
  const totalExpense = getTotalByType(filteredTransactions, 'expense');
  const daysInPeriod = useMemo(() => {
    const from = new Date(getDateRange.from);
    const to = new Date(getDateRange.to);
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [getDateRange]);
  const avgPerDay = daysInPeriod > 0 ? Math.round(totalExpense / daysInPeriod) : 0;

  const expensesByCategory = useMemo(() => {
    return getExpensesByCategory(filteredTransactions, categories)
      .map((e) => {
        const category = categories.find((c) => c.id === e.categoryId);
        return { ...e, category, percent: totalExpense > 0 ? (e.amount / totalExpense) * 100 : 0 };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, totalExpense]);

  const dailyExpenses = getDailyExpenses(filteredTransactions);
  const maxDailyExpense = Math.max(...Object.values(dailyExpenses), 1);

  // Generate days for the period
  const daysInChart = useMemo(() => {
    const from = new Date(getDateRange.from);
    const to = new Date(getDateRange.to);
    const days: { date: string; amount: number }[] = [];
    const current = new Date(from);
    while (current <= to) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({ date: dateStr, amount: dailyExpenses[dateStr] || 0 });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [getDateRange, dailyExpenses]);

  // Monthly data for dynamics chart (last 6 months)
  const monthsData = useMemo(() => {
    const months: { label: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const monthTransactions = transactions.filter((t) => t.date.startsWith(monthKey));
      months.push({
        label: monthDate.toLocaleDateString('ru-RU', { month: 'short' }),
        income: getTotalByType(monthTransactions, 'income'),
        expense: getTotalByType(monthTransactions, 'expense'),
      });
    }
    return months;
  }, [transactions]);

  const maxMonthly = Math.max(...monthsData.map((m) => Math.max(m.income, m.expense)), 1);

  const navigatePeriod = (direction: number) => {
    const newDate = new Date(selectedDate);
    switch (period) {
      case 'week':
        newDate.setDate(newDate.getDate() + direction * 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + direction * 3);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + direction);
        break;
    }
    setSelectedDate(newDate);
  };

  const formatPeriodLabel = () => {
    const now = selectedDate;
    switch (period) {
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'month':
        return now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `${quarter} квартал ${now.getFullYear()}`;
      case 'year':
        return `${now.getFullYear()} год`;
      default:
        return '';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="header" style={{ textAlign: 'left', padding: '20px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Аналитика</div>
        <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 4 }}>
          {(['week', 'month', 'quarter', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 8,
                background: period === p ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                fontSize: 14,
                fontWeight: period === p ? 600 : 400,
              }}
            >
              {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : p === 'quarter' ? 'Квартал' : 'Год'}
            </button>
          ))}
        </div>
      </div>

      {/* Period navigation */}
      <div className="period-selector">
        <span className="period-nav" onClick={() => navigatePeriod(-1)} style={{ cursor: 'pointer' }}>‹</span>
        <span className="period-label">{formatPeriodLabel()}</span>
        <span className="period-nav" onClick={() => navigatePeriod(1)} style={{ cursor: 'pointer' }}>›</span>
      </div>

      {/* Stats cards */}
      <div style={{ padding: 20 }}>
        <div className="grid-3" style={{ gap: 12 }}>
          <div className="stat-card">
            <div className="stat-label">ДОХОДЫ</div>
            <div className="stat-value income">{formatMoney(totalIncome)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">РАСХОДЫ</div>
            <div className="stat-value expense">{formatMoney(totalExpense)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">СРЕДНИЙ/ДЕНЬ</div>
            <div className="stat-value expense">{formatMoney(avgPerDay)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>расходы</div>
          </div>
        </div>
      </div>

      {/* Daily expenses chart */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>РАСХОДЫ ПО ДНЯМ</div>
        </div>
        <div className="card">
          <div style={{ position: 'relative' }}>
            <div className="bar-chart">
              {daysInChart.map((day, i) => {
                const height = maxDailyExpense > 0 ? (day.amount / maxDailyExpense) * 100 : 0;
                const isMax = day.amount === maxDailyExpense && day.amount > 0;
                const isHovered = hoveredBar === i;
                const isToday = day.date === new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={day.date}
                    className={`bar ${isToday ? 'today' : ''} ${isMax ? 'max' : ''}`}
                    style={{
                      height: `${Math.max(height, 2)}%`,
                      opacity: isHovered ? 1 : undefined,
                      position: 'relative',
                    }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {isHovered && day.amount > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'var(--header)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          marginBottom: 4,
                        }}
                      >
                        {formatMoney(day.amount)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            <span>{new Date(getDateRange.from).getDate()}</span>
            <span>{Math.floor(daysInChart.length / 2)}</span>
            <span>{new Date(getDateRange.to).getDate()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>СРЕДНИЙ/ДЕНЬ</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatMoney(avgPerDay)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>МАКСИМУМ</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--expense)' }}>{formatMoney(maxDailyExpense)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>МИНИМУМ</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {formatMoney(Math.min(...Object.values(dailyExpenses).filter((v) => v > 0), 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamics chart */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>ДИНАМИКА</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'income', 'expense'] as DynamicsFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setDynamicsFilter(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: dynamicsFilter === f ? 600 : 400,
                  background: dynamicsFilter === f ? 'var(--bg)' : 'transparent',
                  color: 'var(--text)',
                }}
              >
                {f === 'all' ? 'Все' : f === 'income' ? 'Доходы' : 'Расходы'}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200, padding: '20px 0', position: 'relative' }}>
            {monthsData.map((month, i) => {
              const incomeHeight = (month.income / maxMonthly) * 100;
              const expenseHeight = (month.expense / maxMonthly) * 100;
              const isHovered = hoveredMonth === i;
              return (
                <div
                  key={month.label}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}
                  onMouseEnter={() => setHoveredMonth(i)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -40,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--header)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                    >
                      {dynamicsFilter === 'income' && `${formatMoney(month.income)}`}
                      {dynamicsFilter === 'expense' && `${formatMoney(month.expense)}`}
                      {dynamicsFilter === 'all' && `${formatMoney(month.income)} / ${formatMoney(month.expense)}`}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 160 }}>
                    {(dynamicsFilter === 'all' || dynamicsFilter === 'income') && (
                      <div
                        style={{
                          width: 20,
                          height: `${incomeHeight}%`,
                          background: 'var(--success)',
                          borderRadius: '4px 4px 0 0',
                          opacity: 0.7,
                        }}
                      ></div>
                    )}
                    {(dynamicsFilter === 'all' || dynamicsFilter === 'expense') && (
                      <div
                        style={{
                          width: 20,
                          height: `${expenseHeight}%`,
                          background: 'var(--expense)',
                          borderRadius: '4px 4px 0 0',
                          opacity: 0.7,
                        }}
                      ></div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{month.label}</div>
                </div>
              );
            })}
          </div>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--success)' }}></div>
              <span>Доходы</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--expense)' }}></div>
              <span>Расходы</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>ПО КАТЕГОРИЯМ</div>
        {expensesByCategory.map((e) => (
          <div className="card" key={e.categoryId} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div className="category-icon" style={{ background: e.category?.color || '#999' }}>
              {e.category?.icon || ''}
            </div>
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{e.category?.name}</div>
              <div className="progress-bar" style={{ margin: '8px 0' }}>
                <div
                  className="progress-fill"
                  style={{ width: `${e.percent}%`, background: e.category?.color || '#999' }}
                ></div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(e.amount)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{Math.round(e.percent)}%</div>
            </div>
          </div>
        ))}
        {expensesByCategory.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <div className="empty-title">Нет расходов</div>
            <div className="empty-text">За выбранный период</div>
          </div>
        )}
      </div>
    </div>
  );
}
