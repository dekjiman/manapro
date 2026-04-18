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
import { ColumnsService } from './columns.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get columns by project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.columnsService.findByProject(projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create column' })
  create(
    @Body()
    body: {
      projectId: string;
      name: string;
      color?: string;
      position: number;
    },
  ) {
    return this.columnsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update column' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.columnsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete column' })
  delete(@Param('id') id: string) {
    return this.columnsService.delete(id);
  }

  @Patch('reorder/:projectId')
  @ApiOperation({ summary: 'Reorder columns' })
  reorder(
    @Param('projectId') projectId: string,
    @Body() body: { columnIds: string[] },
  ) {
    return this.columnsService.reorder(projectId, body.columnIds);
  }
}
