import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { InvitationsService } from '../invitations/invitations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantInviteDto } from './dto/tenant-invite.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(
    private tenantsService: TenantsService,
    private invitationsService: InvitationsService,
  ) {}

  @Get('my')
  @ApiOperation({ summary: 'Get user tenants' })
  async myTenants(@CurrentUser() user: any) {
    return this.tenantsService.findByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create tenant' })
  async create(
    @CurrentUser() user: any,
    @Body() body: { name: string; slug: string; plan?: string },
  ) {
    return this.tenantsService.create({ ...body, ownerId: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tenantsService.update(id, body);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get tenant members' })
  async getMembers(@Param('id') id: string) {
    return this.tenantsService.getMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to tenant' })
  async addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role?: string },
  ) {
    return this.tenantsService.addMember(id, body.userId, body.role);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from tenant' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tenantsService.removeMember(id, userId);
  }

  @Patch(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update member role' })
  async updateRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: { role: string },
  ) {
    return this.tenantsService.updateMemberRole(id, userId, body.role);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite member to tenant' })
  async invite(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: TenantInviteDto,
  ) {
    return this.invitationsService.inviteMember(
      id,
      user.id,
      body.email,
      body.role,
    );
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'Get invitations for tenant' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: pending, accepted, expired, cancelled' })
  async getInvitations(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    // Check permission
    const member = await this.tenantsService.findMember(id, user.id);
    if (!member || !member.role || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('Tidak memiliki izin');
    }
    return this.invitationsService.getInvitations(id, status);
  }

  @Delete(':id/invitations/:invitationId')
  @ApiOperation({ summary: 'Cancel invitation' })
  async cancelInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: any,
  ) {
    // Check permission
    const member = await this.tenantsService.findMember(id, user.id);
    if (!member || !member.role || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('Tidak memiliki izin');
    }
    return this.invitationsService.cancelInvitation(invitationId, id);
  }

  @Delete(':id/invitations/:invitationId/permanent')
  @ApiOperation({ summary: 'Delete invitation permanently from database' })
  async deleteInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: any,
  ) {
    // Check permission
    const member = await this.tenantsService.findMember(id, user.id);
    if (!member || !member.role || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('Tidak memiliki izin');
    }
    return this.invitationsService.deleteInvitation(invitationId, id);
  }

  @Post(':id/invitations/:invitationId/resend')
  @ApiOperation({ summary: 'Resend invitation' })
  async resendInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: any,
  ) {
    // Check permission
    const member = await this.tenantsService.findMember(id, user.id);
    if (!member || !member.role || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('Tidak memiliki izin');
    }
    return this.invitationsService.resendInvitation(invitationId, id);
  }
}
