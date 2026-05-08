import React, { useState, useEffect, useRef } from 'react';
import { Timer, Plus, Minus, ChefHat, Clock, Users } from 'lucide-react';

const DAHL = {
  name: 'Red Lentil Dahl',
  emoji: '🍲',
  description: 'A warming, hearty dahl with coconut milk and baby spinach. Serve over brown or white rice.',
  defaultServings: 8,
  prepTime: '10 min',
  cookTime: '30 min',
  ingredients: [
    { amount: 1,    unit: 'tbsp',   name: 'olive oil' },
    { amount: 1,    unit: 'large',  name: 'yellow onion, chopped small' },
    { amount: 5,    unit: 'cloves', name: 'garlic, minced' },
    { amount: 1,    unit: 'tbsp',   name: 'fresh ginger, peeled and grated' },
    { amount: 1,    unit: 'tbsp',   name: 'garam masala' },
    { amount: 1,    unit: 'tsp',    name: 'ground turmeric' },
    { amount: 0.5,  unit: 'tsp',    name: 'red pepper chili flakes' },
    { amount: 1.5,  unit: 'cups',   name: 'dried red lentils' },
    { amount: 14,   unit: 'oz',     name: 'can diced tomatoes' },
    { amount: 13.5, unit: 'oz',     name: 'can full fat coconut milk' },
    { amount: 3,    unit: 'cups',   name: 'vegetable broth' },
    { amount: 1,    unit: 'tsp',    name: 'salt, or to taste' },
    { amount: 0.5,  unit: '',       name: 'lemon, juiced' },
    { amount: 3.5,  unit: 'cups',   name: 'baby spinach' },
    { amount: 4,    unit: 'cups',   name: 'cooked brown or white rice (for serving)' },
  ],
  steps: [
    {
      text: 'Heat olive oil in a large pot over medium heat. Add onion and cook, stirring occasionally, until softened and translucent.',
      timerSeconds: 5 * 60,
      timerLabel: '5 min — soften the onion',
    },
    {
      text: 'Add garlic, ginger, garam masala, turmeric, and chili flakes. Stir and cook for about 1 minute until very fragrant.',
      timerSeconds: null,
    },
    {
      text: 'Add lentils, diced tomatoes, coconut milk, and vegetable broth. Stir to combine. Bring to a boil, then reduce heat, cover partially, and simmer — stirring occasionally — until lentils are completely soft and the dahl has thickened.',
      timerSeconds: 25 * 60,
      timerLabel: '25 min — simmer until lentils are tender',
    },
    {
      text: 'Stir in baby spinach and cook until just wilted, about 1 minute. Season with salt and lemon juice. Serve over cooked rice.',
      timerSeconds: null,
    },
  ],
};

function fmtAmount(base, servings, defaultServings) {
  const scaled = base * (servings / defaultServings);
  if (scaled < 0.1) return '< ¼';
  // Express the fractional part with vulgar fractions
  const whole = Math.floor(scaled);
  const frac = scaled - whole;
  let fracStr = '';
  if (frac < 0.1)       fracStr = '';
  else if (frac < 0.29) fracStr = '¼';
  else if (frac < 0.42) fracStr = '⅓';
  else if (frac < 0.67) fracStr = '½';
  else if (frac < 0.88) fracStr = '¾';
  else { return String(whole + 1); }
  if (whole === 0) return fracStr || '¼';
  return fracStr ? `${whole} ${fracStr}` : String(whole);
}

function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function StepTimer({ seconds, label }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const done = remaining === 0;
  const pct = ((seconds - remaining) / seconds) * 100;

  function toggle() {
    if (done) {
      setRemaining(seconds);
      setRunning(false);
    } else {
      setRunning(r => !r);
    }
  }

  return (
    <div className="mt-3 rounded-xl border-2 border-orange-200 bg-orange-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-medium text-orange-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-lg font-bold ${done ? 'text-green-600' : 'text-orange-700'}`}>
            {done ? '✓ Done' : fmtTime(remaining)}
          </span>
          <button
            onClick={toggle}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              done
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : running
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {done ? 'Reset' : running ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>
      {!done && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-orange-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function RecipesView() {
  const [servings, setServings] = useState(DAHL.defaultServings);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 to-orange-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-4xl mb-2">{DAHL.emoji}</div>
            <h1 className="text-2xl font-bold mb-1">{DAHL.name}</h1>
            <p className="text-orange-100 text-sm leading-relaxed">{DAHL.description}</p>
          </div>
          <ChefHat className="w-10 h-10 text-orange-200 shrink-0 mt-1" />
        </div>
        <div className="flex gap-4 mt-4 text-sm text-orange-100">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Prep {DAHL.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Cook {DAHL.cookTime}</span>
          </div>
        </div>
      </div>

      {/* Serving adjuster */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-gray-800">Servings</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setServings(s => Math.max(1, s - 1))}
            className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-2xl font-bold text-orange-700 w-8 text-center">{servings}</span>
          <button
            onClick={() => setServings(s => Math.min(20, s + 1))}
            className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {DAHL.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline gap-2 text-sm">
              <span className="font-semibold text-orange-700 min-w-[3.5rem] text-right">
                {fmtAmount(ing.amount, servings, DAHL.defaultServings)}
                {ing.unit ? ` ${ing.unit}` : ''}
              </span>
              <span className="text-gray-700">{ing.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Instructions</h2>
        <ol className="space-y-5">
          {DAHL.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-orange-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5 shadow">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-sm leading-relaxed">{step.text}</p>
                {step.timerSeconds && (
                  <StepTimer seconds={step.timerSeconds} label={step.timerLabel} />
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">Kawamura Kitchen Recipe Card</p>
    </div>
  );
}
