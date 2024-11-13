import {
  Body,
  Controller, Delete,
  Get,
  NotAcceptableException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query, UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateUserDto } from './dto/create-update-user-dto';
import { UpdatePasswordDto } from './dto/update-password-dto';
import { UsersService } from '../../../service/users/users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth-guard';
import { RolesGuard } from '../../auth/roles-guard';
import { AccessPermissionService } from '../../../service/access-permission/access-permission.service';

@Controller('user')
export class UserController extends BaseController {

  constructor(
    private readonly usersService: UsersService,
  ) {
    super();
  }


  @Get('/initialize')
  @ApiBearerAuth()
  // @Roles('users.create', 'users.update', 'users.delete', 'users.change_password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async _initialize(
    @Query('userId') userId: string) {
    return {
      accessPermissionRuleItems: await this.accessPermissionService.getListOfPermissions(),
      availableMembers: await this.prisma.test_templates.findMany({
        select: {
          id: true,
          title: true,
        },
      }),
    };
  }


  @Get('/list')
  @ApiBearerAuth()
  // @Roles('users.create', 'users.update', 'users.delete', 'users.change_password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getList() {
    const items = await this.prisma.users.findMany({
      where: {
        isDeleted: false,
      },
    });
    return items;
  }

  @Get('/:id')
  @ApiBearerAuth()
  // @Roles('users.update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getById(
    @Param('id') id: string) {

    const item = await this.prisma.users.findFirst({
      where: {
        id: id,
      },
    });
    if (!item)
      throw new NotFoundException();


    return {
      result: item,
      initialize: {
        permissionGroupItems: await this.prisma.accessPermissionGroup.findMany({
          select: {
            id: true,
            title: true,
          },
        }),
      },
    };
  }

  @Post()
  @ApiBearerAuth()
  // @Roles('users.create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Body() input: CreateUpdateUserDto,
  ) {
    await this.checkUserNameExists(input.username);
    // await this.checkAccessPermissionGroupIfExists(input.accessPermissionGroupId);

    const password = await this.helper.generateHashPassword(input.password);

    const transactions = [];

    const id = this.helper.generateUuid();

    transactions.push(this.prisma.users.create({
      data: {
        id,
        name: input.name,
        family: input.family,
        fatherName: '',
        username: input.username,
        isDeleted: false,
        password: password,
        accessPermissionGroupId: '',
      },
    }));
    transactions.push(this.prisma.user_available_questionnairies.createMany({
      data: input.tests.map(f => {
        return {
          questionnaireId: f,
          userId: id,
        };
      }),
    }));


    await this.prisma.$transaction(transactions);

    const userItem = await this.prisma.users.findFirst({
      where: {
        id,
      },
    });

    delete userItem.password;
    return {
      ...userItem,
      accessPermissionTitle: await this.accessPermissionService.accessPermissionTitleById(input.accessPermissionGroupId),
    };
  }


  @Put('/change-password')
  @ApiBearerAuth()
  // @Roles('users.change_password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePassword(@Body() input: UpdatePasswordDto) {

    const item = await this.prisma.users.findFirst({
      where: {
        id: input.userId,
      },
    });
    if (!item)
      throw new NotAcceptableException();

    const hashedPassword = await this.helper.generateHashPassword(input.newPassword);
    await this.prisma.users.update({
      where: {
        id: item.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }


  @Put('/:id')
  @ApiBearerAuth()
  // @Roles('users.update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateUserDto,
  ) {
    // await this.checkAccessPermissionGroupIfExists(input.accessPermissionGroupId);
    const item = await this.prisma.users.findFirst({
      where: {
        id: id,
      },
    });
    if (!item)
      throw new NotFoundException();


    if (input.username != item.username) {
      await this.checkUserNameExists(input.username);
    }

    await this.usersService.checkUsernameIfExists(input.username);

    // await this.checkAccessPermissionGroupIfExists(input.accessPermissionGroupId);

    const transactions = [];

    transactions.push(this.prisma.users.update({
      where: {
        id: item.id,
      },
      data: {
        name: input.name,
        family: input.family,
        accessPermissionGroupId: input.accessPermissionGroupId,
      },
    }));


    transactions.push(this.prisma.user_available_questionnairies.createMany({
      data: input.tests.map(f => {
        return {
          questionnaireId: f,
          userId: id,
        };
      }),
    }));
    await this.prisma.$transaction(transactions);
    const userItem = await this.prisma.users.findFirst({
      where: {
        id,
      },
    });
    delete userItem.password;
    return {
      ...userItem,
      accessPermissionTitle: await this.accessPermissionService.accessPermissionTitleById(input.accessPermissionGroupId),
    };
  }


  @Delete('/:id')
  @ApiBearerAuth()
  // @Roles('users.delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id) {
    await this.prisma.users.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
      },
    });
  }


  private async checkUserNameExists(username) {
    const exists = await this.usersService.checkUsernameIfExists(username);
    if (exists)
      throw new NotAcceptableException('امکان استفاده از شناسه کاربری وارد شده بدلیل وجود نام کاربری مشابه وجود ندارد!');
  }


  async checkAccessPermissionGroupIfExists(id: string) {
    const exists = await this.accessPermissionService.checkAccessPermissionGroupIfExists(id);
    if (!exists)
      throw new NotAcceptableException('شناسه گروه کاربری درخواست شده وجود ندارد!');
  }
}
