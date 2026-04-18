import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  async getByToken(@Param('token') token: string) {
    return this.invitationsService.getByToken(token);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invitations for a tenant' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: pending, accepted, expired, cancelled' })
  async getInvitations(
    @Query('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.invitationsService.getInvitations(tenantId, status);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept invitation' })
  async accept(@Body() body: { token: string }, @CurrentUser() user: any) {
    return this.invitationsService.acceptInvitation(body.token, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete invitation (only cancelled/expired)' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async delete(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.invitationsService.deleteInvitation(id, tenantId);
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend invitation email' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async resend(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.invitationsService.resendInvitation(id, tenantId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel pending invitation' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant ID' })
  async cancel(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.invitationsService.cancelInvitation(id, tenantId);
  }
}
