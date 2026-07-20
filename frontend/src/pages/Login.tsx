import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useStore((state) => state.login);
  const user = useStore((state) => state.user);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }

    const code = searchParams.get('code');
    if (code) {
      setLoading(true);
      setError(null);
      login(code)
        .then(() => navigate('/'))
        .catch((e) => {
          setError('Ошибка входа: ' + (e as Error).message);
          setLoading(false);
        });
    }
  }, [user, searchParams]);

  const handleLogin = () => {
    const clientId = 'f5bdc1e4c2494499b66592bd9fa7ee43';
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-logo"></div>
        <h1 className="login-title">CoinKeeper</h1>
        <p className="login-subtitle">
          Контролируйте свои финансы — учитывайте расходы, планируйте бюджет, достигайте целей
        </p>
        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}
        <button className="btn login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Вход...' : 'Войти через Yandex ID'}
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
