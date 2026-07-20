import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handleLogin = () => {
    // Демо-авторизация (в продакшене здесь будет редирект на Yandex OAuth)
    const profile = {
      id: 'user_' + Date.now(),
      name: 'Пользователь',
      createdAt: new Date().toISOString(),
    };
    login(profile);
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-logo"></div>
        <h1 className="login-title">CoinKeeper</h1>
        <p className="login-subtitle">
          Контролируйте свои финансы — учитывайте расходы, планируйте бюджет, достигайте целей
        </p>
        <button className="btn btn-primary login-btn" onClick={handleLogin}>
          Войти через Yandex ID
        </button>
      </div>
      <div className="login-right">
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <span>Учёт доходов и расходов</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">🎯</div>
            <span>Планирование бюджета</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon"></div>
            <span>Аналитика и графики</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">🏦</div>
            <span>Несколько счетов</span>
          </div>
        </div>
      </div>
    </div>
  );
}