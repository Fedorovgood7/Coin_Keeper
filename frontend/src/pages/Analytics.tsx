import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { formatMoney, getCurrentMonth } from '@/utils';
import { analyticsService } from '@/services';
import type { CategoryStatItem, DailyStatItem, IncomeExpenseComparison } from '@/types';

export default function Analytics() {
  const { categories } = useStore();
  const [month, setMonth] = useState(getCurrentMonth());
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStatItem[]>([]);
  const [comparison, setComparison] = useState<IncomeExpenseComparison | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catStats, dayStats, comp] = await Promise.all([
          analyticsService.getCategoryStats(month),
          analyticsService.getDailyStats(month),
          analyticsService.getIncomeExpenseComparison(month),
        ]);
        setCategoryStats(catStats.categories);
        setDailyStats(dayStats.days);
        setComparison(comp);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [month]);

  const totalExpense = categoryStats.reduce((s, c) => s + c.amount, 0);
  const maxDailyExpense = Math.max(...dailyStats.map((d) => d.amount), 1);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Аналитика</h1>
        </div>

        <div className="form-group">
          <input
            className="form-input"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state">
            <div>Загрузка...</div>
          </div>
        ) : (
          <>
            {comparison && (
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-label">Доходы</div>
                  <div className="stat-value income">{formatMoney(comparison.income)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Расходы</div>
                  <div className="stat-value expense">{formatMoney(comparison.expense)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Накопления</div>
                  <div className="stat-value" style={{ color: comparison.saving >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {formatMoney(comparison.saving)}
                  </div>
                </div>
              </div>
            )}

            <div className="section-title" style={{ marginTop: 24 }}>
              <span>Расходы по дням</span>
            </div>
            <div className="card">
              <div className="chart-bar">
                {dailyStats.map((day, i) => {
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
            {categoryStats.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Нет данных</div>
              </div>
            ) : (
              categoryStats.map((e) => {
                const cat = categories.find((c) => c.id === e.categoryId);
                return (
                  <div className="card" key={e.categoryId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      className="icon-circle"
                      style={{ background: cat?.color || 'var(--border)', width: 40, height: 40, fontSize: 18 }}
                    >
                      {cat?.icon || '📦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{cat?.name || e.name}</div>
                      <div className="progress-bar" style={{ margin: '8px 0' }}>
                        <div className="progress-fill" style={{ width: `${e.percent}%`, background: cat?.color || 'var(--border)' }}></div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{formatMoney(e.amount)}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{Math.round(e.percent)}%</div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        <div className="bottom-spacer"></div>
      </div>
    </div>
  );
}
