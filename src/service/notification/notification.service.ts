import {Injectable} from '@nestjs/common';
import {BaseService} from "../../base/base-service";
import {filter} from "rxjs";

@Injectable()
export class NotificationService extends BaseService {


    async getItemsByRecordIdsAndUserId(recordIds: string[], userId) {
        return await this.prisma.unreadedNotifications.findMany({
            where: {
                recordId: {
                    in: recordIds,
                },
                userId: userId
            }
        })
    }


    createNotifications(
        createFor: 'projects-action' | 'project-attachment' | 'member-request' | 'customer-deposit',
        userIds: string[],
        recordId: string) {
        return this.prisma.unreadedNotifications.createMany({
            data: userIds.map(f => {
                return {
                    cratedFor: createFor,
                    recordId: recordId,
                    userId: f
                }
            })
        })
    }


    deleteAllNotificationsByRecordIds(recordIds: string[], userId?: string) {
        let whereFilter: any = {
            recordId: {
                in: recordIds,
            }
        }

        if (userId) {
            whereFilter = {
                ...whereFilter,
                userId,
            }
        }
        return this.prisma.unreadedNotifications.deleteMany({
            where: whereFilter,
        })
    }


    async getInitializeNotifications(userId) {
        const notifications = await this.prisma.unreadedNotifications.findMany({
            where: {
                userId: userId
            }
        })

        function getNotifications(filterKey) {
            if (Array.isArray(filterKey)) {
                console.log(filterKey)
                return notifications.filter(notificationItem => filterKey.map(x => x == notificationItem.cratedFor)).length
            } else {
                return notifications.filter(x => x.cratedFor == filterKey).length
            }

        }

        return {
            membersRequest: getNotifications('member-request'),
            financialDeposit: getNotifications('customer-deposit'),
            projects: getNotifications(['projects-action', 'project-attachment']),
        }
    }


}
