import React, { useState, useEffect } from 'react';
import { Calendar, ChefHat, Lightbulb, Package, Users, Home, Plus, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [familyMembers, setFamilyMembers] = useState([]);
  const [dinners, setDinners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [requestTab, setRequestTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const membersSubscription = supabase
      .channel('family_members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, () => {
        loadData();
      })
      .subscribe();

    const dinnersSubscription = supabase
      .channel('dinners_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dinners' }, () => {
        loadData();
      })
      .subscribe();

    const requestsSubscription = supabase
      .channel('requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        loadData();
      })
      .subscribe();

    const pantrySubscription = supabase
      .channel('pantry_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pantry_items' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(membersSubscription);
      supabase.removeChannel(dinnersSubscription);
      supabase.removeChannel(requestsSubscription);
      supabase.removeChannel(pantrySubscription);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, dinnersRes, requestsRes, pantryRes] = await Promise.all([
        supabase.from('family_members').select('*').order('id'),
        supabase.from('dinners').select('*').order('date'),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('pantry_items').select('*').order('name')
      ]);

      if (membersRes.data) setFamilyMembers(membersRes.data);
      if (dinnersRes.data) setDinners(dinnersRes.data);
      if (requestsRes.data) setRequests(requestsRes.data);
      if (pantryRes.data) setPantryItems(pantryRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDateKey = (date) => date.toISOString().split('T')[0];
  
  const formatWeekRange = () => {
    const weekDates = getWeekDates();
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const addFamilyMember = async () => {
    const name = prompt('Member name:');
    if (!name) return;
    const email = prompt('Email:');
    if (!email) return;
    const phone = prompt('Phone (optional):');
    const preferences = prompt('Food preferences (optional):');
  
    await supabase.from('family_members').insert([{
      name,
      email,
      phone: phone || '',
      preferences: preferences || '',
      email_notifications: true
  }]);
  
    // Manually reload data after adding
    await loadData();
  };

  const deleteFamilyMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;

    await supabase.from('family_members').delete().eq('id', memberId);
    await loadData();
  };

  const addDinner = async (date) => {
    const meal = prompt('What is for dinner?');
    if (!meal) return;
    
    if (familyMembers.length === 0) {
      alert('Please add family members first!');
      return;
    }
    
    const chefOptions = familyMembers.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    const chefIndex = prompt(`Who is cooking?\n${chefOptions}\n\nEnter number:`);
    if (!chefIndex) return;
    
    const chef = familyMembers[parseInt(chefIndex) - 1];
    if (!chef) {
      alert('Invalid selection');
      return;
    }
    
    const time = prompt('What time? (e.g., 18:00)', '18:00');
    if (!time) return;
    
    await supabase.from('dinners').insert([{
      date: formatDateKey(date),
      meal,
      chef: chef.name,
      time
    }]);
  };

  const addRequest = async () => {
    const meal = prompt('What meal would you like?');
    if (!meal) return;
    
    if (familyMembers.length === 0) {
      alert('Please add family members first!');
      return;
    }
    
    const requestorOptions = familyMembers.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    const requestorIndex = prompt(`Who is requesting?\n${requestorOptions}\n\nEnter number:`);
    if (!requestorIndex) return;
    
    const requestor = familyMembers[parseInt(requestorIndex) - 1];
    if (!requestor) {
      alert('Invalid selection');
      return;
    }
    
    await supabase.from('requests').insert([{
      meal,
      requested_by: requestor.name,
      status: 'pending',
      votes: 0
    }]);
  };

  const scheduleRequest = async (requestId) => {
    await supabase.from('requests').update({ status: 'scheduled' }).eq('id', requestId);
  };

  const addPantryItem = async () => {
    const name = prompt('Item name:');
    if (!name) return;
    const quantity = prompt('Quantity:');
    if (!quantity) return;
    const isCostco = confirm('Is this from Costco?');
    
    await supabase.from('pantry_items').insert([{
      name,
      quantity,
      low_stock: false,
      source: isCostco ? 'costco' : 'other'
    }]);
  };

  const toggleLowStock = async (itemId) => {
    const item = pantryItems.find(i => i.id === itemId);
    await supabase.from('pantry_items').update({ low_stock: !item.low_stock }).eq('id', itemId);
  };

  const deletePantryItem = async (itemId) => {
    await supabase.from('pantry_items').delete().eq('id', itemId);
  };

  if (loading) {
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-emerald-900 to-emerald-800 border-r border-emerald-700 flex flex-col">
        <div className="p-6 border-b border-emerald-700">
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
        
        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'dashboard' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveView('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'schedule' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Schedule</span>
          </button>
          
          <button
            onClick={() => setActiveView('requests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'requests' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="font-medium">Requests</span>
          </button>
          
          <button
            onClick={() => setActiveView('pantry')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'pantry' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Pantry</span>
          </button>
          
          <button
            onClick={() => setActiveView('family')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'family' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Family</span>
          </button>
        </nav>

        <div className="p-4 border-t border-emerald-700">
          <div className="bg-emerald-950 border border-emerald-600 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-100 mb-1">🌐 Live Sync</p>
            <p className="text-xs text-emerald-200">Everyone sees updates in real-time!</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeView === 'dashboard' && <DashboardView dinners={dinners} requests={requests} pantryItems={pantryItems} />}
        {activeView === 'schedule' && <ScheduleView dinners={dinners} addDinner={addDinner} currentWeekStart={currentWeekStart} setCurrentWeekStart={setCurrentWeekStart} formatWeekRange={formatWeekRange} getWeekDates={getWeekDates} formatDateKey={formatDateKey} />}
        {activeView === 'requests' && <RequestsView requests={requests} requestTab={requestTab} setRequestTab={setRequestTab} addRequest={addRequest} scheduleRequest={scheduleRequest} />}
        {activeView === 'pantry' && <PantryView pantryItems={pantryItems} addPantryItem={addPantryItem} toggleLowStock={toggleLowStock} deletePantryItem={deletePantryItem} />}
        {activeView === 'family' && <FamilyView familyMembers={familyMembers} addFamilyMember={addFamilyMember} deleteFamilyMember={deleteFamilyMember} />}
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ dinners, requests, pantryItems }) {
  const upcomingDinners = dinners.filter(d => new Date(d.date) >= new Date()).slice(0, 3);
  const lowStockItems = pantryItems.filter(item => item.low_stock);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back! Here is what is happening this week</p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-amber-50 mb-1">{dinners.length}</div>
          <div className="text-sm text-orange-100">Meals Planned</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-amber-50 mb-1">{requests.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm text-emerald-100">Pending Requests</div>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-amber-50 mb-1">{lowStockItems.length}</div>
          <div className="text-sm text-orange-100">Low Stock Items</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Dinners</h3>
          {upcomingDinners.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming dinners scheduled</p>
          ) : (
            <div className="space-y-3">
              {upcomingDinners.map(dinner => (
                <div key={dinner.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{dinner.meal}</div>
                    <div className="text-sm text-gray-500">{dinner.chef} - {new Date(dinner.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-orange-600 font-medium">{dinner.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

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

// Schedule View Component  
function ScheduleView({ dinners, addDinner, currentWeekStart, setCurrentWeekStart, formatWeekRange, getWeekDates, formatDateKey }) {
  const weekDates = getWeekDates();
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dinner Schedule</h1>
          <p className="text-gray-600">Plan and organize your meals</p>
        </div>
        <button
          onClick={() => addDinner(new Date())}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Dinner
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart);
              newStart.setDate(newStart.getDate() - 7);
              setCurrentWeekStart(newStart);
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Previous
          </button>
          <div className="text-lg font-semibold text-gray-900">{formatWeekRange()}</div>
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart);
              newStart.setDate(newStart.getDate() + 7);
              setCurrentWeekStart(newStart);
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDates.map(date => {
            const dateKey = formatDateKey(date);
            const dayDinners = dinners.filter(d => d.date === dateKey);
            const isToday = formatDateKey(new Date()) === dateKey;

            return (
              <div key={dateKey} className={`rounded-xl border-2 p-4 min-h-32 ${
                isToday ? 'border-orange-600 bg-gradient-to-br from-orange-100 to-red-100 shadow-lg' : 'border-stone-300 bg-amber-50'
              }`}>
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-500 uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-2xl font-bold text-gray-900">{date.getDate()}</div>
                </div>
                
                {dayDinners.map(dinner => (
                  <div key={dinner.id} className="bg-gradient-to-r from-red-600 to-orange-700 rounded-lg p-2 mb-2 shadow">
                    <div className="text-sm font-semibold text-amber-50">{dinner.meal}</div>
                    <div className="text-xs text-orange-100">{dinner.chef}</div>
                    <div className="text-xs text-amber-200 font-medium">{dinner.time}</div>
                  </div>
                ))}

                <button
                  onClick={() => addDinner(date)}
                  className="w-full h-8 border-2 border-dashed border-stone-400 rounded-lg flex items-center justify-center text-stone-500 hover:border-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Requests View Component
function RequestsView({ requests, requestTab, setRequestTab, addRequest, scheduleRequest }) {
  const filteredRequests = requests.filter(r => {
    if (requestTab === 'pending') return r.status === 'pending';
    if (requestTab === 'scheduled') return r.status === 'scheduled';
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Requests</h1>
          <p className="text-gray-600">Suggest and vote on meal ideas</p>
        </div>
        <button
          onClick={addRequest}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Request a Meal
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setRequestTab('pending')}
            className={`px-6 py-4 font-medium ${
              requestTab === 'pending' ? 'text-orange-700 border-b-2 border-orange-700' : 'text-stone-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setRequestTab('scheduled')}
            className={`px-6 py-4 font-medium ${
              requestTab === 'scheduled' ? 'text-orange-700 border-b-2 border-orange-700' : 'text-stone-600'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setRequestTab('all')}
            className={`px-6 py-4 font-medium ${
              requestTab === 'all' ? 'text-orange-700 border-b-2 border-orange-700' : 'text-stone-600'
            }`}
          >
            All Requests
          </button>
        </div>

        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {requestTab} requests</h3>
              <p className="text-gray-600 mb-4">Be the first to suggest a meal!</p>
              <button
                onClick={addRequest}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Request Your First Meal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{request.meal}</h4>
                    <p className="text-sm text-gray-600">Requested by {request.requested_by}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{request.votes} votes</span>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => scheduleRequest(request.id)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                      >
                        Schedule
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Pantry View Component
function PantryView({ pantryItems, addPantryItem, toggleLowStock, deletePantryItem }) {
  const costcoItems = pantryItems.filter(item => item.source === 'costco');
  const otherItems = pantryItems.filter(item => item.source === 'other');
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pantry</h1>
          <p className="text-gray-600">Track your ingredients and supplies</p>
        </div>
        <button
          onClick={addPantryItem}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Costco Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Costco Items</h2>
          <span className="px-3 py-1 bg-red-600 text-amber-50 text-xs font-bold rounded-full">COSTCO</span>
          <span className="text-gray-500">({costcoItems.length})</span>
        </div>
        <div className="bg-white rounded-xl border-2 border-stone-300 shadow-lg p-6">
          {costcoItems.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No Costco items yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {costcoItems.map(item => (
                <div key={item.id} className={`p-4 rounded-lg border-2 shadow ${
                  item.low_stock ? 'border-red-600 bg-red-50' : 'border-stone-300 bg-amber-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <button
                      onClick={() => deletePantryItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.quantity}</p>
                  <button
                    onClick={() => toggleLowStock(item.id)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors shadow ${
                      item.low_stock
                        ? 'bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 hover:from-red-700 hover:to-orange-800'
                        : 'bg-emerald-700 text-amber-50 hover:bg-emerald-800'
                    }`}
                  >
                    {item.low_stock ? 'Low Stock' : 'In Stock'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Other Items Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Other Items</h2>
          <span className="text-gray-500">({otherItems.length})</span>
        </div>
        <div className="bg-white rounded-xl border-2 border-stone-300 shadow-lg p-6">
          {otherItems.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No other items yet</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {otherItems.map(item => (
                <div key={item.id} className={`p-4 rounded-lg border-2 shadow ${
                  item.low_stock ? 'border-red-600 bg-red-50' : 'border-stone-300 bg-amber-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <button
                      onClick={() => deletePantryItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.quantity}</p>
                  <button
                    onClick={() => toggleLowStock(item.id)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors shadow ${
                      item.low_stock
                        ? 'bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 hover:from-red-700 hover:to-orange-800'
                        : 'bg-emerald-700 text-amber-50 hover:bg-emerald-800'
                    }`}
                  >
                    {item.low_stock ? 'Low Stock' : 'In Stock'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// Family View Component
function FamilyView({ familyMembers, addFamilyMember, deleteFamilyMember }) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Members</h1>
          <p className="text-gray-600">{familyMembers.length} members - {familyMembers.filter(m => m.email_notifications).length} email notifications enabled</p>
        </div>
        <button
          onClick={addFamilyMember}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-amber-100" />
            <span className="text-3xl font-bold text-amber-50">{familyMembers.length}</span>
          </div>
          <div className="text-sm text-orange-100">Total Members</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-amber-50">{familyMembers.filter(m => m.email_notifications).length}</span>
          </div>
          <div className="text-sm text-emerald-100">Email Alerts</div>
        </div>
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-amber-50">0</span>
          </div>
          <div className="text-sm text-orange-100">SMS Alerts</div>
        </div>
      </div>

      {familyMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No family members yet</h3>
          <p className="text-gray-600 mb-4">Add your household members to start coordinating dinners</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {familyMembers.map(member => (
            <div key={member.id} className="bg-amber-50 rounded-xl border-2 border-stone-300 shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center text-amber-50 font-bold text-lg shadow">
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <button
                      onClick={() => deleteFamilyMember(member.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors -mt-2 -mr-2"
                      title="Remove member"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {member.email_notifications && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                      Notifications on
                    </span>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📧</span>
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📱</span>
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.preferences && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">PREFERENCES</p>
                        <p className="text-sm text-gray-700">{member.preferences}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">About Notifications</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>Email notifications work right away - send dinner updates directly from the dashboard</li>
              <li>SMS notifications require backend functions</li>
              <li>Family members will receive updates about who is cooking and when dinner is ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}