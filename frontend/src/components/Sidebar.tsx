import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">💰</span>
        <span>CoinKeeper</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">📊</span>
          <span>Дашборд</span>
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">💸</span>
          <span>Операции</span>
        </NavLink>
        <NavLink to="/accounts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">💳</span>
          <span>Счета</span>
        </NavLink>
        <NavLink to="/budget" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">🎯</span>
          <span>Бюджет</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">📈</span>
          <span>Аналитика</span>
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">🏷️</span>
          <span>Категории</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            {user.name || user.email}
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </aside>
  );
}
