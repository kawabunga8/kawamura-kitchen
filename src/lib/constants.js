// Application constants



export const CATEGORIES = ['freezer', 'fridge', 'produce', 'pantry', 'spices'];

export const CATEGORY_MAP = {
  '1': 'freezer',
  '2': 'fridge',
  '3': 'produce',
  '4': 'pantry',
  '5': 'spices'
};

export const REVERSE_CATEGORY_MAP = {
  freezer: '1',
  fridge: '2',
  produce: '3',
  pantry: '4',
  spices: '5'
};

export const CATEGORY_LABELS = {
  freezer: { name: 'Freezer', icon: '❄️', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  fridge: { name: 'Fridge', icon: '🧊', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  produce: { name: 'Produce', icon: '🥬', color: 'bg-green-100 text-green-800 border-green-300' },
  pantry: { name: 'Pantry', icon: '🥫', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  spices: { name: 'Spices', icon: '🌶️', color: 'bg-orange-100 text-orange-800 border-orange-300' }
};

export const CATEGORY_EMOJI = {
  freezer: '❄️',
  fridge: '🧊',
  produce: '🥬',
  pantry: '🥫',
  spices: '🌶️'
};
