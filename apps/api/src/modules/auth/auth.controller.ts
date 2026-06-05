import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Sync Clerk user to local DB after sign-in' })
  async syncUser(@Req() req: { user: { clerkId: string } }) {
    return this.authService.syncUser(req.user.clerkId);
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req: { user: { clerkId: string } }) {
    return this.authService.getMe(req.user.clerkId);
  }
}
