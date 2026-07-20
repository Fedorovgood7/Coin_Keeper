import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useTelegram, usePlatform } from '@/utils/platform';
import { hapticFeedback } from '@/utils/telegram';

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const platform = usePlatform();
  const { user: tgUser } = useTelegram();

  const handleLogin = () => {
    hapticFeedback('light');
    
    let profile;
    
    if (platform === 'telegram' && tgUser) {
      // Авторизация через Telegram
      profile = {
        id: tgUser.id,
        name: tgUser.name,
        email: tgUser.username ? `${tgUser.username}@telegram` : undefined,
        createdAt: new Date().toISOString(),
      };
    } else {
      // Демо-авторизация для web/pwa
      profile = {
        id: 'user_' + Date.now(),
        name: 'Пользователь',
        createdAt: new Date().toISOString(),
      };
    }
    
    login(profile);
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-logo">💰</div>
        <h1 className="login-title">CoinKeeper</h1>
        <p className="login-subtitle">
          Контролируйте свои финансы — учитывайте расходы, планируйте бюджет, достигайте целей
        </p>
        <button className="btn btn-primary login-btn" onClick={handleLogin}>
          {platform === 'telegram' ? 'Войти через Telegram' : 'Войти через Yandex ID'}
        </button>
        {platform === 'web' && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16, textAlign: 'center' }}>
            Также доступно в Telegram и как PWA
          </p>
        )}
      </div>
      <div className="login-right">
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <span>Учёт доходов и расходов</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon"></div>
            <span>Планирование бюджета</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📈</div>
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
