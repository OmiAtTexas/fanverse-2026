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
    constructor() {
        this.matchCache = '';
        this.cacheTime = 0;
    }
    async getAllMatches() {
        if (this.matchCache && Date.now() - this.cacheTime < 3600000)
            return this.matchCache;
        try {
            const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
                headers: { 'X-Auth-Token': '296b6235a5444d12bea5839c814c4b48' }
            });
            const data = await res.json();
            this.matchCache = (data.matches || []).map((m) => {
                const date = new Date(m.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `${date}: ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.stage.replace(/_/g, ' ')})`;
            }).join('\n');
            this.cacheTime = Date.now();
            return this.matchCache;
        }
        catch {
            return '';
        }
    }
    async chat(body) {
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

OFFICIAL MATCH SCHEDULE (from FIFA):
${matches}

CITY TO STADIUM MAPPING:
- Dallas/Arlington TX: AT&T Stadium - hosts Netherlands vs Japan (Jun 14), England vs Croatia (Jun 17), Argentina vs Austria (Jun 22), Japan vs Sweden (Jun 25), Argentina vs Jordan (Jun 27), plus knockouts
- New York/NJ: MetLife Stadium - hosts Brazil vs Morocco, Germany vs Curacao and more, plus the FINAL (Jul 19)
- Los Angeles: SoFi Stadium
- Miami: Hard Rock Stadium  
- Houston: NRG Stadium
- Atlanta: Mercedes-Benz Stadium
- Boston/Foxborough: Gillette Stadium
- Philadelphia: Lincoln Financial Field
- Kansas City: Arrowhead Stadium
- Seattle: Lumen Field
- San Francisco/Santa Clara: Levi's Stadium
- Mexico City: Estadio Azteca (opening match Jun 11: Mexico vs South Africa)
- Guadalajara: Estadio Akron
- Monterrey: Estadio BBVA
- Toronto: BMO Field
- Vancouver: BC Place

Use ONLY the official schedule above. Never guess or make up match info.`
                        },
                        { role: 'user', content: body.message }
                    ],
                    max_tokens: 250,
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