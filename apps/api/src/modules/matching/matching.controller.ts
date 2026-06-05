import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('Matching')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI-powered fan match suggestions' })
  getSuggestions(@Req() req: any, @Query('limit') limit = 10) {
    return this.matchingService.getMatchSuggestions(req.user.dbId, +limit);
  }

  @Post('connect/:targetId')
  @ApiOperation({ summary: 'Send connection request to a fan' })
  connect(@Req() req: any, @Param('targetId') targetId: string) {
    return this.matchingService.createConnection(req.user.dbId, targetId);
  }

  @Get('connections')
  @ApiOperation({ summary: 'Get accepted connections' })
  getConnections(@Req() req: any) {
    return this.matchingService.getConnections(req.user.dbId);
  }
}
