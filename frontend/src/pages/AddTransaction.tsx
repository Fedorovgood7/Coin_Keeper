import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store';
import { formatMoney } from '@/utils';
import { hapticFeedback } from '@/utils/telegram';

export default function AddTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as 'expense' | 'income' | 'transfer' || 'expense';

  const { accounts, categories, addTransaction } = useStore();
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>(initialType);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const currentCategories = categories.filter((c) => c.type === type);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (type !== 'transfer' && !categoryId) return;
    if (type === 'transfer' && !targetAccountId) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      accountId,
      targetAccountId: type === 'transfer' ? targetAccountId : undefined,
      categoryId: type !== 'transfer' ? categoryId : undefined,
      date: new Date(date).toISOString(),
      note,
    });

    navigate('/transactions');
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <button
            className="toolbar-btn"
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', fontSize: 20 }}
          >
            ←
          </button>
          <h1>Добавление операции</h1>
          <div style={{ width: 40 }}></div>
        </div>

        <div className="tabs">
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              className={`tab ${type === t ? 'active' : ''}`}
              onClick={() => setType(t)}
            >
              {t === 'expense' ? 'Расходы' : t === 'income' ? 'Доходы' : 'Перевод'}
            </button>
          ))}
        </div>

        <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="card-title">Сумма</div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            style={{
              fontSize: 36,
              fontWeight: 700,
              textAlign: 'center',
              border: 'none',
              background: 'none',
              width: '100%',
              outline: 'none',
              fontFamily: 'var(--font)',
            }}
          />
        </div>

        {type !== 'transfer' && (
          <>
            <div className="section-title">
              <span>Категория</span>
            </div>
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
              {currentCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`btn ${categoryId === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryId(cat.id)}
                  style={{ padding: 12, flexDirection: 'column', gap: 4 }}
                >
                  <div style={{ fontSize: 24 }}>{cat.emoji || '📦'}</div>
                  <div style={{ fontSize: 11 }}>{cat.name}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {type === 'transfer' && (
          <>
            <div className="form-group">
              <label className="form-label">Откуда</label>
              <select
                className="form-input"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
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
            <div className="form-group">
              <label className="form-label">Куда</label>
              <select
                className="form-input"
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
              >
                {accounts
                  .filter((a) => !a.archived && a.id !== accountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMoney(acc.balance)})
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {type !== 'transfer' && (
          <div className="form-group">
            <label className="form-label">Счёт</label>
            <select
              className="form-input"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
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
        )}

        <div className="form-group">
          <label className="form-label">Дата</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Заметка</label>
          <input
            className="form-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Комментарий (необязательно)"
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 16 }}
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || (type !== 'transfer' && !categoryId)}
        >
          Создать
        </button>

        <div className="bottom-spacer"></div>
      </div>
    </div>
  );
}
