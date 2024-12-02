import {
  Body,
  Controller,
  Get, Headers,
  NotAcceptableException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { AuthService } from './auth.service';
import { BaseController } from '../../base/base-controller';
import { jwtConstants } from './constants';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth-guard';
import { CurrentUserModel } from '../../base/interfaces/current-user.interface';
import { CurrentUser } from '../../base/decorators/current-user.decorator';
import { UserGoDto } from './dto/user-go-dto';
import { UsersService } from '../../service/users/users.service';
import { CheckMobileNumberDto } from './dto/check-mobile-number-dto';
import { SmsService } from '../../service/sms/sms.service';
import { CheckVerifyCodeDto } from './dto/check-verify-code-dto';
import { NotificationService } from '../../service/notification/notification.service';
import { EnduserLoginDto } from './dto/enduser-login-dto';


@Controller('auth')
export class AuthController extends BaseController {


  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }


  @Post('/checkMobileNumber')
  async checkMobileNumber(@Body() input: CheckMobileNumberDto) {
    const mobileNumber = input.mobileNumber;
    const checkIsCodeExists = await this.prisma.request_codes.findMany({
      where: {
        mobileNumber: mobileNumber,
      },
    });


    if (checkIsCodeExists.length >= 3) {
      if (diff_minutes(checkIsCodeExists[0].createDate, new Date()) < 10) {
        throw new NotAcceptableException('در 10 دقیقه اخیر، بیشتر از 3 مرتبه درخواست ارسال داشته‌اید.');
      }

      function diff_minutes(dt2, dt1) {
        let diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
      }
    }
    const randomNumber = Math.random().toString().substr(2, 6);
    console.log(randomNumber);
    try {
      // await this.smsService.sendOtpCode(mobileNumber, randomNumber);
    } catch (e) {
      console.log(e);
    }

    await this.prisma.request_codes.create({
      data: {
        mobileNumber: mobileNumber,
        code: randomNumber,
      },
    });
    const memberItem = await this.prisma.members.findFirst({
      where: {
        mobileNumber: mobileNumber,
      },
    });


    let isNewUser = !memberItem;
    if (memberItem && memberItem.username && memberItem.password) {
      isNewUser = false;
    } else {
      isNewUser = true;
    }

    return {
      is_new_user: isNewUser,
    };

  }

  @Post('/login')
  async login(@Body() input: LoginDto, @Headers('origin') origin) {
    let isAdmin = true;
    return await this.authService.login(input, isAdmin);
  }


  @Post('/checkVerifyCode')
  async checkVerifyCodePost(@Body() input: EnduserLoginDto) {
    await this.checkVerifyCode(input.mobile, input.verify_code);
    let memberItem = await this.prisma.members.findFirst({
      where: {
        mobileNumber: input.mobile,
      },
    });
    if (!memberItem) {
      memberItem = await this.prisma.members.create({
        data: {
          mobileNumber: input.mobile,
        },
      });
    }


    return this.generateUserObject({
      first_name: memberItem.name,
      last_name: memberItem.family,
      mobile: memberItem.mobileNumber,
      id: memberItem.id,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('initialize')
  async getCurrentProfile(
    @CurrentUser() currentUser: CurrentUserModel,
  ): Promise<UserGoDto> {

    let roles = [];
    if (!currentUser)
      throw new UnauthorizedException();
    let accessPermissions = await this.usersService.getAccessPermissionsByUserId(currentUser.id);
    accessPermissions.map(f => {
      roles.push(f.providerKey);
    });


    return {
      id: currentUser.id,
      name: currentUser.name,
      family: currentUser.family,
      username: currentUser.username,
      phoneNumber: currentUser.mobileNumber,
      nationalCode: currentUser.nationalCode,
      roles: roles as string[],
      notifications: [],
      // notifications: await this.notificationService.getInitializeNotifications(currentUser.id),
    };
  }


  private async generateUserObject(userItem: {
    id: string,
    mobile: string,
    last_name: string,
    first_name: string
  }) {
    const payload = {
      username: userItem.mobile,
      sub: userItem.id,
      type: 'normal',
    };

    const token = this.jwtService.sign(payload, { secret: jwtConstants.privateKey });
    return {
      user: userItem,
      token: token,
    };
  }


  @Post('/logout')
  async logout(@CurrentUser() currentUser: CurrentUserModel) {
  }

  private async checkVerifyCode(mobileNumber, verifyCode) {
    const verifyCodeItem = await this.prisma.request_codes.findFirst({
      where: {
        mobileNumber: mobileNumber,
        code: verifyCode,
      },
    });
    if (!verifyCodeItem)
      throw new NotAcceptableException('کد فعال‌سازی وارد شده معتبر نیست!');
    return verifyCodeItem;
  }
}
