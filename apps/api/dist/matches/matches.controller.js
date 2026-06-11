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
exports.MatchesController = void 0;
const common_1 = require("@nestjs/common");
let MatchesController = class MatchesController {
    async fetchESPN(url) {
        const res = await fetch(url);
        const data = await res.json();
        const events = data.events || [];
        return events.map((e) => {
            const comp = e.competitions[0];
            const home = comp.competitors.find((c) => c.homeAway === 'home');
            const away = comp.competitors.find((c) => c.homeAway === 'away');
            const status = e.status?.type?.state;
            const completed = status === 'post';
            const live = status === 'in';
            return {
                id: e.id,
                homeTeam: home?.team?.displayName,
                awayTeam: away?.team?.displayName,
                homeTeamCode: home?.team?.abbreviation,
                awayTeamCode: away?.team?.abbreviation,
                homeScore: home?.score || '0',
                awayScore: away?.score || '0',
                homeLogo: home?.team?.logo,
                awayLogo: away?.team?.logo,
                status: e.status?.type?.name,
                statusDetail: completed ? 'Full Time' : live ? `${e.status?.displayClock} - LIVE` : e.status?.type?.detail,
                clock: e.status?.displayClock,
                kickoffAt: e.date,
                venue: comp.venue?.fullName,
                city: comp.venue?.address?.city,
                country: comp.venue?.address?.country,
                stage: e.league?.season?.type?.name || 'Group Stage',
                isLive: live,
                isCompleted: completed,
                espnUrl: `https://www.espn.com/soccer/match/_/gameId/${e.id}`,
                winner: completed ? (parseInt(home?.score) > parseInt(away?.score) ? home?.team?.displayName : parseInt(away?.score) > parseInt(home?.score) ? away?.team?.displayName : 'Draw') : null,
            };
        });
    }
    async getLive() {
        return this.fetchESPN('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    }
    async findAll(date) {
        const url = date
            ? `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`
            : `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
        return this.fetchESPN(url);
    }
    async getSchedule(dates) {
        const url = dates
            ? `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dates}`
            : `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
        return this.fetchESPN(url);
    }
};
exports.MatchesController = MatchesController;
__decorate([
    (0, common_1.Get)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getLive", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('schedule'),
    __param(0, (0, common_1.Query)('dates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getSchedule", null);
exports.MatchesController = MatchesController = __decorate([
    (0, common_1.Controller)('matches')
], MatchesController);
//# sourceMappingURL=matches.controller.js.map