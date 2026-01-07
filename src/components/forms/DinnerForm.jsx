import React, { useState } from 'react';
import { Modal } from '../ui/Modal';

export function DinnerForm({
  isOpen,
  onClose,
  onSubmit,
  familyMembers,
  initialData = null,
  selectedDate = null
}) {
  const [meal, setMeal] = useState(initialData?.meal || '');
  const [chefId, setChefId] = useState(initialData?.chefId || '');
  const [customChef, setCustomChef] = useState('');
  const [time, setTime] = useState(initialData?.time || '6:00');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();

    const chefName = chefId === 'custom'
      ? customChef
      : familyMembers.find(m => m.id === parseInt(chefId))?.name || customChef;

    if (!meal.trim()) return;
    if (!chefName.trim()) return;

    onSubmit({
      meal: meal.trim(),
      chefName,
      time,
      notes: notes.trim(),
      date: selectedDate
    });

    // Reset form
    setMeal('');
    setChefId('');
    setCustomChef('');
    setTime('6:00');
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setMeal(initialData?.meal || '');
    setChefId(initialData?.chefId || '');
    setCustomChef('');
    setTime(initialData?.time || '6:00');
    setNotes(initialData?.notes || '');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Dinner' : 'Add Dinner'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What's for dinner?
          </label>
          <input
            type="text"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Spaghetti, Tacos, Sushi"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who's cooking?
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
            <option value="custom">Other (type name)</option>
          </select>

          {chefId === 'custom' && (
            <input
              type="text"
              value={customChef}
              onChange={(e) => setCustomChef(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter chef name"
              required
            />
          )}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Any special instructions or details..."
            rows={2}
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
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-700 text-white rounded-lg hover:from-red-700 hover:to-orange-800 transition-colors font-medium"
          >
            {initialData ? 'Save Changes' : 'Add Dinner'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
