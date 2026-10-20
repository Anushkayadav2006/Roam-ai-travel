import React, { useState } from 'react';
import { DayPlan, Activity } from '../types/itinerary';
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Lightbulb, 
  Sparkles, 
  Check, 
  ExternalLink, 
  AlertCircle,
  Coffee,
  Sun,
  Sunset,
  Moon,
  UtensilsCrossed,
  ArrowUpDown,
  Compass
} from 'lucide-react';

interface DayScheduleProps {
  days: DayPlan[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  destinationName: string;
  onOpenSwapModal: (dayNumber: number, activity: Activity) => void;
  onToggleActivityCompleted: (dayNumber: number, activityId: string) => void;
}

const getTimeSlotIcon = (slot: string) => {
  const s = slot.toLowerCase();
  if (s.includes('morning')) return <Sun className="w-4 h-4 text-amber-400" />;
  if (s.includes('lunch') || s.includes('midday')) return <UtensilsCrossed className="w-4 h-4 text-orange-400" />;
  if (s.includes('afternoon')) return <Compass className="w-4 h-4 text-sky-400" />;
  if (s.includes('evening')) return <Sunset className="w-4 h-4 text-rose-400" />;
  if (s.includes('night')) return <Moon className="w-4 h-4 text-indigo-400" />;
  return <Clock className="w-4 h-4 text-amber-400" />;
};

const getCategoryColor = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes('food')) return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
  if (c.includes('culture') || c.includes('temple')) return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  if (c.includes('nature') || c.includes('garden')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (c.includes('shopping')) return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
  if (c.includes('relaxation') || c.includes('spa')) return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
  return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
};

export const DaySchedule: React.FC<DayScheduleProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
  destinationName,
  onOpenSwapModal,
  onToggleActivityCompleted,
}) => {
  const currentDay = days.find((d) => d.dayNumber === selectedDayNumber) || days[0];

  if (!currentDay) {
    return <div className="text-slate-400 text-center py-12">No day plan available.</div>;
  }

  const completedCount = currentDay.activities.filter((a) => a.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          const isAllDone = day.activities.length > 0 && day.activities.every((a) => a.isCompleted);
          return (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay(day.dayNumber)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span>Day {day.dayNumber}</span>
                {isAllDone && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className={`text-[11px] truncate max-w-[130px] font-normal ${isSelected ? 'text-slate-950 font-medium' : 'text-slate-400'}`}>
                {day.theme.split('&')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Day Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DAY {currentDay.dayNumber} OF {days.length}
              </span>
              <span className="text-xs text-slate-400">
                {completedCount}/{currentDay.activities.length} completed
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 font-serif">
              {currentDay.dateOrTitle || currentDay.theme}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {currentDay.summary}
            </p>
          </div>

          <div className="flex-shrink-0 sm:text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Estimated Budget</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              {currentDay.estimatedDayBudget}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-300"
            style={{
              width: `${(completedCount / Math.max(currentDay.activities.length, 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="relative pl-4 sm:pl-6 space-y-6 before:absolute before:left-[19px] sm:before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
        {currentDay.activities.map((act, index) => {
          const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${act.title} ${act.locationName} ${destinationName}`
          )}`;

          return (
            <div key={act.id || index} className="relative group">
              {/* Timeline Node dot */}
              <button
                onClick={() => onToggleActivityCompleted(currentDay.dayNumber, act.id)}
                title={act.isCompleted ? 'Mark as unvisited' : 'Mark as visited'}
                className={`absolute -left-4 sm:-left-6 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                  act.isCompleted
                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                    : 'bg-slate-950 border-slate-700 text-transparent hover:border-amber-400'
                }`}
              >
                <Check className={`w-3.5 h-3.5 stroke-[3] ${act.isCompleted ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              {/* Activity Card */}
              <div
                className={`ml-5 sm:ml-6 p-5 sm:p-6 rounded-3xl border transition-all ${
                  act.isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Time Slot Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 text-xs font-semibold text-slate-200 border border-slate-800">
                      {getTimeSlotIcon(act.timeSlot)}
                      <span>{act.timeSlot}</span>
                    </div>

                    {/* Time Range */}
                    <span className="text-xs font-mono text-slate-400 font-medium">
                      {act.timeRange}
                    </span>

                    {/* Category Tag */}
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border capitalize ${getCategoryColor(
                        act.category
                      )}`}
                    >
                      {act.category}
                    </span>
                  </div>

                  {/* Top Right Action: AI Swap Button */}
                  <button
                    onClick={() => onOpenSwapModal(currentDay.dayNumber, act)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
                    title="Ask AI for alternative spots for this time slot"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Swap Spot</span>
                  </button>
                </div>

                {/* Title & Location */}
                <div className="mb-2">
                  <h3
                    className={`text-lg sm:text-xl font-bold text-white transition-all ${
                      act.isCompleted ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {act.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{act.locationName}</span>
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-sky-400 hover:text-sky-300 inline-flex items-center gap-0.5 hover:underline"
                    >
                      <span>Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2.5">
                  {act.description}
                </p>

                {/* Insider Tip Callout */}
                {act.insiderTip && (
                  <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="leading-snug">
                      <strong className="text-amber-300">Local Secret: </strong>
                      {act.insiderTip}
                    </div>
                  </div>
                )}

                {/* Bottom Details (Cost, Duration, Booking alert, tags) */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{act.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{act.estimatedCost || 'Free'}</span>
                    </div>
                    {act.bookingRequired && (
                      <div className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/25">
                        <AlertCircle className="w-3 h-3" />
                        <span>Advance Booking Recommended</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {act.tags && act.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {act.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-400 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
