import {
  Body,
  Controller,
  Get, Headers,
  NotAcceptableException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { RegisterDto } from './dto/register-dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth-guard';
import { CurrentUser } from '../../../base/decorators/current-user.decorator';
import { CurrentUserModel } from '../../../base/interfaces/current-user.interface';
import { SmsService } from '../../../service/sms/sms.service';
import { NotificationService } from '../../../service/notification/notification.service';
import { WorkflowService } from '../../../service/workflow/workflow.service';
import { WorkflowActions } from '../../../enums/workflowActions';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../auth/constants';
import { UpdateProfileDto } from './dto/update-profile-dto';
import { CoreService } from '../../../service/core/core.service';
import { LoginDto } from '../../auth/dto/login-dto';

@ApiTags('Auth (enduser)')
@Controller('auth')
export class AuthController extends BaseController {


  constructor(
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
    private readonly workflowService: WorkflowService,
    private readonly coreService: CoreService,
  ) {
    super();
  }


  @Get('/initialize')
  async initialize(@Query('grades') grades) {
    return await this.coreService.initializeAuth(grades && grades == 'all');
  }


  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getCurrentProfile(
    @Headers('authorization') authorization,
  ) {

    const jwtUser = await this.jwtService.verifyAsync(authorization.replaceAll('Bearer ', ''), {
      secret: jwtConstants.privateKey,
    });


    let memberOrCoachItem: any = await this.prisma.members.findFirst({
      where: {
        id: jwtUser.sub,
      },
    });

    if (!memberOrCoachItem) {
      memberOrCoachItem = await this.prisma.coachs.findFirst({
        where: {
          id: jwtUser.sub,
        },
      });
    }


    let cityItem = null;
    if (memberOrCoachItem && memberOrCoachItem.city) {
      const cities = await this.prisma.cities.findMany();
      cityItem = cities.find(x => x.cityId === Number(memberOrCoachItem.city));
      if (cityItem) {
        cityItem = cityItem.title;
      }
    }


    return {
      status: memberOrCoachItem.status,
      name: memberOrCoachItem.name,
      family: memberOrCoachItem.family,
      nationalCode: memberOrCoachItem.nationalCode,
      schoolName: memberOrCoachItem.schoolName,
      educationLevel: memberOrCoachItem.educationLevel,
      city: cityItem,
      zone: memberOrCoachItem.zone,
    };
  }


  @Post('/login')
  async login(@Body() input: LoginDto) {
    const coachItem = await this.prisma.coachs.findFirst({
      where: {
        username: input.username,
      },
    });
    if (input.username && !coachItem)
      throw new NotAcceptableException('نام کاربری وارد شده معتبر نیست!');


    const payload = {
      username: coachItem.username,
      sub: coachItem.id,
      type: 'normal',
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConstants.privateKey,
        expiresIn: '300d',
      }),
    };
  }


  @Post('/update-profile')
  async updateProfile(
    @Headers('authorization') authorization,
    @Body() input: UpdateProfileDto) {

    if (input.mobileNumber) {

      let userItem = await this.prisma.members.findFirst({
        where: {
          mobileNumber: input.mobileNumber,
        },
      });

      if (!userItem) {
        userItem = await this.prisma.members.create({
          data: {
            name: input.name,
            family: input.family,
            city: String(input.city),
            nationalCode: input.nationalCode,
            mobileNumber: input.mobileNumber,
            schoolName: input.schoolName,
            fatherName: input.fatherName,
            educationLevel: Number(input.educationLevel),
            zone: String(input.zone),
            status: 1,
          },
        });
      } else {
        userItem = await this.prisma.members.update({
          where: {
            id: userItem.id,
          },
          data: {
            name: input.name,
            family: input.family,
            city: String(input.city),
            nationalCode: input.nationalCode,
            schoolName: input.schoolName,
            fatherName: input.fatherName,
            educationLevel: Number(input.educationLevel),
            zone: String(input.zone),
            status: 1,
          },
        });
      }


      return {
        access_token: this.jwtService.sign({
          username: userItem.username,
          sub: userItem.id,
          type: 'normal',
        }, {
          secret: jwtConstants.privateKey,
          expiresIn: '24h',
        }),

      };

    } else {

      const jwtUser = await this.jwtService.verifyAsync(authorization.replaceAll('Bearer ', ''), {
        secret: jwtConstants.privateKey,
      });

      await this.prisma.members.update({
        where: {
          id: jwtUser.sub,
        },
        data: {
          name: input.name,
          family: input.family,
          city: String(input.city),
          nationalCode: input.nationalCode,
          schoolName: input.schoolName,
          fatherName: input.fatherName,
          educationLevel: Number(input.educationLevel),
          zone: String(input.zone),
          status: 1,
        },
      });
    }


  }
}
