import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Heart, 
  Compass, 
  DollarSign, 
  Users, 
  Sun, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { 
  POPULAR_DESTINATIONS, 
  INTEREST_TAGS, 
  TRAVEL_STYLES, 
  BUDGET_TIERS, 
  COMPANION_OPTIONS, 
  SEASONS 
} from '../data/presetItineraries';
import { TripPreferences } from '../types/itinerary';

interface TripFormProps {
  onGenerate: (preferences: TripPreferences) => Promise<void>;
  onLoadPreset: () => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  onGenerate,
  onLoadPreset,
  isLoading,
}) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    '🍜 Food & Street Eats',
    '⛩️ Temples & History',
    '💎 Hidden Local Gems',
  ]);
  const [customInterest, setCustomInterest] = useState('');
  const [travelStyle, setTravelStyle] = useState('Balanced Explorer');
  const [budget, setBudget] = useState('Moderate');
  const [companion, setCompanion] = useState('Solo Traveler');
  const [season, setSeason] = useState('Any Season');
  const [specialNotes, setSpecialNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Toggle interest
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const removeInterest = (tag: string) => {
    setSelectedInterests(selectedInterests.filter((i) => i !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onGenerate({
      destination: destination.trim(),
      days,
      interests: selectedInterests,
      travelStyle,
      budget,
      companion,
      season,
      specialNotes: specialNotes.trim(),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4">
      {/* Hero Headline */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-4 tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated with Gemini 3.8 Flash AI</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif max-w-2xl mx-auto leading-tight">
          Where do you want to wander next?
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
          Input your dream destination, trip duration, and personal passions. We’ll generate an optimized, day-by-day travel itinerary with secret spots, realistic timing, and interactive maps.
        </p>
      </div>

      {/* Main Card Form */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/60 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10">
          {/* Destination Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="destination" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Destination City or Region</span>
              </label>
              <span className="text-xs text-slate-400">Where are you headed?</span>
            </div>
            <div className="relative">
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tokyo, Japan or Amalfi Coast, Italy or Barcelona..."
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-base sm:text-lg transition-all"
                required
              />
              <MapPin className="w-5 h-5 text-slate-500 absolute left-3.5 top-4" />
            </div>

            {/* Popular Presets Quick Selector */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs text-slate-400">
              <span className="flex-shrink-0 flex items-center gap-1 text-slate-500 font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Popular:
              </span>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => {
                    setDestination(dest.name);
                    setDays(dest.days);
                  }}
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition-colors"
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </div>

          {/* Days / Duration Slider & Stepper */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="days-range" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Trip Duration: <span className="text-amber-400 text-base font-bold">{days} {days === 1 ? 'Day' : 'Days'}</span></span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 7, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                      days === d
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
              <input
                id="days-range"
                type="range"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <span className="w-12 text-center text-sm font-bold text-amber-400 font-mono bg-slate-900 py-1 rounded-lg border border-slate-800">
                {days}d
              </span>
            </div>
          </div>

          {/* Interests Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Your Interests & Passions ({selectedInterests.length} selected)</span>
              </label>
              <span className="text-xs text-slate-400">Select all that apply</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => {
                const isSelected = selectedInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10 scale-[1.02]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Interest Input */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomInterest(e)}
                placeholder="Add custom interest (e.g. Scuba diving, Anime, Architecture)..."
                className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                disabled={!customInterest.trim()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Selected Custom Tags (if any outside defaults) */}
            {selectedInterests.filter(i => !INTEREST_TAGS.includes(i)).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedInterests.filter(i => !INTEREST_TAGS.includes(i)).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs"
                  >
                    {tag}
                    <button type="button" onClick={() => removeInterest(tag)}>
                      <X className="w-3 h-3 hover:text-white" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Travel Style Selection */}
          <div>
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2.5">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Travel Style & Pace</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TRAVEL_STYLES.slice(0, 3).map((style) => {
                const isSelected = travelStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setTravelStyle(style.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{style.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{style.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collapsible Advanced Preferences */}
          <div className="border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 py-1 transition-colors"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Budget, Companions, Season & Special Dietary Notes
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pt-2">
                {/* Budget & Companion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Budget */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Budget Tier
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUDGET_TIERS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBudget(b.id)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            budget === b.id
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-xs">{b.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Companion */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Who is traveling?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMPANION_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCompanion(c)}
                          className={`p-2 rounded-xl border text-center text-xs transition-all ${
                            companion === c
                              ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 font-semibold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Season & Special Requests */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Timing / Season
                    </label>
                    <select
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      {SEASONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                      Special Dietary / Accessibility Notes
                    </label>
                    <input
                      type="text"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Vegetarian, early morning riser, wheelchair access"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || !destination.trim()}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 disabled:opacity-50 text-slate-950 font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating {days}-Day Itinerary with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate {days}-Day Itinerary</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>

            {/* Instant Sample Preview Button */}
            <button
              type="button"
              onClick={onLoadPreset}
              disabled={isLoading}
              className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:text-amber-300"
            >
              <span>Instant Sample (Tokyo 4-Day)</span>
            </button>
          </div>
        </form>

        {/* Loading overlay state message */}
        {isLoading && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center animate-pulse">
            <p className="text-amber-300 text-sm font-medium">
              Curating high-rated local favorites, calculating walking routes, and timing visits for {destination || 'your destination'}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
