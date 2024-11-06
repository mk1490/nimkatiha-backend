import {Injectable} from '@nestjs/common';
import {BaseService} from "../../base/base-service";

@Injectable()
export class AccessPermissionService extends BaseService {

    async getListOfPermissions() {
        let root = [];
        let report = [];
        {
            {
                let company_intro: any = [];
                const key = 'company_intro';
                company_intro.push(this.defineAccessPermissionObject('مدیریت اسلایدر صفحه اصلی', `${key}.home_sliders_management`, [
                    this.defineAccessPermissionObject('اضافه نمودن', `${key}.home_sliders_management.create`, []),
                    this.defineAccessPermissionObject('بروزرسانی عنوان', `${key}.home_sliders_management.update_title`, []),
                    this.defineAccessPermissionObject('حذف', `${key}.home_sliders_management.delete`, []),
                ]))
                company_intro.push(this.defineAccessPermissionObject('مدیریت اسلایدر صفحه پروفایل', `${key}.profile_sliders_management`, [
                    this.defineAccessPermissionObject('اضافه نمودن', `${key}.profile_sliders_management.create`, []),
                    this.defineAccessPermissionObject('بروزرسانی آدرس Url', `${key}.profile_sliders_management.update_url`, []),
                    this.defineAccessPermissionObject('حذف', `${key}.profile_sliders_management.delete`, []),
                ]));

                root.push(this.defineAccessPermissionObject('معرّفی شرکت', key, company_intro));
            }
        }
        return root;
    }

    private defineAccessPermissionObject(title: string, providerKey: string, childrenItems: any[]): object {
        return {
            title,
            providerKey,
            children: childrenItems,
        };
    }


    async checkAccessPermissionGroupIfExists(id) {
        const userItem = await this.prisma.accessPermissionGroup.count({
            where: {
                id,
            }
        });
        return userItem > 0;
    }


    async accessPermissionTitleById(permissionGroupId) {
        const item = await this.prisma.accessPermissionGroup.findFirst({
            where: {
                id: permissionGroupId,
            }
        })
        if (!item)
            return null
        return item.title;
    }


    async userIsAdminByUserId(userId) {
        const userItem = await this.prisma.users.findFirst({
            where: {
                id: userId
            }
        })


        const accessPermissionGroupItem = await this.prisma.access_permission_group.findFirst({
            where: {
                id: userItem.accessPermissionGroupId
            }
        });
        return accessPermissionGroupItem.name == 'admin';
    }


    async getAllUserIdsByPermissionType(permissionTypeNames: string[]) {
        const accessPermissionGroupItems = await this.prisma.access_permission_group.findMany({
            where: {
                name: {
                    in: permissionTypeNames
                },
            }
        })


        const userItems = await this.prisma.users.findMany({
            where: {
                permissionGroupId: {
                    id: {
                        in: accessPermissionGroupItems.map(f => f.id)
                    }
                }
            }
        })

        return userItems.map(f => f.id);
    }


    async getAllUsersIdsByPermissionProviderKeys(providerKeys: string[]) {
        const accessPermissionGroupItems = await this.prisma.access_permission_group_items.findMany({
            where: {
                providerKey: {
                    in: providerKeys,
                }
            }
        })

        const userItems = await this.prisma.users.findMany({
            where: {
                OR: [
                    {
                        accessPermissionGroupId: {
                            in: accessPermissionGroupItems.map(f => f.userOrParentAccessPermissionId)
                        }
                    },
                    {
                        id: {
                            in: accessPermissionGroupItems.map(f => f.userOrParentAccessPermissionId)
                        }
                    }
                ]

            }
        })

        return userItems.map(f => f.id)
    }


}
