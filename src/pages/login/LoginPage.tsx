import { useState } from 'react';
import { useStore } from '@/shared/store';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, user } = useStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleYandexLogin = () => {
    // Yandex OAuth URL - в реальном приложении будет редирект на Yandex
    // Для демо создаём мок-пользователя
    const mockYandexUser = {
      id: 'yandex-001',
      name: 'Иван Петров',
      email: 'ivan.petrov@yandex.ru',
      avatar: 'https://avatars.yandex.net/get-yapic/00000/islands-200',
    };
    login(mockYandexUser);
    navigate('/dashboard');
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-001',
      name: 'Демо Пользователь',
      email: 'demo@coinkeeper.app',
      avatar: null,
    };
    login(demoUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    // logout() вызовётся через меню пользователя
  };

  // Если пользователь уже авторизован, показываем аватар и меню
  if (user) {
    return (
      <div className="login-container" style={{ background: 'var(--bg)' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: 16,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
              <span style={{ fontSize: 20, color: 'var(--text-secondary)' }}>⌄</span>
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 8,
                  background: 'white',
                  borderRadius: 16,
                  padding: 8,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  zIndex: 100,
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: 15,
                    color: 'var(--danger)',
                    borderRadius: 8,
                  }}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 16, padding: 16 }}
          >
            Перейти к приложению
          </button>
        </div>
      </div>
    );
  }

  // Страница входа
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">💰</div>
        <div className="login-title">CoinKeeper</div>
        <div className="login-subtitle">
          Учёт личных финансов.
          <br />
          Быстро, безопасно, под контролем.
        </div>
        <button className="login-btn login-btn-primary" onClick={handleYandexLogin}>
          <span style={{ marginRight: 8, fontWeight: 700 }}>Я</span> Войти с Яндекс ID
        </button>
        <button className="login-btn login-btn-secondary" onClick={handleDemoLogin}>
          Демо-вход
        </button>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          Временный вход без авторизации
        </div>
        <div style={{ margin: '32px 0 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
          возможности
        </div>
        <div style={{ textAlign: 'left' }}>
          {[
            { icon: '💳', title: 'Счета и карты', desc: 'Карта, наличные, накопительный счёт — всё в одном месте' },
            { icon: '📊', title: 'Бюджет и лимиты', desc: 'Контроль расходов по категориям и безопасная сумма в день' },
            { icon: '📈', title: 'Аналитика', desc: 'Графики расходов, динамика по дням, сравнение периодов' },
          ].map((feature, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>{feature.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{feature.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
