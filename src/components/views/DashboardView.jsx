import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { useKitchenData } from '../../hooks/useKitchenData.jsx';
import { useToast } from '../ui/ToastProvider';
import { formatDateKey, parseDateKey } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { useState } from 'react';


export function DashboardView({ setActiveView }) {
  const { dinners, requests, pantryItems, sendShoppingList, sendSMS, familyMembers } = useKitchenData();
  const { toast } = useToast();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState(new Set());

  // SMS Modal State
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [smsRecipientId, setSmsRecipientId] = useState('');
  const [smsBody, setSmsBody] = useState('');

  const handleSendSMS = async () => {
    const recipient = familyMembers.find(m => m.id === Number(smsRecipientId));
    if (!recipient || !recipient.phone) {
      toast.error('Invalid recipient');
      return;
    }

    const res = await sendSMS(recipient.phone, `${smsBody} - from Kawamura-Kitchen`);

    if (res.error) {
      toast.error('Failed to send SMS: ' + res.error.message);
    } else {
      toast.success('Message sent!');
      setIsSMSModalOpen(false);
      setSmsBody('');
      setSmsRecipientId('');
    }
  };

  // Filter members who have emails enabled
  const validRecipients = familyMembers.filter(m => m.email);

  const handleOpenEmailModal = () => {
    // Select all by default
    setSelectedRecipients(new Set(validRecipients.map(m => m.email)));
    setIsEmailModalOpen(true);
  };

  const toggleRecipient = (email) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedRecipients(newSelected);
  };

  const toggleAll = () => {
    if (selectedRecipients.size === validRecipients.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(validRecipients.map(m => m.email)));
    }
  };

  const handleSend = async () => {
    if (selectedRecipients.size === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    const { error } = await sendShoppingList(Array.from(selectedRecipients));
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Shopping list sent to ${selectedRecipients.size} people.`);
      setIsEmailModalOpen(false);
    }
  };



  const upcomingDinners = dinners
    .filter(d => d.date >= formatDateKey(new Date()))
    .slice(0, 3);
  const lowStockItems = pantryItems.filter(item => item.low_stock);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Welcome back! Here is what is happening this week</p>
        </div>
        <button
          onClick={() => setIsSMSModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg shadow hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <MessageSquare className="w-4 h-4" />
          Send Text
        </button>
      </div>

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
                      {dinner.chef} - {parseDateKey(dinner.date).toLocaleDateString()}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            {lowStockItems.length > 0 && (
              <button
                onClick={handleOpenEmailModal}
                className="text-sm flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                title="Email shopping list"
              >
                <Mail className="w-4 h-4" />
                Email List
              </button>
            )}
          </div>

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

      {/* Email Recipients Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Email Shopping List"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Select who should receive the shopping list:</p>

          <div className="flex justify-end">
            <button
              onClick={toggleAll}
              className="text-xs text-orange-600 font-medium hover:text-orange-700"
            >
              {selectedRecipients.size === validRecipients.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {validRecipients.length === 0 ? (
              <p className="text-gray-500 italic text-sm text-center py-4">No family members have email addresses set up.</p>
            ) : (
              validRecipients.map(member => (
                <label key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.has(member.email)}
                    onChange={() => toggleRecipient(member.email)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 block">{member.name}</span>
                    <span className="text-xs text-gray-500 block">{member.email}</span>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={selectedRecipients.size === 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>
          </div>
        </div>
      </Modal>

      {/* SMS Modal */}
      <Modal
        isOpen={isSMSModalOpen}
        onClose={() => setIsSMSModalOpen(false)}
        title="Send Text Message"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select
              value={smsRecipientId}
              onChange={(e) => setSmsRecipientId(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="">Select a recipient</option>
              {familyMembers.filter(m => m.phone).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={smsBody}
              onChange={(e) => setSmsBody(e.target.value)}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="Type your message here..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsSMSModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendSMS}
              disabled={!smsRecipientId || !smsBody.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
