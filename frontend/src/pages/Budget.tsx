import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { formatMoney, getCurrentMonth } from '@/utils';

export default function Budget() {
  const {
    monthlyBudget,
    categoryLimits,
    goals,
    recurring,
    categories,
    accounts,
    loadBudget,
    loadCategoryLimits,
    loadCategories,
    loadAccounts,
    loadGoals,
    loadRecurring,
    setMonthlyBudget,
    setCategoryLimit,
    createGoal,
    topupGoal,
    deleteGoal,
    createRecurring,
    updateRecurring,
    deleteRecurring,
  } = useStore();

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [limitCategoryId, setLimitCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeFromAccount, setContributeFromAccount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [recurringType, setRecurringType] = useState<'expense' | 'income'>('expense');
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringAccountId, setRecurringAccountId] = useState('');
  const [recurringCategoryId, setRecurringCategoryId] = useState('');
  const [recurringPeriodicity, setRecurringPeriodicity] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [recurringNextDate, setRecurringNextDate] = useState('');
  const [recurringComment, setRecurringComment] = useState('');

  const month = getCurrentMonth();

  useEffect(() => {
    loadBudget(month);
    loadCategoryLimits(month);
    loadCategories();
    loadAccounts();
    loadGoals();
    loadRecurring();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !contributeFromAccount) {
      setContributeFromAccount(accounts[0].id);
    }
    if (accounts.length > 0 && !recurringAccountId) {
      setRecurringAccountId(accounts[0].id);
    }
  }, [accounts]);

  const openLimitModal = (categoryId?: string) => {
    if (categoryId) {
      const limit = categoryLimits.find((l) => l.categoryId === categoryId);
      setLimitCategoryId(categoryId);
      setLimitAmount(limit?.limit.toString() || '');
    } else {
      setLimitCategoryId('');
      setLimitAmount('');
    }
    setShowLimitModal(true);
  };

  const handleSaveLimit = async () => {
    if (!limitCategoryId || !limitAmount) return;
    await setCategoryLimit(limitCategoryId, month, parseFloat(limitAmount));
    setShowLimitModal(false);
  };

  const openGoalModal = () => {
    setGoalTitle('');
    setGoalTarget('');
    setGoalDeadline('');
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!goalTitle || !goalTarget) return;
    await createGoal({
      title: goalTitle,
      targetAmount: parseFloat(goalTarget),
      deadline: new Date(goalDeadline).toISOString(),
    });
    setShowGoalModal(false);
  };

  const openContributeModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setContributeAmount('');
    setShowContributeModal(true);
  };

  const handleContribute = async () => {
    if (!selectedGoalId || !contributeAmount || parseFloat(contributeAmount) <= 0) return;
    await topupGoal(selectedGoalId, parseFloat(contributeAmount), contributeFromAccount);
    setShowContributeModal(false);
  };

  const openBudgetModal = () => {
    setBudgetAmount(monthlyBudget?.plannedAmount.toString() || '');
    setShowBudgetModal(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) return;
    await setMonthlyBudget(month, parseFloat(budgetAmount));
    setShowBudgetModal(false);
  };

  const openRecurringModal = () => {
    setRecurringType('expense');
    setRecurringAmount('');
    setRecurringAccountId(accounts[0]?.id || '');
    setRecurringCategoryId('');
    setRecurringPeriodicity('monthly');
    setRecurringNextDate('');
    setRecurringComment('');
    setShowRecurringModal(true);
  };

  const handleSaveRecurring = async () => {
    if (!recurringAmount || !recurringAccountId || !recurringCategoryId || !recurringNextDate) return;
    await createRecurring({
      type: recurringType,
      amount: parseFloat(recurringAmount),
      accountId: recurringAccountId,
      categoryId: recurringCategoryId,
      periodicity: recurringPeriodicity,
      nextDate: new Date(recurringNextDate).toISOString(),
      comment: recurringComment,
    });
    setShowRecurringModal(false);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const recurringCategories = recurringType === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Бюджет</h1>
          <div className="toolbar">
            <button className="toolbar-btn toolbar-btn-primary" onClick={openBudgetModal}>
              Бюджет
            </button>
            <button className="toolbar-btn toolbar-btn-primary" onClick={openRecurringModal}>
              + Платёж
            </button>
            <button className="toolbar-btn toolbar-btn-primary" onClick={openGoalModal}>
              + Цель
            </button>
          </div>
        </div>

        {monthlyBudget && (
          <>
            <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="card-title">Потрачено</div>
              <div className="card-value negative">
                {formatMoney(monthlyBudget.actualAmount)} <span style={{ fontSize: 16, color: 'var(--muted)' }}>/ {formatMoney(monthlyBudget.plannedAmount)}</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 16 }}>
                <div
                  className={`progress-fill ${monthlyBudget.usagePercent >= 90 ? 'danger' : monthlyBudget.usagePercent >= 70 ? 'warning' : ''}`}
                  style={{ width: monthlyBudget.usagePercent + '%' }}
                ></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                <span>{Math.round(monthlyBudget.usagePercent)}% использовано</span>
                <span>Осталось {formatMoney(monthlyBudget.remainingAmount)}</span>
              </div>
            </div>

            <div className="safe-to-spend" style={{ marginBottom: 24 }}>
              <div className="safe-label">Безопасно тратить в день</div>
              <div className="safe-amount">{formatMoney(monthlyBudget.safeDailyAmount)}</div>
              <div className="safe-subtitle">
                до конца месяца
              </div>
            </div>
          </>
        )}

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

        {categoryLimits.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Нет лимитов</div>
          </div>
        ) : (
          categoryLimits.map((limit) => {
            const cat = categories.find((c) => c.id === limit.categoryId);
            return (
              <div className="card" key={limit.id} style={{ cursor: 'pointer' }} onClick={() => openLimitModal(limit.categoryId)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div className="icon-circle" style={{ background: cat?.color || 'var(--border)', width: 36, height: 36, fontSize: 16 }}>
                    {cat?.icon || '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{cat?.name || 'Без категории'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {formatMoney(limit.spent)} из {formatMoney(limit.limit)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: limit.isExceeded ? 'var(--danger)' : limit.usagePercent >= 70 ? 'var(--accent-secondary)' : 'var(--success)' }}>
                      {Math.round(limit.usagePercent)}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>ост. {formatMoney(limit.remaining)}</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${limit.isExceeded ? 'danger' : limit.usagePercent >= 70 ? 'warning' : ''}`}
                    style={{ width: Math.min(limit.usagePercent, 100) + '%' }}
                  ></div>
                </div>
              </div>
            );
          })
        )}

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>Цели накоплений</span>
        </div>

        {goals.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Нет целей</div>
          </div>
        ) : (
          goals.map((g) => {
            const deadline = g.deadline ? new Date(g.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            return (
              <div className="card" key={g.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="icon-circle" style={{ background: '#4285f4', width: 40, height: 40, fontSize: 18 }}>
                    🎯
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.title}</div>
                    {deadline && <div style={{ fontSize: 11, color: 'var(--muted)' }}>до {deadline}</div>}
                  </div>
                  <span className={`badge ${g.status === 'completed' ? 'badge-success' : g.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                    {g.status === 'completed' ? 'Достигнута' : g.status === 'failed' ? 'Просрочена' : 'В процессе'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{formatMoney(g.currentAmount)}</div>
                  <div style={{ fontSize: 14, color: 'var(--muted)' }}>/ {formatMoney(g.targetAmount)}</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: g.progress + '%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{Math.round(g.progress)}%</span>
                  <span style={{ color: 'var(--muted)' }}>осталось {formatMoney(g.targetAmount - g.currentAmount)}</span>
                </div>
                {g.status !== 'completed' && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 12 }}
                    onClick={() => openContributeModal(g.id)}
                  >
                    Пополнить
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={() => {
                    if (confirm('Удалить цель?')) deleteGoal(g.id);
                  }}
                >
                  Удалить цель
                </button>
              </div>
            );
          })
        )}

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>Регулярные платежи</span>
        </div>

        {recurring.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Нет регулярных платежей</div>
          </div>
        ) : (
          recurring.map((r) => {
            const cat = categories.find((c) => c.id === r.categoryId);
            const nextDate = new Date(r.nextDate);
            const dateStr = nextDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            return (
              <div className="card" key={r.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="icon-circle" style={{ background: cat?.color || 'var(--border)', width: 40, height: 40, fontSize: 18 }}>
                    {cat?.icon || '🔄'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.comment || cat?.name || 'Платёж'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {dateStr} · {r.periodicity === 'daily' ? 'Ежедневно' : r.periodicity === 'weekly' ? 'Еженедельно' : 'Ежемесячно'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: r.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {r.type === 'income' ? '+' : '-'}{formatMoney(r.amount)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      if (confirm('Удалить регулярный платёж?')) deleteRecurring(r.id);
                    }}
                  >
                    Удалить
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      updateRecurring(r.id, { isActive: !r.isActive });
                    }}
                  >
                    {r.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="bottom-spacer"></div>
      </div>

      {showLimitModal && (
        <div className="modal active" onClick={() => setShowLimitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Лимит по категории</div>
              <button className="modal-close" onClick={() => setShowLimitModal(false)}>
                
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select
                className="form-input"
                value={limitCategoryId}
                onChange={(e) => setLimitCategoryId(e.target.value)}
              >
                <option value="">Выберите категорию</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
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
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveLimit}>
              Сохранить
            </button>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="modal active" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Новая цель</div>
              <button className="modal-close" onClick={() => setShowGoalModal(false)}>
                
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Название</label>
              <input
                className="form-input"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
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
              Создать
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
                  .filter((a) => !a.isArchived)
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

      {showBudgetModal && (
        <div className="modal active" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Месячный бюджет</div>
              <button className="modal-close" onClick={() => setShowBudgetModal(false)}>
                
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Планируемый бюджет на месяц</label>
              <input
                className="form-input"
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveBudget}>
              Сохранить
            </button>
          </div>
        </div>
      )}

      {showRecurringModal && (
        <div className="modal active" onClick={() => setShowRecurringModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Новый регулярный платёж</div>
              <button className="modal-close" onClick={() => setShowRecurringModal(false)}>
                
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Тип</label>
              <div className="grid-2">
                <button
                  className={`btn ${recurringType === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRecurringType('expense')}
                >
                  Расход
                </button>
                <button
                  className={`btn ${recurringType === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRecurringType('income')}
                >
                  Доход
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Сумма</label>
              <input
                className="form-input"
                type="number"
                value={recurringAmount}
                onChange={(e) => setRecurringAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Счёт</label>
              <select
                className="form-input"
                value={recurringAccountId}
                onChange={(e) => setRecurringAccountId(e.target.value)}
              >
                {accounts
                  .filter((a) => !a.isArchived)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select
                className="form-input"
                value={recurringCategoryId}
                onChange={(e) => setRecurringCategoryId(e.target.value)}
              >
                <option value="">Выберите категорию</option>
                {recurringCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Периодичность</label>
              <select
                className="form-input"
                value={recurringPeriodicity}
                onChange={(e) => setRecurringPeriodicity(e.target.value as 'daily' | 'weekly' | 'monthly')}
              >
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
                <option value="monthly">Ежемесячно</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Дата следующего платежа</label>
              <input
                className="form-input"
                type="date"
                value={recurringNextDate}
                onChange={(e) => setRecurringNextDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Комментарий</label>
              <input
                className="form-input"
                value={recurringComment}
                onChange={(e) => setRecurringComment(e.target.value)}
                placeholder="Необязательно"
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveRecurring}>
              Создать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
