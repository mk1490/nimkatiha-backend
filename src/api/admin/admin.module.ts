import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { AccessPermissionService } from '../../service/access-permission/access-permission.service';
import { AccessPermissionController } from './access-permission/access-permission.controller';
import { HomeItemsImageSliderController } from './home-items-image-slider/home-items-image-slider.controller';
import { FinancialDepositController } from './financial-deposit/financial-deposit.controller';
import { RejectionTemplateController } from './rejection-template/rejection-template.controller';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from '../../service/settings/settings.service';
import { UsersService } from '../../service/users/users.service';
import { SettingIpgController } from './setting-ipg/setting-ipg.controller';
import { CoreController } from './core/core.controller';
import { SmsService } from '../../service/sms/sms.service';
import { ProfileImageSliderController } from './profile-image-slider/profile-image-slider.controller';
import { WorkflowService } from '../../service/workflow/workflow.service';
import { NotificationService } from '../../service/notification/notification.service';
import { MarketController } from './market/market.controller';
import { MarketDeskController } from './market-desk/market-desk.controller';
import { MemberRequestController } from './member-request/member-request.controller';
import { CoreService } from '../../service/core/core.service';
import { MemberController } from './member/member.controller';

@Module({
  controllers: [
    UserController,
    AccessPermissionController,
    HomeItemsImageSliderController,
    FinancialDepositController,
    RejectionTemplateController,
    SettingsController,
    SettingIpgController,
    CoreController,
    ProfileImageSliderController,
    MarketController,
    MarketDeskController,
    MemberRequestController,
    MemberController,
  ],
  providers: [
    AccessPermissionService,
    SettingsService,
    UsersService,
    SmsService,
    WorkflowService,
    NotificationService,
    CoreService,
  ],
})
export class AdminModule {
}
