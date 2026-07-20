import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { formatMoney, getCurrentMonth } from '@/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboard, recurring, categories, loadDashboard, loadRecurring, loadCategories } = useStore();

  useEffect(() => {
    loadDashboard();
    loadRecurring();
    loadCategories();
  }, []);

  if (!dashboard) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div>Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingRecurring = dashboard.upcomingRecurring.slice(0, 6);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Дашборд</h1>
          <div className="toolbar">
            <button
              className="toolbar-btn toolbar-btn-primary"
              onClick={() => navigate('/add-transaction?type=expense')}
            >
              + Расход
            </button>
            <button
              className="toolbar-btn toolbar-btn-primary"
              onClick={() => navigate('/add-transaction?type=income')}
            >
              + Доход
            </button>
            <button
              className="toolbar-btn"
              onClick={() => navigate('/add-transaction?type=transfer')}
            >
              Перевод
            </button>
          </div>
        </div>

        <div className="balance-card">
          <div>
            <div className="balance-label">Общий баланс</div>
            <div className="balance-amount">
              {new Intl.NumberFormat('ru-RU').format(dashboard.totalBalance)}{' '}
              <span className="balance-currency">₽</span>
            </div>
          </div>
          <div className="balance-actions">
            <button
              className="balance-action-btn"
              onClick={() => navigate('/add-transaction?type=expense')}
            >
              + Расход
            </button>
            <button
              className="balance-action-btn"
              onClick={() => navigate('/add-transaction?type=income')}
            >
              + Доход
            </button>
            <button
              className="balance-action-btn"
              onClick={() => navigate('/add-transaction?type=transfer')}
            >
              Перевод
            </button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Доходы за месяц</div>
            <div className="stat-value income">{formatMoney(dashboard.monthlyIncome)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Расходы за месяц</div>
            <div className="stat-value expense">{formatMoney(dashboard.monthlyExpense)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Безопасно в день</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {formatMoney(dashboard.safeDailyAmount)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Остаток бюджета</div>
            <div className="stat-value">{formatMoney(dashboard.budgetRemaining)}</div>
          </div>
        </div>

        <div className="safe-to-spend">
          <div className="safe-label">Безопасно потратить в день</div>
          <div className="safe-amount">{formatMoney(dashboard.safeDailyAmount)}</div>
          <div className="safe-subtitle">до конца месяца</div>
        </div>

        <div className="section-title">
          <span>Топ категории</span>
          <Link to="/analytics" className="section-link">
            Аналитика →
          </Link>
        </div>
        {dashboard.topCategories.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Нет данных</div>
          </div>
        ) : (
          dashboard.topCategories.slice(0, 5).map((cat) => (
            <div className="card" key={cat.categoryId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                className="icon-circle"
                style={{ background: 'var(--border)', width: 40, height: 40, fontSize: 18 }}
              >
                📦
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</div>
                <div className="progress-bar" style={{ margin: '8px 0' }}>
                  <div className="progress-fill" style={{ width: `${cat.percent}%` }}></div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{formatMoney(cat.amount)}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{Math.round(cat.percent)}%</div>
              </div>
            </div>
          ))
        )}

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>Регулярные платежи</span>
          <Link to="/budget" className="section-link">
            Все →
          </Link>
        </div>
        <div className="recurring-list-desktop">
          {upcomingRecurring.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Нет регулярных платежей</div>
            </div>
          ) : (
            upcomingRecurring.map((r) => {
              const cat = categories.find((c) => c.id === r.categoryId);
              const nextDate = new Date(r.nextDate);
              const dateStr = nextDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
              return (
                <div className="recurring-item" key={r.id}>
                  <div className="recurring-icon">{cat?.icon || '🔄'}</div>
                  <div className="recurring-info">
                    <div className="recurring-name">{r.comment || cat?.name || 'Платёж'}</div>
                    <div className="recurring-date">
                      {dateStr} · {r.periodicity}
                    </div>
                  </div>
                  <div className="recurring-amount">{formatMoney(r.amount)}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="bottom-spacer"></div>
      </div>
    </div>
  );
}
