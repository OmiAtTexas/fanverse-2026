import { Controller, Post, Body } from '@nestjs/common';

@Controller('ai')
export class AiController {
  @Post('chat')
  async chat(@Body() body: { message: string }) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a helpful FIFA World Cup 2026 travel and fan companion. You know everything about the 16 host cities in USA, Canada and Mexico. Give concise practical advice about travel, food, transport, stadiums and match day tips. Under 150 words. Be friendly and enthusiastic.\n\nUser: ${body.message}` }] }]
      }),
    });
    const data = await res.json();
    return { reply: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, try again!' };
  }
}
