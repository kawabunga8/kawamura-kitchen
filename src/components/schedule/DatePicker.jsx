import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDateKey } from '../../lib/utils';

export function DatePicker({
  value,
  onChange,
  highlightedDates = [],
  placeholder = 'Select date'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  // Get calendar days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startDayOfWeek },
    (_, i) => ({
      date: new Date(year, month - 1, prevMonthLastDay - startDayOfWeek + i + 1),
      isCurrentMonth: false
    })
  );

  const currentMonthDays = Array.from(
    { length: daysInMonth },
    (_, i) => ({
      date: new Date(year, month, i + 1),
      isCurrentMonth: true
    })
  );

  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
  const nextMonthDays = Array.from(
    { length: totalCells - prevMonthDays.length - currentMonthDays.length },
    (_, i) => ({
      date: new Date(year, month + 1, i + 1),
      isCurrentMonth: false
    })
  );

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const today = formatDateKey(new Date());
  const selectedDate = value ? formatDateKey(new Date(value)) : null;
  const highlightedSet = new Set(highlightedDates);

  const handleSelectDate = (date) => {
    onChange(formatDateKey(date));
    setIsOpen(false);
  };

  const prevMonth = () => {
    setViewMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(year, month + 1, 1));
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return placeholder;
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex items-center gap-2"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {formatDisplayDate(value)}
        </span>
      </button>

      {/* Dropdown calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="font-semibold text-gray-900">
              {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map(({ date, isCurrentMonth }) => {
                  const dateKey = formatDateKey(date);
                  const isToday = dateKey === today;
                  const isSelected = dateKey === selectedDate;
                  const isHighlighted = highlightedSet.has(dateKey);

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      className={`
                        w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors
                        ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-orange-100'}
                        ${isToday && !isSelected ? 'ring-1 ring-orange-400' : ''}
                        ${isSelected ? 'bg-orange-600 text-white hover:bg-orange-700' : ''}
                        ${isHighlighted && !isSelected ? 'bg-orange-100' : ''}
                      `}
                    >
                      {date.getDate()}
                      {isHighlighted && !isSelected && (
                        <span className="absolute bottom-0.5 w-1 h-1 bg-orange-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setViewMonth(new Date());
                handleSelectDate(new Date());
              }}
              className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
