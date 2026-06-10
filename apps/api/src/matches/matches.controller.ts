import { Controller, Get, Query } from '@nestjs/common';

@Controller('matches')
export class MatchesController {

  @Get('live')
  async getLive() {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const data = await res.json();
    const events = data.events || [];
    return events.map((e: any) => {
      const comp = e.competitions[0];
      const home = comp.competitors.find((c: any) => c.homeAway === 'home');
      const away = comp.competitors.find((c: any) => c.homeAway === 'away');
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

  @Get('schedule')
  async getSchedule(@Query('date') date?: string) {
    const url = date
      ? `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`
      : `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
    const res = await fetch(url);
    const data = await res.json();
    const events = data.events || [];
    return events.map((e: any) => {
      const comp = e.competitions[0];
      const home = comp.competitors.find((c: any) => c.homeAway === 'home');
      const away = comp.competitors.find((c: any) => c.homeAway === 'away');
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

  @Get()
  async findAll() {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const data = await res.json();
    const events = data.events || [];
    return events.map((e: any) => {
      const comp = e.competitions[0];
      const home = comp.competitors.find((c: any) => c.homeAway === 'home');
      const away = comp.competitors.find((c: any) => c.homeAway === 'away');
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
}
