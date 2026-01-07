import React from 'react';
import { Menu, X } from 'lucide-react';

export function MobileHeader({
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-900 to-emerald-800 border-b border-emerald-700 z-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-700 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-amber-50 font-bold">川村</span>
        </div>
        <h1 className="text-lg font-bold text-amber-50">Kawamura Kitchen</h1>
      </div>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="p-2 text-amber-50 hover:bg-emerald-700 rounded-lg transition-colors"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  );
}

export function MobileOverlay({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div
      className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-16"
      onClick={onClose}
    />
  );
}
