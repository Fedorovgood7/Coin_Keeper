import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '@/store';
import { isTelegram, initTelegram } from '@/utils/telegram';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Accounts from '@/pages/Accounts';
import Budget from '@/pages/Budget';
import Analytics from '@/pages/Analytics';
import Categories from '@/pages/Categories';
import AddTransaction from '@/pages/AddTransaction';
import './styles.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function TelegramInit() {
  const login = useStore((state) => state.login);
  
  useEffect(() => {
    if (isTelegram()) {
      const tgUser = initTelegram();
      if (tgUser && !useStore.getState().user) {
        // Автоматическая авторизация через Telegram
        login({
          id: tgUser.id,
          name: tgUser.name,
          email: tgUser.username ? `${tgUser.username}@telegram` : undefined,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }, [login]);
  
  return null;
}

export default function App() {
  return (
    <>
      <TelegramInit />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-transaction"
          element={
            <ProtectedRoute>
              <AddTransaction />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
