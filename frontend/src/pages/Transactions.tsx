import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { formatMoney, formatDateShort } from '@/utils';

export default function Transactions() {
  const navigate = useNavigate();
  const { transactions, categories, accounts, deleteTransaction } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [filterAccountId, setFilterAccountId] = useState<string>('all');

  const filteredTransactions = transactions
    .filter((t) => filterType === 'all' || t.type === filterType)
    .filter((t) => filterAccountId === 'all' || t.accountId === filterAccountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped: Record<string, typeof filteredTransactions> = {};
  filteredTransactions.forEach((tx) => {
    const date = tx.date.split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(tx);
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Операции</h1>
          <div className="toolbar">
            <button
              className="toolbar-btn toolbar-btn-primary"
              onClick={() => navigate('/add-transaction?type=expense')}
            >
              + Добавить
            </button>
          </div>
        </div>

        <div className="filter-bar">
          {(['all', 'expense', 'income', 'transfer'] as const).map((type) => (
            <button
              key={type}
              className={`filter-chip ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'Все' : type === 'expense' ? 'Расходы' : type === 'income' ? 'Доходы' : 'Переводы'}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <select
            className="filter-chip"
            value={filterAccountId}
            onChange={(e) => setFilterAccountId(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="all">Все счета</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <div className="section-title" style={{ marginTop: 16 }}>
              <span>{formatDateShort(date)}</span>
            </div>
            {txs.map((tx) => {
              const category = categories.find((c) => c.id === tx.categoryId);
              const account = accounts.find((a) => a.id === tx.accountId);
              const targetAccount = accounts.find((a) => a.id === tx.targetAccountId);
              return (
                <div className="list-item" key={tx.id}>
                  <div
                    className="icon-circle"
                    style={{ background: category?.color || 'var(--border)' }}
                  >
                    {tx.type === 'transfer' ? '⇄' : category?.emoji || '📦'}
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">
                      {tx.type === 'transfer'
                        ? `${account?.name || 'Счёт'} → ${targetAccount?.name || 'Счёт'}`
                        : category?.name || 'Без категории'}
                    </div>
                    <div className="list-item-subtitle">
                      {tx.note || account?.name}
                    </div>
                  </div>
                  <div
                    className="list-item-amount"
                    style={{
                      color:
                        tx.type === 'income'
                          ? 'var(--success)'
                          : tx.type === 'expense'
                          ? 'var(--danger)'
                          : 'var(--cat-blue)',
                    }}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatMoney(tx.amount)}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Удалить операцию?')) deleteTransaction(tx.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 18,
                      cursor: 'pointer',
                      color: 'var(--danger)',
                      padding: '4px 8px',
                    }}
                  >
                    
                  </button>
                </div>
              );
            })}
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <div style={{ fontSize: 14 }}>Нет операций</div>
          </div>
        )}

        <div className="bottom-spacer"></div>
      </div>
    </div>
  );
}
