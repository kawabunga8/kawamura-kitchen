import React, { useState, useMemo } from 'react';
import { Plus, Edit, X, MessageSquare, Search } from 'lucide-react';
import { useKitchenData } from '../../hooks/useKitchenData.jsx';
import { useToast } from '../ui/ToastProvider';
import { PantryItemForm } from '../forms/PantryItemForm';
import { CATEGORIES, CATEGORY_LABELS } from '../../lib/constants';

export function PantryView() {
  const { pantryItems, addPantryItem, editPantryItem, deletePantryItem, toggleLowStock } = useKitchenData();
  const { toast } = useToast();

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Filter items
  const filteredItems = useMemo(() => {
    return pantryItems.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = categoryFilter === 'all' ||
        (item.category || 'pantry') === categoryFilter;

      // Stock filter
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'low' && item.low_stock) ||
        (stockFilter === 'in-stock' && !item.low_stock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [pantryItems, searchTerm, categoryFilter, stockFilter]);

  // Group filtered items by category
  const getItemsByCategory = (category) => {
    return filteredItems.filter(item => (item.category || 'pantry') === category);
  };

  const handleAddItem = async (data) => {
    const { error } = await addPantryItem(data);
    if (error) {
      if (error.code === '23505') {
        toast.warning(`An item named "${data.name}" already exists`);
      } else {
        toast.error('Failed to add item');
      }
    } else {
      toast.success('Item added!');
    }
  };

  const handleEditItem = async (data) => {
    const { error } = await editPantryItem(data.id, data);
    if (error) {
      toast.error('Failed to update item');
    } else {
      toast.success('Item updated!');
    }
    setEditingItem(null);
  };

  const handleToggleLowStock = async (itemId) => {
    const { error } = await toggleLowStock(itemId);
    if (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    const { error } = await deletePantryItem(itemId);
    if (error) {
      toast.error('Failed to delete item');
    } else {
      toast.success('Item deleted');
    }
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  // Determine which categories have items to display
  const categoriesToShow = categoryFilter === 'all'
    ? CATEGORIES.filter(cat => getItemsByCategory(cat).length > 0)
    : [categoryFilter].filter(cat => getItemsByCategory(cat).length > 0);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pantry</h1>
          <p className="text-sm md:text-base text-gray-600">Track your ingredients and supplies by category</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowItemForm(true); }}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="low">Low Stock</option>
          </select>
        </div>

        {/* Results count */}
        {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredItems.length} of {pantryItems.length} items
          </div>
        )}
      </div>

      {/* Category Sections */}
      <div className="space-y-6">
        {categoriesToShow.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow">
            <p className="text-gray-500">No items match your filters</p>
          </div>
        ) : (
          categoriesToShow.map(category => {
            const items = getItemsByCategory(category);
            const categoryInfo = CATEGORY_LABELS[category];

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
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border-2 shadow ${
                          item.low_stock
                            ? 'border-red-600 bg-red-50'
                            : 'border-stone-300 bg-amber-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                            {item.source === 'costco' && (
                              <span className="inline-block px-2 py-0.5 bg-red-600 text-amber-50 text-xs font-bold rounded">
                                COSTCO
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => openEditForm(item)}
                              className="text-gray-400 hover:text-orange-500"
                              title="Edit item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="Delete item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-1">{item.quantity}</p>

                        {item.notes && (
                          <p className="text-xs text-gray-500 italic mb-2 flex items-start gap-1">
                            <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            {item.notes}
                          </p>
                        )}

                        <button
                          onClick={() => handleToggleLowStock(item.id)}
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
          })
        )}
      </div>

      {/* Item Form Modal */}
      <PantryItemForm
        isOpen={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setEditingItem(null);
        }}
        onSubmit={editingItem ? handleEditItem : handleAddItem}
        initialData={editingItem}
      />
    </div>
  );
}
