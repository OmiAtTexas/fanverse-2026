import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const venues: Record<number, { stadium: string; city: string; citySlug: string; country: string }> = {
  537327: { stadium: 'Estadio Azteca', city: 'Mexico City', citySlug: 'mexico_city', country: 'MEX' },
  537328: { stadium: 'Estadio Akron', city: 'Guadalajara', citySlug: 'guadalajara', country: 'MEX' },
  537329: { stadium: 'BMO Field', city: 'Toronto', citySlug: 'toronto', country: 'CAN' },
  537330: { stadium: 'SoFi Stadium', city: 'Los Angeles', citySlug: 'los_angeles', country: 'USA' },
};

async function main() {
  const matches = await prisma.worldCupMatch.findMany();
  console.log(`Found ${matches.length} matches to update`);
  
  // Group stage venues by city based on match order
  const cityAssignments = [
    'mexico_city', 'guadalajara', 'toronto', 'los_angeles', 'san_francisco',
    'seattle', 'dallas', 'houston', 'kansas_city', 'atlanta', 'miami',
    'philadelphia', 'boston', 'new_york', 'monterrey', 'vancouver'
  ];
  
  const stadiums: Record<string, string> = {
    'mexico_city': 'Estadio Azteca', 'guadalajara': 'Estadio Akron',
    'toronto': 'BMO Field', 'los_angeles': 'SoFi Stadium',
    'san_francisco': "Levi's Stadium", 'seattle': 'Lumen Field',
    'dallas': 'AT&T Stadium', 'houston': 'NRG Stadium',
    'kansas_city': 'Arrowhead Stadium', 'atlanta': 'Mercedes-Benz Stadium',
    'miami': 'Hard Rock Stadium', 'philadelphia': 'Lincoln Financial Field',
    'boston': 'Gillette Stadium', 'new_york': 'MetLife Stadium',
    'monterrey': 'Estadio BBVA', 'vancouver': 'BC Place',
  };

  const cityNames: Record<string, string> = {
    'mexico_city': 'Mexico City', 'guadalajara': 'Guadalajara',
    'toronto': 'Toronto', 'los_angeles': 'Los Angeles',
    'san_francisco': 'San Francisco', 'seattle': 'Seattle',
    'dallas': 'Dallas', 'houston': 'Houston',
    'kansas_city': 'Kansas City', 'atlanta': 'Atlanta',
    'miami': 'Miami', 'philadelphia': 'Philadelphia',
    'boston': 'Boston', 'new_york': 'New York',
    'monterrey': 'Monterrey', 'vancouver': 'Vancouver',
  };

  for (let i = 0; i < matches.length; i++) {
    const citySlug = cityAssignments[i % cityAssignments.length];
    await prisma.worldCupMatch.update({
      where: { id: matches[i].id },
      data: {
        citySlug,
        city: cityNames[citySlug],
        stadium: stadiums[citySlug],
        country: ['mexico_city','guadalajara','monterrey'].includes(citySlug) ? 'MEX' : ['toronto','vancouver'].includes(citySlug) ? 'CAN' : 'USA',
      },
    });
  }
  console.log('✅ Venues updated!');
  await prisma.$disconnect();
}
main().catch(console.error);
