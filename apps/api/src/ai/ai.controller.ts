import { Controller, Post, Body } from '@nestjs/common';

@Controller('ai')
export class AiController {
  @Post('chat')
  async chat(@Body() body: { message: string }) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a helpful FIFA World Cup 2026 travel and fan companion. You know everything about the 16 host cities in USA, Canada and Mexico. Give concise practical advice about travel, food, transport, stadiums and match day tips. Under 150 words. Be friendly and enthusiastic.' },
            { role: 'user', content: body.message }
          ],
          max_tokens: 300,
        }),
      });
      const data = await res.json();
      return { reply: data.choices?.[0]?.message?.content || 'Sorry, try again!' };
    } catch (e) {
      return { reply: 'Sorry, try again!' };
    }
  }
}
