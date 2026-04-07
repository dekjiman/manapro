import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TenantsModule } from './tenants/tenants.module'
import { WorkspacesModule } from './workspaces/workspaces.module'
import { ProjectsModule } from './projects/projects.module'
import { TasksModule } from './tasks/tasks.module'
import { ColumnsModule } from './columns/columns.module'
import { CommentsModule } from './comments/comments.module'
import { NotificationsModule } from './notifications/notifications.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    ColumnsModule,
    CommentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
