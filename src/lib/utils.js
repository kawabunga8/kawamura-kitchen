// Date utility functions

export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = -day; // Days to subtract to get to Sunday
  d.setDate(d.getDate() + diff);
  return d;
}

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getWeekDates(weekStart) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setHours(0, 0, 0, 0);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function formatWeekRange(weekStart) {
  const weekDates = getWeekDates(weekStart);
  const start = weekDates[0];
  const end = weekDates[6];
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// Convert time input to 12-hour format with AM/PM (assumes PM unless 'am' specified)
export function convertTo12Hour(timeInput) {
  if (!timeInput) return '';

  const input = timeInput.toLowerCase().trim();
  const isAM = input.includes('am');
  const isPM = input.includes('pm');

  // Extract just the numbers
  const timeOnly = input.replace(/[^0-9:]/g, '');

  // Parse the time
  let [hours, minutes] = timeOnly.split(':');
  hours = parseInt(hours);
  minutes = minutes || '00';

  // If already has AM/PM, just format it
  if (isAM || isPM) {
    const period = isAM ? 'AM' : 'PM';
    const displayHour = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    return `${displayHour}:${minutes} ${period}`;
  }

  // Assume PM for times between 1-11, AM for 12
  const period = 'PM';
  const displayHour = hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes} ${period}`;
}
