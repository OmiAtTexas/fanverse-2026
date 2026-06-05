import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiQuery({ name: 'city', required: false })
  findAll(@Query('city') city?: string, @Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.groupsService.findAll(city, +limit, +offset);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Post()
  create(@Req() req: any, @Body() body: { name: string; description: string; citySlug: string; teamFocus?: string }) {
    return this.groupsService.create(req.user.dbId, body);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.join(id, req.user.dbId);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.leave(id, req.user.dbId);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @Query('before') before?: string) {
    return this.groupsService.getMessages(id, 50, before);
  }
}
