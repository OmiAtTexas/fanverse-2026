import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { MapsService } from '../maps/maps.service';

// ============================================================
// FANVERSE 2026 — AI TRAVEL COMPANION SERVICE
//
// Generates personalized match-day itineraries using:
// - GPT-4 for planning and narrative
// - Google Maps / Places API for real venue data
// - User context (team, city, time constraints, interests)
// ============================================================

export interface ItineraryItem {
  time: string;                 // "13:00"
  durationMins: number;
  type: 'food' | 'attraction' | 'transport' | 'stadium' | 'fan_zone' | 'rest';
  emoji: string;
  name: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  transportToNext?: TransportLeg;
}

export interface TransportLeg {
  mode: 'walk' | 'uber' | 'subway' | 'bus';
  durationMins: number;
  instruction: string;
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  items: ItineraryItem[];
  totalDistance: string;
  tips: string[];
  weatherNote?: string;
}

export interface TravelQueryContext {
  userId: string;
  citySlug: string;
  query: string;                // Natural language query
  matchId?: string;
  hoursBeforeMatch?: number;
  userInterests?: string[];
  languages?: string[];
  currentTime?: string;
}

@Injectable()
export class TravelService {
  private readonly logger = new Logger(TravelService.name);
  private openai: OpenAI;

  // City information database (supplement to Maps API)
  private readonly CITY_CONTEXT: Record<string, string> = {
    dallas: `Dallas, Texas, USA. AT&T Stadium in Arlington (nearby). Key areas: Deep Ellum (music/food), Uptown (restaurants/bars), Arts District, Dallas Arboretum. Transport: DART light rail, Uber reliable. Timezone: CDT (UTC-5). Tips: June-July is HOT (95°F+), stay hydrated. BBQ culture is strong - Pecan Lodge and Cattleack are must-visits.`,
    los_angeles: `Los Angeles, California, USA. SoFi Stadium in Inglewood. Key areas: Santa Monica, Venice Beach, Hollywood, Downtown LA, Koreatown. Transport: Metro, but Uber preferred for fans. Famous for food diversity - Mexican, Korean, Japanese. Beach weather perfect for World Cup. Take the Metro Expo Line to get around.`,
    new_york: `New York City, USA. MetLife Stadium in East Rutherford, NJ. Key areas: Manhattan (Times Square, Central Park), Brooklyn, Queens (diverse food). Transport: NYC Subway + NJ Transit to stadium. Extremely walkable city. Incredible global food scene. Hot and humid in summer.`,
    miami: `Miami, Florida, USA. Hard Rock Stadium. Key areas: South Beach, Wynwood (art/food), Brickell (nightlife), Little Havana. Transport: Uber, Metrorail. Vibrant Latin culture, amazing Cuban/Colombian food. Beach weather. Humid and hot - plan for afternoon thunderstorms.`,
    toronto: `Toronto, Ontario, Canada. BMO Field + TBD. Key areas: Downtown, Kensington Market, Distillery District, CN Tower. Transport: TTC subway, very walkable. Extremely multicultural food scene. Summer weather is perfect. Use Presto card for transit.`,
    vancouver: `Vancouver, British Columbia, Canada. BC Place Stadium. Key areas: Gastown, Granville Island, Stanley Park, Commercial Drive. Transport: SkyTrain. Stunning mountain + ocean backdrop. Pacific Rim food culture (Japanese, Korean, Chinese). Perfect summer weather.`,
    mexico_city: `Mexico City, Mexico. Estadio Azteca (iconic!). Key areas: Polanco (upscale), Roma Norte (trendy), Zócalo (historic), Xochimilco. Transport: Metro is excellent and cheap. Altitude at 7,350 ft - acclimatize! Rich indigenous and Spanish culture. Incredible street food - tacos al pastor, tlayudas.`,
    guadalajara: `Guadalajara, Jalisco, Mexico. Estadio Akron. Birthplace of tequila and mariachi. Key areas: Tlaquepaque (artisan shops), Historic Center, Zapopan. Transport: Tren Ligero, Uber. Great tortas ahogadas (local specialty). Friendly locals, strong football culture.`,
  };

