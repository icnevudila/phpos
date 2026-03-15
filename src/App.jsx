// ============================================
// MAIN APP COMPONENT - Route Management
// ============================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './i18n/i18n-context.jsx';
import { GlobalStoreProvider } from './store/GlobalStore.jsx';
import CashierMode from './components/CashierMode.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';
import Login from './components/Login.jsx';
import { db } from './db/dexie-schema.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL UI CRASH:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Systems Critical Failure</h1>
          <p className="text-slate-400 mb-6 max-w-md">The application encountered an unexpected error. Don't worry, your data is safe.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            Refresh Dashboard
          </button>
          <div className="mt-8 text-[10px] text-slate-600 font-mono bg-black/20 p-4 rounded-lg max-w-lg overflow-hidden">
            {this.state.error?.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await db.settings.get('currentUser');
      if (currentUser?.value) {
        setUser(currentUser.value);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(userData) {
    setUser(userData);
    db.settings.put({ key: 'currentUser', value: userData });
  }

  function handleLogout() {
    setUser(null);
    db.settings.delete('currentUser');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <GlobalStoreProvider>
        <I18nProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to={user.role === 'cashier' ? '/cashier' : '/manager'} />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/cashier"
                element={
                  user && user.role === 'cashier' ? (
                    <CashierMode userId={user.id} tenantId={user.tenantId} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/manager"
                element={
                  user && (user.role === 'manager' || user.role === 'owner') ? (
                    <ManagerDashboard userId={user.id} tenantId={user.tenantId} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </GlobalStoreProvider>
    </ErrorBoundary>
  );
}

export default App;

