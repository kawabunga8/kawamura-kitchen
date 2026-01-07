import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, MessageSquare, Calendar, LayoutGrid } from 'lucide-react';
import { useKitchenData } from '../../hooks/useKitchenData.jsx';
import { useToast } from '../ui/ToastProvider';
import { getWeekStart, getWeekDates, formatDateKey, formatWeekRange } from '../../lib/utils';
import { DinnerForm } from '../forms/DinnerForm';
import { ConfirmDialog } from '../ui/Modal';
import { MonthView } from '../schedule/MonthView';

export function ScheduleView() {
  const { dinners, familyMembers, addDinner, editDinner, deleteDinner } = useKitchenData();
  const { toast } = useToast();

  // View mode: 'week' or 'month'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('schedule_view_mode') || 'week';
  });

  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDinnerForm, setShowDinnerForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingDinner, setEditingDinner] = useState(null);
  const [deletingDinnerId, setDeletingDinnerId] = useState(null);

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('schedule_view_mode', viewMode);
  }, [viewMode]);

  const weekDates = getWeekDates(currentWeekStart);

  const handleAddDinner = async (data) => {
    const { error } = await addDinner(data.date, data.meal, data.chefName, data.time, data.notes);
    if (error) {
      toast.error('Failed to add dinner');
    } else {
      toast.success('Dinner added!');
    }
  };

  const handleEditDinner = async (data) => {
    const { error } = await editDinner(editingDinner.id, {
      meal: data.meal,
      chef: data.chefName,
      time: data.time,
      notes: data.notes
    });
    if (error) {
      toast.error('Failed to update dinner');
    } else {
      toast.success('Dinner updated!');
    }
    setEditingDinner(null);
  };

  const handleDeleteDinner = async () => {
    const { error } = await deleteDinner(deletingDinnerId);
    if (error) {
      toast.error('Failed to delete dinner');
    } else {
      toast.success('Dinner deleted');
    }
    setDeletingDinnerId(null);
  };

  const openAddForm = (date) => {
    setSelectedDate(date);
    setEditingDinner(null);
    setShowDinnerForm(true);
  };

  const openEditForm = (dinner) => {
    setEditingDinner(dinner);
    setShowDinnerForm(true);
  };

  const handleDayClick = (date) => {
    openAddForm(date);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dinner Schedule</h1>
          <p className="text-sm md:text-base text-gray-600">Plan and organize your meals</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-orange-700 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-orange-700 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Month
            </button>
          </div>

          <button
            onClick={() => openAddForm(new Date())}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-orange-700 text-amber-50 rounded-lg hover:from-red-700 hover:to-orange-800 transition-all shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Dinner
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow">
          {/* Week Navigation */}
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
            <div className="text-sm md:text-lg font-semibold text-gray-900">
              {formatWeekRange(currentWeekStart)}
            </div>
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

          {/* Days Grid */}
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <div className="grid grid-cols-7 gap-2 md:gap-4 min-w-max md:min-w-0">
              {weekDates.map(date => {
                const dateKey = formatDateKey(date);
                const dayDinners = dinners.filter(d => d.date === dateKey);
                const isToday = formatDateKey(new Date()) === dateKey;

                return (
                  <div
                    key={dateKey}
                    className={`rounded-xl border-2 p-3 md:p-4 min-h-32 min-w-[120px] md:min-w-0 ${
                      isToday
                        ? 'border-orange-600 bg-gradient-to-br from-orange-100 to-red-100 shadow-lg'
                        : 'border-stone-300 bg-amber-50'
                    }`}
                  >
                    <div className="text-center mb-2 md:mb-3">
                      <div className="text-xs text-gray-500 uppercase">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-gray-900">
                        {date.getDate()}
                      </div>
                    </div>

                    {/* Dinners for this day */}
                    {dayDinners.map(dinner => (
                      <div
                        key={dinner.id}
                        className="bg-gradient-to-r from-red-600 to-orange-700 rounded-lg p-2 mb-2 shadow relative group"
                      >
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button
                            onClick={() => openEditForm(dinner)}
                            className="p-1 text-amber-50 hover:bg-orange-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit dinner"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeletingDinnerId(dinner.id)}
                            className="p-1 text-amber-50 hover:bg-red-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete dinner"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-sm font-semibold text-amber-50">{dinner.meal}</div>
                        <div className="text-xs text-orange-100">{dinner.chef}</div>
                        <div className="text-xs text-amber-200 font-medium">{dinner.time}</div>
                        {dinner.notes && (
                          <div className="text-xs text-amber-100 mt-1 flex items-start gap-1">
                            <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="italic">{dinner.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add button */}
                    <button
                      onClick={() => openAddForm(date)}
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
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Prev
            </button>
            <div className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>

          <MonthView
            currentMonth={currentMonth}
            dinners={dinners}
            onAddDinner={openAddForm}
            onDayClick={handleDayClick}
          />
        </>
      )}

      {/* Dinner Form Modal */}
      <DinnerForm
        isOpen={showDinnerForm}
        onClose={() => {
          setShowDinnerForm(false);
          setEditingDinner(null);
        }}
        onSubmit={editingDinner ? handleEditDinner : handleAddDinner}
        familyMembers={familyMembers}
        initialData={editingDinner ? {
          meal: editingDinner.meal,
          chefId: familyMembers.find(m => m.name === editingDinner.chef)?.id || '',
          time: editingDinner.time,
          notes: editingDinner.notes
        } : null}
        selectedDate={selectedDate}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingDinnerId}
        onClose={() => setDeletingDinnerId(null)}
        onConfirm={handleDeleteDinner}
        title="Delete Dinner"
        message="Are you sure you want to delete this dinner?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
