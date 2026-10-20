import React, { useState } from 'react';
import { Itinerary, Activity } from '../types/itinerary';
import { DaySchedule } from './DaySchedule';
import { InteractiveMap } from './InteractiveMap';
import { PackingChecklist } from './PackingChecklist';
import { FoodAndNeighborhoods } from './FoodAndNeighborhoods';
import { SwapActivityModal } from './SwapActivityModal';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Sun, 
  Bookmark, 
  Share2, 
  Check, 
  Printer, 
  ArrowLeft,
  Luggage,
  UtensilsCrossed,
  Map as MapIcon,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItineraryViewProps {
  itinerary: Itinerary;
  onBackToEdit: () => void;
  onSaveTrip: (itinerary: Itinerary) => void;
  isSaved: boolean;
  onUpdateItinerary: (updated: Itinerary) => void;
}

type TabType = 'schedule' | 'map' | 'packing' | 'food';

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onBackToEdit,
  onSaveTrip,
  isSaved,
  onUpdateItinerary,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [mapDayFilter, setMapDayFilter] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);
  
  // Swap Modal State
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapDayNumber, setSwapDayNumber] = useState<number>(1);
  const [swapActivity, setSwapActivity] = useState<Activity | null>(null);

  const handleOpenSwapModal = (dayNumber: number, activity: Activity) => {
    setSwapDayNumber(dayNumber);
    setSwapActivity(activity);
    setSwapModalOpen(true);
  };

  const handleApplySwap = (newActivity: Activity) => {
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber !== swapDayNumber) return day;
      return {
        ...day,
        activities: day.activities.map((act) => (act.id === newActivity.id || act.timeSlot === newActivity.timeSlot ? newActivity : act)),
      };
    });

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
    });
  };

  const handleToggleActivityCompleted = (dayNumber: number, activityId: string) => {
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: day.activities.map((act) => {
          if (act.id === activityId) {
            const nextState = !act.isCompleted;
            if (nextState) {
              confetti({
                particleCount: 25,
                spread: 45,
                origin: { y: 0.8 },
                colors: ['#f59e0b', '#10b981', '#38bdf8'],
              });
            }
            return { ...act, isCompleted: nextState };
          }
          return act;
        }),
      };
    });

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
    });
  };

  const handleShare = () => {
    // Generate text summary
    const summaryLines = [
      `✈️ ${itinerary.tripTitle}`,
      `📍 ${itinerary.destination} (${itinerary.totalDays} Days)`,
      `💰 Budget: ${itinerary.estimatedTotalBudget}`,
      `✨ ${itinerary.tagline}`,
      '',
      ...itinerary.days.map(d => `Day ${d.dayNumber}: ${d.dateOrTitle} (${d.activities.length} stops)`),
      '',
      'Created with RoamAI',
    ];
    navigator.clipboard.writeText(summaryLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToEdit}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Plan Another Trip</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveTrip(itinerary)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isSaved ? 'Saved to Trips' : 'Save Trip'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Summary!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {itinerary.totalDays} DAYS ITINERARY
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-300 font-medium bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {itinerary.destination}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-300 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              {itinerary.estimatedTotalBudget}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif leading-tight">
            {itinerary.tripTitle}
          </h1>

          <p className="text-amber-200/80 text-sm sm:text-base font-medium italic">
            "{itinerary.tagline}"
          </p>

          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            {itinerary.summary}
          </p>

          {/* Quick info row */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span><strong>Best Season:</strong> {itinerary.bestSeasonAdvice}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-300">Currency:</span>
              <span>{itinerary.localCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'schedule'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Day-by-Day Schedule</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('map');
            setMapDayFilter(selectedDayNumber);
          }}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'map'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Interactive Route Map</span>
        </button>

        <button
          onClick={() => setActiveTab('food')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'food'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Food & Neighborhoods</span>
        </button>

        <button
          onClick={() => setActiveTab('packing')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'packing'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Luggage className="w-4 h-4" />
          <span>Packing Checklist</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'schedule' && (
          <DaySchedule
            days={itinerary.days}
            selectedDayNumber={selectedDayNumber}
            onSelectDay={setSelectedDayNumber}
            destinationName={itinerary.destination}
            onOpenSwapModal={handleOpenSwapModal}
            onToggleActivityCompleted={handleToggleActivityCompleted}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <InteractiveMap
              days={itinerary.days}
              selectedDayNumber={mapDayFilter}
              onSelectDay={setMapDayFilter}
              destinationName={itinerary.destination}
              defaultCoords={itinerary.destinationCoordinates}
            />
          </div>
        )}

        {activeTab === 'food' && (
          <FoodAndNeighborhoods
            practicalInfo={itinerary.practicalInfo}
            destinationName={itinerary.destination}
          />
        )}

        {activeTab === 'packing' && (
          <PackingChecklist
            initialItems={itinerary.practicalInfo.packingEssentials || []}
            destinationName={itinerary.destination}
          />
        )}
      </div>

      {/* AI Swap Modal */}
      <SwapActivityModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        destination={itinerary.destination}
        dayTheme={itinerary.days.find(d => d.dayNumber === swapDayNumber)?.theme || ''}
        dayNumber={swapDayNumber}
        activity={swapActivity}
        onSelectAlternative={handleApplySwap}
      />
    </div>
  );
};
