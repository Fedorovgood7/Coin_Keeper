import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '@/shared/store';

const navItems = [
  { path: '/dashboard', label: 'Главная', icon: '' },
  { path: '/transactions', label: 'Операции', icon: '💵' },
  { path: '/accounts', label: 'Счета', icon: '' },
  { path: '/analytics', label: 'Аналитика', icon: '' },
  { path: '/budget', label: 'Бюджет', icon: '📅' },
];

export function Sidebar() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>CoinKeeper</div>
      </div>
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            color: 'white',
          }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {user?.name.charAt(0) || '?'}
            </div>
          )}
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || 'Гость'}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{user?.email || ''}</div>
          </div>
          <span style={{ fontSize: 16 }}>⌄</span>
        </button>

        {showUserMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 24,
              right: 24,
              marginBottom: 8,
              background: 'white',
              borderRadius: 12,
              padding: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              zIndex: 100,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 12px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                fontSize: 14,
                color: 'var(--danger)',
                borderRadius: 8,
              }}
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
