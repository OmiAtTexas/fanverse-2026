import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PassportService } from './passport.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('Passport')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('passport')
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  @Get('my')
  getMyPassport(@Req() req: any) {
    return this.passportService.getMyPassport(req.user.dbId);
  }
}
