import React, { useState, useEffect } from 'react';
import { KitchenDataProvider, useKitchenData } from './hooks/useKitchenData.jsx';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader, MobileOverlay } from './components/layout/MobileHeader';
import { DashboardView } from './components/views/DashboardView';
import { ScheduleView } from './components/views/ScheduleView';
import { RequestsView } from './components/views/RequestsView';
import { PantryView } from './components/views/PantryView';
import { FamilyView } from './components/views/FamilyView';
import { FAMILY_PASSWORD } from './lib/constants';

function LoginScreen({ onLogin }) {
  const [passwordInput, setPasswordInput] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === FAMILY_PASSWORD) {
      onLogin();
      setPasswordInput('');
    } else {
      toast.error('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-stone-300">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-amber-50 font-bold text-3xl">川村</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kawamura Kitchen</h1>
            <p className="text-gray-600">Family Members Only</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Family Password
              </label>
              <input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-200 transition-colors"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium text-lg"
            >
              Enter Kitchen
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Password required to prevent unauthorized access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
          <span className="text-amber-50 font-bold text-2xl">川村</span>
        </div>
        <p className="text-gray-600">Loading Kawamura Kitchen...</p>
      </div>
    </div>
  );
}

function MainApp({ onLogout }) {
  const { loading } = useKitchenData();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Mobile Header */}
      <MobileHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={onLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Overlay */}
      <MobileOverlay
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        {activeView === 'dashboard' && <DashboardView setActiveView={setActiveView} />}
        {activeView === 'schedule' && <ScheduleView />}
        {activeView === 'requests' && <RequestsView />}
        {activeView === 'pantry' && <PantryView />}
        {activeView === 'family' && <FamilyView />}
      </div>
    </div>
  );
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if already authenticated on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('kawamura_kitchen_auth');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('kawamura_kitchen_auth', 'authenticated');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kawamura_kitchen_auth');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <KitchenDataProvider>
      <MainApp onLogout={handleLogout} />
    </KitchenDataProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
