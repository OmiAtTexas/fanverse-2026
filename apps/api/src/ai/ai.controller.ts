import { Controller, Post, Body } from '@nestjs/common';

@Controller('ai')
export class AiController {
  private matchCache: string = '';
  private cacheTime: number = 0;

  private async getAllMatches() {
    if (this.matchCache && Date.now() - this.cacheTime < 3600000) return this.matchCache;
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=200&dates=20260611-20260720');
      const data: any = await res.json();
      const events = data.events || [];
      if (events.length > 0) {
        this.matchCache = events.map((e: any) => {
          const comp = e.competitions[0];
          const home = comp.competitors.find((c: any) => c.homeAway === 'home');
          const away = comp.competitors.find((c: any) => c.homeAway === 'away');
          const date = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `${date}: ${home?.team?.displayName} vs ${away?.team?.displayName} at ${comp.venue?.fullName}, ${comp.venue?.address?.city}`;
        }).join('\n');
        this.cacheTime = Date.now();
        return this.matchCache;
      }

      // Fallback to football-data.org
      const res2 = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': '296b6235a5444d12bea5839c814c4b48' }
      });
      const data2: any = await res2.json();
      this.matchCache = (data2.matches || []).map((m: any) =>
        `${new Date(m.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.stage.replace(/_/g, ' ')})`
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
              content: `You are a FIFA World Cup 2026 fan companion. Give SHORT answers - max 3-4 sentences. Use emojis. Be direct and specific.

COMPLETE MATCH SCHEDULE WITH VENUES:
${matches}

Use ONLY the above data when answering match questions. Always mention team names and dates.`
            },
            { role: 'user', content: body.message }
          ],
          max_tokens: 250,
        }),
      });
      const data = await res.json();
      return { reply: data.choices?.[0]?.message?.content || 'Sorry, try again!' };
    } catch (e) {
      return { reply: 'Sorry, try again!' };
    }
  }
}
