import {Injectable, NotAcceptableException} from '@nestjs/common';
import {BaseService} from "../../base/base-service";
import {AccessPermissionService} from "../access-permission/access-permission.service";
import {UsersService} from "../users/users.service";
import {CreateWorkflowDto} from "../../dtos/create-workflow-dto";

@Injectable()
export class WorkflowService extends BaseService {
    constructor(
        private readonly accessPermissionService: AccessPermissionService,
        private readonly usersService: UsersService,
    ) {
        super();
    }


    async checkLastRequestByUser(userId, recordId) {
        const hasRecord = await this.prisma.workFlow.findFirst({
            where: {
                recordId: recordId,
                creatorId: userId
            },
            orderBy: {
                creationTime: 'desc'
            }
        })
        return !!hasRecord;
    }

    async getWorkFlowByRecordAndUserId(userId, recordId) {
        return await this.prisma.workFlow.findFirst({
            where: {
                recordId: recordId,
                creatorId: userId
            },
            orderBy: {
                creationTime: 'desc',
            }
        })
    }


    async getLastWorkflowByRecordId(recordId) {
        return await this.prisma.workFlow.findFirst({
            where: {
                recordId: recordId,
            },
            orderBy: {
                creationTime: 'desc',
            }
        })
    }

    async getWorkflowById(recordId) {
        return await this.prisma.workFlow.findFirst({
            where: {
                id: recordId,
            },
        })
    }


    async getWorkflowItemsByRecordIdAndCreatorOrResponseToId(recordId, creatorOrResponseToId) {
        const isAdmin = await this.accessPermissionService.userIsAdminByUserId(creatorOrResponseToId);
        if (isAdmin == false) {
            return await this.prisma.workFlow.findMany({
                where: {
                    recordId: recordId,
                    OR: [
                        {creatorId: creatorOrResponseToId},
                        {responseTo: creatorOrResponseToId},
                    ]
                }
            })
        } else {
            return await this.prisma.workFlow.findMany({
                where: {
                    recordId: recordId,
                }
            })
        }


    }


    async getWorkFlowItemsByRecordId(userId, recordId, exception = true) {
        const isAdmin = await this.accessPermissionService.userIsAdminByUserId(userId);
        const users = await this.usersService.getUsersList('notCustomers')

        let whereFilter: any = {
            recordId,
            // creatorId: isAdmin == false ? {
            //     in: [...adminUsers.map(f => f.id), userId]
            // } : undefined,

        };

        if (isAdmin == false) {
            whereFilter = {
                ...whereFilter,
                OR: [
                    {
                        creatorId: userId
                    },
                    {
                        responseTo: userId
                    }
                ]
            }
        }

        let items = await this.prisma.workFlow.findMany({
            where: whereFilter,
            orderBy: {
                creationTime: 'asc'
            }
        })

        if (exception === true && items.length == 0) {
            throw new NotAcceptableException('هیچ گردش کار تعریف شده‌ای وجود ندارد.')
        }

        let showActions = false;
        if (isAdmin == false) {
            showActions = false;
        } else {
            // const lastRecord = await this.getLastWorkflowByRecordId(recordId);
            // if (lastRecord.creatorId != userId) {
            //     showActions = true;
            // }
            showActions = true;

        }


        return {
            isAdmin,
            recordId,
            items: items.map(f => {
                let userItem = users.find(x => x.id == f.creatorId);
                f['userFullName'] = userItem ? userItem.name + (userItem.family ? ' ' + userItem.family : '') : ''
                return f;
            }),
            showActions,
        }
    }


    create(input: CreateWorkflowDto, insertWithoutTransaction?: boolean) {
        return this.prisma.workFlow.create({
            data: {
                id: !input.id ? this.helper.generateUuid() : input.id,
                creatorId: input.creatorId,
                responseTo: input.responseTo,
                recordId: input.recordId,
                controller: input.controller,
                status: Number(input.status),
                summaryDescription: input.summaryDescription,
                body: input.body,
                targetUserPermission: input.targetUserPermission,
                requestDescription: input.requestDescription,
                action: input.action,
                determinedStatus: input.determinedStatus
            }
        })
    }

    async createWthManyResponseToUserIds(input: CreateWorkflowDto, responseToUserIds: string[]) {
        const transactionItem = await this.prisma.workFlow.createMany({
            data: responseToUserIds.map(f => {
                return {
                    creatorId: input.creatorId,
                    responseTo: f,
                    recordId: input.recordId,
                    controller: input.controller,
                    status: Number(input.status),
                    summaryDescription: input.summaryDescription,
                    body: input.body,
                    targetUserPermission: input.targetUserPermission,
                    requestDescription: input.requestDescription,
                    action: input.action
                }
            })
        })
        return transactionItem;
    }

    async setWorkflowDetermineStatus(id, status = 1) {
        await this.prisma.workFlow.update({
            where: {
                id: id,
            },
            data: {
                determinedStatus: 1,
            }
        })
    }
}
