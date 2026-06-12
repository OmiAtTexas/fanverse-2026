import { Controller, Post, Get, Delete, Body, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('ai')
export class AiController {
  constructor(private prisma: PrismaService) {}

  private matchCache: string = '';
  private cacheTime: number = 0;

  private async getAllMatches() {
    if (this.matchCache && Date.now() - this.cacheTime < 3600000) return this.matchCache;
    try {
      const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': '296b6235a5444d12bea5839c814c4b48' }
      });
      const data: any = await res.json();
      this.matchCache = (data.matches || []).map((m: any) => {
        const date = new Date(m.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${date}: ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.stage.replace(/_/g, ' ')})`;
      }).join('\n');
      this.cacheTime = Date.now();
      return this.matchCache;
    } catch {
      return '';
    }
  }

  @Get('history')
  async getHistory(@Headers('x-user-id') clerkId: string) {
    if (!clerkId) return [];
    return this.prisma.aiChatMessage.findMany({
      where: { clerkId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  @Delete('history')
  async clearHistory(@Headers('x-user-id') clerkId: string) {
    if (!clerkId) return;
    await this.prisma.aiChatMessage.deleteMany({ where: { clerkId } });
    return { success: true };
  }

  @Post('chat')
  async chat(@Body() body: { message: string; history?: { role: string; content: string }[] }, @Headers('x-user-id') clerkId: string) {
    try {
      const matches = await this.getAllMatches();
      const systemPrompt = `You are a FIFA World Cup 2026 fan companion. Give SHORT answers - max 3-4 sentences. Use emojis. Be direct and specific. Remember the conversation context. Never add disclaimers.

OFFICIAL MATCH SCHEDULE:
${matches}

CITY TO STADIUM:
- Dallas/Arlington TX: AT&T Stadium - Netherlands vs Japan (Jun 14), England vs Croatia (Jun 17), Argentina vs Austria (Jun 22), Japan vs Sweden (Jun 25), Argentina vs Jordan (Jun 27) + knockouts
- New York/NJ: MetLife Stadium - FINAL (Jul 19)
- Los Angeles: SoFi Stadium
- Miami: Hard Rock Stadium
- Houston: NRG Stadium
- Atlanta: Mercedes-Benz Stadium
- Boston: Gillette Stadium
- Philadelphia: Lincoln Financial Field
- Kansas City: Arrowhead Stadium
- Seattle: Lumen Field
- San Francisco: Levi's Stadium
- Mexico City: Estadio Azteca (Jun 11: Mexico vs South Africa)
- Guadalajara: Estadio Akron
- Monterrey: Estadio BBVA
- Toronto: BMO Field
- Vancouver: BC Place`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(body.history || []).slice(-10),
        { role: 'user', content: body.message }
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 250 }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, try again!';

      if (clerkId) {
        await this.prisma.aiChatMessage.createMany({
          data: [
            { clerkId, role: 'user', content: body.message },
            { clerkId, role: 'assistant', content: reply },
          ]
        });
      }

      return { reply };
    } catch (e) {
      return { reply: 'Sorry, try again!' };
    }
  }
}
