import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { formatMoney } from '@/utils';

export default function EditRecurring() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { recurring, accounts, categories, loadRecurring, updateRecurring, deleteRecurring, error, clearError } = useStore();
  
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [periodicity, setPeriodicity] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [nextDate, setNextDate] = useState('');
  const [comment, setComment] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecurring();
  }, []);

  useEffect(() => {
    if (id && recurring.length > 0) {
      const rec = recurring.find((r) => r.id === id);
      if (rec) {
        setType(rec.type as 'expense' | 'income');
        setAmount(rec.amount.toString());
        setAccountId(rec.accountId);
        setCategoryId(rec.categoryId);
        setPeriodicity(rec.periodicity);
        setNextDate(rec.nextDate.split('T')[0]);
        setComment(rec.comment || '');
        setIsActive(rec.isActive);
      }
    }
  }, [id, recurring]);

  const rec = recurring.find((r) => r.id === id);
  const currentCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async () => {
    if (!amount || !accountId || !categoryId || !nextDate || !id) return;

    setSubmitting(true);
    clearError();
    try {
      await updateRecurring(id, {
        type,
        amount: parseFloat(amount),
        accountId,
        categoryId,
        periodicity,
        nextDate: new Date(nextDate).toISOString(),
        comment,
        isActive,
      });
      navigate('/budget');
    } catch (e) {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Удалить регулярный платёж?')) return;
    
    setSubmitting(true);
    clearError();
    try {
      await deleteRecurring(id);
      navigate('/budget');
    } catch (e) {
      setSubmitting(false);
    }
  };

  if (!rec) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div>Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <button
            className="toolbar-btn"
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--fg)' }}
          >
            ←
          </button>
          <h1>Редактирование платежа</h1>
          <div style={{ width: 40 }}></div>
        </div>

        {error && (
          <div style={{ background: 'rgba(214, 48, 48, 0.15)', border: '1px solid var(--danger)', color: '#ff6b6b', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Тип</label>
          <div className="grid-2">
            <button
              className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setType('expense')}
            >
              Расход
            </button>
            <button
              className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setType('income')}
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Счёт</label>
          <select
            className="form-input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
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
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            {currentCategories.map((cat) => (
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
            value={periodicity}
            onChange={(e) => setPeriodicity(e.target.value as 'daily' | 'weekly' | 'monthly')}
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
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Комментарий</label>
          <input
            className="form-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Необязательно"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Статус</label>
          <div className="grid-2">
            <button
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsActive(true)}
            >
              Активен
            </button>
            <button
              className={`btn ${!isActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsActive(false)}
            >
              Неактивен
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 16 }}
          onClick={handleSubmit}
          disabled={!amount || !accountId || !categoryId || !nextDate || submitting}
        >
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </button>

        <button
          className="btn btn-danger"
          style={{ width: '100%', padding: 16, marginTop: 12 }}
          onClick={handleDelete}
          disabled={submitting}
        >
          {submitting ? 'Удаление...' : 'Удалить платёж'}
        </button>

        <div className="bottom-spacer"></div>
      </div>
    </div>
  );
}
