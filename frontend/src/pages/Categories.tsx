import { useState, useEffect } from 'react';
import { useStore } from '@/store';

export default function Categories() {
  const { categories, loadCategories, updateCategory } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [color, setColor] = useState('#4285f4');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const openEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setEditingId(id);
    setColor(cat.color);
    setIcon(cat.icon);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingId) return;
    await updateCategory(editingId, { color, icon });
    setShowModal(false);
  };

  const ICONS = ['📦', '🍕', '🛒', '🎬', '💊', '🛍️', '☕', '👕', '🏋️', '💼', '💻', '🎁', '📈', '🎯', '🍔', '🚌', '💳', '🏦', '📱', '🏠'];
  const COLORS = ['#ff7043', '#4285f4', '#e91e63', '#4caf50', '#7e57c2', '#78909c', '#26a69a', '#f4b400', '#9c27b0', '#00bcd4'];

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="header">
          <h1>Категории</h1>
        </div>

        <div className="section-title">
          <span>Расходы</span>
        </div>
        {expenseCategories.map((cat) => (
          <div className="list-item" key={cat.id} onClick={() => openEdit(cat.id)} style={{ cursor: 'pointer' }}>
            <div className="icon-circle" style={{ background: cat.color, fontSize: 20 }}>
              {cat.icon || '📦'}
            </div>
            <div className="list-item-content">
              <div className="list-item-title">{cat.name}</div>
            </div>
          </div>
        ))}

        <div className="section-title" style={{ marginTop: 24 }}>
          <span>Доходы</span>
        </div>
        {incomeCategories.map((cat) => (
          <div className="list-item" key={cat.id} onClick={() => openEdit(cat.id)} style={{ cursor: 'pointer' }}>
            <div className="icon-circle" style={{ background: cat.color, fontSize: 20 }}>
              {cat.icon || '📦'}
            </div>
            <div className="list-item-content">
              <div className="list-item-title">{cat.name}</div>
            </div>
          </div>
        ))}

        <div className="bottom-spacer"></div>
      </div>

      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Настроить категорию</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Иконка</label>
              <div className="grid-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {ICONS.map((e) => (
                  <button
                    key={e}
                    className={`btn ${icon === e ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIcon(e)}
                    style={{ padding: 8, fontSize: 20 }}
                  >
                    {e}
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
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
