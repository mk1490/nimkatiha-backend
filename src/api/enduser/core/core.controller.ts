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
    private readonly settingsService: SettingsService,
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

    const levels = await this.prisma.test_template_levels.findMany({
      where: {
        parentId: testTemplateItem.id,
      },
    });


    const formTemplates = await this.prisma.form_templates.findMany();


    const formTemplateItem = await this.prisma.form_template_items.findMany();

    return {
      success: true,
      questionnaireId: testTemplateItem.id,
      questionnaireTitle: testTemplateItem.title,
      mobileNumber: memberItem ? memberItem.mobileNumber : '',
      levels: levels.map(f => {
        return {
          title: f.levelTitle,
          id: f.id,
          formItems: formTemplateItem.filter(x => x.parentId == f.formId).map(formItem => {
            return {
              size: `v-col-${formItem.size}`,
              label: formItem.label,
              type: formItem.type,
              key: formItem.key,
              isRequired: formItem.isRequired,
            };
          }),
        };
      }),
    };
  }

}