import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Activity, DayPlan } from '../types/itinerary';
import { MapPin, Navigation, Eye, Layers } from 'lucide-react';

interface InteractiveMapProps {
  days: DayPlan[];
  selectedDayNumber: number | null; // null means 'All Days'
  onSelectDay: (dayNumber: number | null) => void;
  onSelectActivity?: (activity: Activity) => void;
  destinationName: string;
  defaultCoords: { lat: number; lng: number; zoom?: number };
}

// Day color palette for route lines and pins
const DAY_COLORS = [
  '#f59e0b', // Amber (Day 1)
  '#06b6d4', // Cyan (Day 2)
  '#10b981', // Emerald (Day 3)
  '#ec4899', // Pink (Day 4)
  '#8b5cf6', // Purple (Day 5)
  '#f97316', // Orange (Day 6)
  '#3b82f6', // Blue (Day 7)
  '#14b8a6', // Teal (Day 8+)
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
  destinationName,
  defaultCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const linesGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = defaultCoords?.lat || 35.6762;
    const initialLng = defaultCoords?.lng || 139.6503;
    const initialZoom = defaultCoords?.zoom || 12;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
    });

    // Dark-styled map tiles (CartoDB Dark Matter / Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    linesGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Polyline Routes when days or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const linesGroup = linesGroupRef.current;
    if (!map || !markersGroup || !linesGroup) return;

    markersGroup.clearLayers();
    linesGroup.clearLayers();

    const allPoints: L.LatLngExpression[] = [];

    // Filter which days to show
    const visibleDays = selectedDayNumber
      ? days.filter((d) => d.dayNumber === selectedDayNumber)
      : days;

    visibleDays.forEach((dayPlan) => {
      const dayColor = DAY_COLORS[(dayPlan.dayNumber - 1) % DAY_COLORS.length];
      const dayRoutePoints: [number, number][] = [];

      dayPlan.activities.forEach((act, idx) => {
        if (!act.coordinates || typeof act.coordinates.lat !== 'number') return;

        // Apply category filter
        if (activeCategoryFilter !== 'all' && act.category?.toLowerCase() !== activeCategoryFilter.toLowerCase()) {
          return;
        }

        const point: [number, number] = [act.coordinates.lat, act.coordinates.lng];
        allPoints.push(point);
        dayRoutePoints.push(point);

        // Custom HTML Marker Icon
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              background-color: ${dayColor};
              color: #020617;
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              border: 2px solid #ffffff;
            ">
              <span style="
                transform: rotate(45deg);
                font-size: 11px;
                font-weight: 800;
                font-family: sans-serif;
              ">${dayPlan.dayNumber}.${idx + 1}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${act.title} ${act.locationName} ${destinationName}`)}`;

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 200px; max-width: 280px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="background: ${dayColor}22; color: ${dayColor}; border: 1px solid ${dayColor}55; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                Day ${dayPlan.dayNumber} • ${act.timeSlot}
              </span>
              <span style="font-size: 11px; font-weight: 600; color: #475569;">${act.timeRange}</span>
            </div>
            <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3;">
              ${act.title}
            </h4>
            <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">
              📍 ${act.locationName}
            </p>
            <p style="margin: 0 0 8px; font-size: 12px; color: #334155; line-height: 1.4;">
              ${act.description.slice(0, 110)}...
            </p>
            ${
              act.insiderTip
                ? `<div style="background: #fef3c7; border-left: 3px solid #f59e0b; padding: 6px; font-size: 11px; color: #92400e; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
                    💡 <strong>Tip:</strong> ${act.insiderTip.slice(0, 90)}...
                  </div>`
                : ''
            }
            <div style="display: flex; align-items: center; justify-content: space-between; pt: 4px; border-top: 1px solid #e2e8f0;">
              <span style="font-size: 11px; font-weight: 700; color: #0f172a;">${act.estimatedCost || 'Free'}</span>
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                color: #2563eb;
                font-size: 11px;
                font-weight: 600;
                text-decoration: none;
              ">
                Google Maps ↗
              </a>
            </div>
          </div>
        `;

        const marker = L.marker(point, { icon: customIcon }).bindPopup(popupContent);
        markersGroup.addLayer(marker);
      });

      // Draw dashed connecting path for this day's sequence
      if (dayRoutePoints.length > 1) {
        const polyline = L.polyline(dayRoutePoints, {
          color: dayColor,
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 8',
          lineCap: 'round',
        });
        linesGroup.addLayer(polyline);
      }
    });

    // Auto-fit map to visible markers
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [days, selectedDayNumber, activeCategoryFilter]);

  // Invalidate map size on window resize or tab switch
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Filter Bar Over Map */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Day Switcher */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg overflow-x-auto max-w-full">
          <button
            onClick={() => onSelectDay(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedDayNumber === null
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            All Days
          </button>
          {days.map((day) => {
            const isSelected = selectedDayNumber === day.dayNumber;
            const dayColor = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
            return (
              <button
                key={day.dayNumber}
                onClick={() => onSelectDay(day.dayNumber)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: dayColor }}
                />
                <span>Day {day.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg text-xs">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {['all', 'food', 'culture', 'sightseeing', 'nature'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                activeCategoryFilter === cat
                  ? 'bg-slate-800 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90 text-xs text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-medium">Connecting lines show logical walking/transit flow</span>
        </div>
      </div>
    </div>
  );
};
