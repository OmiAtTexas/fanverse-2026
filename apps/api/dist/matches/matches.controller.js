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
    async getLive() {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
        const data = await res.json();
        const events = data.events || [];
        return events.map((e) => {
            const comp = e.competitions[0];
            const home = comp.competitors.find((c) => c.homeAway === 'home');
            const away = comp.competitors.find((c) => c.homeAway === 'away');
            return {
                id: e.id,
                homeTeam: home?.team?.displayName,
                awayTeam: away?.team?.displayName,
                homeTeamCode: home?.team?.abbreviation,
                awayTeamCode: away?.team?.abbreviation,
                homeScore: home?.score,
                awayScore: away?.score,
                homeLogo: home?.team?.logo,
                awayLogo: away?.team?.logo,
                status: e.status?.type?.name,
                statusDetail: e.status?.type?.detail,
                clock: e.status?.displayClock,
                kickoffAt: e.date,
                venue: comp.venue?.fullName,
                city: comp.venue?.address?.city,
                stage: e.season?.type?.name,
                isLive: e.status?.type?.state === 'in',
            };
        });
    }
    async getSchedule(date) {
        const url = date
            ? `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`
            : `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
        const res = await fetch(url);
        const data = await res.json();
        const events = data.events || [];
        return events.map((e) => {
            const comp = e.competitions[0];
            const home = comp.competitors.find((c) => c.homeAway === 'home');
            const away = comp.competitors.find((c) => c.homeAway === 'away');
            return {
                id: e.id,
                homeTeam: home?.team?.displayName,
                awayTeam: away?.team?.displayName,
                homeTeamCode: home?.team?.abbreviation,
                awayTeamCode: away?.team?.abbreviation,
                homeScore: home?.score,
                awayScore: away?.score,
                homeLogo: home?.team?.logo,
                awayLogo: away?.team?.logo,
                status: e.status?.type?.name,
                statusDetail: e.status?.type?.detail,
                clock: e.status?.displayClock,
                kickoffAt: e.date,
                venue: comp.venue?.fullName,
                city: comp.venue?.address?.city,
                stage: e.season?.type?.name,
                isLive: e.status?.type?.state === 'in',
            };
        });
    }
    async findAll() {
        const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
        const data = await res.json();
        const events = data.events || [];
        return events.map((e) => {
            const comp = e.competitions[0];
            const home = comp.competitors.find((c) => c.homeAway === 'home');
            const away = comp.competitors.find((c) => c.homeAway === 'away');
            return {
                id: e.id,
                homeTeam: home?.team?.displayName,
                awayTeam: away?.team?.displayName,
                homeTeamCode: home?.team?.abbreviation,
                awayTeamCode: away?.team?.abbreviation,
                homeScore: home?.score,
                awayScore: away?.score,
                homeLogo: home?.team?.logo,
                awayLogo: away?.team?.logo,
                status: e.status?.type?.name,
                statusDetail: e.status?.type?.detail,
                clock: e.status?.displayClock,
                kickoffAt: e.date,
                venue: comp.venue?.fullName,
                city: comp.venue?.address?.city,
                country: comp.venue?.address?.country,
                stage: e.season?.type?.name,
                isLive: e.status?.type?.state === 'in',
            };
        });
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
    (0, common_1.Get)('schedule'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchesController.prototype, "findAll", null);
exports.MatchesController = MatchesController = __decorate([
    (0, common_1.Controller)('matches')
], MatchesController);
//# sourceMappingURL=matches.controller.js.map