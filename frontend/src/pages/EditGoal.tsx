import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { formatMoney } from '@/utils';

export default function EditGoal() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { goals, accounts, loadGoals, updateGoal, deleteGoal, topupGoal, error, clearError } = useStore();
  
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (id && goals.length > 0) {
      const goal = goals.find((g) => g.id === id);
      if (goal) {
        setTitle(goal.title);
        setTargetAmount(goal.targetAmount.toString());
        setDeadline(goal.deadline.split('T')[0]);
      }
    }
  }, [id, goals]);

  const goal = goals.find((g) => g.id === id);

  const handleSubmit = async () => {
    if (!title || !targetAmount || !deadline || !id) return;

    setSubmitting(true);
    clearError();
    try {
      await updateGoal(id, {
        title,
        targetAmount: parseFloat(targetAmount),
        deadline: new Date(deadline).toISOString(),
      });
      navigate('/budget');
    } catch (e) {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Удалить цель?')) return;
    
    setSubmitting(true);
    clearError();
    try {
      await deleteGoal(id);
      navigate('/budget');
    } catch (e) {
      setSubmitting(false);
    }
  };

  const handleTopup = async () => {
    if (!id || !topupAmount || parseFloat(topupAmount) <= 0) return;
    
    setSubmitting(true);
    clearError();
    try {
      await topupGoal(id, parseFloat(topupAmount), accounts[0]?.id || '');
      setTopupAmount('');
      loadGoals();
    } catch (e) {
      setSubmitting(false);
    }
  };

  if (!goal) {
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
          <h1>Редактирование цели</h1>
          <div style={{ width: 40 }}></div>
        </div>

        {error && (
          <div style={{ background: 'rgba(214, 48, 48, 0.15)', border: '1px solid var(--danger)', color: '#ff6b6b', padding: '10px 14px', borderRadius: 'var(--radius)', marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="icon-circle" style={{ background: '#4285f4', width: 40, height: 40, fontSize: 18 }}>
              🎯
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{goal.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <span className={`badge ${goal.status === 'completed' ? 'badge-success' : goal.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
              {goal.status === 'completed' ? 'Достигнута' : goal.status === 'failed' ? 'Просрочена' : 'В процессе'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatMoney(goal.currentAmount)}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>/ {formatMoney(goal.targetAmount)}</div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: goal.progress + '%' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>{Math.round(goal.progress)}%</span>
            <span style={{ color: 'var(--muted)' }}>осталось {formatMoney(goal.targetAmount - goal.currentAmount)}</span>
          </div>
        </div>

        {goal.status !== 'completed' && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="form-label" style={{ marginBottom: 12 }}>Пополнить цель</div>
            <div className="form-group">
              <label className="form-label">Сумма пополнения</label>
              <input
                className="form-input"
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleTopup}
              disabled={!topupAmount || parseFloat(topupAmount) <= 0 || submitting}
            >
              Пополнить
            </button>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Название</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Отпуск"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Целевая сумма</label>
          <input
            className="form-input"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Дедлайн</label>
          <input
            className="form-input"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 16 }}
          onClick={handleSubmit}
          disabled={!title || !targetAmount || !deadline || submitting}
        >
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </button>

        <button
          className="btn btn-danger"
          style={{ width: '100%', padding: 16, marginTop: 12 }}
          onClick={handleDelete}
          disabled={submitting}
        >
          {submitting ? 'Удаление...' : 'Удалить цель'}
        </button>

        <div className="bottom-spacer"></div>
      </div>
    </div>
  );
}
