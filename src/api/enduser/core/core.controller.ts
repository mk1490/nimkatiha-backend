import { Body, Controller, Get, Headers, NotAcceptableException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import * as fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { SettingsService } from '../../../service/settings/settings.service';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';
import { CurrentUser } from '../../../base/decorators/current-user.decorator';
import { CurrentUserModel } from '../../../base/interfaces/current-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth-guard';
import { IncreaseDepositDto } from './dto/increase-deposit-dto';
import { CalculateRateDto } from './dto/calculate-rate-dto';
import * as test from 'node:test';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../auth/constants';

@Controller('core')
export class CoreController extends BaseController {


  constructor(
    private readonly jwtService: JwtService,
  ) {
    super();
  }


  @Get('/initialize')
  async initialize(
    @Headers('authorization') authorization,
    @Query('slug') slug) {
    const testTemplateItem = await this.prisma.test_templates.findFirst({
      where: {
        slug: slug,
      },
    });
    if (!testTemplateItem) {
      return {
        success: false,
        message: 'لینک درخواستی معتبر نیست!',
      };
    }

    let memberItem;
    try {
      const jwtPayload = await this.jwtService.verifyAsync(authorization.replace('Bearer ', ''), {
        secret: jwtConstants.privateKey,
      });

      memberItem = await this.prisma.members.findFirst({
        where: {
          id: jwtPayload.sub,
        },
      });

    } catch (e) {

    }
    return {
      success: true,
      questionnaireId: testTemplateItem.id,
      questionnaireTitle: testTemplateItem.title,
      mobileNumber: memberItem ? memberItem.mobileNumber : '',
    };
  }

}