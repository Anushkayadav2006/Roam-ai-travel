import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// JSON Schema definition for Day-by-Day Itinerary
const itineraryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING, description: 'Catchy and inspiring title for the trip' },
    tagline: { type: Type.STRING, description: 'Short evocative tagline' },
    destination: { type: Type.STRING, description: 'Standardized destination name, City, Country' },
    totalDays: { type: Type.INTEGER, description: 'Total number of days' },
    summary: { type: Type.STRING, description: 'Engaging 2-3 sentence overview of this itinerary' },
    bestSeasonAdvice: { type: Type.STRING, description: 'Advice on best time/season for these activities' },
    localCurrency: { type: Type.STRING, description: 'Currency symbol or code (e.g., USD $, EUR €, JPY ¥)' },
    estimatedTotalBudget: { type: Type.STRING, description: 'Estimated budget range per person (excluding flights)' },
    destinationCoordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER, description: 'Latitude of destination center' },
        lng: { type: Type.NUMBER, description: 'Longitude of destination center' },
        zoom: { type: Type.INTEGER, description: 'Recommended map zoom level (e.g. 12 or 13)' },
      },
      required: ['lat', 'lng', 'zoom'],
    },
    days: {
      type: Type.ARRAY,
      description: 'Day-by-day plan',
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER, description: 'Day index starting from 1' },
          theme: { type: Type.STRING, description: 'Theme of the day, e.g. Old Town Charm & Culinary Marvels' },
          dateOrTitle: { type: Type.STRING, description: 'Title e.g. Day 1: Historic Core & Sunset Views' },
          summary: { type: Type.STRING, description: 'Brief summary of the day flow' },
          estimatedDayBudget: { type: Type.STRING, description: 'Approx budget for this day' },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'Unique identifier for the activity' },
                timeSlot: { type: Type.STRING, description: 'Morning, Midday / Lunch, Afternoon, Evening, or Night' },
                timeRange: { type: Type.STRING, description: 'Suggested timing e.g. 09:30 AM - 11:30 AM' },
                title: { type: Type.STRING, description: 'Name of the place, landmark, or specific experience' },
                locationName: { type: Type.STRING, description: 'Specific location or neighborhood name' },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER, description: 'Real geographic latitude coordinate' },
                    lng: { type: Type.NUMBER, description: 'Real geographic longitude coordinate' },
                  },
                  required: ['lat', 'lng'],
                },
                description: { type: Type.STRING, description: 'Vivid description and what to do/see' },
                category: {
                  type: Type.STRING,
                  description: 'Category: sightseeing, food, culture, nature, relaxation, adventure, or shopping',
                },
                estimatedCost: { type: Type.STRING, description: 'Estimated cost per person e.g. Free, $15, €20' },
                duration: { type: Type.STRING, description: 'Approx duration e.g. 2 hours' },
                insiderTip: { type: Type.STRING, description: 'Pro traveler tip to avoid crowds, save money, or get the best view' },
                bookingRequired: { type: Type.BOOLEAN, description: 'Whether tickets or reservation is recommended in advance' },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Relevant tags e.g. ["Scenic", "Historic", "Photo Spot"]',
                },
              },
              required: ['id', 'timeSlot', 'timeRange', 'title', 'locationName', 'coordinates', 'description', 'category', 'estimatedCost', 'duration', 'insiderTip', 'bookingRequired', 'tags'],
            },
          },
        },
        required: ['dayNumber', 'theme', 'dateOrTitle', 'summary', 'estimatedDayBudget', 'activities'],
      },
    },
    practicalInfo: {
      type: Type.OBJECT,
      properties: {
        transportationTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key transit passes, metro etiquette, taxi apps or tips',
        },
        neighborhoodGuide: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              vibe: { type: Type.STRING },
              bestFor: { type: Type.STRING },
            },
            required: ['name', 'vibe', 'bestFor'],
          },
        },
        localEtiquette: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Cultural customs, tipping norms, dress codes',
        },
        recommendedFoods: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dish: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['dish', 'description'],
          },
        },
        packingEssentials: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Custom checklist of items suited to destination climate and activities',
        },
        emergencyNumbers: { type: Type.STRING, description: 'Emergency services number and medical advice' },
      },
      required: ['transportationTips', 'neighborhoodGuide', 'localEtiquette', 'recommendedFoods', 'packingEssentials', 'emergencyNumbers'],
    },
  },
  required: ['tripTitle', 'tagline', 'destination', 'totalDays', 'summary', 'bestSeasonAdvice', 'localCurrency', 'estimatedTotalBudget', 'destinationCoordinates', 'days', 'practicalInfo'],
};

