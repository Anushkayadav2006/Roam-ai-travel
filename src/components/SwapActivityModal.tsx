import React, { useState, useEffect } from 'react';
import { Activity, AlternativeActivity } from '../types/itinerary';
import { Sparkles, X, ArrowRight, RefreshCw, CheckCircle, MapPin, Tag, Lightbulb } from 'lucide-react';

interface SwapActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  dayTheme: string;
  dayNumber: number;
  activity: Activity | null;
  onSelectAlternative: (newActivity: Activity) => void;
}

export const SwapActivityModal: React.FC<SwapActivityModalProps> = ({
  isOpen,
  onClose,
  destination,
  dayTheme,
  dayNumber,
  activity,
  onSelectAlternative,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeActivity[]>([]);

  const fetchAlternatives = async () => {
    if (!activity) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/itinerary/swap-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          dayTheme,
          timeSlot: activity.timeSlot,
          currentActivity: activity,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch alternative activities');
      }

      setAlternatives(data.alternatives || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with AI service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activity) {
      fetchAlternatives();
    } else {
      setAlternatives([]);
      setError(null);
    }
  }, [isOpen, activity]);

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Activity Swap</h3>
              <p className="text-xs text-slate-400">Day {dayNumber} • {activity.timeSlot}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Activity Reference */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Currently Scheduled:</span>
            <span className="font-mono">{activity.timeRange}</span>
          </div>
          <div className="font-semibold text-sm text-slate-200">{activity.title}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{activity.locationName}</span>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-amber-300 font-medium">
              Gemini AI is finding 2 tailored alternative experiences for Day {dayNumber}...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-rose-400">{error}</p>
            <button
              onClick={fetchAlternatives}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Alternatives List */}
        {!loading && !error && alternatives.length > 0 && (
          <div className="mt-5 space-y-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Choose an AI Curated Alternative:
            </div>

            {alternatives.map((alt, idx) => (
              <div
                key={alt.id || idx}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        {alt.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{alt.duration}</span>
                      <span className="text-xs font-semibold text-emerald-400">{alt.estimatedCost}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                      {alt.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{alt.locationName}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectAlternative({
                        ...activity,
                        id: alt.id || `alt-${Date.now()}-${idx}`,
                        title: alt.title,
                        locationName: alt.locationName,
                        coordinates: alt.coordinates,
                        description: alt.description,
                        category: alt.category,
                        estimatedCost: alt.estimatedCost,
                        duration: alt.duration,
                        insiderTip: alt.insiderTip,
                        bookingRequired: alt.bookingRequired,
                        tags: alt.tags || [],
                      });
                      onClose();
                    }}
                    className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Swap This In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {alt.description}
                </p>

                {/* Why this alternative works */}
                {alt.whyThisIsAGreatAlternative && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-200/90 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Why it fits:</strong> {alt.whyThisIsAGreatAlternative}</span>
                  </div>
                )}

                {/* Insider tip */}
                {alt.insiderTip && (
                  <div className="flex items-start gap-2 text-xs text-slate-400">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{alt.insiderTip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={fetchAlternatives}
            disabled={loading}
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate New Options</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
