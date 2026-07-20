import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { formatMoney, getTotalBalance, getTotalByType, getSafePerDay } from '@/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, accounts, transactions, budgets, recurring, categories, logout } = useStore();

  const totalBalance = getTotalBalance(accounts);
  const now = new Date();
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthIncome = getTotalByType(monthTx, 'income');
  const monthExpense = getTotalByType(monthTx, 'expense');

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const budgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const safeDaily = getSafePerDay(totalBudget, monthExpense);

  const upcomingRecurring = recurring.slice(0, 6);

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
              {new Intl.NumberFormat('ru-RU').format(totalBalance)}{' '}
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
            <div className="stat-value income">{formatMoney(monthIncome)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Расходы за месяц</div>
            <div className="stat-value expense">{formatMoney(monthExpense)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Безопасно в день</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {formatMoney(safeDaily)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Остаток бюджета</div>
            <div className="stat-value">{formatMoney(remaining)}</div>
          </div>
        </div>

        <div className="safe-to-spend">
          <div className="safe-label">Безопасно потратить в день</div>
          <div className="safe-amount">{formatMoney(safeDaily)}</div>
          <div className="safe-subtitle">до конца месяца</div>
        </div>

        <div className="budget-mini">
          <div className="budget-mini-header">
            <span className="budget-mini-title">Бюджет (общий)</span>
            <span className="budget-mini-value">
              {formatMoney(totalSpent)} / {formatMoney(totalBudget)}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${budgetPercent >= 90 ? 'danger' : budgetPercent >= 70 ? 'warning' : ''}`}
              style={{ width: budgetPercent + '%' }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{budgetPercent}% использовано</span>
            <Link to="/budget" className="section-link">
              Подробнее →
            </Link>
          </div>
        </div>

        <div className="section-title">
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
                  <div className="recurring-icon">{cat?.emoji || '🔄'}</div>
                  <div className="recurring-info">
                    <div className="recurring-name">{r.note || cat?.name || 'Платёж'}</div>
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
