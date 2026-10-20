import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TripForm } from './components/TripForm';
import { ItineraryView } from './components/ItineraryView';
import { SavedTripsModal } from './components/SavedTripsModal';
import { Itinerary, TripPreferences } from './types/itinerary';
import { SAMPLE_PRESET_ITINERARY } from './data/presetItineraries';
import confetti from 'canvas-confetti';
import { AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'roam_ai_saved_trips_v1';

export default function App() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [savedTripsModalOpen, setSavedTripsModalOpen] = useState(false);

  // Load saved trips from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedTrips(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved trips from localStorage', e);
    }
  }, []);

  // Save trips to localStorage whenever updated
  const persistSavedTrips = (trips: Itinerary[]) => {
    setSavedTrips(trips);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const handleGenerate = async (preferences: TripPreferences) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate itinerary. Please try again.');
      }

      const newItinerary: Itinerary = {
        ...result.data,
        id: `trip-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setItinerary(newItinerary);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#f97316', '#ec4899', '#38bdf8'],
      });
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred while generating your itinerary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = () => {
    setItinerary({
      ...SAMPLE_PRESET_ITINERARY,
      id: `trip-tokyo-sample`,
      createdAt: new Date().toISOString(),
    });
    setError(null);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#38bdf8'],
    });
  };

  const handleSaveTrip = (tripToSave: Itinerary) => {
    const tripId = tripToSave.id || `trip-${Date.now()}`;
    const exists = savedTrips.some((t) => t.id === tripId || t.tripTitle === tripToSave.tripTitle);

    if (exists) {
      // Update existing
      const updated = savedTrips.map((t) =>
        t.id === tripId || t.tripTitle === tripToSave.tripTitle ? { ...tripToSave, id: tripId } : t
      );
      persistSavedTrips(updated);
    } else {
      const updated = [{ ...tripToSave, id: tripId }, ...savedTrips];
      persistSavedTrips(updated);
    }

    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#10b981'],
    });
  };

  const handleDeleteTrip = (tripId: string) => {
    const updated = savedTrips.filter((t) => t.id !== tripId);
    persistSavedTrips(updated);
  };

  const isCurrentTripSaved = Boolean(
    itinerary &&
      savedTrips.some(
        (t) => t.id === itinerary.id || t.tripTitle === itinerary.tripTitle
      )
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <Header
        onNewTrip={() => {
          setItinerary(null);
          setError(null);
        }}
        onOpenSavedTrips={() => setSavedTripsModalOpen(true)}
        savedTripsCount={savedTrips.length}
        hasActiveTrip={Boolean(itinerary)}
        currentDestination={itinerary?.destination}
        onPrintTrip={() => window.print()}
      />

      <main className="flex-1 pb-16">
        {/* Error Notification */}
        {error && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-semibold underline hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* View Switcher: Form or Generated Itinerary */}
        {!itinerary ? (
          <TripForm
            onGenerate={handleGenerate}
            onLoadPreset={handleLoadPreset}
            isLoading={isLoading}
          />
        ) : (
          <ItineraryView
            itinerary={itinerary}
            onBackToEdit={() => setItinerary(null)}
            onSaveTrip={handleSaveTrip}
            isSaved={isCurrentTripSaved}
            onUpdateItinerary={(updated) => {
              setItinerary(updated);
              if (isCurrentTripSaved) {
                handleSaveTrip(updated);
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p>RoamAI • Intelligent Day-by-Day Travel Itineraries with Gemini 3.8 Flash</p>
      </footer>

      {/* Saved Trips Drawer / Modal */}
      <SavedTripsModal
        isOpen={savedTripsModalOpen}
        onClose={() => setSavedTripsModalOpen(false)}
        savedTrips={savedTrips}
        onLoadTrip={(trip) => {
          setItinerary(trip);
          setError(null);
        }}
        onDeleteTrip={handleDeleteTrip}
      />
    </div>
  );
}
