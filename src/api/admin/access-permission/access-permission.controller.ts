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
    Req,
    UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {CreateAccessPermissionDto} from './dto/create-access-permission-dto/create-access-permission-dto';
import {Roles} from '../../auth/roles.decorator';
import {JwtAuthGuard} from '../../auth/jwt-auth-guard';
import {RolesGuard} from '../../auth/roles-guard';
import {AccessPermissionService} from '../../../service/access-permission/access-permission.service';
import {BaseController} from '../../../base/base-controller';

@ApiTags('accessPermission')
@Controller('access-permission')
export class AccessPermissionController extends BaseController {


    constructor() {
        super();
    }


    @Get('/initialize')
    @ApiBearerAuth()
    @Roles('access_permissions.update', 'access_permissions.create', 'access_permissions.delete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async _initialize() {
        return await this.accessPermissionService.getListOfPermissions();
    }


    @Get('/list')
    @ApiBearerAuth()
    @Roles('access_permissions.update', 'access_permissions.create', 'access_permissions.delete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getList() {
        return await this.prisma.accessPermissionGroup.findMany({
            orderBy: {
                createDate: 'asc',
            },
        });
    }


    @Get('/:id')
    @ApiBearerAuth()
    @Roles('access_permissions.update')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async get(@Param('id') id: string) {
        const roleItem = await this.prisma.accessPermissionGroup.findFirst({where: {id: id}});
        return {
            model: {
                id: roleItem.id,
                title: roleItem.title,
                items: await this.prisma.accessPermissionGroupItems.findMany({
                    where: {
                        userOrParentAccessPermissionId: roleItem.id,
                    },
                }),
            },
            initialize: await this.accessPermissionService.getListOfPermissions()

        };
    }

    @Post()
    @ApiBearerAuth()
    @Roles( 'access_permissions.create')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async insert(@Req() {user}, @Body() input: CreateAccessPermissionDto) {
        const accessPermissionData = await this.prisma.accessPermissionGroup.create({
            data: {
                title: input.title,
                name: input.title,
                isDeletable: false,
            },
        });
        input.items.map(async (f) => {
            await this.prisma.accessPermissionGroupItems.create({
                data: {
                    providerKey: f,
                    userOrParentAccessPermissionId: accessPermissionData.id.toString(),
                },
            });
        });

        return {
            id: accessPermissionData.id,
            title: accessPermissionData.title,
        };
    }

    @Put('/:id')
    @ApiBearerAuth()
    @Roles( 'access_permissions.update')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async update(@Req() {user}, @Body() input: CreateAccessPermissionDto, @Param('id') id: string) {
        const roleItem = await this.prisma.accessPermissionGroup.findFirst({
            where: {id},
        });
        if (roleItem == null) {
            throw new NotFoundException('شناسه گروه کاربری وارد شده معتبر نیست!');
        }


        await this.prisma.accessPermissionGroupItems.deleteMany({
            where: {
                userOrParentAccessPermissionId: id,
            },
        });

        const accessPermissionData = await this.prisma.accessPermissionGroup.update({
            where: {
                id: id,
            },
            data: {
                title: input.title,
            },
        });
        input.items.map(async (f) => {
            await this.prisma.accessPermissionGroupItems.create({
                data: {
                    providerKey: f,
                    userOrParentAccessPermissionId: accessPermissionData.id.toString(),
                },
            });
        });

        return {
            id: accessPermissionData.id,
            title: accessPermissionData.title,
        };
    }

    @Delete('/:id')
    @ApiBearerAuth()
    @Roles( 'access_permissions.delete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async delete(@Param('id') id: string) {
        const usersItemCountForPremission = await this.prisma.users.count({
            where: {
                accessPermissionGroupId: id,
            },
        });

        if (usersItemCountForPremission > 0) {
            throw new NotAcceptableException('امکان حذف این گروه کاربری وجود ندارد؛ زیرا برای این گروه کاربرانی تعریف شده است.');
        }

        await this.prisma.accessPermissionGroupItems.deleteMany({
            where: {
                userOrParentAccessPermissionId: id,
            },
        });
        await this.prisma.accessPermissionGroup.delete({
            where: {
                id: id,
            },
        });
    }
}

