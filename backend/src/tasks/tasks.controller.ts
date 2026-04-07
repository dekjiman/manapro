import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TasksService } from './tasks.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentTenant } from '../common/decorators/current-user.decorator'

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get tasks' })
  findAll(@Query('columnId') columnId?: string, @Query('projectId') projectId?: string) {
    if (columnId) return this.tasksService.findByColumn(columnId)
    if (projectId) return this.tasksService.findByProject(projectId)
    return []
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create task' })
  create(@CurrentTenant() tenantId: string, @Body() body: any) {
    return this.tasksService.create(body)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id)
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move task to column' })
  move(@Param('id') id: string, @Body() body: { columnId: string; position: number }) {
    return this.tasksService.move(id, body.columnId, body.position)
  }

  @Patch('reorder/:columnId')
  @ApiOperation({ summary: 'Reorder tasks in column' })
  reorder(@Param('columnId') columnId: string, @Body() body: { taskIds: string[] }) {
    return this.tasksService.reorder(columnId, body.taskIds)
  }
}
