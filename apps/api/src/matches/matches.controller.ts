import { Controller, Get, Query } from '@nestjs/common';

@Controller('matches')
export class MatchesController {

  private async fetchESPN(url: string) {
    const res = await fetch(url);
    const data = await res.json();
    const events = data.events || [];
    return events.map((e: any) => {
      const comp = e.competitions[0];
      const home = comp.competitors.find((c: any) => c.homeAway === 'home');
      const away = comp.competitors.find((c: any) => c.homeAway === 'away');
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

  @Get('live')
  async getLive() {
    return this.fetchESPN('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  }

  @Get()
  async findAll(@Query('date') date?: string) {
    const url = date
      ? `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`
      : `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
    return this.fetchESPN(url);
  }

  @Get('schedule')
  async getSchedule(@Query('dates') dates?: string) {
    const url = dates
      ? `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dates}`
      : `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
    return this.fetchESPN(url);
  }
}
