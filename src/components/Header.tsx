import React from 'react';
import { Compass, Bookmark, PlusCircle, Printer, Sparkles, MapPin } from 'lucide-react';

interface HeaderProps {
  onNewTrip: () => void;
  onOpenSavedTrips: () => void;
  savedTripsCount: number;
  hasActiveTrip: boolean;
  onPrintTrip?: () => void;
  currentDestination?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNewTrip,
  onOpenSavedTrips,
  savedTripsCount,
  hasActiveTrip,
  onPrintTrip,
  currentDestination,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onNewTrip}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-serif">Roam</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">AI Travel Itinerary Generator</p>
          </div>
        </div>

        {/* Center destination pill if active */}
        {hasActiveTrip && currentDestination && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-slate-200">{currentDestination}</span>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveTrip && onPrintTrip && (
            <button
              onClick={onPrintTrip}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          )}

          <button
            onClick={onOpenSavedTrips}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all relative"
            title="Saved Itineraries"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Saved Trips</span>
            {savedTripsCount > 0 && (
              <span className="w-4 h-4 text-[10px] bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center">
                {savedTripsCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewTrip}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};
