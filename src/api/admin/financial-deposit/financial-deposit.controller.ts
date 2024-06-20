import {
    Body,
    Controller,
    Delete,
    Get,
    NotAcceptableException,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {BaseController} from '../../../base/base-controller';
import {ApiTags} from '@nestjs/swagger';
import {CreateUpdateDepositDto} from './dto/create-update-deposit-dto';
import {CreateSingleDepositDto} from "./dto/create-single-deposit-dto";
import {WorkflowService} from "../../../service/workflow/workflow.service";
import {CurrentUser} from "../../../base/decorators/current-user.decorator";
import {CurrentUserModel} from "../../../base/interfaces/current-user.interface";
import {WorkflowActions} from "../../../enums/workflowActions";
import {DepositItemDto} from "./dto/deposit-item-dto";
import {NotificationService} from "../../../service/notification/notification.service";


@ApiTags('financial')
@Controller('financial-deposit')
export class FinancialDepositController extends BaseController {

    constructor(
        private readonly workflowService: WorkflowService,
        private readonly notificationService: NotificationService,
    ) {
        super();
    }


    @Get('/initialize')
    async initialize() {
        return await this.initializeData();
    }


    @Get('/workflow/:id')
    async getWorkflow(
        @CurrentUser() currentUser: CurrentUserModel,
        @Param('id') id) {
        const workflowItems = await this.workflowService.getWorkFlowItemsByRecordId(currentUser.id, id);
        if (currentUser.isAdmin == false) {
            await this.notificationService.deleteAllNotificationsByRecordIds(workflowItems.items.map(f => f.id))
        }

        return workflowItems;
    }

    @Put('/workflow/:recordId/:workflowId/:status')
    async updateWorkflow(
        @CurrentUser() currentUser: CurrentUserModel,
        @Param('recordId') recordId,
        @Param('workflowId') workflowId,
        @Param('status') status: number
    ) {
        let workflowItem = await this.workflowService.getWorkflowById(workflowId);
        let requestDescription = '';
        let data = '';


        switch (workflowItem.action) {
            case WorkflowActions.DELETE:
                requestDescription = 'تأیید درخواست حذف آیتم مالی'
                await this.deleteItemById(workflowItem.recordId);
                break;
            case WorkflowActions.CREATE:
                requestDescription = 'تأیید درخواست ایجاد آیتم مالی'
            case WorkflowActions.UPDATE:
                requestDescription = 'تأیید ویرایش آیتم مالی'
                await this.prisma.customersDeposit.update({
                    where: {
                        id: workflowItem.recordId,
                    },
                    data: {
                        status: 1,
                    }
                })
                break;
        }

        await this.notificationService.deleteAllNotificationsByRecordIds([workflowItem.id])
        await this.workflowService.setWorkflowDetermineStatus(workflowItem.id)
        const id = this.helper.generateUuid()
        await this.workflowService.create({
            id: id,
            action: workflowItem.action as WorkflowActions,
            controller: 'financial-deposit',
            body: data,
            creatorId: currentUser.id,
            recordId: workflowItem.recordId,
            requestDescription: requestDescription,
            status: status,
            responseTo: workflowItem.creatorId,
            determinedStatus: 1,
        })


        await this.notificationService.createNotifications('customer-deposit', [workflowItem.creatorId], id)


        return {
            status: currentUser.isAdmin ? 1 : 101,
            action: workflowItem.action
        }
    }


    @Post('/list/:projectId')
    async getList(
        @Param('projectId') projectId,
        @Body('memberIds') memberIds: string[],
        @CurrentUser() currentUser: CurrentUserModel,
    ) {
        return await this.prisma.$queryRawUnsafe(`
            select c.id,
                   concat(u.name, ' ', u.family,
                          case
                              when (select count(*) from customers c where c.parentUserId = u.id) > 1
                                  then concat(' ', N'(کد سهم', ' ', (select c.stockCode), ')')
                              else ''
                              end
                       )                                   customerName,
                   (select sum(cd.amountValue)
                    from customersDeposit cd
                    where cd.customerId = c.id
                      and cd.status = 1)                   totalDepositValue,
                   p.title                                 projectTitle,
                   (select count(*)
                    from unreadedNotifications un
                    where un.recordId in ((select wf.id
                                           from workFlow wf
                                           where wf.recordId in
                                                 (select cd.id from customersDeposit cd where cd.customerId = c.id)))
                      and un.userId = '${currentUser.id}') notifications
            from customers c
                     inner join users u on u.id = c.parentUserId
                     inner join customerJoinedProjects cjp on cjp.customerId = c.id
                     inner join projects p on p.id = cjp.projectId
            where cjp.projectId = '${projectId}'
            order by totalDepositValue desc
        `);
        // memberIds
    }


    @Post('/single-deposit')
    async createSingleDeposit(
        @CurrentUser() currentUser: CurrentUserModel,
        @Body() input: CreateSingleDepositDto) {
        const isAdmin = await this.accessPermissionService.userIsAdminByUserId(currentUser.id);
        const id = this.helper.generateUuid();
        const item = this.prisma.customersDeposit.create({
            data: {
                id: id,
                amountValue: input.amountValue,
                status: isAdmin ? 1 : 100,
                depositTime: new Date(),
                creationTime: new Date(),
                projectId: input.projectId,
                customerId: input.customerId
            }
        });

        let status = 0;
        let transaction = [];
        transaction.push(item);
        if (isAdmin) {
            status = 1;
        } else {
            status = 101;
            const workflowId = this.helper.generateUuid();
            transaction.push(this.prisma.workFlow.create({
                data: {
                    id: workflowId,
                    recordId: id,
                    status: 101,
                    controller: 'financial-deposit',
                    body: '{}',
                    action: WorkflowActions.CREATE,
                    requestDescription: 'ایجاد آیتم مالی جدید',
                    creatorId: currentUser.id,
                }
            }))
            const userIds = await this.accessPermissionService.getAllUserIdsByPermissionType(['admin']);
            transaction.push(this.notificationService.createNotifications('customer-deposit', userIds, workflowId))
        }
        const finalTransaction = await this.prisma.$transaction(transaction)

        return {
            ...finalTransaction[0],
            status,
        };
    }

    @Post('/:customerId/:projectId')
    async insert(
        @Body() input: CreateUpdateDepositDto,
        @Param('customerId') customerId: string,
        @Param('projectId') projectId: string,
    ) {
        await this.checkProjectAndCustomerIdValidation(customerId, projectId);
        const item = await this.prisma.customersDeposit.createMany({
            data: input.depositItems.map(f => {
                return {
                    depositTime: new Date(f.depositTime),
                    amountValue: f.amountValue,
                    customerId: customerId,
                    projectId: projectId,
                };
            }),
        });
        return {
            ...item,
            projectTitle: await this.getProjectTitleById(projectId),
        };
    }


    @Put('/:id')
    async updateSingleItem(
        @Param('id') id: string,
        @CurrentUser() currentUser: CurrentUserModel,
        @Body() input: DepositItemDto) {

        const transaction = []
        const item = this.prisma.customersDeposit.update({
            where: {
                id: id,
            },
            data: {
                amountValue: input.amountValue,
                depositTime: input.depositTime,
                status: currentUser.isAdmin ? 1 : 100,
            }
        })
        transaction.push(item);

        if (!currentUser.isAdmin) {


            const workflowId = this.helper.generateUuid();
            const creatorId = currentUser.id;

            transaction.push(this.prisma.workFlow.create({
                data: {
                    id: workflowId,
                    recordId: id,
                    status: 101,
                    controller: 'financial-deposit',
                    body: '{}',
                    action: WorkflowActions.UPDATE,
                    requestDescription: 'ویرایش آیتم مالی',
                    creatorId: creatorId,
                }
            }))

            await this.createNotification(workflowId)

        }
        const finalTransaction = await this.prisma.$transaction(transaction)
        return finalTransaction[0];
    }


    @Put('/:customerId/:projectId')
    async update(
        @Param('customerId') customerId,
        @Param('projectId') projectId,
        @Body() input: CreateUpdateDepositDto) {

        await this.checkProjectAndCustomerIdValidation(customerId, projectId);


        const deleteTransaction = this.prisma.customersDeposit.deleteMany({
            where: {
                projectId: projectId,
                customerId: customerId,
            },
        });


        let totalDepositValue = 0;
        const createTransaction = this.prisma.customersDeposit.createMany({
            data: input.depositItems.map(f => {
                const amountValue = Number(f.amountValue.toString())
                totalDepositValue += amountValue;
                return {
                    depositTime: new Date(f.depositTime),
                    amountValue: amountValue,
                    customerId: customerId,
                    projectId: projectId,
                };
            }),
        });

        await this.prisma.$transaction([deleteTransaction, createTransaction]);

        return {
            projectTitle: await this.getProjectTitleById(projectId),
            projectId: projectId,
            customerId: customerId,
            totalDepositValue: totalDepositValue
        };
    }

    @Get('/find-project')
    async findProject(@Query('q') q) {
        const items = await this.prisma.projects.findMany({
            where: {
                title: {
                    contains: q,
                },
            },
        });

        return items.map(f => {
            return {
                id: f.id,
                title: f.title,
            };
        });
    }


    @Get('/:customerId/:projectId')
    async getById(
        @CurrentUser() currentUser: CurrentUserModel,
        @Param('customerId') customerId: string,
        @Param('projectId') projectId: string,
    ) {
        const item = await this.prisma.customers.findFirst({
            where: {
                id: customerId,
            },
        });

        if (!item)
            throw new NotFoundException();

        const customer = await this.prisma.$queryRawUnsafe(`
            select c.id,
                   concat(u.name, ', ', u.family) fullName
            from users u
                     inner join customers c on c.parentUserId = u.id
            where c.id = '${item.id}'
        `);
        const customerItems = await this.prisma.customersDeposit.findMany({
            where: {
                customerId: item.id,
            },
        });
        const projectItem = await this.prisma.projects.findFirst({
            where: {
                id: projectId,
            },
        });

        return {
            initialize: await this.initializeData(),
            result: {
                ...item,
                projectTitle: projectItem.title,
                projectId: projectItem.id,
                customerItem: customer[0],
                depositItems: await Promise.all(customerItems.map(async f => {
                    let status = 0;
                    const workflowItem = await this.workflowService.getLastWorkflowByRecordId(f.id)
                    if (!workflowItem) {
                        status = 1;
                    } else {
                        status = workflowItem.status != 1 ? (currentUser.isAdmin ? 100 : 101) : 1;
                    }
                    return {
                        id: f.id,
                        depositTime: f.depositTime,
                        amountValue: f.amountValue,
                        status,
                    };
                })),
            },
        };
    }


    @Delete('/:id')
    async deleteItem(
        @CurrentUser() currentUser: CurrentUserModel,
        @Param('id') id) {
        let isWorkflow = false;
        if (currentUser.isAdmin) {
            await this.deleteItemById(id)
            isWorkflow = false;
        } else {
            const workflowId = this.helper.generateUuid();
            await this.workflowService.create({
                id: workflowId,
                controller: 'financial-deposit',
                action: WorkflowActions.DELETE,
                status: 100,
                recordId: id,
                requestDescription: 'حذف اطلاعات واریزی',
                body: '{}',
                creatorId: currentUser.id
            })

            await this.createNotification(workflowId)


            isWorkflow = true;
        }
        return {isWorkflow}
    }

    private async initializeData() {
        const projectItems = await this.prisma.projects.findMany({
            take: 10,
        });
        return {
            projects: projectItems.map(f => {
                return {
                    id: f.id,
                    title: f.title,
                };
            }),
        };
    }

    private async getProjectTitleById(projectId) {
        const item = await this.prisma.projects.findFirst({
            where: {
                id: projectId,

            },
        });
        if (!item)
            return null;
        return item.title;
    }

    private async checkProjectAndCustomerIdValidation(customerId: string, projectId: string) {
        const projectItem = await this.prisma.projects.findFirst({
            where: {
                id: projectId,
            },
        });

        const customerItem = await this.prisma.customers.findFirst({
            where: {
                id: customerId,
            },
        });
        if (!projectItem)
            throw new NotAcceptableException('شناسه پروژه درخواست شده معتبر نیست.');
        if (!customerItem)
            throw new NotAcceptableException('شناسه مشتری درخواست شده معتبر نیست.');
    }

    private async deleteItemById(id) {
        await this.prisma.customersDeposit.delete({
            where: {
                id
            }
        })
    }

    private async createNotification(workflowId) {
        const userIds = await this.accessPermissionService.getAllUserIdsByPermissionType(['admin'])
        await this.notificationService.createNotifications('customer-deposit', userIds, workflowId)
    }
}
