import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from '../../prisma.service';
import { PrismaClient } from '../../../models';
import { AppModule } from '../../app.module';

@Injectable()
export class RolesGuard implements CanActivate {
  private prismaService: PrismaClient;

  constructor(private reflector: Reflector) {
    this.prismaService = AppModule.moduleRef.get(PrismaService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    let userItem = await this.prismaService.users.findFirst({
      where: {
        id: request.user.userId,
      },
    });
    const roleItem = await this.prismaService.access_permission_group.findFirst({
      where: { id: userItem.accessPermissionGroupId },
    });
    const roleId = roleItem.id;
    const hasRoleExist = await this.prismaService.access_permission_group_items.findMany({
      where: {
        AND: {
          providerKey: {
            in: requiredRoles,
          },
        },
        OR: [{ userOrParentAccessPermissionId: roleId }, { userOrParentAccessPermissionId: userItem.id }],
      },
    });
    return hasRoleExist.length > 0;
  }
}
