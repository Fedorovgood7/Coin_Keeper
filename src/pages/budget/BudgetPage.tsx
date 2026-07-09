import { useState } from 'react';
import { useStore } from '@/shared/store';
import { formatMoney, getSafePerDay, getDaysLeftInMonth, getTotalByType } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';

export function BudgetPage() {
  const { budget, transactions, categories, goals, contributeToGoal, accounts, updateBudget, addGoal, updateGoal, updateAccount } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showAddLimitModal, setShowAddLimitModal] = useState(false);
  const [showEditLimitModal, setShowEditLimitModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeFromAccount, setContributeFromAccount] = useState(accounts[0]?.id || '');
  const [newBudget, setNewBudget] = useState(budget.monthly.toString());
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());

  // Limit form state
  const [limitCategoryId, setLimitCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);

  // Goal form state
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎯');
  const [goalColor, setGoalColor] = useState('#4a7fd9');

  const totalExpense = getTotalByType(transactions, 'expense');
  const remaining = budget.monthly - totalExpense;
  const percentUsed = budget.monthly > 0 ? Math.round((totalExpense / budget.monthly) * 100) : 0;
  const daysLeft = getDaysLeftInMonth();
  const safePerDay = getSafePerDay(remaining);

  const handleContribute = () => {
    if (!selectedGoalId || !contributeAmount || parseFloat(contributeAmount) <= 0) return;
    contributeToGoal(selectedGoalId, parseFloat(contributeAmount), contributeFromAccount);
    setShowContributeModal(false);
    setContributeAmount('');
  };

  const handleSaveBudget = () => {
    if (!newBudget || parseFloat(newBudget) <= 0) return;
    updateBudget({ ...budget, monthly: parseFloat(newBudget) });
    setShowEditModal(false);
  };

  const handleAddLimit = () => {
    if (!limitCategoryId || !limitAmount) return;
    const newLimit = { categoryId: limitCategoryId, limit: parseFloat(limitAmount) };
    updateBudget({ ...budget, limits: [...budget.limits, newLimit] });
    setShowAddLimitModal(false);
    setLimitCategoryId('');
    setLimitAmount('');
  };

  const handleEditLimit = () => {
    if (!editingLimitId || !limitAmount) return;
    const updatedLimits = budget.limits.map((l) =>
      l.categoryId === editingLimitId ? { ...l, limit: parseFloat(limitAmount) } : l
    );
    updateBudget({ ...budget, limits: updatedLimits });
    setShowEditLimitModal(false);
    setEditingLimitId(null);
    setLimitAmount('');
  };

  const handleDeleteLimit = (categoryId: string) => {
    updateBudget({ ...budget, limits: budget.limits.filter((l) => l.categoryId !== categoryId) });
  };

  const openEditLimit = (categoryId: string) => {
    const limit = budget.limits.find((l) => l.categoryId === categoryId);
    if (!limit) return;
    setEditingLimitId(categoryId);
    setLimitAmount(limit.limit.toString());
    setShowEditLimitModal(true);
  };

  const handleAddGoal = () => {
    if (!goalName || !goalTarget || !goalDeadline) return;
    addGoal({
      name: goalName,
      icon: goalIcon,
      color: goalColor,
      target: parseFloat(goalTarget),
      current: 0,
      deadline: goalDeadline,
    });
    setShowAddGoalModal(false);
    setGoalName('');
    setGoalTarget('');
    setGoalDeadline('');
    setGoalIcon('');
    setGoalColor('#4a7fd9');
  };

  const handleEditGoal = () => {
    if (!selectedGoalId || !goalName || !goalTarget || !goalDeadline) return;
    updateGoal(selectedGoalId, {
      name: goalName,
      target: parseFloat(goalTarget),
      deadline: goalDeadline,
      icon: goalIcon,
      color: goalColor,
    });
    setShowEditGoalModal(false);
  };

  const openEditGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    setSelectedGoalId(goalId);
    setGoalName(goal.name);
    setGoalTarget(goal.target.toString());
    setGoalDeadline(goal.deadline);
    setGoalIcon(goal.icon);
    setGoalColor(goal.color);
    setShowEditGoalModal(true);
  };

  const navigatePeriod = (direction: number) => {
    const newDate = new Date(selectedPeriod);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedPeriod(newDate);
  };

  const formatPeriodLabel = () => {
    return selectedPeriod.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const GOAL_ICONS = ['🎯', '️', '💻', '', '🏠', '📱', '💍', '🎓'];
  const GOAL_COLORS = ['#4a7fd9', '#9b8bd9', '#4a9d5b', '#e8652d', '#e88ba8', '#e8b84d', '#4a9d8b', '#d9656b'];

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>Бюджет</div>
          <button
            onClick={() => setShowEditModal(true)}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 14, fontWeight: 600 }}
          >
            Изменить
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <span className="period-nav" onClick={() => navigatePeriod(-1)} style={{ cursor: 'pointer', color: 'white', fontSize: 20 }}>‹</span>
          <span style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>{formatPeriodLabel()}</span>
          <span className="period-nav" onClick={() => navigatePeriod(1)} style={{ cursor: 'pointer', color: 'white', fontSize: 20 }}>›</span>
        </div>
      </div>

      {/* Budget overview */}
      <div style={{ padding: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div className="stat-label">ПОТРАЧЕНО</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>
                {formatMoney(totalExpense)} <span style={{ fontSize: 18, color: 'var(--text-secondary)' }}>/ {formatMoney(budget.monthly)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="stat-label" style={{ color: 'var(--success)' }}>ОСТАЛОСЬ {formatMoney(remaining)}</div>
            </div>
          </div>
          <div className="progress-bar" style={{ height: 12 }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(percentUsed, 100)}%`, background: percentUsed > 90 ? 'var(--danger)' : 'var(--success)' }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
            <span>{percentUsed}% использовано</span>
            <span>{daysLeft} дней осталось</span>
          </div>
        </div>

        {/* Safe per day */}
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div className="stat-label">БЕЗОПАСНО ТРАТИТЬ В ДЕНЬ</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--success)', margin: '16px 0' }}>
            {formatMoney(safePerDay)}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {formatMoney(remaining)} ÷ {daysLeft} дней
          </div>
        </div>
      </div>

      {/* Category limits */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>ЛИМИТЫ ПО КАТЕГОРИЯМ</div>
          <button
            onClick={() => {
              setLimitCategoryId('');
              setLimitAmount('');
              setShowAddLimitModal(true);
            }}
            style={{ fontSize: 14, color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 600 }}
          >
            + Добавить
          </button>
        </div>
        {budget.limits.map((limit) => {
          const category = categories.find((c) => c.id === limit.categoryId);
          const spent = transactions
            .filter((t) => t.type === 'expense' && t.categoryId === limit.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);
          const limitPercent = limit.limit > 0 ? Math.round((spent / limit.limit) * 100) : 0;
          const limitRemaining = limit.limit - spent;
          return (
            <div className="card" key={limit.categoryId} style={{ position: 'relative' }}>
              <button
                onClick={() => handleDeleteLimit(limit.categoryId)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 18, color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                
              </button>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, cursor: 'pointer' }} onClick={() => openEditLimit(limit.categoryId)}>
                <div className="category-icon" style={{ background: category?.color || '#999' }}>
                  {category?.icon || '📦'}
                </div>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{category?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {formatMoney(spent)} из {formatMoney(limit.limit)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: limitPercent > 90 ? 'var(--danger)' : 'var(--success)' }}>
                    {limitPercent}%
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>ост. {formatMoney(limitRemaining)}</div>
                </div>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(limitPercent, 100)}%`, background: limitPercent > 90 ? 'var(--danger)' : 'var(--success)' }}
                ></div>
              </div>
            </div>
          );
        })}
        {budget.limits.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">Нет лимитов</div>
            <div className="empty-text">Добавьте лимит по категории</div>
          </div>
        )}
      </div>

      {/* Goals */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>ЦЕЛИ НАКОПЛЕНИЙ</div>
          <button
            onClick={() => {
              setGoalName('');
              setGoalTarget('');
              setGoalDeadline('');
              setGoalIcon('🎯');
              setGoalColor('#4a7fd9');
              setShowAddGoalModal(true);
            }}
            style={{ fontSize: 14, color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 600 }}
          >
            + Добавить
          </button>
        </div>
        {goals.map((goal) => {
          const percent = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
          const remainingGoal = goal.target - goal.current;
          return (
            <div className="goal-card" key={goal.id}>
              <div className="goal-header">
                <div className="goal-icon" style={{ background: goal.color }}>
                  {goal.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-deadline">до {new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <button
                  onClick={() => openEditGoal(goal.id)}
                  style={{ fontSize: 18, color: 'var(--text-secondary)', background: 'none', border: 'none', marginRight: 8 }}
                >
                  ✎
                </button>
                <div className="goal-status">В ПРОЦЕССЕ</div>
              </div>
              <div className="goal-amounts">
                <div className="goal-current">{formatMoney(goal.current)}</div>
                <div className="goal-target">/ {formatMoney(goal.target)}</div>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${percent}%`, background: 'var(--success)' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div className="goal-percent">{percent}%</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>осталось {formatMoney(remainingGoal)}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedGoalId(goal.id);
                  setShowContributeModal(true);
                }}
                className="btn btn-dark"
                style={{ width: '100%', marginTop: 16, padding: 14 }}
              >
                Пополнить
              </button>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <div className="empty-title">Нет целей</div>
            <div className="empty-text">Создайте первую цель накопления</div>
          </div>
        )}
      </div>

      {/* Edit budget modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Изменить бюджет</div>
            <div className="form-label">МЕСЯЧНЫЙ БЮДЖЕТ</div>
            <input
              type="number"
              className="form-input"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              style={{ fontSize: 24, fontWeight: 700 }}
            />
            <button onClick={handleSaveBudget} className="btn btn-dark" style={{ width: '100%', marginTop: 24, padding: 16 }}>
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit limit modal */}
      {(showAddLimitModal || showEditLimitModal) && (
        <div className="modal-overlay" onClick={() => { setShowAddLimitModal(false); setShowEditLimitModal(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              {showEditLimitModal ? 'Изменить лимит' : 'Добавить лимит'}
            </div>
            <div className="form-label">КАТЕГОРИЯ</div>
            <select
              className="form-input"
              value={limitCategoryId}
              onChange={(e) => setLimitCategoryId(e.target.value)}
              disabled={!!showEditLimitModal}
            >
              <option value="">Выберите категорию</option>
              {categories
                .filter((c) => c.type === 'expense' && (!showEditLimitModal || budget.limits.some((l) => l.categoryId === c.id)))
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
            </select>
            <div className="form-label" style={{ marginTop: 16 }}>ЛИМИТ</div>
            <input
              type="number"
              className="form-input"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              placeholder="0"
            />
            <button
              onClick={showEditLimitModal ? handleEditLimit : handleAddLimit}
              className="btn btn-dark"
              style={{ width: '100%', marginTop: 24, padding: 16 }}
            >
              {showEditLimitModal ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit goal modal */}
      {(showAddGoalModal || showEditGoalModal) && (
        <div className="modal-overlay" onClick={() => { setShowAddGoalModal(false); setShowEditGoalModal(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              {showEditGoalModal ? 'Изменить цель' : 'Новая цель'}
            </div>
            <div className="form-label">НАЗВАНИЕ</div>
            <input
              type="text"
              className="form-input"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Например: Отпуск"
            />
            <div className="form-label" style={{ marginTop: 16 }}>ЦЕЛЕВАЯ СУММА</div>
            <input
              type="number"
              className="form-input"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              placeholder="0"
            />
            <div className="form-label" style={{ marginTop: 16 }}>ДЕДЛАЙН</div>
            <input
              type="date"
              className="form-input"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
            />
            <div className="form-label" style={{ marginTop: 16 }}>ИКОНКА</div>
            <div className="color-picker" style={{ justifyContent: 'center' }}>
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setGoalIcon(icon)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: goalIcon === icon ? '3px solid var(--header)' : '3px solid transparent',
                    background: 'var(--bg)',
                    fontSize: 24,
                    cursor: 'pointer',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="form-label" style={{ marginTop: 16 }}>ЦВЕТ</div>
            <div className="color-picker">
              {GOAL_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-option ${goalColor === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setGoalColor(c)}
                ></div>
              ))}
            </div>
            <button
              onClick={showEditGoalModal ? handleEditGoal : handleAddGoal}
              className="btn btn-dark"
              style={{ width: '100%', marginTop: 24, padding: 16 }}
            >
              {showEditGoalModal ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      )}

      {/* Contribute to goal modal */}
      {showContributeModal && selectedGoalId && (
        <div className="modal-overlay" onClick={() => setShowContributeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Link to="/budget" style={{ fontSize: 20, color: 'var(--text)', textDecoration: 'none' }}>‹</Link>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Пополнить цель</div>
              <div style={{ width: 20 }}></div>
            </div>

            {/* Goal info */}
            {(() => {
              const goal = goals.find((g) => g.id === selectedGoalId);
              if (!goal) return null;
              const percent = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
              return (
                <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div className="goal-icon" style={{ background: goal.color, margin: '0 auto 12px', width: 64, height: 64, fontSize: 32 }}>
                    {goal.icon}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{goal.name}</div>
                  <div className="progress-bar" style={{ margin: '0 20px 12px' }}>
                    <div className="progress-fill" style={{ width: `${percent}%`, background: 'var(--success)' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--success)' }}>{formatMoney(goal.current)}</span>
                    <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/ {formatMoney(goal.target)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{percent}% собрано</div>
                </div>
              );
            })()}

            {/* Amount */}
            <div className="form-label">СУММА ПОПОЛНЕНИЯ</div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className="form-input"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                placeholder="0"
                style={{ fontSize: 32, fontWeight: 700, paddingRight: 40 }}
              />
              <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: 20 }}>₽</span>
            </div>

            {/* Quick amounts */}
            <div className="quick-amounts">
              {[1000, 5000, 10000, 35000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setContributeAmount(amount.toString())}
                  className="quick-amount-btn"
                >
                  {formatMoney(amount)}
                </button>
              ))}
            </div>

            {/* Account selector */}
            <div className="form-label" style={{ marginTop: 20 }}>СПИСАТЬ СО СЧЁТА</div>
            {accounts.filter((a) => !a.isArchived).map((account) => (
              <div
                key={account.id}
                className="account-card"
                onClick={() => setContributeFromAccount(account.id)}
                style={{
                  cursor: 'pointer',
                  border: contributeFromAccount === account.id ? '2px solid var(--header)' : '1px solid var(--border)',
                  marginBottom: 8,
                }}
              >
                <div className="account-icon" style={{ background: account.color }}>
                  {account.icon}
                </div>
                <div className="account-info">
                  <div className="account-name">{account.name}</div>
                  <div className="account-type">{account.type === 'card' ? 'Дебетовая карта' : account.type === 'cash' ? 'Наличные' : 'Накопительный'}</div>
                </div>
                <div className="account-balance">{formatMoney(account.balance)}</div>
              </div>
            ))}

            {/* Submit */}
            <button
              onClick={handleContribute}
              className="btn btn-dark"
              style={{ width: '100%', marginTop: 24, padding: 16 }}
            >
              Пополнить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
