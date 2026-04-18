import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentTenant,
} from '../common/decorators/current-user.decorator';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'Get workspaces by tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.workspacesService.findByTenant(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create workspace' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() body: { name: string },
  ) {
    return this.workspacesService.create(tenantId, user.id, body.name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.workspacesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workspace' })
  delete(@Param('id') id: string) {
    return this.workspacesService.delete(id);
  }
}
