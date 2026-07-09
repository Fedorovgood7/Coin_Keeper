import { useState } from 'react';
import { useStore } from '@/shared/store';
import { formatMoney } from '@/shared/lib/utils';

interface EditTransactionModalProps {
  transactionId: string;
  onClose: () => void;
}

export function EditTransactionModal({ transactionId, onClose }: EditTransactionModalProps) {
  const { transactions, categories, accounts, updateTransaction } = useStore();
  const transaction = transactions.find((t) => t.id === transactionId);

  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
  const [accountId, setAccountId] = useState(transaction?.accountId || '');
  const [toAccountId, setToAccountId] = useState(transaction?.toAccountId || '');
  const [date, setDate] = useState(transaction?.date || '');
  const [description, setDescription] = useState(transaction?.description || '');

  if (!transaction) return null;

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    updateTransaction(transactionId, {
      amount: parseFloat(amount),
      categoryId: transaction.type !== 'transfer' ? categoryId : '',
      accountId,
      toAccountId: transaction.type === 'transfer' ? toAccountId : undefined,
      date,
      description,
    });

    onClose();
  };

  const currentCategories = categories.filter((c) => c.type === transaction.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Редактировать операцию</div>
          <button onClick={onClose} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}></button>
        </div>

        {/* Amount */}
        <div className="form-label">СУММА</div>
        <input
          type="number"
          className="form-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ fontSize: 32, fontWeight: 700, textAlign: 'center' }}
        />

        {/* Category (not for transfers) */}
        {transaction.type !== 'transfer' && (
          <>
            <div className="form-label" style={{ marginTop: 20 }}>КАТЕГОРИЯ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {currentCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 12,
                    border: categoryId === cat.id ? '2px solid var(--header)' : '2px solid transparent',
                    background: 'var(--bg)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="category-icon" style={{ background: cat.color, width: 48, height: 48, fontSize: 24 }}>
                    {cat.icon}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 8, textAlign: 'center' }}>{cat.name}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Account */}
        <div className="form-label" style={{ marginTop: 20 }}>СЧЁТ</div>
        <select
          className="form-input"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          {accounts.filter((a) => !a.isArchived).map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.icon} {acc.name} ({formatMoney(acc.balance)})
            </option>
          ))}
        </select>

        {/* To Account (for transfers) */}
        {transaction.type === 'transfer' && (
          <>
            <div className="form-label" style={{ marginTop: 20 }}>КУДА</div>
            <select
              className="form-input"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              {accounts.filter((a) => !a.isArchived && a.id !== accountId).map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.icon} {acc.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Date */}
        <div className="form-label" style={{ marginTop: 20 }}>ДАТА</div>
        <input
          type="date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Description */}
        <div className="form-label" style={{ marginTop: 20 }}>ОПИСАНИЕ</div>
        <input
          type="text"
          className="form-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Комментарий"
        />

        {/* Save button */}
        <button
          onClick={handleSave}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 24, padding: 16 }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
