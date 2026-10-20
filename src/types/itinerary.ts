export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  timeSlot: string; // 'Morning' | 'Midday / Lunch' | 'Afternoon' | 'Evening' | 'Night';
  timeRange: string;
  title: string;
  locationName: string;
  coordinates: Coordinate;
  description: string;
  category: 'sightseeing' | 'food' | 'culture' | 'nature' | 'relaxation' | 'adventure' | 'shopping' | string;
  estimatedCost: string;
  duration: string;
  insiderTip: string;
  bookingRequired: boolean;
  tags: string[];
  isCompleted?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  dateOrTitle: string;
  summary: string;
  estimatedDayBudget: string;
  activities: Activity[];
}

export interface Neighborhood {
  name: string;
  vibe: string;
  bestFor: string;
}

export interface FoodRecommendation {
  dish: string;
  description: string;
}

export interface PracticalInfo {
  transportationTips: string[];
  neighborhoodGuide: Neighborhood[];
  localEtiquette: string[];
  recommendedFoods: FoodRecommendation[];
  packingEssentials: string[];
  emergencyNumbers: string;
}

export interface Itinerary {
  id?: string;
  createdAt?: string;
  tripTitle: string;
  tagline: string;
  destination: string;
  totalDays: number;
  summary: string;
  bestSeasonAdvice: string;
  localCurrency: string;
  estimatedTotalBudget: string;
  destinationCoordinates: Coordinate & { zoom?: number };
  days: DayPlan[];
  practicalInfo: PracticalInfo;
}

export interface TripPreferences {
  destination: string;
  days: number;
  interests: string[];
  travelStyle: string;
  budget: string;
  companion: string;
  season: string;
  specialNotes: string;
}

export interface AlternativeActivity extends Activity {
  whyThisIsAGreatAlternative: string;
}
