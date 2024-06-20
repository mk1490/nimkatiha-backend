import {
    Body,
    Controller,
    Get,
    NotAcceptableException,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {BaseController} from '../../../base/base-controller';
import {RegisterDto} from './dto/register-dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from '../../auth/jwt-auth-guard';
import {CurrentUser} from '../../../base/decorators/current-user.decorator';
import {CurrentUserModel} from '../../../base/interfaces/current-user.interface';
import {SmsService} from '../../../service/sms/sms.service';
import {NotificationService} from "../../../service/notification/notification.service";
import {WorkflowService} from "../../../service/workflow/workflow.service";
import {WorkflowActions} from "../../../enums/workflowActions";

@ApiTags('Auth (enduser)')
@Controller('auth')
export class AuthController extends BaseController {


    constructor(
        private readonly smsService: SmsService,
        private readonly notificationService: NotificationService,
        private readonly workflowService: WorkflowService,
    ) {
        super();
    }


    @Get('/initialize')
    async initialize() {
        const projectItems = await this.prisma.projects.findMany({});
        return {
            projects: projectItems.map(f => {
                return {
                    id: f.id,
                    title: f.title,
                };
            }),
            housingTypes: ['استیجاری', 'ملکی'],
        };
    }


    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('/profile')
    async getCurrentProfile(
        @CurrentUser() currentUser: CurrentUserModel,
        @Query('projectId') queryProjectId,
        @Query('stockId') stockId,
    ) {
    }


    @Post('/register')
    async register(@Body() input: RegisterDto) {
        let customerCount = await this.prisma.customers.count({
            where: {
                nationalCode: input.nationalCode,
            },
        });

        if (customerCount > 0)
            throw new NotAcceptableException('کد ملّی درخواست شده قبلا در سامانه ثبت گردیده شده است!');

        const projectCount = await this.prisma.projects.count({
            where: {
                id: input.projectId,
            },
        });


        if (projectCount < 1)
            throw new NotAcceptableException('شناسۀ پروژۀ درخواست شده معتبر نیست!');
        const trackingCode = this.helper.generateRandomNumber(6);


        const customerPermissionGroupItem = await this.prisma.accessPermissionGroup.findFirst({
            where: {
                name: 'customer',
            },
        });


        const userId = this.helper.generateUuid();
        let userItem = this.prisma.users.create({
            data: {
                id: userId,
                name: input.name,
                family: input.family,
                fatherName: input.fatherName,
                accessPermissionGroupId: customerPermissionGroupItem.id,
            },
        });
        const customerId = this.helper.generateUuid();

        const joinedProjectTransaction = this.prisma.customerJoinedProjects.create({
            data: {
                projectId: input.projectId,
                customerId: customerId,
                customerNationalCode: '',
            },
        });


        const userIds = await this.accessPermissionService.getAllUsersIdsByPermissionProviderKeys(['members_request.change_status'])

        await this.workflowService.createWthManyResponseToUserIds({
            controller: 'enduser/auth',
            status: 0,
            requestDescription: 'ایجاد درخواست عضویت توسط کاربر',
            body: JSON.stringify(input),
            action: WorkflowActions.CREATE,
            targetUserPermission: 'admin',
            recordId: customerId,
            responseTo: '',
            creatorId: customerId
        }, userIds)
        // this.smsService.sendTrackingCode(transaction[0].mobileNumber, trackingCode).then();
        return {
            trackingCode: trackingCode,
        };
    }
}
