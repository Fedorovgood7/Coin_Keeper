import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { formatMoney, getExpensesByCategory } from '@/utils';

export default function Analytics() {
  const { transactions, categories } = useStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const now = new Date();
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        const startMonth = quarter * 3;
        return d.getMonth() >= startMonth && d.getMonth() < startMonth + 3 && d.getFullYear() === now.getFullYear();
      }
      if (period === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, period, now]);

  const totalIncome = filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const daysInPeriod = useMemo(() => {
    if (period === 'week') return 7;
    if (period === 'month') return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (period === 'quarter') return 90;
    return 365;
  }, [period, now]);
  const avgPerDay = daysInPeriod > 0 ? Math.round(totalExpense / daysInPeriod) : 0;

  const expensesByCategory = useMemo(() => {
    return getExpensesByCategory(filteredTransactions, categories)
      .map((e) => {
        const category = categories.find((c) => c.id === e.categoryId);
        return { ...e, category, percent: totalExpense > 0 ? (e.amount / totalExpense) * 100 : 0 };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories, totalExpense]);

  const dailyExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter((t) => t.type === 'expense').forEach((t) => {
      const date = t.date.split('T')[0];
      map[date] = (map[date] || 0) + t.amount;
    });
    return map;
  }, [filteredTransactions]);

  const daysInChart = useMemo(() => {
    const days: { date: string; amount: number }[] = [];
    for (let i = daysInPeriod - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, amount: dailyExpenses[dateStr] || 0 });
    }
    return days;
  }, [daysInPeriod, now, dailyExpenses]);

  const maxDailyExpense = Math.max(...Object.values(dailyExpenses), 1);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Аналитика</h1>
        </div>

        <div className="tabs">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              className={`tab ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : p === 'quarter' ? 'Квартал' : 'Год'}
            </button>
          ))}
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Доходы</div>
            <div className="stat-value income">{formatMoney(totalIncome)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Расходы</div>
            <div className="stat-value expense">{formatMoney(totalExpense)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Средний/день</div>
            <div className="stat-value expense">{formatMoney(avgPerDay)}</div>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>Расходы по дням</span>
        </div>
        <div className="card">
          <div className="chart-bar">
            {daysInChart.map((day, i) => {
              const height = maxDailyExpense > 0 ? (day.amount / maxDailyExpense) * 100 : 0;
              const isHovered = hoveredBar === i;
              return (
                <div
                  key={day.date}
                  className="chart-bar-item"
                  style={{
                    height: `${Math.max(height, 2)}%`,
                    opacity: isHovered ? 1 : 0.7,
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
                        background: 'var(--accent)',
                        color: 'var(--bg)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
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

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>По категориям</span>
        </div>
        {expensesByCategory.map((e) => (
          <div className="card" key={e.categoryId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="icon-circle"
              style={{ background: e.category?.color || 'var(--border)', width: 40, height: 40, fontSize: 18 }}
            >
              {e.category?.emoji || '📦'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{e.category?.name}</div>
              <div className="progress-bar" style={{ margin: '8px 0' }}>
                <div className="progress-fill" style={{ width: `${e.percent}%`, background: e.category?.color || 'var(--border)' }}></div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{formatMoney(e.amount)}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{Math.round(e.percent)}%</div>
            </div>
          </div>
        ))}

        <div className="bottom-spacer"></div>
      </div>
    </div>
  );
}
