import { Controller, Post, Body } from '@nestjs/common';

@Controller('ai')
export class AiController {

  private matchCache: string = '';
  private cacheTime: number = 0;

  private async getAllMatches() {
    if (this.matchCache && Date.now() - this.cacheTime < 3600000) return this.matchCache;
    try {
      const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': '296b6235a5444d12bea5839c814c4b48' }
      });
      const data: any = await res.json();
      const matches = data.matches || [];
      this.matchCache = matches.map((m: any) => 
        `${new Date(m.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.stage.replace(/_/g,' ')}) - ${m.group || ''}`
      ).join('\n');
      this.cacheTime = Date.now();
      return this.matchCache;
    } catch {
      return '';
    }
  }

  @Post('chat')
  async chat(@Body() body: { message: string }) {
    try {
      const matches = await this.getAllMatches();
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a FIFA World Cup 2026 fan companion. Give SHORT answers - max 3-4 sentences. Use emojis. Be direct and specific. Only answer based on the real data below.

FULL MATCH SCHEDULE:
${matches}

HOST CITIES & STADIUMS:
- Dallas: AT&T Stadium (5 group matches, Round of 32 x2, Round of 16, Semi-Final)
- New York: MetLife Stadium (5 group matches, Round of 32, Quarter-Final, FINAL)
- Los Angeles: SoFi Stadium (5 group matches, Round of 32, Quarter-Final)
- Miami: Hard Rock Stadium (4 group matches, Round of 32, Round of 16)
- Houston: NRG Stadium (4 group matches, Round of 32, Round of 16)
- Atlanta: Mercedes-Benz Stadium (4 group matches, Round of 32)
- Boston: Gillette Stadium (4 group matches, Round of 32)
- Philadelphia: Lincoln Financial Field (4 group matches, Round of 32)
- Kansas City: Arrowhead Stadium (4 group matches, Round of 32)
- Seattle: Lumen Field (4 group matches, Round of 32)
- San Francisco: Levi's Stadium (4 group matches, Round of 32)
- Mexico City: Estadio Azteca (3 group matches, Round of 32)
- Guadalajara: Estadio Akron (3 group matches)
- Monterrey: Estadio BBVA (3 group matches)
- Toronto: BMO Field (4 group matches, Round of 32)
- Vancouver: BC Place (3 group matches, Round of 32, Semi-Final)

NEVER make up match information. Use only the data above.`
            },
            { role: 'user', content: body.message }
          ],
          max_tokens: 200,
        }),
      });
      const data = await res.json();
      return { reply: data.choices?.[0]?.message?.content || 'Sorry, try again!' };
    } catch (e) {
      return { reply: 'Sorry, try again!' };
    }
  }
}
