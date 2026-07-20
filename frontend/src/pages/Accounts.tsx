import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { formatMoney } from '@/utils';
import type { AccountType } from '@/types';

export default function Accounts() {
  const { accounts, loadAccounts, createAccount, updateAccount, archiveAccount } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('card');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState('RUB');

  useEffect(() => {
    loadAccounts();
  }, []);

  const totalBalance = accounts.filter((a) => !a.isArchived).reduce((s, a) => s + a.balance, 0);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setType('card');
    setInitialBalance('');
    setCurrency('RUB');
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return;
    setEditingId(id);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(acc.initialBalance.toString());
    setCurrency(acc.currency);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editingId) {
      await updateAccount(editingId, name);
    } else {
      await createAccount({
        name,
        type,
        currency,
        initialBalance: parseFloat(initialBalance) || 0,
      });
    }
    setShowModal(false);
  };

  const handleArchive = async (id: string) => {
    if (confirm('Архивировать счёт?')) {
      await archiveAccount(id);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Счета</h1>
          <div className="toolbar">
            <button className="toolbar-btn toolbar-btn-primary" onClick={openCreate}>
              + Добавить
            </button>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="card-title">Общий баланс</div>
          <div className="card-value">{formatMoney(totalBalance)}</div>
        </div>

        {accounts
          .filter((a) => !a.isArchived)
          .map((acc) => (
            <div
              className="list-item"
              key={acc.id}
              onClick={() => openEdit(acc.id)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="icon-circle"
                style={{
                  background:
                    acc.type === 'cash'
                      ? '#4caf50'
                      : acc.type === 'deposit'
                      ? '#26a69a'
                      : '#4285f4',
                }}
              >
                {acc.type === 'cash' ? '💵' : acc.type === 'deposit' ? '' : '💳'}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{acc.name}</div>
                <div className="list-item-subtitle">
                  {acc.type === 'cash'
                    ? 'Наличные'
                    : acc.type === 'deposit'
                    ? 'Накопительный'
                    : 'Карта'}{' '}
                  · {acc.currency}
                </div>
              </div>
              <div className="list-item-amount">{formatMoney(acc.balance)}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchive(acc.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  padding: '4px 8px',
                }}
              >
                
              </button>
            </div>
          ))}

        <div className="bottom-spacer"></div>
      </div>

      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingId ? 'Редактировать счёт' : 'Новый счёт'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Название</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Сберкарта"
              />
            </div>

            {!editingId && (
              <>
                <div className="form-group">
                  <label className="form-label">Тип счёта</label>
                  <div className="grid-3">
                    {([
                      { value: 'cash', label: 'Наличные', icon: '💵' },
                      { value: 'card', label: 'Карта', icon: '💳' },
                      { value: 'deposit', label: 'Накопительный', icon: '' },
                    ] as const).map((t) => (
                      <button
                        key={t.value}
                        className={`btn ${type === t.value ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setType(t.value)}
                        style={{ padding: '12px 8px', fontSize: 12 }}
                      >
                        <div style={{ fontSize: 20 }}>{t.icon}</div>
                        <div>{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Валюта</label>
                  <select
                    className="form-input"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="RUB">RUB ₽</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Начальный баланс</label>
                  <input
                    className="form-input"
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </>
            )}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
              {editingId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
