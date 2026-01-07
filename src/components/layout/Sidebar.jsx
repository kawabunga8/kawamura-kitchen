import React from 'react';
import { Calendar, Lightbulb, Package, Users, Home } from 'lucide-react';

export function Sidebar({
  activeView,
  setActiveView,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'requests', label: 'Requests', icon: Lightbulb },
    { id: 'pantry', label: 'Pantry', icon: Package },
    { id: 'family', label: 'Family', icon: Users }
  ];

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`
      fixed md:static inset-0 z-40 transform transition-transform duration-300 ease-in-out
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      w-64 bg-gradient-to-b from-emerald-900 to-emerald-800 border-r border-emerald-700 flex flex-col
      mt-16 md:mt-0
    `}>
      {/* Desktop Header */}
      <div className="p-6 border-b border-emerald-700 hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-amber-50 font-bold text-lg">川村</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-amber-50">Kawamura Kitchen</h1>
            <p className="text-xs text-emerald-200">Meal Coordinator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeView === item.id
                  ? 'bg-orange-700 text-amber-50'
                  : 'text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-emerald-700">
        <div className="bg-emerald-950 border border-emerald-600 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-amber-100 mb-1">Live Sync</p>
          <p className="text-xs text-emerald-200">Everyone sees updates in real-time!</p>
        </div>

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-amber-50 rounded-lg transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
