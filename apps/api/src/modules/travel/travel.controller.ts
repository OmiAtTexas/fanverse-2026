import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('Travel')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post('itinerary')
  @ApiOperation({ summary: 'Generate AI itinerary for a city visit' })
  generateItinerary(
    @Req() req: any,
    @Body() body: { citySlug: string; hoursAvailable: number; preferences: string; matchTime?: string },
  ) {
    return this.travelService.generateItinerary(req.user.dbId, body);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get all host cities with tips' })
  getCities() {
    return this.travelService.getHostCities();
  }

  @Get('cities/:slug')
  @ApiOperation({ summary: 'Get specific host city details' })
  getCity(@Param('slug') slug: string) {
    return this.travelService.getCityDetails(slug);
  }
}
