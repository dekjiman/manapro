import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TenantsService } from './tenants.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get user tenants' })
  async myTenants(@CurrentUser() user: any) {
    return this.tenantsService.findByUser(user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create tenant' })
  async create(@CurrentUser() user: any, @Body() body: { name: string; slug: string; plan?: string }) {
    return this.tenantsService.create({ ...body, ownerId: user.id })
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tenantsService.update(id, body)
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get tenant members' })
  async getMembers(@Param('id') id: string) {
    return this.tenantsService.getMembers(id)
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to tenant' })
  async addMember(@Param('id') id: string, @Body() body: { userId: string; role?: string }) {
    return this.tenantsService.addMember(id, body.userId, body.role)
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from tenant' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tenantsService.removeMember(id, userId)
  }

  @Patch(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update member role' })
  async updateRole(@Param('id') id: string, @Param('userId') userId: string, @Body() body: { role: string }) {
    return this.tenantsService.updateMemberRole(id, userId, body.role)
  }
}
