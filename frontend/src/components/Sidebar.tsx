import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: '📊', label: 'Дашборд' },
    { to: '/transactions', icon: '💸', label: 'Операции' },
    { to: '/accounts', icon: '💳', label: 'Счета' },
    { to: '/budget', icon: '🎯', label: 'Бюджет' },
    { to: '/analytics', icon: '📈', label: 'Аналитика' },
    { to: '/categories', icon: '🏷️', label: 'Категории' },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">💰</span>
          <span>CoinKeeper</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.email}
                  className="sidebar-user-avatar"
                />
              )}
              <span>{user.name || user.email}</span>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="sidebar-mobile">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-mobile-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-mobile-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
