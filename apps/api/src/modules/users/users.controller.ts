import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user public profile' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.clerkId, dto);
  }

  @Get('city/:citySlug/fans')
  @ApiOperation({ summary: 'Get fans in a city' })
  getNearbyFans(@Param('citySlug') citySlug: string, @Req() req: any) {
    return this.usersService.getNearbyFans(citySlug, req.user.sub);
  }
}
