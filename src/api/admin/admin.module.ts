import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { AccessPermissionService } from '../../service/access-permission/access-permission.service';
import { AccessPermissionController } from './access-permission/access-permission.controller';
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
import { TestTemplateController } from './test-template/test-template.controller';
import { FormTemplateController } from './form-template/form-template.controller';
import { FormTemplateItemsController } from './form-template-items/form-template-items.controller';
import { AnswerSheetController } from './answer-sheet/answer-sheet.controller';
import { TestQuestionController } from './test-question/test-question.controller';
import { PublishedTestController } from './published-test/published-test.controller';
import { AnsweredTestsController } from './answered-tests/answered-tests.controller';
import { QuestionBankController } from './question-bank/question-bank.controller';
import { FileController } from './file/file.controller';
import { CoachController } from './coach/coach.controller';
import { CourseController } from './course/course.controller';
import { CoachCategoryController } from './coach-category/coach-category.controller';
import { CourseEpisodeController } from './course-episode/course-episode.controller';
import { ZendegiBaAyehaController } from './zendegi-ba-ayeha/zendegi-ba-ayeha.controller';
import { CourseItemsController } from './course-items/course-items.controller';
import { ReportModule } from './report/report.module';

@Module({
  controllers: [
    UserController,
    AccessPermissionController,
    FinancialDepositController,
    RejectionTemplateController,
    SettingsController,
    SettingIpgController,
    CoreController,
    ProfileImageSliderController,
    TestTemplateController,
    FormTemplateController,
    FormTemplateItemsController,
    AnswerSheetController,
    TestQuestionController,
    PublishedTestController,
    AnsweredTestsController,
    QuestionBankController,
    FileController,
    CoachController,
    CourseController,
    CoachCategoryController,
    CourseEpisodeController,
    ZendegiBaAyehaController,
    CourseItemsController,
  ],
  providers: [
    AccessPermissionService,
    SettingsService,
    UsersService,
    SmsService,
    WorkflowService,
    NotificationService,
  ],
  imports: [ReportModule],
})
export class AdminModule {
}
