import React, { useState } from 'react';
import { Modal } from '../ui/Modal';

export function FamilyMemberForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {

  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [preferences, setPreferences] = useState(initialData?.preferences || '');
  const [color, setColor] = useState(initialData?.color || 'orange');

  const COLORS = [
    { id: 'orange', label: 'Orange', bg: 'bg-orange-600', text: 'text-white' },
    { id: 'red', label: 'Red', bg: 'bg-red-600', text: 'text-white' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-600', text: 'text-white' },
    { id: 'green', label: 'Green', bg: 'bg-emerald-600', text: 'text-white' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-600', text: 'text-white' },
    { id: 'pink', label: 'Pink', bg: 'bg-pink-600', text: 'text-white' },
  ];


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),

      preferences: preferences.trim(),
      color

    });

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setPreferences('');
    setColor('orange');
    onClose();
  };

  const handleClose = () => {
    setName(initialData?.name || '');
    setEmail(initialData?.email || '');
    setPhone(initialData?.phone || '');
    setPreferences(initialData?.preferences || '');
    setColor(initialData?.color || 'orange');
    onClose();
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}

      title={initialData ? "Edit Family Member" : "Add Family Member"}
    >

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Full name"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Food Preferences (optional)
          </label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Allergies, dietary restrictions, favorite foods..."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Code
          </label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${c.bg} ${color === c.id ? 'ring-4 ring-offset-2 ring-gray-300 scale-110' : 'hover:scale-110'
                  }`}
                title={c.label}
              >
                {color === c.id && <span className="text-white text-lg">✓</span>}
              </button>
            ))}
          </div>
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
            {initialData ? 'Save Changes' : 'Add Member'}

          </button>
        </div>
      </form>
    </Modal>
  );
}
