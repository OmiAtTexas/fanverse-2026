import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('Matches')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get() findAll(@Query('city') city?: string, @Query('from') from?: string) {
    return this.matchesService.findAll(city, from);
  }

  @Get('my') getMyMatches(@Req() req: any) {
    return this.matchesService.getMyMatches(req.user.dbId);
  }

  @Post(':id/ticket') addTicket(@Param('id') id: string, @Req() req: any, @Body() body: { seatSection?: string }) {
    return this.matchesService.addTicket(req.user.dbId, id, body.seatSection);
  }

  @Delete(':id/ticket') removeTicket(@Param('id') id: string, @Req() req: any) {
    return this.matchesService.removeTicket(req.user.dbId, id);
  }
}
