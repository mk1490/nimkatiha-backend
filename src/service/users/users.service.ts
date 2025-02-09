import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base-service';

@Injectable()
export class UsersService extends BaseService {


  public async findUsersByFamilyOrUsername(usernameOrFamilyOrPhoneNumber) {
    return await this.prisma.$queryRawUnsafe(`
        select *
        from users u
        where u.family like N'%${usernameOrFamilyOrPhoneNumber}%'
           or u.username like N'%${usernameOrFamilyOrPhoneNumber}%'
           or u.mobileNumber like N'%${usernameOrFamilyOrPhoneNumber}%'
    `);
  }

  async checkUserIfExists(userId: string): Promise<boolean> {
    const userCount = await this.prisma.users.count({
      where: {
        id: userId,
      },
    });
    return userCount > 0;
  }


  async getAccessPermissionsByUserId(userId: string, type?: 'authorPanels' | string) {


    let accessPermissionGroupItem;


    switch (type) {
      case 'authorPanels':

        accessPermissionGroupItem = await this.prisma.accessPermissionGroup.findFirst({
          where: {
            name: 'authorPanels',
          },
        });
        break;

      default: {
        const userItem = await this.prisma.users.findFirst({
          where: {
            id: userId,
          },
        });

        if (!userItem || !userItem.accessPermissionGroupId) {
          return [];
        }

        accessPermissionGroupItem = await this.prisma.access_permission_group.findFirst({
          where: {
            id: userItem.accessPermissionGroupId.toString(),
          },
        });
      }
    }

    if (type === 'seller') {

    } else {

    }
    return await this.prisma.access_permission_group_items.findMany({
      where: {
        userOrParentAccessPermissionId: accessPermissionGroupItem.id,
      },
    });
  }


  async getUserTypeKeyByUserId(userId: string) {

    const userItem = await this.prisma.users.findFirst({
      where: {
        id: userId,
      },
    });
    return await this.getUserTypeKeyByUserItem(userItem.accessPermissionGroupId);
  }

  async getUserTypeKeyByUserItem(permissionGroupId: string) {
    if (permissionGroupId != null) {
      const accessPermissionItem = await this.prisma.access_permission_group.findFirst({
        where: {
          id: permissionGroupId,
        },
      });
      if (accessPermissionItem) {
        return accessPermissionItem.name;
      }
      return null;
    }
    return null;
  }


  async checkUsernameIfExists(username: string) {
    const userItem = await this.prisma.users.count({
      where: {
        username: username,
        isDeleted: false,
      },
    });
    return userItem > 0;
  }


  async getNormalUserPermissionId() {
    return await this.prisma.access_permission_group.findFirst({
      where: {
        name: 'normal',
      },
    });
  }

  async getFullUserFirstAndLastNameByUserId(id: string, firstFamilyThenName: boolean = false) {
    const user = await this.prisma.users.findFirst({
      where: {
        id,
      },
    });
    if (!!user) {
      if (firstFamilyThenName)
        return user.family + ', ' + user.name;
      return user.name + ' ' + user.family;
    } else
      return null;
  }


  async getUsersList(type: 'admin' | 'customers' | 'notCustomers' | 'all') {
    let filterKeys = {};
    switch (type) {
      case 'customers':
        filterKeys = { in: ['customer'] };
        break;
      case 'all':
        break;
      case 'notCustomers':
        filterKeys = {
          notIn: ['customer'],
        };
        break;
      case 'admin':
        filterKeys = {
          in: ['admin'],
        };
        break;
    }

    const accessPermissionItems = await this.prisma.access_permission_group.findMany({
      where: {
        name: filterKeys,
      },
    });

    return await this.prisma.users.findMany({
      where: {
        permissionGroupId: {
          id: {
            in: accessPermissionItems.map(f => f.id.toString()),
          },
        },
      },
    });
  }
}
