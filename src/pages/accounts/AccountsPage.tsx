import { useState } from 'react';
import { useStore } from '@/shared/store';
import { formatMoney, getTotalBalance } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';
import type { AccountType } from '@/entities/types';

const ACCOUNT_COLORS = ['#1a1f2e', '#4a9d5b', '#4a7fd9', '#9b8bd9', '#e88ba8', '#d9656b', '#e8652d', '#e8b84d', '#4a9d8b', '#4a9dc9'];

export function AccountsPage() {
  const { accounts, addAccount, updateAccount } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('card');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  const totalBalance = getTotalBalance(accounts);

  const handleSave = () => {
    if (!name || !balance) return;

    if (editingAccount) {
      updateAccount(editingAccount, { name, type, balance: parseFloat(balance), color });
    } else {
      addAccount({
        name,
        type,
        balance: parseFloat(balance),
        currency: 'RUB',
        color,
        icon: type === 'card' ? '💳' : type === 'cash' ? '💰' : '🐷',
        isArchived: false,
      });
    }

    setShowModal(false);
    setEditingAccount(null);
    setName('');
    setType('card');
    setBalance('');
    setColor(ACCOUNT_COLORS[0]);
  };

  const openEdit = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;
    setEditingAccount(accountId);
    setName(account.name);
    setType(account.type);
    setBalance(account.balance.toString());
    setColor(account.color);
    setShowModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: 'white', fontSize: 20, textDecoration: 'none' }}>‹</Link>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Счета</div>
          <div style={{ width: 20 }}></div>
        </div>
      </div>

      {/* Total balance */}
      <div style={{ textAlign: 'center', padding: '24px 20px' }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Общий баланс</div>
        <div style={{ fontSize: 40, fontWeight: 700 }}>{formatMoney(totalBalance)}</div>
      </div>

      {/* Accounts list */}
      <div style={{ padding: '0 20px' }}>
        {accounts.filter((a) => !a.isArchived).map((account) => (
          <div
            key={account.id}
            className="account-card"
            onClick={() => openEdit(account.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="account-icon" style={{ background: account.color }}>
              {account.icon}
            </div>
            <div className="account-info">
              <div className="account-name">{account.name}</div>
            </div>
            <div className="account-balance">{formatMoney(account.balance)}</div>
          </div>
        ))}
      </div>

      {/* Add account button */}
      <div style={{ padding: 20 }}>
        <button
          onClick={() => {
            setEditingAccount(null);
            setName('');
            setType('card');
            setBalance('');
            setColor(ACCOUNT_COLORS[0]);
            setShowModal(true);
          }}
          className="btn btn-dark"
          style={{ width: '100%', padding: 16 }}
        >
          + Добавить счёт
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="account-icon" style={{ background: color, width: 48, height: 48 }}>
                  {type === 'card' ? '💳' : type === 'cash' ? '💰' : '🐷'}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{editingAccount ? name || 'Редактировать' : 'Новый счёт'}</div>
                  {editingAccount && <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{formatMoney(parseFloat(balance) || 0)}</div>}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 24, color: 'var(--text-secondary)' }}>✕</button>
            </div>

            {/* Account type */}
            <div className="form-label">ТИП СЧЁТА</div>
            <div className="type-selector">
              {([
                { type: 'cash' as AccountType, label: 'Наличные', icon: '💰' },
                { type: 'card' as AccountType, label: 'Карта', icon: '' },
                { type: 'savings' as AccountType, label: 'Накопительный', icon: '🏦' },
              ]).map((t) => (
                <div
                  key={t.type}
                  className={`type-option ${type === t.type ? 'selected' : ''}`}
                  onClick={() => setType(t.type)}
                >
                  <div className="type-option-icon">{t.icon}</div>
                  <div className="type-option-label">{t.label}</div>
                </div>
              ))}
            </div>

            {/* Name */}
            <div className="form-label">НАЗВАНИЕ</div>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название счёта"
            />

            {/* Balance */}
            <div className="form-label" style={{ marginTop: 16 }}>БАЛАНС</div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className="form-input"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                style={{ paddingRight: 40 }}
              />
              <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₽</span>
            </div>

            {/* Color */}
            <div className="form-label" style={{ marginTop: 16 }}>ЦВЕТ</div>
            <div className="color-picker">
              {ACCOUNT_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                ></div>
              ))}
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              className="btn btn-dark"
              style={{ width: '100%', marginTop: 24, padding: 16 }}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
