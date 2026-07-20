import { useState } from 'react';
import { useStore } from '@/store';
import { formatMoney, getSafePerDay } from '@/utils';

export default function Budget() {
  const {
    transactions,
    budgets,
    goals,
    categories,
    accounts,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    contributeToGoal,
  } = useStore();

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [limitCategoryId, setLimitCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeFromAccount, setContributeFromAccount] = useState(accounts[0]?.id || '');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const budgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const safeDaily = getSafePerDay(totalBudget, totalSpent);
  const daysLeft = Math.max(1, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate());

  const openLimitModal = (categoryId?: string) => {
    if (categoryId) {
      const budget = budgets.find((b) => b.categoryId === categoryId);
      setEditingLimitId(categoryId);
      setLimitCategoryId(categoryId);
      setLimitAmount(budget?.limit.toString() || '');
    } else {
      setEditingLimitId(null);
      setLimitCategoryId('');
      setLimitAmount('');
    }
    setShowLimitModal(true);
  };

  const handleSaveLimit = () => {
    if (!limitCategoryId || !limitAmount) return;
    if (editingLimitId) {
      updateBudget(editingLimitId, { categoryId: limitCategoryId, limit: parseFloat(limitAmount) });
    } else {
      addBudget({ categoryId: limitCategoryId, limit: parseFloat(limitAmount) });
    }
    setShowLimitModal(false);
  };

  const openGoalModal = (goalId?: string) => {
    if (goalId) {
      const goal = goals.find((g) => g.id === goalId);
      setEditingGoalId(goalId);
      setGoalName(goal?.name || '');
      setGoalTarget(goal?.target.toString() || '');
      setGoalDeadline(goal?.deadline || '');
    } else {
      setEditingGoalId(null);
      setGoalName('');
      setGoalTarget('');
      setGoalDeadline('');
    }
    setShowGoalModal(true);
  };

  const handleSaveGoal = () => {
    if (!goalName || !goalTarget) return;
    if (editingGoalId) {
      updateGoal(editingGoalId, {
        name: goalName,
        target: parseFloat(goalTarget),
        deadline: goalDeadline,
      });
    } else {
      addGoal({
        name: goalName,
        target: parseFloat(goalTarget),
        current: 0,
        deadline: goalDeadline,
      });
    }
    setShowGoalModal(false);
  };

  const openContributeModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setContributeAmount('');
    setContributeFromAccount(accounts[0]?.id || '');
    setShowContributeModal(true);
  };

  const handleContribute = () => {
    if (!selectedGoalId || !contributeAmount || parseFloat(contributeAmount) <= 0) return;
    contributeToGoal(selectedGoalId, parseFloat(contributeAmount), contributeFromAccount);
    setShowContributeModal(false);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Бюджет</h1>
          <div className="toolbar">
            <button className="toolbar-btn toolbar-btn-primary" onClick={() => openGoalModal()}>
              + Цель
            </button>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="card-title">Потрачено</div>
          <div className="card-value negative">
            {formatMoney(totalSpent)} <span style={{ fontSize: 16, color: 'var(--muted)' }}>/ {formatMoney(totalBudget)}</span>
          </div>
          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div
              className={`progress-fill ${budgetPercent >= 90 ? 'danger' : budgetPercent >= 70 ? 'warning' : ''}`}
              style={{ width: budgetPercent + '%' }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
            <span>{budgetPercent}% использовано</span>
            <span>Осталось {formatMoney(remaining)}</span>
          </div>
        </div>

        <div className="safe-to-spend" style={{ marginBottom: 24 }}>
          <div className="safe-label">Безопасно тратить в день</div>
          <div className="safe-amount">{formatMoney(safeDaily)}</div>
          <div className="safe-subtitle">
            {formatMoney(remaining)} ÷ {daysLeft} дней
          </div>
        </div>

        <div className="section-title">
          <span>Лимиты по категориям</span>
          <button
            className="section-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => openLimitModal()}
          >
            + Добавить
          </button>
        </div>

        {budgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          const spent = transactions
            .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
            .reduce((s, t) => s + t.amount, 0);
          const percent = b.limit > 0 ? Math.min(100, Math.round((spent / b.limit) * 100)) : 0;
          return (
            <div className="card" key={b.id} style={{ cursor: 'pointer' }} onClick={() => openLimitModal(b.categoryId)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div className="icon-circle" style={{ background: cat?.color || 'var(--border)', width: 36, height: 36, fontSize: 16 }}>
                  {cat?.emoji || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{cat?.name || 'Без категории'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {formatMoney(spent)} из {formatMoney(b.limit)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: percent >= 90 ? 'var(--danger)' : percent >= 70 ? 'var(--accent-secondary)' : 'var(--success)' }}>
                    {percent}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>ост. {formatMoney(Math.max(0, b.limit - spent))}</div>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${percent >= 90 ? 'danger' : percent >= 70 ? 'warning' : ''}`}
                  style={{ width: percent + '%' }}
                ></div>
              </div>
            </div>
          );
        })}

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>Цели накоплений</span>
        </div>

        {goals.map((g) => {
          const percent = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
          const deadline = g.deadline ? new Date(g.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          return (
            <div className="card" key={g.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="icon-circle" style={{ background: '#4285f4', width: 40, height: 40, fontSize: 18 }}>
                  🎯
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</div>
                  {deadline && <div style={{ fontSize: 11, color: 'var(--muted)' }}>до {deadline}</div>}
                </div>
                <span className="badge badge-success">В процессе</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{formatMoney(g.current)}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>/ {formatMoney(g.target)}</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: percent + '%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{percent}%</span>
                <span style={{ color: 'var(--muted)' }}>осталось {formatMoney(g.target - g.current)}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12 }}
                onClick={() => openContributeModal(g.id)}
              >
                Пополнить
              </button>
            </div>
          );
        })}

        <div className="bottom-spacer"></div>
      </div>

      {showLimitModal && (
        <div className="modal active" onClick={() => setShowLimitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingLimitId ? 'Изменить лимит' : 'Новый лимит'}</div>
              <button className="modal-close" onClick={() => setShowLimitModal(false)}>
                
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select
                className="form-input"
                value={limitCategoryId}
                onChange={(e) => setLimitCategoryId(e.target.value)}
                disabled={!!editingLimitId}
              >
                <option value="">Выберите категорию</option>
                {categories
                  .filter((c) => c.type === 'expense' && (!editingLimitId || budgets.some((b) => b.categoryId === c.id)))
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Лимит</label>
              <input
                className="form-input"
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editingLimitId && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    deleteBudget(editingLimitId);
                    setShowLimitModal(false);
                  }}
                >
                  Удалить
                </button>
              )}
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveLimit}>
                {editingLimitId ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="modal active" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingGoalId ? 'Изменить цель' : 'Новая цель'}</div>
              <button className="modal-close" onClick={() => setShowGoalModal(false)}>
                
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Название</label>
              <input
                className="form-input"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Например: Отпуск"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Целевая сумма</label>
              <input
                className="form-input"
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Дедлайн</label>
              <input
                className="form-input"
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveGoal}>
              {editingGoalId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      )}

      {showContributeModal && selectedGoalId && (
        <div className="modal active" onClick={() => setShowContributeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Пополнить цель</div>
              <button className="modal-close" onClick={() => setShowContributeModal(false)}>
                
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Сумма пополнения</label>
              <input
                className="form-input"
                type="number"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Списать со счёта</label>
              <select
                className="form-input"
                value={contributeFromAccount}
                onChange={(e) => setContributeFromAccount(e.target.value)}
              >
                {accounts
                  .filter((a) => !a.archived)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMoney(acc.balance)})
                    </option>
                  ))}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleContribute}>
              Пополнить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
