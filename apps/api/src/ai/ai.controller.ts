import { Controller, Post, Body } from '@nestjs/common';

@Controller('ai')
export class AiController {
  
  private async getLiveMatches() {
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
      const data = await res.json();
      const events = data.events || [];
      return events.map((e: any) => {
        const comp = e.competitions[0];
        const home = comp.competitors.find((c: any) => c.homeAway === 'home');
        const away = comp.competitors.find((c: any) => c.homeAway === 'away');
        return `${home?.team?.displayName} vs ${away?.team?.displayName} - ${comp.venue?.fullName}, ${comp.venue?.address?.city} - ${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }).join('\n');
    } catch {
      return '';
    }
  }

  @Post('chat')
  async chat(@Body() body: { message: string }) {
    try {
      const matches = await this.getLiveMatches();
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

REAL MATCH DATA (use ONLY this for match questions):
${matches}

Host cities: Dallas (AT&T Stadium), New York (MetLife Stadium), Los Angeles (SoFi Stadium), Miami (Hard Rock Stadium), Houston (NRG Stadium), Atlanta (Mercedes-Benz Stadium), Boston (Gillette Stadium), Philadelphia (Lincoln Financial Field), Kansas City (Arrowhead Stadium), Seattle (Lumen Field), San Francisco (Levi's Stadium), Mexico City (Estadio Azteca), Guadalajara (Estadio Akron), Monterrey (Estadio BBVA), Toronto (BMO Field), Vancouver (BC Place).

IMPORTANT: Only mention matches you can see in the REAL MATCH DATA above. Never make up match information.`
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
