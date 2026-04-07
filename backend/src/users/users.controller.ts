import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id)
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user' })
  async updateMe(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.update(user.id, body)
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return this.usersService.findAll()
  }
}
