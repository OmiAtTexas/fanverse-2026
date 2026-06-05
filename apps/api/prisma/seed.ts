import { PrismaClient, MatchStage } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// FANVERSE 2026 — DATABASE SEED
// Populates: host cities, all World Cup matches, demo users
// ============================================================

const HOST_CITIES = [
  {
    slug: 'new_york',
    name: 'New York / New Jersey',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.0060,
    description: 'The city that never sleeps hosts some of the biggest World Cup matches at MetLife Stadium.',
    stadiumName: 'MetLife Stadium',
    stadiumCapacity: 82500,
    airportCode: 'JFK',
    tips: {
      transport: 'Take NJ Transit train from Penn Station to MetLife. Avoid driving on match days.',
      safety: 'NYC is very safe for tourists. Keep valuables secure in crowded areas.',
      weather: 'June-July hot and humid. Thunderstorms possible. Bring umbrella.',
      currency: 'USD. Cards accepted everywhere. ATMs widely available.',
    },
  },
  {
    slug: 'los_angeles',
    name: 'Los Angeles',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/Los_Angeles',
    latitude: 34.0522,
    longitude: -118.2437,
    description: 'Hollywood meets football at SoFi Stadium in the entertainment capital of the world.',
    stadiumName: 'SoFi Stadium',
    stadiumCapacity: 70240,
    airportCode: 'LAX',
    tips: {
      transport: 'Metro to Inglewood for SoFi Stadium. Uber/Lyft recommended. Avoid driving.',
      safety: 'Research your neighborhood. Venice Beach and Santa Monica are very safe for tourists.',
      weather: 'Perfect Southern California weather. 75-85°F, minimal rain.',
      currency: 'USD. Tipping expected: 18-22% at restaurants.',
    },
  },
  {
    slug: 'dallas',
    name: 'Dallas',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/Chicago',
    latitude: 32.7767,
    longitude: -96.7970,
    description: 'Big match energy in the Lone Star State. AT&T Stadium is one of the most spectacular venues on Earth.',
    stadiumName: 'AT&T Stadium',
    stadiumCapacity: 80000,
    airportCode: 'DFW',
    tips: {
      transport: 'DART light rail from downtown Dallas. Uber reliable and cheap in Texas.',
      safety: 'Dallas is fan-friendly. Deep Ellum and Uptown are safe entertainment districts.',
      weather: 'HOT. June-July averages 95-100°F. Stay hydrated! Evening matches are cooler.',
      currency: 'USD. Texas has no state income tax — prices slightly lower than other cities.',
    },
  },
  {
    slug: 'miami',
    name: 'Miami',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/New_York',
    latitude: 25.7617,
    longitude: -80.1918,
    description: 'Latin vibes, beautiful beaches, and world-class football at Hard Rock Stadium.',
    stadiumName: 'Hard Rock Stadium',
    stadiumCapacity: 64767,
    airportCode: 'MIA',
    tips: {
      transport: 'Metrorail + bus to Hard Rock Stadium. Uber common. South Beach 25 min from stadium.',
      safety: 'South Beach and Brickell very safe. Avoid walking alone late night in less touristy areas.',
      weather: 'Tropical — hot and humid. Brief afternoon thunderstorms common. 85-90°F.',
      currency: 'USD. Miami is pricey. Budget $80-150/day for food and transport.',
    },
  },
  {
    slug: 'chicago',
    name: 'Chicago',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/Chicago',
    latitude: 41.8781,
    longitude: -87.6298,
    description: 'The Windy City hosts Group Stage and Knockout matches at Soldier Field on Lake Michigan.',
    stadiumName: 'Soldier Field',
    stadiumCapacity: 61500,
    airportCode: 'ORD',
    tips: {
      transport: 'CTA Red Line to Roosevelt. Chicago has excellent public transit. Easy to navigate.',
      safety: 'Tourist areas (Magnificent Mile, Navy Pier, Grant Park) are very safe.',
      weather: 'Mild June-July (75-82°F). Wind off the lake. Layers recommended for evenings.',
      currency: 'USD. Deep dish pizza mandatory experience.',
    },
  },
  {
    slug: 'seattle',
    name: 'Seattle',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/Los_Angeles',
    latitude: 47.6062,
    longitude: -122.3321,
    description: 'The Pacific Northwest brings its natural beauty to Lumen Field, home of some stunning Group Stage clashes.',
    stadiumName: 'Lumen Field',
    stadiumCapacity: 69000,
    airportCode: 'SEA',
    tips: {
      transport: 'Link Light Rail to Stadium station — literally steps from Lumen Field.',
      safety: 'Excellent. Pike Place Market, Capitol Hill, and downtown very safe.',
      weather: 'Rare rain in July. Perfect 70-78°F weather. Mountains visible on clear days.',
      currency: 'USD. No state income tax. Coffee culture — Starbucks was born here.',
    },
  },
  {
    slug: 'san_francisco',
    name: 'San Francisco Bay Area',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/Los_Angeles',
    latitude: 37.7749,
    longitude: -122.4194,
    description: 'Tech capital meets football passion at Levi\'s Stadium in Silicon Valley.',
    stadiumName: "Levi's Stadium",
    stadiumCapacity: 68500,
    airportCode: 'SFO',
    tips: {
      transport: 'VTA light rail to Levi\'s Stadium. BART is the best way around SF itself.',
      safety: 'Stick to tourist areas: Union Square, Fisherman\'s Wharf, Mission District.',
      weather: 'Coolest host city! 60-70°F with fog. Always bring a light jacket.',
      currency: 'USD. Most expensive city — budget $150-250/day.',
    },
  },
  {
    slug: 'boston',
    name: 'Boston',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/New_York',
    latitude: 42.3601,
    longitude: -71.0589,
    description: 'America\'s most European city — colonial history meets world football at Gillette Stadium.',
    stadiumName: 'Gillette Stadium',
    stadiumCapacity: 65878,
    airportCode: 'BOS',
    tips: {
      transport: 'Commuter rail from South Station to Foxborough for Gillette. T subway within Boston.',
      safety: 'Very safe city. Beacon Hill, Back Bay, and Cambridge excellent tourist areas.',
      weather: '70-78°F in summer. Occasional afternoon thunderstorms.',
      currency: 'USD. Seafood is mandatory — clam chowder and lobster rolls.',
    },
  },
  {
    slug: 'philadelphia',
    name: 'Philadelphia',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/New_York',
    latitude: 39.9526,
    longitude: -75.1652,
    description: 'City of Brotherly Love hosts Group Stage matches at Lincoln Financial Field.',
    stadiumName: 'Lincoln Financial Field',
    stadiumCapacity: 69379,
    airportCode: 'PHL',
    tips: {
      transport: 'SEPTA Broad Street Line to NRG Station for Linc. Easy subway system.',
      safety: 'Center City and Old City are very safe. Historic district is walkable.',
      weather: '80-88°F in July. Humid. Historic areas give excellent shade.',
      currency: 'USD. Famous for cheesesteaks — a must.',
    },
  },
  {
    slug: 'atlanta',
    name: 'Atlanta',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/New_York',
    latitude: 33.7490,
    longitude: -84.3880,
    description: 'New World Cup host site — Atlanta is hosting its first major FIFA tournament at Mercedes-Benz Stadium.',
    stadiumName: 'Mercedes-Benz Stadium',
    stadiumCapacity: 71000,
    airportCode: 'ATL',
    tips: {
      transport: 'MARTA train to Vine City/GWCC station — Mercedes-Benz is connected to the station.',
      safety: 'Midtown, Buckhead, and downtown areas around stadium are safe.',
      weather: 'HOT. 88-94°F and humid. Air conditioning everywhere is your friend.',
      currency: 'USD. Atlanta has great food — try Busy Bee Cafe for Southern soul food.',
    },
  },
  {
    slug: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Toronto',
    latitude: 43.6532,
    longitude: -79.3832,
    description: 'Canada\'s largest city puts on a global show at BMO Field on Lake Ontario.',
    stadiumName: 'BMO Field',
    stadiumCapacity: 30991,
    airportCode: 'YYZ',
    tips: {
      transport: 'TTC subway + 509 streetcar to Exhibition station. Excellent public transit.',
      safety: 'One of the safest major cities. CN Tower area, Harbourfront, Kensington Market all great.',
      weather: '22-28°C (72-82°F). Warm and pleasant. Possible afternoon storms.',
      currency: 'CAD. 1 USD ≈ 1.35 CAD. Tipping similar to US (15-20%).',
    },
  },
  {
    slug: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Vancouver',
    latitude: 49.2827,
    longitude: -123.1207,
    description: 'Mountains, ocean, and football. BC Place offers the most scenic World Cup backdrop.',
    stadiumName: 'BC Place',
    stadiumCapacity: 54500,
    airportCode: 'YVR',
    tips: {
      transport: 'SkyTrain to Stadium-Chinatown station. Best transit in Canada.',
      safety: 'Extremely safe. Gastown, Granville Island, and downtown Vancouver all excellent.',
      weather: 'Perfect. 18-24°C (65-75°F). Low humidity. Mountains visible on clear days.',
      currency: 'CAD. Vancouver is expensive — budget CAD 200-300/day.',
    },
  },
  {
    slug: 'guadalajara',
    name: 'Guadalajara',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Mexico_City',
    latitude: 20.6597,
    longitude: -103.3496,
    description: 'Birthplace of tequila and mariachi. Estadio Akron brings Mexican passion to the World Cup.',
    stadiumName: 'Estadio Akron',
    stadiumCapacity: 49850,
    airportCode: 'GDL',
    tips: {
      transport: 'Tren Ligero (light rail) is excellent. Uber widely available and cheap.',
      safety: 'Tourist areas (Tlaquepaque, Historic Center, Zapopan) are very safe.',
      weather: '20-26°C (68-79°F). Rainy season June-Sept with afternoon showers.',
      currency: 'MXN. 1 USD ≈ 17 MXN. Cash is king — always carry pesos.',
    },
  },
  {
    slug: 'mexico_city',
    name: 'Mexico City',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Mexico_City',
    latitude: 19.4326,
    longitude: -99.1332,
    description: 'The iconic Azteca — the only stadium to host two World Cup Finals — roars again in 2026.',
    stadiumName: 'Estadio Azteca',
    stadiumCapacity: 87523,
    airportCode: 'MEX',
    tips: {
      transport: 'Metro Line 2 to Taxqueña, then bus to Azteca. Metro is cheap at 5 pesos.',
      safety: 'Polanco, Roma Norte, Condesa, and Coyoacán are very safe. Avoid empty streets at night.',
      weather: '15-22°C (59-72°F) due to altitude (7,350 ft). Acclimatize first day.',
      currency: 'MXN. Rich food culture — street tacos are the best meals you\'ll have.',
    },
  },
  {
    slug: 'monterrey',
    name: 'Monterrey',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Monterrey',
    latitude: 25.6866,
    longitude: -100.3161,
    description: 'Mexico\'s industrial capital surprises fans with mountain scenery and incredible carne asada culture.',
    stadiumName: 'Estadio BBVA',
    stadiumCapacity: 53500,
    airportCode: 'MTY',
    tips: {
      transport: 'Metrorrey (subway) + Uber. Stadium is in Guadalupe, 15 min from downtown.',
      safety: 'San Pedro Garza García and Barrio Antiguo are safe tourist areas.',
      weather: 'HOT. 32-38°C (90-100°F). Very dry heat with mountains as backdrop.',
      currency: 'MXN. Carne asada and cabrito (goat) are local specialties.',
    },
  },
  {
    slug: 'kansas_city',
    name: 'Kansas City',
    country: 'USA',
    countryCode: 'US',
    timezone: 'America/Chicago',
    latitude: 39.0997,
    longitude: -94.5786,
    description: 'BBQ capital of America. Arrowhead Stadium hosts some of the most passionate crowds of the tournament.',
    stadiumName: 'Arrowhead Stadium',
    stadiumCapacity: 76416,
    airportCode: 'MCI',
    tips: {
      transport: 'KC Streetcar in downtown. Uber recommended to Arrowhead (no direct transit).',
      safety: 'Power & Light District and Plaza are very fan-friendly.',
      weather: '82-90°F in July. Occasional thunderstorms — check forecast on match day.',
      currency: 'USD. Kansas City BBQ is a world art — do not skip it.',
    },
  },
];