// Alternative Activity Schema
const alternativeActivitySchema = {
  type: Type.OBJECT,
  properties: {
    alternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          locationName: { type: Type.STRING },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
            },
            required: ['lat', 'lng'],
          },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          estimatedCost: { type: Type.STRING },
          duration: { type: Type.STRING },
          insiderTip: { type: Type.STRING },
          bookingRequired: { type: Type.BOOLEAN },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          whyThisIsAGreatAlternative: { type: Type.STRING },
        },
        required: ['id', 'title', 'locationName', 'coordinates', 'description', 'category', 'estimatedCost', 'duration', 'insiderTip', 'bookingRequired', 'tags', 'whyThisIsAGreatAlternative'],
      },
    },
  },
  required: ['alternatives'],
};

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Generate Itinerary Endpoint
app.post('/api/itinerary/generate', async (req, res) => {
  try {
    const {
      destination,
      days = 3,
      interests = [],
      travelStyle = 'Balanced Explorer',
      budget = 'Moderate',
      companion = 'Solo',
      season = 'Any Season',
      specialNotes = '',
    } = req.body;

    if (!destination || typeof destination !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid destination.' });
    }

    const safeDays = Math.min(Math.max(parseInt(days, 10) || 3, 1), 14);

    const prompt = `
Create an extraordinary, realistic, and highly practical ${safeDays}-day travel itinerary for "${destination}".

User Preferences:
- Duration: ${safeDays} full days
- Interests: ${interests.length > 0 ? interests.join(', ') : 'Must-see landmarks, food & culinary culture, scenic viewpoints, hidden local gems'}
- Travel Style / Pace: ${travelStyle}
- Budget Tier: ${budget}
- Travel Companions: ${companion}
- Travel Season / Timing: ${season}
${specialNotes ? `- Special Requests / Dietary / Accessibility Notes: ${specialNotes}` : ''}

Key Guidelines:
1. Ensure the sequence of activities each day is geographically logical (minimize transit crisscrossing, group neighboring spots).
2. For every activity, provide ACCURATE real latitude and longitude coordinates for map pinning in ${destination}.
3. Include realistic time ranges (e.g., Morning 09:00 - 11:30, Lunch 12:00 - 13:30, Afternoon 14:00 - 17:00, Evening 18:30 - 21:00).
4. Provide tangible insider tips (e.g. secret view points, dress codes, best photo lighting, avoiding lines).
5. Specify authentic local food recommendations for lunch or dinner.
6. Provide practical neighborhood guidance, packing essentials tailored to this destination, and transit advice.
    `;

    // If GEMINI_API_KEY is configured, call Gemini 3.8 Flash
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are a world-class travel curator and local destination expert.
You craft realistic, perfectly paced itineraries that balance iconic landmarks with atmospheric local neighborhood secrets.
Always provide precise real coordinates (latitude and longitude) for every attraction and location.
Respond strictly in JSON adhering to the specified responseSchema.`,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: itineraryResponseSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No text received from Gemini API');
      }

      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, data: parsedData });
    }

    // High quality offline fallback generator when GEMINI_API_KEY is not yet attached
    const fallbackData = createFallbackItinerary({
      destination,
      days: safeDays,
      interests,
      travelStyle,
      budget,
      companion,
      season,
    });
    return res.json({ success: true, data: fallbackData });
  } catch (error: any) {
    console.error('Error generating itinerary with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate itinerary. Please try again.',
    });
  }
});

// Swap / Alternatives Endpoint
app.post('/api/itinerary/swap-activity', async (req, res) => {
  try {
    const {
      destination,
      dayTheme,
      timeSlot,
      currentActivity,
      interests = [],
      travelStyle = 'Balanced',
      budget = 'Moderate',
    } = req.body;

    if (!destination || !currentActivity) {
      return res.status(400).json({ error: 'Missing destination or activity information.' });
    }

    const prompt = `
In the context of a trip to ${destination} on a day with the theme "${dayTheme || 'Exploration'}",
the traveler wants an alternative replacement for this ${timeSlot || 'activity'}:
- Current Activity: "${currentActivity.title}" at "${currentActivity.locationName}" (${currentActivity.category || 'activity'})
- Description: ${currentActivity.description || ''}

Interests: ${interests.join(', ') || 'Culture, Food, Sights'}
Style: ${travelStyle}
Budget: ${budget}

Generate 2 distinct, exciting, and geographically compatible alternatives in ${destination} for this time slot.
Provide accurate real latitude and longitude coordinates for each alternative.
`;

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert travel concierge. Propose 2 high quality alternative activities with real coordinates in valid JSON format.',
          responseMimeType: 'application/json',
          responseSchema: alternativeActivitySchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No text returned from Gemini API');
      }

      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, alternatives: parsedData.alternatives || [] });
    }

    // Fallback alternative activities
    const baseCoords = getDestinationCoords(destination);
    const mockAlternatives = [
      {
        id: `alt-1-${Date.now()}`,
        title: `Artisanal Roastery & Local Crafts in ${destination}`,
        locationName: `Old Quarter, ${destination}`,
        coordinates: {
          lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
          lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
        },
        description: `Step away from tourist thoroughfares into an intimate local space dedicated to master roasts, small-batch tea infusions, and handmade regional ceramics.`,
        category: 'relaxation',
        estimatedCost: '$8 / €7',
        duration: '1.5 hours',
        insiderTip: 'Ask the barista for their single-origin brew of the day and sit by the courtyard garden.',
        bookingRequired: false,
        tags: ['Coffee', 'Hidden Gem', 'Local Art'],
        whyThisIsAGreatAlternative: 'A tranquil, atmospheric alternative that gives you time to recharge and savor local craft culture.',
      },
      {
        id: `alt-2-${Date.now()}`,
        title: `Scenic Panorama Viewpoint & Sunset Terrace`,
        locationName: `Hillside Belvedere, ${destination}`,
        coordinates: {
          lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
          lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
        },
        description: `A stunning vantage point overlooking the rooftops, landmarks, and skyline of ${destination}, surrounded by cypress trees and quiet walkways.`,
        category: 'sightseeing',
        estimatedCost: 'Free entry',
        duration: '2 hours',
        insiderTip: 'Bring a light jacket as the evening breeze picks up right as the city lights turn on.',
        bookingRequired: false,
        tags: ['Scenic View', 'Photography', 'Sunset'],
        whyThisIsAGreatAlternative: 'Offers unmatched photography lighting and a panoramic view of the entire city.',
      },
    ];

    return res.json({ success: true, alternatives: mockAlternatives });
  } catch (error: any) {
    console.error('Error generating alternatives:', error);
    return res.status(500).json({
      error: error.message || 'Failed to find alternative activities.',
    });
  }
});

// Destination geographic database helper
function getDestinationCoords(dest: string): { lat: number; lng: number; zoom: number; currency: string } {
  const d = dest.toLowerCase();
  if (d.includes('tokyo')) return { lat: 35.6762, lng: 139.6503, zoom: 12, currency: 'JPY (¥)' };
  if (d.includes('kyoto')) return { lat: 35.0116, lng: 135.7681, zoom: 13, currency: 'JPY (¥)' };
  if (d.includes('paris')) return { lat: 48.8566, lng: 2.3522, zoom: 12, currency: 'EUR (€)' };
  if (d.includes('rome')) return { lat: 41.9028, lng: 12.4964, zoom: 13, currency: 'EUR (€)' };
  if (d.includes('barcelona')) return { lat: 41.3879, lng: 2.1699, zoom: 13, currency: 'EUR (€)' };
  if (d.includes('amalfi') || d.includes('positano')) return { lat: 40.6340, lng: 14.6027, zoom: 12, currency: 'EUR (€)' };
  if (d.includes('london')) return { lat: 51.5074, lng: -0.1278, zoom: 12, currency: 'GBP (£)' };
  if (d.includes('new york') || d.includes('nyc')) return { lat: 40.7128, lng: -74.0060, zoom: 12, currency: 'USD ($)' };
  if (d.includes('reykjavik') || d.includes('iceland')) return { lat: 64.1466, lng: -21.9426, zoom: 11, currency: 'ISK (kr)' };
  if (d.includes('bali')) return { lat: -8.4095, lng: 115.1889, zoom: 11, currency: 'IDR (Rp)' };
  if (d.includes('amsterdam')) return { lat: 52.3676, lng: 4.9041, zoom: 13, currency: 'EUR (€)' };
  if (d.includes('florence')) return { lat: 43.7696, lng: 11.2558, zoom: 14, currency: 'EUR (€)' };
  if (d.includes('singapore')) return { lat: 1.3521, lng: 103.8198, zoom: 12, currency: 'SGD ($)' };
  if (d.includes('sydney')) return { lat: -33.8688, lng: 151.2093, zoom: 12, currency: 'AUD ($)' };
  if (d.includes('bangkok')) return { lat: 13.7563, lng: 100.5018, zoom: 12, currency: 'THB (฿)' };
  return { lat: 48.8566, lng: 2.3522, zoom: 12, currency: 'USD ($)' };
}

function createFallbackItinerary(params: {
  destination: string;
  days: number;
  interests: string[];
  travelStyle: string;
  budget: string;
  companion: string;
  season: string;
}) {
  const { destination, days, interests, travelStyle, budget } = params;
  const coords = getDestinationCoords(destination);

  const dayThemes = [
    { theme: 'Historic Heritage & Old Town Atmosphere', subtitle: 'Iconic Landmarks & Heritage Trails' },
    { theme: 'Culinary Flavors & Artisan Markets', subtitle: 'Sensory Feasts & Neighborhood Walks' },
    { theme: 'Panoramic Views & Nature Escapes', subtitle: 'Scenic Viewpoints & Botanical Gardens' },
    { theme: 'Vibrant Arts & Bohemian Quarters', subtitle: 'Galleries, Boutiques & Sunset Terraces' },
    { theme: 'Hidden Passages & Local Secrets', subtitle: 'Off-the-Beaten-Path Exploration' },
    { theme: 'Waterfront Serenity & Leisure', subtitle: 'Riverside / Coastal Stroll & Farewell Feast' },
    { theme: 'Day Excursion & Cultural Immersion', subtitle: 'Regional Treasures & Village Charms' },
  ];

  const generatedDays = Array.from({ length: days }, (_, dayIdx) => {
    const dayNumber = dayIdx + 1;
    const themeObj = dayThemes[(dayNumber - 1) % dayThemes.length];
    const offsetLat = coords.lat + (dayIdx * 0.008) - 0.01;
    const offsetLng = coords.lng + (dayIdx * 0.006) - 0.01;

    return {
      dayNumber,
      theme: themeObj.theme,
      dateOrTitle: `Day ${dayNumber}: ${themeObj.subtitle}`,
      summary: `A carefully paced day focusing on ${themeObj.theme.toLowerCase()}, tailored for ${travelStyle} travelers seeking rich experiences.`,
      estimatedDayBudget: `$60 - $95 per person`,
      activities: [
        {
          id: `act-${dayNumber}-1`,
          timeSlot: 'Morning',
          timeRange: '09:00 AM - 11:30 AM',
          title: `Historic Heart & Grand Plaza Stroll in ${destination}`,
          locationName: `Historic District, ${destination}`,
          coordinates: { lat: offsetLat + 0.004, lng: offsetLng - 0.003 },
          description: `Begin your morning taking in the architectural splendor of ${destination} before the daytime crowds arrive. Discover centuries-old stonework and sunlit plazas.`,
          category: 'sightseeing',
          estimatedCost: 'Free entry',
          duration: '2.5 hours',
          insiderTip: 'Early morning (before 10:00 AM) provides the softest golden light for photography and virtually empty streets.',
          bookingRequired: false,
          tags: ['Historic', 'Architecture', 'Morning', 'Scenic'],
        },
        {
          id: `act-${dayNumber}-2`,
          timeSlot: 'Midday / Lunch',
          timeRange: '12:00 PM - 01:30 PM',
          title: `Traditional Market Feast & Regional Delicacies`,
          locationName: `Central Food Hall, ${destination}`,
          coordinates: { lat: offsetLat + 0.002, lng: offsetLng + 0.002 },
          description: `Savor authentic regional dishes freshly prepared at bustling food stalls. Experience the aromas, local chatter, and seasonal specialties.`,
          category: 'food',
          estimatedCost: '$16 - $24 per person',
          duration: '1.5 hours',
          insiderTip: 'Look for stalls with lines of local office workers or families—always the true indicator of peak freshness.',
          bookingRequired: false,
          tags: ['Foodie', 'Local Market', 'Authentic'],
        },
        {
          id: `act-${dayNumber}-3`,
          timeSlot: 'Afternoon',
          timeRange: '02:00 PM - 05:00 PM',
          title: `Cultural Immersion & Hidden Courtyards`,
          locationName: `Artisan Quarter, ${destination}`,
          coordinates: { lat: offsetLat - 0.003, lng: offsetLng + 0.005 },
          description: `Wander through shaded backstreets, discovery boutique craft workshops, antique bookshops, and serene hidden cloisters.`,
          category: 'culture',
          estimatedCost: '$12 museum/palace pass',
          duration: '3 hours',
          insiderTip: 'Duck into interior courtyards—many are open to respectful visitors and feature secret fountains and blooming bougainvillea.',
          bookingRequired: false,
          tags: ['Artisan', 'Culture', 'Hidden Gem'],
        },
        {
          id: `act-${dayNumber}-4`,
          timeSlot: 'Evening',
          timeRange: '06:00 PM - 09:30 PM',
          title: `Twilight Belvedere Stroll & Candlelit Dinner`,
          locationName: `Riverside Promenade, ${destination}`,
          coordinates: { lat: offsetLat - 0.005, lng: offsetLng - 0.002 },
          description: `Watch the sunset paint the historic skyline in shades of amber and rose, followed by a relaxed multi-course dinner with local wine and conversation.`,
          category: 'food',
          estimatedCost: '$30 - $50 per person',
          duration: '3.5 hours',
          insiderTip: 'Reserve a table by the window or terrace approximately 30 minutes before official twilight to watch the city illuminate.',
          bookingRequired: true,
          tags: ['Sunset', 'Romantic', 'Dinner', 'Night'],
        },
      ],
    };
  });

  return {
    tripTitle: `${destination} Unveiled: ${days}-Day Curated Journey`,
    tagline: `An unforgettable fusion of landmark wonders, culinary treasures, and secret corners in ${destination}`,
    destination,
    totalDays: days,
    summary: `Designed specifically for ${travelStyle} travelers seeking ${interests.slice(0, 3).join(', ') || 'authentic experiences'}, this day-by-day plan maximizes discovery while keeping transit smooth and logical.`,
    bestSeasonAdvice: 'Spring or early Autumn offers glorious weather, vibrant festivals, and pleasant walking conditions.',
    localCurrency: coords.currency,
    estimatedTotalBudget: `$${days * 85} - $${days * 160} USD per person`,
    destinationCoordinates: {
      lat: coords.lat,
      lng: coords.lng,
      zoom: coords.zoom,
    },
    days: generatedDays,
    practicalInfo: {
      transportationTips: [
        `Download the official local transit app for ${destination} to purchase tap-and-go digital metro and bus tickets.`,
        'Walking is often the fastest and most scenic way to traverse the historic district.',
        'Licensed taxis and ride-hailing apps operate reliably; avoid unmetered street cabs near tourist hubs.',
      ],
      neighborhoodGuide: [
        { name: 'Historic Old Town', vibe: 'Cobblestone lanes, grand cathedrals, cafe squares', bestFor: 'First-time visitors, walking tours, historic architecture' },
        { name: 'Arts & Design District', vibe: 'Contemporary galleries, boutique roasteries, concept stores', bestFor: 'Vintage finds, artisan coffee, evening aperitifs' },
        { name: 'Riverside / Waterfront', vibe: 'Open breezes, illuminated bridges, sunset terraces', bestFor: 'Evening strolls, scenic dining, bike rides' },
      ],
      localEtiquette: [
        'A friendly greeting in the local language when entering small shops is warmly appreciated.',
        'Keep shoulders and knees covered when entering historic churches, cathedrals, or temples.',
        'Check whether service charges are included on dining bills before adding an additional gratuity.',
      ],
      recommendedFoods: [
        { dish: `Signature Regional Tasting Plate`, description: `Fresh local specialties featuring cured delicacies, seasonal produce, and fresh artisan breads.` },
        { dish: `Slow-Simmered Comfort Stew`, description: `Tender meats or root vegetables braised in aromatic broth and herbs for hours.` },
        { dish: `Traditional Fresh Pastry`, description: `Crispy flaky pastry filled with delicate cream, fruit preserves, or dusted sugar.` },
      ],
      packingEssentials: [
        'Extremely comfortable, broken-in walking sneakers for cobblestone streets and long days',
        'Lightweight daypack with secure zippered anti-theft compartments',
        'Universal power adapter with multiple USB ports',
        'Portable power bank to keep your phone charged for navigation and photos',
        'Packable rain shell or compact travel umbrella',
      ],
      emergencyNumbers: 'Emergency Services (Police / Ambulance / Fire): 112 (Europe) / 911 (US) / 110 (Asia)',
    },
  };
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RoamAI server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
