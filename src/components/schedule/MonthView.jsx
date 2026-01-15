import React from 'react';
import { Plus } from 'lucide-react';
import { formatDateKey } from '../../lib/utils';

export function MonthView({
  currentMonth,
  dinners,
  familyMembers,
  onAddDinner,
  onDayClick,
  onEditDinner
}) {


  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Get days from previous month to fill first week
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startDayOfWeek },
    (_, i) => ({
      date: new Date(year, month - 1, prevMonthLastDay - startDayOfWeek + i + 1),
      isCurrentMonth: false
    })
  );

  // Current month days
  const currentMonthDays = Array.from(
    { length: daysInMonth },
    (_, i) => ({
      date: new Date(year, month, i + 1),
      isCurrentMonth: true
    })
  );

  // Next month days to fill last week
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
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDinnersForDate = (date) => {
    const dateKey = formatDateKey(date);
    return dinners.filter(d => d.date === dateKey);
  };

  const getChefColor = (chefName) => {
    const member = familyMembers.find(m => m.name === chefName);
    return member?.color || 'orange';
  };


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
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
              const dayDinners = getDinnersForDate(date);
              const hasEvents = dayDinners.length > 0;

              return (
                <div
                  key={dateKey}
                  onClick={() => onDayClick(date)}
                  className={`
                    min-h-[80px] md:min-h-[100px] p-1 md:p-2 rounded-lg cursor-pointer transition-colors border
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400 border-transparent' : 'bg-amber-50 border-stone-200 hover:border-orange-400'}
                    ${isToday ? 'ring-2 ring-orange-500 bg-orange-100' : ''}
                  `}
                >
                  {/* Date number */}
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-orange-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {date.getDate()}
                  </div>

                  {/* Event indicators */}
                  <div className="space-y-0.5">
                    {dayDinners.slice(0, 2).map(dinner => {
                      const color = getChefColor(dinner.chef);
                      const bgClass = color === 'green' ? 'bg-emerald-600' : `bg-${color}-600`;

                      return (
                        <div
                          key={dinner.id}
                          className={`text-xs truncate text-white px-1 py-0.5 rounded ${bgClass}`}
                          title={`${dinner.meal} - ${dinner.chef}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDinner(dinner);
                          }}
                        >
                          {dinner.meal}
                        </div>
                      );

                    })}

                    {dayDinners.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayDinners.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Add indicator on hover for empty days */}
                  {isCurrentMonth && dayDinners.length === 0 && (
                    <div className="flex items-center justify-center h-6 opacity-0 hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
