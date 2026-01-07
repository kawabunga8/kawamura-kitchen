import React from 'react';
import { useKitchenData } from '../../hooks/useKitchenData.jsx';

export function DashboardView({ setActiveView }) {
  const { dinners, requests, pantryItems } = useKitchenData();

  const upcomingDinners = dinners
    .filter(d => new Date(d.date) >= new Date())
    .slice(0, 3);
  const lowStockItems = pantryItems.filter(item => item.low_stock);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Welcome back! Here is what is happening this week</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <button
          onClick={() => setActiveView('schedule')}
          className="bg-gradient-to-br from-red-600 to-orange-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left cursor-pointer"
        >
          <div className="text-3xl font-bold text-amber-50 mb-1">{dinners.length}</div>
          <div className="text-sm text-orange-100">Meals Planned</div>
        </button>

        <button
          onClick={() => setActiveView('requests')}
          className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left cursor-pointer"
        >
          <div className="text-3xl font-bold text-amber-50 mb-1">{pendingRequests.length}</div>
          <div className="text-sm text-emerald-100">Pending Requests</div>
        </button>

        <button
          onClick={() => setActiveView('pantry')}
          className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left cursor-pointer"
        >
          <div className="text-3xl font-bold text-amber-50 mb-1">{lowStockItems.length}</div>
          <div className="text-sm text-orange-100">Low Stock Items</div>
        </button>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Upcoming Dinners */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Dinners</h3>
          {upcomingDinners.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming dinners scheduled</p>
          ) : (
            <div className="space-y-3">
              {upcomingDinners.map(dinner => (
                <div key={dinner.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{dinner.meal}</div>
                    <div className="text-sm text-gray-500">
                      {dinner.chef} - {new Date(dinner.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-orange-600 font-medium">{dinner.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-400 text-sm">All pantry items are well stocked</p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-sm text-red-600 font-medium">Low Stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
