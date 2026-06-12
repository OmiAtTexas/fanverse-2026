import { Controller, Post, Body } from '@nestjs/common';

@Controller('ai')
export class AiController {
  @Post('chat')
  async chat(@Body() body: { message: string }) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a helpful FIFA World Cup 2026 travel and fan companion. You know everything about the 16 host cities in USA, Canada and Mexico. Give concise practical advice about travel, food, transport, stadiums and match day tips. Under 150 words. Be friendly and enthusiastic.\n\nUser: ${body.message}` }] }]
        }),
      });
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) console.error('Gemini error:', JSON.stringify(data));
      return { reply: reply || 'Sorry, try again!' };
    } catch (e) {
      console.error('AI error:', e);
      return { reply: 'Sorry, try again!' };
    }
  }
}
