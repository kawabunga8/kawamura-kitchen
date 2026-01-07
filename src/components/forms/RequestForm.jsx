import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { DatePicker } from '../schedule/DatePicker';

export function RequestForm({
  isOpen,
  onClose,
  onSubmit,
  familyMembers
}) {
  const [meal, setMeal] = useState('');
  const [requestorId, setRequestorId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestor = familyMembers.find(m => m.id === parseInt(requestorId));
    if (!meal.trim() || !requestor) return;

    onSubmit({
      meal: meal.trim(),
      requestorName: requestor.name
    });

    // Reset form
    setMeal('');
    setRequestorId('');
    onClose();
  };

  const handleClose = () => {
    setMeal('');
    setRequestorId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request a Meal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What meal would you like?
          </label>
          <input
            type="text"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Mom's Lasagna, Grilled Salmon"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who's requesting?
          </label>
          <select
            value={requestorId}
            onChange={(e) => setRequestorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            <option value="">Select your name...</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-700 text-white rounded-lg hover:from-red-700 hover:to-orange-800 transition-colors font-medium"
          >
            Request Meal
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ScheduleRequestForm({
  isOpen,
  onClose,
  onSubmit,
  familyMembers,
  request
}) {
  const [date, setDate] = useState('');
  const [chefId, setChefId] = useState('');
  const [time, setTime] = useState('6:00');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date || !chefId) return;

    onSubmit({
      requestId: request.id,
      date,
      chefId: parseInt(chefId),
      time
    });

    // Reset form
    setDate('');
    setChefId('');
    setTime('6:00');
    onClose();
  };

  const handleClose = () => {
    setDate('');
    setChefId('');
    setTime('6:00');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Schedule: ${request?.meal || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            placeholder="Select date..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who will cook?
          </label>
          <select
            value={chefId}
            onChange={(e) => setChefId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            <option value="">Select chef...</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What time?
          </label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., 6:00, 7:30pm"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-colors font-medium"
          >
            Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function VoteDialog({
  isOpen,
  onClose,
  onSubmit,
  familyMembers,
  request
}) {
  const [voterId, setVoterId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const voter = familyMembers.find(m => m.id === parseInt(voterId));
    if (!voter) return;

    onSubmit({
      requestId: request.id,
      voterName: voter.name
    });

    setVoterId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setVoterId(''); onClose(); }}
      title={`Vote for: ${request?.meal || ''}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who's voting?
          </label>
          <select
            value={voterId}
            onChange={(e) => setVoterId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
            autoFocus
          >
            <option value="">Select your name...</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={() => { setVoterId(''); onClose(); }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors font-medium"
          >
            Vote
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function MessageDialog({
  isOpen,
  onClose,
  onSubmit,
  familyMembers,
  request
}) {
  const [senderId, setSenderId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const sender = familyMembers.find(m => m.id === parseInt(senderId));
    if (!sender || !message.trim()) return;

    onSubmit({
      request,
      senderName: sender.name,
      message: message.trim()
    });

    setSenderId('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setSenderId(''); setMessage(''); onClose(); }}
      title={`Message about: ${request?.meal || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Send a message to <strong>{request?.requested_by}</strong> about their request.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who's sending?
          </label>
          <select
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select your name...</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your message..."
            rows={3}
            required
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={() => { setSenderId(''); setMessage(''); onClose(); }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium"
          >
            Send Message
          </button>
        </div>
      </form>
    </Modal>
  );
}
