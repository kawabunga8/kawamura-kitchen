// Main Application Component for Kawamura Kitchen
import React, { useState, useEffect } from 'react';
import { Calendar, ChefHat, Lightbulb, Package, Users, Home, Plus, X, ThumbsUp, Menu } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [familyMembers, setFamilyMembers] = useState([]);
  const [dinners, setDinners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [votes, setVotes] = useState([]);
  const [requestTab, setRequestTab] = useState('pending');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const FAMILY_PASSWORD = 'RiverVillage';

  // Check if already authenticated on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('kawamura_kitchen_auth');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === FAMILY_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('kawamura_kitchen_auth', 'authenticated');
      setPasswordInput('');
    } else {
      alert('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kawamura_kitchen_auth');
  };

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    if (!isAuthenticated) return;

    loadData();

    // Realtime subscriptions - only reload changed data
    const membersSubscription = supabase
      .channel('family_members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, async () => {
        const { data } = await supabase.from('family_members').select('*').order('id');
        if (data) setFamilyMembers(data);
      })
      .subscribe();

    const dinnersSubscription = supabase
      .channel('dinners_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dinners' }, () => {
        loadDinners();
      })
      .subscribe();

    const requestsSubscription = supabase
      .channel('requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        loadRequests();
      })
      .subscribe();

    const pantrySubscription = supabase
      .channel('pantry_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pantry_items' }, () => {
        loadPantryItems();
      })
      .subscribe();

    const votesSubscription = supabase
      .channel('votes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, async () => {
        const { data } = await supabase.from('votes').select('*');
        if (data) setVotes(data);
      })
      .subscribe();

    return () => {
      // removeChannel expects the channel object
      supabase.removeChannel(membersSubscription);
      supabase.removeChannel(dinnersSubscription);
      supabase.removeChannel(requestsSubscription);
      supabase.removeChannel(pantrySubscription);
      supabase.removeChannel(votesSubscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, dinnersRes, requestsRes, pantryRes, votesRes] = await Promise.all([
        supabase.from('family_members').select('*').order('id'),
        supabase.from('dinners').select('*').order('date'),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('pantry_items').select('*').order('name'),
        supabase.from('votes').select('*')
      ]);

      if (!membersRes.error && membersRes.data) setFamilyMembers(membersRes.data);
      if (!dinnersRes.error && dinnersRes.data) setDinners(dinnersRes.data);
      if (!requestsRes.error && requestsRes.data) setRequests(requestsRes.data);
      if (!pantryRes.error && pantryRes.data) setPantryItems(pantryRes.data);
      if (!votesRes.error && votesRes.data) setVotes(votesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadPantryItems = async () => {
    const { data, error } = await supabase.from('pantry_items').select('*').order('name');
    if (!error && data) setPantryItems(data);
  };

  const loadDinners = async () => {
    const { data, error } = await supabase.from('dinners').select('*').order('date');
    if (!error && data) setDinners(data);
  };

  const loadRequests = async () => {
    const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
    if (!error && data) setRequests(data);
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
    console.log('Delete clicked for member:', memberId);
    console.log('Current family members:', familyMembers);

    if (!confirm('Are you sure you want to remove this family member?')) return;

    console.log('Delete confirmed');

    const { data, error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    console.log('Delete result:', { data, error });

    if (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete family member');
      return;
    }

    console.log('Calling loadData...');
    await loadData();
    console.log('Family members after reload:', familyMembers);
  };

  // Email notification helper
  const sendEmail = async (to, subject, html) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html })
      });

      if (!response.ok) {
        console.error('Failed to send email:', await response.text());
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const notifyFamilyMembers = async (subject, message) => {
    const subscribedMembers = familyMembers.filter(m => m.email_notifications && m.email);

    if (subscribedMembers.length === 0) return;

    const emailPromises = subscribedMembers.map(member =>
      sendEmail(
        member.email,
        subject,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ea580c;">🍳 Kawamura Kitchen</h2>
            <p>Hi ${member.name},</p>
            <p>${message}</p>
            <p style="color: #666; font-size: 14px;">
              You're receiving this because you have email notifications enabled in Kawamura Kitchen.
            </p>
          </div>
        `
      )
    );

    await Promise.all(emailPromises);
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
    // Real-time subscription will update automatically
  };

  const deleteDinner = async (dinnerId) => {
    if (!confirm('Are you sure you want to delete this dinner?')) return;

    await supabase.from('dinners').delete().eq('id', dinnerId);
    // Real-time subscription will update automatically
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

    // Send email notification
    await notifyFamilyMembers(
      `New Meal Request: ${meal}`,
      `<strong>${requestor.name}</strong> has requested <strong>${meal}</strong> for an upcoming dinner. Vote on this request in the app!`
    );

    // Real-time subscription will update automatically
  };

  const scheduleRequest = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (familyMembers.length === 0) {
      alert('Please add family members first!');
      return;
    }

    // Ask for the date
    const dateInput = prompt('What date? (YYYY-MM-DD, e.g., 2026-01-15)');
    if (!dateInput) return;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateInput)) {
      alert('Invalid date format. Please use YYYY-MM-DD');
      return;
    }

    // Ask who will cook
    const chefOptions = familyMembers.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    const chefIndex = prompt(`Who will cook ${request.meal}?\n${chefOptions}\n\nEnter number:`);
    if (!chefIndex) return;

    const chef = familyMembers[parseInt(chefIndex) - 1];
    if (!chef) {
      alert('Invalid selection');
      return;
    }

    // Ask for time
    const time = prompt('What time? (e.g., 18:00)', '18:00');
    if (!time) return;

    // Add to dinner schedule
    await supabase.from('dinners').insert([{
      date: dateInput,
      meal: request.meal,
      chef: chef.name,
      time
    }]);

    // Mark request as scheduled
    await supabase.from('requests').update({ status: 'scheduled' }).eq('id', requestId);

    // Send email notification
    await notifyFamilyMembers(
      `Meal Scheduled: ${request.meal}`,
      `<strong>${request.meal}</strong> has been scheduled for <strong>${new Date(dateInput).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>${time}</strong>.<br><br>Chef: <strong>${chef.name}</strong>`
    );

    // Real-time subscriptions will update both dinners and requests automatically
  };

  const deleteRequest = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (request.status === 'scheduled') {
      // If scheduled, just move it back to pending (unschedule)
      if (!confirm('Unschedule this meal and move it back to pending?')) return;
      await supabase.from('requests').update({ status: 'pending' }).eq('id', requestId);
    } else {
      // If pending, delete it completely
      if (!confirm('Are you sure you want to delete this request?')) return;
      await supabase.from('requests').delete().eq('id', requestId);
    }
    // Real-time subscription will update automatically
  };

  const voteOnRequest = async (requestId) => {
    if (familyMembers.length === 0) {
      alert('Please add family members first!');
      return;
    }

    // Ask who is voting
    const voterOptions = familyMembers.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    const voterIndex = prompt(`Who is voting?\n${voterOptions}\n\nEnter number:`);
    if (!voterIndex) return;

    const voter = familyMembers[parseInt(voterIndex) - 1];
    if (!voter) {
      alert('Invalid selection');
      return;
    }

    // Check if this person already voted
    const existingVote = votes.find(v => v.request_id === requestId && v.voter_name === voter.name);
    if (existingVote) {
      alert(`${voter.name} has already voted for this meal!`);
      return;
    }

    // Add the vote
    const { error: voteError } = await supabase.from('votes').insert([{
      request_id: requestId,
      voter_name: voter.name
    }]);

    if (voteError) {
      console.error('Error adding vote:', voteError);
      alert('Failed to add vote');
      return;
    }

    // Update the vote count on the request
    const currentVotes = votes.filter(v => v.request_id === requestId).length + 1;
    await supabase.from('requests').update({ votes: currentVotes }).eq('id', requestId);
  };

  const addPantryItem = async () => {
    const name = prompt('Item name:');
    if (!name) return;
    const quantity = prompt('Quantity:');
    if (!quantity) return;

    const categoryChoice = prompt('Category:\n1. Freezer\n2. Fridge\n3. Produce\n4. Pantry (default)\n5. Spices\n\nEnter number (or press Enter for Pantry):');
    const categoryMap = {
      '1': 'freezer',
      '2': 'fridge',
      '3': 'produce',
      '4': 'pantry',
      '5': 'spices'
    };
    const category = categoryMap[categoryChoice] || 'pantry';

    const source = prompt('Where is this from?\n1. Other (default)\n2. Costco\n\nEnter number (or press Enter for Other):');
    const isCostco = source === '2';

    const { data, error } = await supabase.from('pantry_items').insert([{
      name,
      quantity,
      low_stock: false,
      source: isCostco ? 'costco' : 'other',
      category
    }]).select();

    if (error) {
      console.error('Error adding pantry item:', error);

      // Handle unique constraint violation (409 Conflict)
      if (error.code === '23505') {
        alert(`An item named "${name}" already exists in ${isCostco ? 'Costco' : 'Other'} section.\n\nPlease:\n1. Use a different name (e.g., "${name} 2")\n2. Or update the existing item's quantity instead`);
      } else {
        alert('Failed to add item: ' + error.message);
      }
      return;
    }

    console.log('Successfully added pantry item:', data);
    // Real-time subscription will update automatically
  };

  const toggleLowStock = async (itemId) => {
    const item = pantryItems.find(i => i.id === itemId);
    if (!item) return;

    const newLowStockStatus = !item.low_stock;
    await supabase.from('pantry_items').update({ low_stock: newLowStockStatus }).eq('id', itemId);

    // Send email notification if item just became low stock
    if (newLowStockStatus) {
      const categoryEmoji = {
        freezer: '❄️',
        fridge: '🧊',
        produce: '🥬',
        pantry: '🥫',
        spices: '🌶️'
      };
      const emoji = categoryEmoji[item.category || 'pantry'] || '📦';

      await notifyFamilyMembers(
        `Low Stock Alert: ${item.name}`,
        `${emoji} <strong>${item.name}</strong> is running low!<br><br>Current quantity: <strong>${item.quantity}</strong><br><br>Please add it to your shopping list.`
      );
    }

    // Real-time subscription will update automatically
  };

  const deletePantryItem = async (itemId) => {
    await supabase.from('pantry_items').delete().eq('id', itemId);
    // Real-time subscription will update automatically
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
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

            <form onSubmit={handleLogin}>
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
                🔒 Password required to prevent unauthorized access
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Mobile Header */}
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

      {/* Sidebar - Desktop & Mobile Overlay */}
      <div className={`
        fixed md:static inset-0 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 bg-gradient-to-b from-emerald-900 to-emerald-800 border-r border-emerald-700 flex flex-col
        mt-16 md:mt-0
      `}>
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

        <nav className="flex-1 p-4">
          <button
            onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'dashboard' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveView('schedule'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'schedule' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Schedule</span>
          </button>

          <button
            onClick={() => { setActiveView('requests'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'requests' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="font-medium">Requests</span>
          </button>

          <button
            onClick={() => { setActiveView('pantry'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'pantry' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Pantry</span>
          </button>

          <button
            onClick={() => { setActiveView('family'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === 'family' ? 'bg-orange-700 text-amber-50' : 'text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Family</span>
          </button>
        </nav>

        <div className="p-4 border-t border-emerald-700">
          <div className="bg-emerald-950 border border-emerald-600 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-amber-100 mb-1">🌐 Live Sync</p>
            <p className="text-xs text-emerald-200">Everyone sees updates in real-time!</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-amber-50 rounded-lg transition-colors text-sm font-medium"
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {/* Mobile Overlay Background */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 mt-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        {activeView === 'dashboard' && <DashboardView dinners={dinners} requests={requests} pantryItems={pantryItems} />}
        {activeView === 'schedule' && (
          <ScheduleView
            dinners={dinners}
            addDinner={addDinner}
            deleteDinner={deleteDinner}
            currentWeekStart={currentWeekStart}
            setCurrentWeekStart={setCurrentWeekStart}
            formatWeekRange={formatWeekRange}
            getWeekDates={getWeekDates}
            formatDateKey={formatDateKey}
          />
        )}
        {activeView === 'requests' && (
          <RequestsView
            requests={requests}
            votes={votes}
            requestTab={requestTab}
            setRequestTab={setRequestTab}
            addRequest={addRequest}
            scheduleRequest={scheduleRequest}
            deleteRequest={deleteRequest}
            voteOnRequest={voteOnRequest}
          />
        )}
        {activeView === 'pantry' && (
          <PantryView
            pantryItems={pantryItems}
            addPantryItem={addPantryItem}
            toggleLowStock={toggleLowStock}
            deletePantryItem={deletePantryItem}
          />
        )}
        {activeView === 'family' && (
          <FamilyView 
            familyMembers={familyMembers} 
            addFamilyMember={addFamilyMember}
            deleteFamilyMember={deleteFamilyMember}
          />
        )}
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ 
  dinners, 
  requests, 
  pantryItems 
}) {
  const upcomingDinners = dinners.filter(d => new Date(d.date) >= new Date()).slice(0, 3);
  const lowStockItems = pantryItems.filter(item => item.low_stock);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Welcome back! Here is what is happening this week</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
function ScheduleView({ 
  dinners, 
  addDinner,
  deleteDinner,
  currentWeekStart, 
  setCurrentWeekStart, 
  formatWeekRange, 
  getWeekDates, 
  formatDateKey 
}) {
  const weekDates = getWeekDates();

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dinner Schedule</h1>
          <p className="text-sm md:text-base text-gray-600">Plan and organize your meals</p>
        </div>
        <button
          onClick={() => addDinner(new Date())}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Dinner
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart);
              newStart.setDate(newStart.getDate() - 7);
              setCurrentWeekStart(newStart);
            }}
            className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Prev
          </button>
          <div className="text-sm md:text-lg font-semibold text-gray-900">{formatWeekRange()}</div>
          <button
            onClick={() => {
              const newStart = new Date(currentWeekStart);
              newStart.setDate(newStart.getDate() + 7);
              setCurrentWeekStart(newStart);
            }}
            className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <div className="grid grid-cols-7 gap-2 md:gap-4 min-w-max md:min-w-0">
          {weekDates.map(date => {
            const dateKey = formatDateKey(date);
            const dayDinners = dinners.filter(d => d.date === dateKey);
            const isToday = formatDateKey(new Date()) === dateKey;

            return (
              <div key={dateKey} className={`rounded-xl border-2 p-3 md:p-4 min-h-32 min-w-[120px] md:min-w-0 ${
                isToday ? 'border-orange-600 bg-gradient-to-br from-orange-100 to-red-100 shadow-lg' : 'border-stone-300 bg-amber-50'
              }`}>
                <div className="text-center mb-2 md:mb-3">
                  <div className="text-xs text-gray-500 uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{date.getDate()}</div>
                </div>

                {dayDinners.map(dinner => (
                  <div key={dinner.id} className="bg-gradient-to-r from-red-600 to-orange-700 rounded-lg p-2 mb-2 shadow relative group">
                    <button
                      onClick={() => deleteDinner(dinner.id)}
                      className="absolute top-1 right-1 p-1 text-amber-50 hover:bg-red-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete dinner"
                    >
                      <X className="w-3 h-3" />
                    </button>
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
    </div>
  );
}

// Requests View Component
function RequestsView({
  requests,
  votes,
  requestTab,
  setRequestTab,
  addRequest,
  scheduleRequest,
  deleteRequest,
  voteOnRequest
}) {
  const filteredRequests = requests.filter(r => {
    if (requestTab === 'pending') return r.status === 'pending';
    if (requestTab === 'scheduled') return r.status === 'scheduled';
    return true;
  });

  const getVotersForRequest = (requestId) => {
    return votes.filter(v => v.request_id === requestId);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Meal Requests</h1>
          <p className="text-sm md:text-base text-gray-600">Suggest and vote on meal ideas</p>
        </div>
        <button
          onClick={addRequest}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Request a Meal
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setRequestTab('pending')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 font-medium text-sm md:text-base whitespace-nowrap ${
              requestTab === 'pending' ? 'text-orange-700 border-b-2 border-orange-700' : 'text-stone-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setRequestTab('scheduled')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 font-medium text-sm md:text-base whitespace-nowrap ${
              requestTab === 'scheduled' ? 'text-orange-700 border-b-2 border-orange-700' : 'text-stone-600'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setRequestTab('all')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 font-medium text-sm md:text-base whitespace-nowrap ${
              requestTab === 'all' ? 'text-orange-700 border-b-2 border-orange-700' : 'text-stone-600'
            }`}
          >
            All Requests
          </button>
        </div>

        <div className="p-4 md:p-6">
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
              {filteredRequests.map(request => {
                const requestVoters = getVotersForRequest(request.id);
                return (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative group">
                    <button
                      onClick={() => deleteRequest(request.id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                      title={request.status === 'scheduled' ? 'Unschedule and move to pending' : 'Delete request'}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                      <div className="flex-1 pr-8 md:pr-0">
                        <h4 className="font-semibold text-gray-900">{request.meal}</h4>
                        <p className="text-sm text-gray-600">Requested by {request.requested_by}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <button
                          onClick={() => voteOnRequest(request.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow"
                          title="Vote for this meal"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-semibold">{request.votes}</span>
                        </button>

                        {request.status === 'pending' && (
                          <button
                            onClick={() => scheduleRequest(request.id)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow text-sm font-medium"
                          >
                            Schedule
                          </button>
                        )}
                        {request.status === 'scheduled' && (
                          <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium text-center">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                    {requestVoters.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">Voted by:</span>
                        <div className="flex flex-wrap gap-1">
                          {requestVoters.map(vote => (
                            <span key={vote.id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              <ThumbsUp className="w-3 h-3" />
                              {vote.voter_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Pantry View Component
function PantryView({
  pantryItems,
  addPantryItem,
  toggleLowStock,
  deletePantryItem
}) {
  // Group items by category
  const categories = ['freezer', 'fridge', 'produce', 'pantry', 'spices'];
  const categoryLabels = {
    freezer: { name: 'Freezer', icon: '❄️', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    fridge: { name: 'Fridge', icon: '🧊', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    produce: { name: 'Produce', icon: '🥬', color: 'bg-green-100 text-green-800 border-green-300' },
    pantry: { name: 'Pantry', icon: '🥫', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    spices: { name: 'Spices', icon: '🌶️', color: 'bg-orange-100 text-orange-800 border-orange-300' }
  };

  const getItemsByCategory = (category) => {
    return pantryItems.filter(item => (item.category || 'pantry') === category);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pantry</h1>
          <p className="text-sm md:text-base text-gray-600">Track your ingredients and supplies by category</p>
        </div>
        <button
          onClick={addPantryItem}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Category Sections */}
      <div className="space-y-6">
        {categories.map(category => {
          const items = getItemsByCategory(category);
          if (items.length === 0) return null;

          const categoryInfo = categoryLabels[category];

          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {categoryInfo.icon} {categoryInfo.name}
                </h2>
                <span className="text-gray-500">({items.length})</span>
              </div>
              <div className="bg-white rounded-xl border-2 border-stone-300 shadow-lg p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(item => (
                    <div key={item.id} className={`p-4 rounded-lg border-2 shadow ${item.low_stock ? 'border-red-600 bg-red-50' : 'border-stone-300 bg-amber-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                          {item.source === 'costco' && (
                            <span className="inline-block px-2 py-0.5 bg-red-600 text-amber-50 text-xs font-bold rounded">
                              COSTCO
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deletePantryItem(item.id)}
                          className="text-gray-400 hover:text-red-500 ml-2"
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Family View Component
function FamilyView({ 
  familyMembers, 
  addFamilyMember, 
  deleteFamilyMember 
}) {
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Family</h1>
          <p className="text-sm md:text-base text-gray-600">Manage household members</p>
        </div>
        <button
          onClick={addFamilyMember}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {familyMembers.map(member => (
            <div key={member.id} className="bg-amber-50 rounded-xl border-2 border-stone-300 shadow-lg p-4 md:p-6 transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-700 flex items-center justify-center text-amber-50 font-bold text-lg shadow">
                  {member.name ? member.name[0] : '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <button
                      onClick={() => deleteFamilyMember(member.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors -mt-2 -mr-2"
                      title="Remove member"
                    >
                      <X className="w-4 h-4"  />
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
