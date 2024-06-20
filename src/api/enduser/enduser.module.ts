import { Module } from '@nestjs/common';
import { CoreController } from './core/core.controller';
import { AuthController } from './auth/auth.controller';
import { SettingsService } from '../../service/settings/settings.service';
import { SmsService } from '../../service/sms/sms.service';
import { NotificationService } from '../../service/notification/notification.service';
import { WorkflowService } from '../../service/workflow/workflow.service';
import { AccessPermissionService } from '../../service/access-permission/access-permission.service';
import { UsersService } from '../../service/users/users.service';
import { MemberRequestController } from './member-request/member-request.controller';
import { CoreService } from '../../service/core/core.service';

@Module({
  controllers: [CoreController, AuthController, MemberRequestController],
  providers: [
    SettingsService,
    SmsService,
    NotificationService,
    WorkflowService,
    AccessPermissionService,
    UsersService,
    CoreService,
  ],
})

export class EnduserModule {
}
