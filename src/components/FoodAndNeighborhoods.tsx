import React from 'react';
import { PracticalInfo } from '../types/itinerary';
import { Utensils, Compass, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';

interface FoodAndNeighborhoodsProps {
  practicalInfo: PracticalInfo;
  destinationName: string;
}

export const FoodAndNeighborhoods: React.FC<FoodAndNeighborhoodsProps> = ({
  practicalInfo,
  destinationName,
}) => {
  return (
    <div className="space-y-8">
      {/* Must-Try Regional Foods */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Utensils className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Signature Foods to Savor</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Do not leave {destinationName} without trying these iconic culinary traditions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {practicalInfo.recommendedFoods.map((food, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold font-mono">
                  {idx + 1}
                </span>
                <h4 className="text-base font-bold text-white">{food.dish}</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 pl-8 leading-relaxed">
                {food.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Neighborhood Vibe Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white">Neighborhood Vibe Guide</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Understanding the distinct character of each district helps you explore with confidence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {practicalInfo.neighborhoodGuide.map((neighborhood, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
            >
              <h4 className="text-base font-bold text-white flex items-center justify-between">
                <span>{neighborhood.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  {neighborhood.bestFor.split(',')[0]}
                </span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {neighborhood.vibe}
              </p>
              <div className="pt-2 text-[11px] text-amber-300/90 font-medium">
                🎯 <strong>Best for:</strong> {neighborhood.bestFor}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transit & Cultural Etiquette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Transit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-lg">🚇</span>
            <span>Getting Around & Transit Tips</span>
          </h3>
          <ul className="space-y-2.5">
            {practicalInfo.transportationTips.map((tip, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Etiquette & Emergency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Local Customs & Etiquette</span>
          </h3>
          <ul className="space-y-2.5">
            {practicalInfo.localEtiquette.map((rule, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>

          {practicalInfo.emergencyNumbers && (
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>{practicalInfo.emergencyNumbers}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
