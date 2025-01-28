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
  async initialize() {
    return await this.coreService.initializeAuth()
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


    const memberItem = await this.prisma.members.findFirst({
      where: {
        id: jwtUser.sub,
      },
    });


    const cities = await this.prisma.cities.findMany();
    let cityItem = null;
    if (memberItem.city) {
      cityItem = cities.find(x => x.cityId === Number(memberItem.city));
      if (cityItem) {
        cityItem = cityItem.title;
      }
    }


    return {
      status: memberItem.status,
      name: memberItem.name,
      family: memberItem.family,
      nationalCode: memberItem.nationalCode,
      schoolName: memberItem.schoolName,
      educationLevel: memberItem.educationLevel,
      city: cityItem,
      zone: memberItem.zone,
    };
  }


  @Post('/update-profile')
  async updateProfile(
    @Headers('authorization') authorization,
    @Body() input: UpdateProfileDto) {

    if (input.mobileNumber){

      let userItem = await this.prisma.members.findFirst({
        where:{
          mobileNumber: input.mobileNumber,
        }
      })

      if (!userItem){
       userItem = await this.prisma.members.create({
        data:{
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
        }
      })
      }else {
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

    }else {

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
