"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
let AiController = class AiController {
    async getLiveMatches() {
        try {
            const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
            const data = await res.json();
            const events = data.events || [];
            return events.map((e) => {
                const comp = e.competitions[0];
                const home = comp.competitors.find((c) => c.homeAway === 'home');
                const away = comp.competitors.find((c) => c.homeAway === 'away');
                return `${home?.team?.displayName} vs ${away?.team?.displayName} - ${comp.venue?.fullName}, ${comp.venue?.address?.city} - ${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            }).join('\n');
        }
        catch {
            return '';
        }
    }
    async chat(body) {
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
        }
        catch (e) {
            return { reply: 'Sorry, try again!' };
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai')
], AiController);
//# sourceMappingURL=ai.controller.js.map