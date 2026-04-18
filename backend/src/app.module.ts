import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { EmailModule } from './email/email.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ColumnsModule } from './columns/columns.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
    InvitationsModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    ColumnsModule,
    CommentsModule,
    NotificationsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
