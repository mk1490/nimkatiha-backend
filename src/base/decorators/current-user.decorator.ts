import {createParamDecorator, ExecutionContext, SetMetadata} from '@nestjs/common';
import {AppModule} from "../../app.module";
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "../../api/auth/constants";
import {PrismaService} from "../../prisma.service";
import {CurrentUserModel} from "../interfaces/current-user.interface";
import {UsersService} from "../../service/users/users.service";
import {AccessPermissionService} from "../../service/access-permission/access-permission.service";

export const CurrentUser = createParamDecorator(async (name: string, ctx: ExecutionContext): Promise<any> => {
    const prismaService = await AppModule.moduleRef.get(PrismaService);
    const usersService = await AppModule.moduleRef.get(UsersService);
    const accessPermissionService = await AppModule.moduleRef.get(AccessPermissionService);
    const jwtService = await AppModule.moduleRef.get(JwtService);
    const req = ctx.switchToHttp().getRequest<any>();
    const {headers} = req;
    const token = headers.authorization;
    if (!!token) {
        const jwtUser = await jwtService.verifyAsync(token.replace('Bearer ', ''), {
            secret: jwtConstants.privateKey
        });

        const userItem = await prismaService.users.findFirst({
            where: {
                id: jwtUser.sub
            }
        });
        if (!userItem)
            return null;
        const userType = await usersService.getUserTypeKeyByUserItem(userItem.accessPermissionGroupId);
        const isAdmin = await accessPermissionService.userIsAdminByUserId(userItem.id);
        return {
            id: userItem.id,
            name: userItem.name,
            family: userItem.family,
            permissionGroupId: userItem.accessPermissionGroupId,
            userType: userType,
            username: userItem.username,
            mobileNumber: null,
            nationalCode: null,
            isAdmin: isAdmin,
        } as CurrentUserModel
    } else {
        return null;
    }


})


