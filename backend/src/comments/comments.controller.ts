import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get comments by task' })
  findByTask(
    @Param('taskId') taskId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.findByTask(
      taskId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('task/:taskId')
  @ApiOperation({ summary: 'Add comment to task' })
  create(
    @Param('taskId') taskId: string,
    @CurrentUser() user: any,
    @Body() body: { content: string; projectId: string },
  ) {
    return this.commentsService.create(
      taskId,
      user.id,
      body.content,
      body.projectId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment' })
  delete(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}
