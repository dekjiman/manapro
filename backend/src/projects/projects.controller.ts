import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ProjectsService } from './projects.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentTenant } from '../common/decorators/current-user.decorator'

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get projects' })
  findAll(@CurrentTenant() tenantId: string, @Query('workspaceId') workspaceId?: string) {
    if (workspaceId) return this.projectsService.findByWorkspace(workspaceId)
    return this.projectsService.findByTenant(tenantId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create project' })
  create(@CurrentTenant() tenantId: string, @Body() body: any) {
    return this.projectsService.create({ ...body, tenantId })
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id)
  }
}