  constructor(
    private prisma: PrismaService,
    private maps: MapsService,
    private config: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  // ============================================================
  // MAIN: Generate personalized itinerary
  // ============================================================

  async generateItinerary(context: TravelQueryContext): Promise<GeneratedItinerary> {
    // 1. Load match details if provided
    let matchContext = '';
    if (context.matchId) {
      const match = await this.prisma.worldCupMatch.findUnique({
        where: { id: context.matchId },
      });
      if (match) {
        matchContext = `
Match: ${match.homeTeam} vs ${match.awayTeam}
Stadium: ${match.stadium}, ${match.city}
Kickoff: ${match.kickoffAt.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago' })}
Hours before kickoff: ${context.hoursBeforeMatch ?? 'unknown'}`;
      }
    }

    // 2. Get real Places data from Google Maps
    const places = await this.maps.getNearbyAttractions(context.citySlug, context.userInterests ?? []);

    // 3. Build the LLM prompt
    const systemPrompt = `You are FanVerse, an expert AI travel guide for FIFA World Cup 2026 fans. 
You have deep knowledge of all 16 host cities across USA, Canada, and Mexico.
You create practical, exciting, and specific match-day itineraries for international football fans.

Your itineraries should:
- Be realistic about timing and travel
- Include specific, real venues (not generic suggestions)  
- Consider the fan's interests and team
- Account for match-day safety and stadium logistics
- Include local food and cultural experiences
- Always get fans to the stadium 60-90 minutes before kickoff

Always respond with valid JSON matching the exact structure provided.`;

    const userPrompt = `Create a match-day itinerary for this fan:

Query: "${context.query}"
City: ${context.citySlug.replace('_', ' ')} 
${matchContext}
Fan interests: ${(context.userInterests ?? []).join(', ') || 'general'}
Current time context: ${context.currentTime ?? 'morning'}

City context: ${this.CITY_CONTEXT[context.citySlug] ?? 'Major World Cup host city'}

Available nearby places: ${JSON.stringify(places.slice(0, 15))}

Return a JSON itinerary with this exact structure:
{
  "title": "string (exciting title for the day)",
  "summary": "string (2-3 sentences, warm and enthusiastic)",
  "items": [
    {
      "time": "HH:MM",
      "durationMins": number,
      "type": "food|attraction|transport|stadium|fan_zone|rest",
      "emoji": "single emoji",
      "name": "place name",
      "description": "2 sentences max, specific details",
      "address": "street address if known",
      "transportToNext": {
        "mode": "walk|uber|subway|bus",
        "durationMins": number,
        "instruction": "brief instruction"
      }
    }
  ],
  "totalDistance": "X km / Y miles",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "weatherNote": "optional weather advice"
}

Create 5-8 items. Make it feel like advice from a friend who knows the city perfectly.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) throw new Error('No response from AI');

    const itinerary = JSON.parse(rawResponse) as GeneratedItinerary;

    // 4. Enrich items with real coordinates from Maps API
    const enriched = await this.enrichItineraryWithCoordinates(itinerary, context.citySlug);

    // 5. Save to DB for offline caching
    await this.prisma.itinerary.create({
      data: {
        userId: context.userId,
        title: enriched.title,
        citySlug: context.citySlug,
        date: new Date(),
        prompt: context.query,
        items: enriched.items as any,
        matchId: context.matchId,
        hoursBeforeMatch: context.hoursBeforeMatch,
      },
    });

    return enriched;
  }

  // ============================================================
  // CONVERSATIONAL TRAVEL ASSISTANT
  // ============================================================

  async chat(
    userId: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    citySlug: string,
  ): Promise<string> {
    const cityContext = this.CITY_CONTEXT[citySlug] ?? '';

    const systemMessage = `You are FanVerse AI, a friendly and knowledgeable travel companion for FIFA World Cup 2026 fans in ${citySlug.replace('_', ' ')}.

City context: ${cityContext}

You help fans with:
- Restaurant and food recommendations
- Local attractions and experiences  
- Transport directions (Uber, subway, walking)
- Stadium logistics and tips
- Meeting other fans and groups
- Safety advice
- Translation help
- Cultural tips

Be concise, warm, and specific. Use emojis naturally. Always prioritize safety. If asked about other fans or groups, mention that FanVerse can help connect them. Keep responses under 150 words.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content ?? 'Sorry, I had trouble with that. Try asking me again!';
  }

  // ============================================================
  // JOURNEY STORY GENERATOR (for Passport feature)
  // ============================================================

  async generateJourneyStory(userId: string): Promise<string> {
    const passport = await this.prisma.passport.findUnique({
      where: { userId },
      include: {
        stamps: true,
        user: { include: { tickets: { include: { match: true } } } },
      },
    });

    if (!passport) throw new Error('Passport not found');

    const { user, stamps } = passport;

    const matchDescriptions = user.tickets.map(t =>
      `${t.match.homeTeam} vs ${t.match.awayTeam} in ${t.match.city}`
    );

    const citiesVisited = [...new Set(stamps
      .filter(s => s.type === 'CITY_VISIT' && s.citySlug)
      .map(s => s.citySlug!))];

    const prompt = `Write a beautiful, personal 3-4 paragraph journey story for a World Cup fan.

Fan details:
- Name: ${user.displayName}
- From: ${user.nationality}
- Supporting: ${user.supportedTeam}
- Matches attended: ${matchDescriptions.join(', ')}
- Cities visited: ${citiesVisited.join(', ')}
- Fans met: ${passport.fansMetCount}
- Stamps earned: ${stamps.length}

Write in second person ("You arrived in Dallas..."). Make it emotional, vivid, and celebratory. 
Include specific details about the cities and matches. Reference the cultural moments and connections made.
This is their permanent World Cup memory — make it unforgettable. Max 400 words.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.9,
    });

    const story = completion.choices[0]?.message?.content ?? '';

    // Save story to passport
    await this.prisma.passport.update({
      where: { userId },
      data: {
        journeyStory: story,
        storyGeneratedAt: new Date(),
      },
    });

    return story;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async enrichItineraryWithCoordinates(
    itinerary: GeneratedItinerary,
    citySlug: string,
  ): Promise<GeneratedItinerary> {
    const enrichedItems = await Promise.all(
      itinerary.items.map(async (item) => {
        try {
          if (item.address) {
            const coords = await this.maps.geocodeAddress(`${item.name}, ${item.address}`);
            if (coords) {
              item.latitude = coords.lat;
              item.longitude = coords.lng;
              item.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
            }
          }
        } catch {
          // Coords optional — don't fail the whole itinerary
        }
        return item;
      }),
    );

    return { ...itinerary, items: enrichedItems };
  }
}
