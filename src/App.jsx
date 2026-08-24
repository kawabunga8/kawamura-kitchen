import React, { useState } from 'react';
import { KitchenDataProvider, useKitchenData } from './hooks/useKitchenData.jsx';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader, MobileOverlay } from './components/layout/MobileHeader';
import { DashboardView } from './components/views/DashboardView';
import { ScheduleView } from './components/views/ScheduleView';
import { RequestsView } from './components/views/RequestsView';
import { PantryView } from './components/views/PantryView';
import { FamilyView } from './components/views/FamilyView';
import { RecipesView } from './components/views/RecipesView';

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

function MainApp() {
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
        <div key={activeView} className="page-zoom-in h-full">
          {activeView === 'dashboard' && <DashboardView setActiveView={setActiveView} />}
          {activeView === 'schedule' && <ScheduleView />}
          {activeView === 'requests' && <RequestsView />}
          {activeView === 'pantry' && <PantryView />}
          {activeView === 'family' && <FamilyView />}
          {activeView === 'recipes' && <RecipesView />}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <KitchenDataProvider>
      <MainApp />
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
