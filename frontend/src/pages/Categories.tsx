import { useState } from 'react';
import { useStore } from '@/store';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState('#4285f4');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const openCreate = (catType: 'expense' | 'income') => {
    setEditingId(null);
    setName('');
    setEmoji('');
    setColor('#4285f4');
    setType(catType);
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setEditingId(id);
    setName(cat.name);
    setEmoji(cat.emoji);
    setColor(cat.color);
    if (cat.type === 'expense' || cat.type === 'income') {
      setType(cat.type);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateCategory(editingId, { name, emoji, color, type });
    } else {
      addCategory({ name, emoji, color, type });
    }
    setShowModal(false);
  };

  const EMOJIS = ['', '🍕', '', '🎬', '', '🛍️', '', '☕', '', '👕', '️', '💼', '', '🎁', '', '🎯', '', '🍔', '🚌', '💳', '🏦'];
  const COLORS = ['#ff7043', '#4285f4', '#e91e63', '#4caf50', '#7e57c2', '#78909c', '#26a69a', '#f4b400', '#9c27b0', '#00bcd4'];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Категории</h1>
        </div>

        <div className="section-title">
          <span>Расходы</span>
          <button
            className="section-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => openCreate('expense')}
          >
            + Добавить
          </button>
        </div>
        {expenseCategories.map((cat) => (
          <div className="list-item" key={cat.id} onClick={() => openEdit(cat.id)} style={{ cursor: 'pointer' }}>
            <div className="icon-circle" style={{ background: cat.color, fontSize: 20 }}>
              {cat.emoji || '📦'}
            </div>
            <div className="list-item-content">
              <div className="list-item-title">{cat.name}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Удалить категорию?')) deleteCategory(cat.id);
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
        ))}

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>Доходы</span>
          <button
            className="section-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => openCreate('income')}
          >
            + Добавить
          </button>
        </div>
        {incomeCategories.map((cat) => (
          <div className="list-item" key={cat.id} onClick={() => openEdit(cat.id)} style={{ cursor: 'pointer' }}>
            <div className="icon-circle" style={{ background: cat.color, fontSize: 20 }}>
              {cat.emoji || '📦'}
            </div>
            <div className="list-item-content">
              <div className="list-item-title">{cat.name}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Удалить категорию?')) deleteCategory(cat.id);
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
        ))}

        <div className="bottom-spacer"></div>
      </div>

      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingId ? 'Редактировать категорию' : 'Новая категория'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Название</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Кафе"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Иконка</label>
              <div className="grid-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    className={`btn ${emoji === e ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setEmoji(e)}
                    style={{ padding: 8, fontSize: 20 }}
                  >
                    {e || '📦'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Цвет</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      border: color === c ? '3px solid var(--fg)' : '3px solid transparent',
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
              {editingId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
