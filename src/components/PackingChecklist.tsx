import React, { useState } from 'react';
import { Check, Plus, Trash2, Luggage, Sparkles, CheckCircle2 } from 'lucide-react';

interface PackingChecklistProps {
  initialItems: string[];
  destinationName: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({
  initialItems,
  destinationName,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(() =>
    initialItems.map((text, idx) => ({
      id: `pack-${idx}-${Date.now()}`,
      text,
      checked: false,
    }))
  );
  const [newItemText, setNewItemText] = useState('');

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `pack-${Date.now()}`, text: newItemText.trim(), checked: false },
    ]);
    setNewItemText('');
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Luggage className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Smart Packing Checklist</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Custom-tailored for {destinationName}’s activities, weather, and local customs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Packing Readiness</span>
            <span className="text-base font-bold text-amber-400">{progressPercent}%</span>
          </div>
          <div className="w-16 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={addItem} className="my-5 flex items-center gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add an extra item (e.g., Passport copy, Noise-cancelling headphones)..."
          className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add</span>
        </button>
      </form>

      {/* Item List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
              item.checked
                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  item.checked
                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                    : 'border-slate-700 group-hover:border-amber-400'
                }`}
              >
                {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  item.checked ? 'line-through text-slate-500' : 'text-slate-200'
                }`}
              >
                {item.text}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 p-1 transition-opacity"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
