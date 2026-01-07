import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { CATEGORIES, CATEGORY_LABELS } from '../../lib/constants';

export function PantryItemForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('pantry');
  const [source, setSource] = useState('other');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setQuantity(initialData.quantity || '');
      setCategory(initialData.category || 'pantry');
      setSource(initialData.source || 'other');
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !quantity.trim()) return;

    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      quantity: quantity.trim(),
      category,
      source,
      notes: notes.trim()
    });

    // Reset form
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setQuantity('');
    setCategory('pantry');
    setSource('other');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Item' : 'Add Item'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Chicken breast, Olive oil"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., 2 lbs, 1 bottle, 3 bags"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="source"
                value="other"
                checked={source === 'other'}
                onChange={(e) => setSource(e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span>Other</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="source"
                value="costco"
                checked={source === 'costco'}
                onChange={(e) => setSource(e.target.value)}
                className="text-orange-600 focus:ring-orange-500"
              />
              <span className="text-red-600 font-medium">Costco</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Any additional details..."
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
            {initialData ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
