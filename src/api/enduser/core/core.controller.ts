import { Body, Controller, Get, NotAcceptableException, Param, Post, Query, UseGuards } from '@nestjs/common';
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

@Controller('core')
export class CoreController extends BaseController {


  constructor(
    private readonly settingsService: SettingsService,
  ) {
    super();
  }


  @Get('/initialize')
  async initialize(@Query('slug') slug) {
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
    return {
      success: true,
      questionnaireId: testTemplateItem.id,
    };
  }

}