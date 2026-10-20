import React from 'react';
import { Itinerary } from '../types/itinerary';
import { Bookmark, Calendar, MapPin, Trash2, ArrowRight, X, Download } from 'lucide-react';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: Itinerary[];
  onLoadTrip: (trip: Itinerary) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onLoadTrip,
  onDeleteTrip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl relative p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Your Saved Trips</h3>
              <p className="text-xs text-slate-400">{savedTrips.length} itineraries stored locally</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedTrips.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">You haven't saved any travel itineraries yet.</p>
            <p className="text-xs text-slate-500">
              Generate an itinerary and click "Save Trip" to keep it handy for offline or future review!
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {savedTrips.map((trip) => (
              <div
                key={trip.id || trip.tripTitle}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      {trip.totalDays} Days
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {trip.destination}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white truncate">
                    {trip.tripTitle}
                  </h4>
                  <p className="text-xs text-slate-400 truncate max-w-sm">
                    {trip.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      onLoadTrip(trip);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteTrip(trip.id || '')}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
