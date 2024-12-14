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

@ApiTags('Auth (enduser)')
@Controller('auth')
export class AuthController extends BaseController {


  constructor(
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
    private readonly workflowService: WorkflowService,
  ) {
    super();
  }


  @Get('/initialize')
  async initialize() {
    const cities = await this.prisma.cities.findMany();


    return {
      cities: cities.map(f => {
        return this.helper.getComboBox(f.title, f.cityId);
      }),
      educationLevels: [
        this.helper.getComboBox('هفتم', 7),
        this.helper.getComboBox('هشتم', 8),
        this.helper.getComboBox('نهم', 9),
        this.helper.getComboBox('دهم', 10),
        this.helper.getComboBox('یازدهم', 11),
        this.helper.getComboBox('دوازدهم', 12),
      ],
      zones: [
        this.helper.getComboBox('ناحیه 1', 1),
        this.helper.getComboBox('ناحیه 2', 2),
        this.helper.getComboBox('ناحیه 3', 3),
        this.helper.getComboBox('ناحیه 4', 4),
        this.helper.getComboBox('ناحیه 5', 5),
        this.helper.getComboBox('ناحیه 6', 6),
        this.helper.getComboBox('ناحیه 7', 7),
        this.helper.getComboBox('تبادکان', 8),
        this.helper.getComboBox('رضویه', 8),
        this.helper.getComboBox('احمدآباد', 9),
      ],
    };
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
