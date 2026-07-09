import { useState } from 'react';
import { useStore } from '@/shared/store';
import { formatMoney } from '@/shared/lib/utils';
import { useNavigate, Link } from 'react-router-dom';

export function NewTransactionPage() {
  const navigate = useNavigate();
  const { categories, accounts, goals, addTransaction, contributeToGoal } = useStore();
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState('');
  const [transferToGoal, setTransferToGoal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const currentCategories = type === 'expense' ? expenseCategories : type === 'income' ? incomeCategories : [];
  const availableGoals = goals.filter((g) => g.current < g.target);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    if (type === 'transfer') {
      if (transferToGoal) {
        if (!selectedGoalId) return;
        contributeToGoal(selectedGoalId, parseFloat(amount), accountId);
      } else {
        if (!toAccountId) return;
        addTransaction({
          type: 'transfer',
          amount: parseFloat(amount),
          categoryId: '',
          accountId,
          toAccountId,
          date,
          description,
          isRecurring,
        });
      }
    } else {
      if (!categoryId) return;
      addTransaction({
        type,
        amount: parseFloat(amount),
        categoryId,
        accountId,
        date,
        description,
        isRecurring,
      });
    }
    navigate('/transactions');
  };

  if (type === 'transfer') {
    return (
      <div>
        {/* Header */}
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Link to="/transactions" style={{ color: 'white', fontSize: 20, textDecoration: 'none' }}>‹</Link>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Добавление операции</div>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}
            >
              {accounts.filter((a) => !a.isArchived).map((a) => (
                <option key={a.id} value={a.id} style={{ color: 'black' }}>{a.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderBottom: type === t ? '2px solid white' : 'none',
                  fontWeight: 600,
                  opacity: type === t ? 1 : 0.5,
                  color: 'white',
                  background: 'none',
                  fontSize: 14,
                }}
              >
                {t === 'expense' ? 'РАСХОДЫ' : t === 'income' ? 'ДОХОДЫ' : 'ПЕРЕВОД'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {/* Transfer type toggle */}
          <div className="type-selector" style={{ marginBottom: 20 }}>
            <div
              className={`type-option ${!transferToGoal ? 'selected' : ''}`}
              onClick={() => setTransferToGoal(false)}
            >
              <div className="type-option-icon">💳</div>
              <div className="type-option-label">Между счетами</div>
            </div>
            <div
              className={`type-option ${transferToGoal ? 'selected' : ''}`}
              onClick={() => setTransferToGoal(true)}
            >
              <div className="type-option-icon"></div>
              <div className="type-option-label">На цель</div>
            </div>
          </div>

          {!transferToGoal ? (
            <>
              {/* From account */}
              <div className="form-label">ОТКУДА</div>
              <div className="account-card" style={{ cursor: 'pointer' }}>
                <div className="account-icon" style={{ background: accounts.find((a) => a.id === accountId)?.color }}>
                  {accounts.find((a) => a.id === accountId)?.icon || '💳'}
                </div>
                <div className="account-info">
                  <div className="account-name">{accounts.find((a) => a.id === accountId)?.name}</div>
                </div>
                <div className="account-balance">{formatMoney(accounts.find((a) => a.id === accountId)?.balance || 0)}</div>
              </div>

              {/* Swap button */}
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button
                  onClick={() => {
                    const temp = accountId;
                    setAccountId(toAccountId);
                    setToAccountId(temp);
                  }}
                  style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 20 }}
                >
                  ⇄
                </button>
              </div>

              {/* To account */}
              <div className="form-label">КУДА</div>
              {accounts.filter((a) => !a.isArchived && a.id !== accountId).map((acc) => (
                <div
                  key={acc.id}
                  className="account-card"
                  onClick={() => setToAccountId(acc.id)}
                  style={{
                    cursor: 'pointer',
                    border: toAccountId === acc.id ? '2px solid var(--header)' : '1px solid var(--border)',
                    marginBottom: 8,
                  }}
                >
                  <div className="account-icon" style={{ background: acc.color }}>
                    {acc.icon}
                  </div>
                  <div className="account-info">
                    <div className="account-name">{acc.name}</div>
                  </div>
                  <div className="account-balance">{formatMoney(acc.balance)}</div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* From account */}
              <div className="form-label">СПИСАТЬ СО СЧЁТА</div>
              {accounts.filter((a) => !a.isArchived).map((acc) => (
                <div
                  key={acc.id}
                  className="account-card"
                  onClick={() => setAccountId(acc.id)}
                  style={{
                    cursor: 'pointer',
                    border: accountId === acc.id ? '2px solid var(--header)' : '1px solid var(--border)',
                    marginBottom: 8,
                  }}
                >
                  <div className="account-icon" style={{ background: acc.color }}>
                    {acc.icon}
                  </div>
                  <div className="account-info">
                    <div className="account-name">{acc.name}</div>
                    <div className="account-type">{acc.type === 'card' ? 'Дебетовая карта' : acc.type === 'cash' ? 'Наличные' : 'Накопительный'}</div>
                  </div>
                  <div className="account-balance">{formatMoney(acc.balance)}</div>
                </div>
              ))}

              {/* Goal selector */}
              <div className="form-label" style={{ marginTop: 20 }}>ЦЕЛЬ</div>
              {availableGoals.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <div className="empty-text">Нет активных целей</div>
                </div>
              ) : (
                availableGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="account-card"
                    onClick={() => setSelectedGoalId(goal.id)}
                    style={{
                      cursor: 'pointer',
                      border: selectedGoalId === goal.id ? '2px solid var(--header)' : '1px solid var(--border)',
                      marginBottom: 8,
                    }}
                  >
                    <div className="account-icon" style={{ background: goal.color }}>
                      {goal.icon}
                    </div>
                    <div className="account-info">
                      <div className="account-name">{goal.name}</div>
                      <div className="account-type">
                        {formatMoney(goal.current)} / {formatMoney(goal.target)}
                      </div>
                    </div>
                    <div className="account-balance">{Math.round((goal.current / goal.target) * 100)}%</div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Amount */}
          <div className="form-label" style={{ marginTop: 20 }}>СУММА</div>
          <input
            type="number"
            className="form-input"
            placeholder="0 ₽"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ fontSize: 32, textAlign: 'center', fontWeight: 700 }}
          />

          {/* Description */}
          <div className="form-label" style={{ marginTop: 20 }}>Описание</div>
          <input
            type="text"
            className="form-input"
            placeholder="Комментарий к переводу"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 24, padding: 18, fontSize: 18 }}
          >
            {transferToGoal ? 'Пополнить цель' : 'Перевести'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Link to="/transactions" style={{ color: 'white', fontSize: 20, textDecoration: 'none' }}>‹</Link>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Добавление операции</div>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}
          >
            {accounts.filter((a) => !a.isArchived).map((a) => (
              <option key={a.id} value={a.id} style={{ color: 'black' }}>{a.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderBottom: type === t ? '2px solid white' : 'none',
                fontWeight: 600,
                opacity: type === t ? 1 : 0.5,
                color: 'white',
                background: 'none',
                fontSize: 14,
              }}
            >
              {t === 'expense' ? 'РАСХОДЫ' : t === 'income' ? 'ДОХОДЫ' : 'ПЕРЕВОД'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Amount */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            style={{ fontSize: 48, fontWeight: 700, border: 'none', background: 'none', textAlign: 'center', width: 200, outline: 'none' }}
          />
          <select style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 16, fontWeight: 600 }}>
            <option>RUB</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 0 20px' }}></div>

        {/* Categories */}
        <div className="form-label">Категории</div>
        <div className="category-grid">
          {currentCategories.map((cat) => (
            <div
              key={cat.id}
              className={`category-item ${categoryId === cat.id ? 'selected' : ''}`}
              onClick={() => setCategoryId(cat.id)}
            >
              <div className="category-icon" style={{ background: cat.color }}>
                {cat.icon}
              </div>
              <div className="category-item-label">{cat.name}</div>
            </div>
          ))}
          <div className="category-item">
            <div className="category-icon" style={{ border: '2px dashed var(--border)', background: 'transparent' }}>
              +
            </div>
            <div className="category-item-label">Своя</div>
          </div>
        </div>

        {/* Date */}
        <div className="form-label" style={{ marginTop: 20 }}>Дата</div>
        <input
          type="date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ fontSize: 18, fontWeight: 600 }}
        />

        {/* Description */}
        <div className="form-label" style={{ marginTop: 20 }}>Описание</div>
        <input
          type="text"
          className="form-input"
          placeholder="Указание о"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Recurring toggle */}
        <div className="toggle">
          <span className="toggle-label">Регулярная операция</span>
          <div
            className={`toggle-switch ${isRecurring ? 'active' : ''}`}
            onClick={() => setIsRecurring(!isRecurring)}
          ></div>
        </div>
      </div>
    </div>
  );
}