async function main() {
  console.log('🌍 Seeding FanVerse 2026 database...');

  // ---- Seed Host Cities ----
  console.log('📍 Creating host cities...');
  for (const city of HOST_CITIES) {
    await prisma.hostCity.upsert({
      where: { slug: city.slug },
      update: city,
      create: city,
    });
  }
  console.log(`✅ Created ${HOST_CITIES.length} host cities`);

  // ---- Seed World Cup Matches (Group Stage sample) ----
  console.log('⚽ Creating World Cup matches...');
  
  const sampleMatches = [
    {
      externalId: 'fifa-2026-001',
      homeTeam: 'Mexico',
      awayTeam: 'USA',
      homeTeamCode: 'MEX',
      awayTeamCode: 'USA',
      stadium: 'Estadio Azteca',
      city: 'Mexico City',
      citySlug: 'mexico_city',
      country: 'MEX',
      stage: MatchStage.GROUP,
      kickoffAt: new Date('2026-06-11T18:00:00-06:00'),
    },
    {
      externalId: 'fifa-2026-002',
      homeTeam: 'Brazil',
      awayTeam: 'Germany',
      homeTeamCode: 'BRA',
      awayTeamCode: 'GER',
      stadium: 'AT&T Stadium',
      city: 'Dallas',
      citySlug: 'dallas',
      country: 'USA',
      stage: MatchStage.GROUP,
      kickoffAt: new Date('2026-06-15T19:00:00-05:00'),
    },
    {
      externalId: 'fifa-2026-003',
      homeTeam: 'Argentina',
      awayTeam: 'France',
      homeTeamCode: 'ARG',
      awayTeamCode: 'FRA',
      stadium: 'SoFi Stadium',
      city: 'Los Angeles',
      citySlug: 'los_angeles',
      country: 'USA',
      stage: MatchStage.GROUP,
      kickoffAt: new Date('2026-06-18T19:30:00-07:00'),
    },
    {
      externalId: 'fifa-2026-004',
      homeTeam: 'Japan',
      awayTeam: 'Spain',
      homeTeamCode: 'JPN',
      awayTeamCode: 'ESP',
      stadium: 'BC Place',
      city: 'Vancouver',
      citySlug: 'vancouver',
      country: 'CAN',
      stage: MatchStage.GROUP,
      kickoffAt: new Date('2026-06-20T16:00:00-07:00'),
    },
    {
      externalId: 'fifa-2026-100',
      homeTeam: 'TBD',
      awayTeam: 'TBD',
      homeTeamCode: 'TBD',
      awayTeamCode: 'TBD',
      stadium: 'MetLife Stadium',
      city: 'New York',
      citySlug: 'new_york',
      country: 'USA',
      stage: MatchStage.FINAL,
      kickoffAt: new Date('2026-07-19T18:00:00-04:00'),
    },
  ];

  for (const match of sampleMatches) {
    await prisma.worldCupMatch.upsert({
      where: { externalId: match.externalId },
      update: match,
      create: match,
    });
  }
  console.log(`✅ Created ${sampleMatches.length} sample matches`);

  // ---- Seed Sample Groups ----
  console.log('👥 Creating fan groups...');
  
  // First create a seed admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fanverse.app' },
    update: {},
    create: {
      clerkId: 'seed_admin_001',
      email: 'admin@fanverse.app',
      username: 'fanverse_admin',
      displayName: 'FanVerse Team',
      role: 'ADMIN',
      trustLevel: 'VERIFIED',
      isVerified: true,
      nationality: 'US',
      hostCities: ['dallas', 'new_york', 'los_angeles'],
      languages: ['EN'],
      interests: [],
    },
  });

  const seedGroups = [
    {
      name: '🇧🇷 Brazil Fans Dallas',
      description: 'Official Brazil supporters group for all Dallas matches. BBQ, samba, and pure futebol love! Todos juntos! 🟡🟢',
      slug: 'brazil-fans-dallas',
      emoji: '🇧🇷',
      citySlug: 'dallas',
      teamCode: 'BRA',
      tags: ['brazil', 'dallas', 'samba'],
      isVerified: true,
    },
    {
      name: '🇦🇷 La Scaloneta — Los Angeles',
      description: '¡Vamos Argentina! Watch parties, banderazos, and the best milanesas en NA. ¡Arriba la Albiceleste!',
      slug: 'argentina-fans-la',
      emoji: '🇦🇷',
      citySlug: 'los_angeles',
      teamCode: 'ARG',
      tags: ['argentina', 'la', 'milei'],
    },
    {
      name: '🇯🇵 Japan Supporters Vancouver',
      description: 'Samurai Blue fans in Canada! Pre-match ramen meetups, stadium marches, and clean stands guaranteed.',
      slug: 'japan-fans-vancouver',
      emoji: '🇯🇵',
      citySlug: 'vancouver',
      teamCode: 'JPN',
      tags: ['japan', 'vancouver', 'ramen'],
    },
    {
      name: '🌮 Dallas Food & Football',
      description: 'Best food spots before every match — BBQ trails, taco tours, and fan meetups. All nationalities welcome!',
      slug: 'dallas-food-football',
      emoji: '🌮',
      citySlug: 'dallas',
      tags: ['food', 'dallas', 'meetup'],
    },
    {
      name: '📸 World Cup Photography 2026',
      description: 'Photographers and visual storytellers documenting the WC2026 across all host cities. Share your shots!',
      slug: 'wc2026-photography',
      emoji: '📸',
      tags: ['photography', 'art', 'global'],
    },
    {
      name: '🇫🇷 Allez les Bleus — New York',
      description: 'French supporters in New York! Croissants, baguettes, and champagne if we win! Allez allez allez!',
      slug: 'france-fans-nyc',
      emoji: '🇫🇷',
      citySlug: 'new_york',
      teamCode: 'FRA',
      tags: ['france', 'new_york', 'allez'],
    },
  ];

  for (const group of seedGroups) {
    const created = await prisma.group.upsert({
      where: { slug: group.slug },
      update: {},
      create: {
        ...group,
        ownerId: adminUser.id,
      },
    });

    // Create conversation for each group
    await prisma.conversation.upsert({
      where: { groupId: created.id },
      update: {},
      create: {
        type: 'group',
        groupId: created.id,
      },
    });
  }
  
  console.log(`✅ Created ${seedGroups.length} fan groups`);
  console.log('\n🏆 FanVerse 2026 database seeded successfully!');
  console.log('   Ready for World Cup 2026 🌍⚽');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
