import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/shared/store';
import { Sidebar, BottomNav } from '@/shared/ui/Navigation';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
import { NewTransactionPage } from '@/pages/transactions/NewTransactionPage';
import { AccountsPage } from '@/pages/accounts/AccountsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { BudgetPage } from '@/pages/budget/BudgetPage';
import '@/app/styles.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuth } = useStore();
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <AppLayout><TransactionsPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <ProtectedRoute>
              <AppLayout><NewTransactionPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <AppLayout><AccountsPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout><AnalyticsPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <AppLayout><BudgetPage /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
