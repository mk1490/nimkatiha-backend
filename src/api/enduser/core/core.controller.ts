import { Controller, Get, Headers, Query } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { SettingsService } from '../../../service/settings/settings.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../auth/constants';
import { FormInputTypes } from '../../../base/enums/formInputTypes';
import { CoreService } from '../../../service/core/core.service';

@Controller('core')
export class CoreController extends BaseController {


  constructor(
    private readonly settingsService: SettingsService,
    private readonly jwtService: JwtService,
    private readonly coreService: CoreService,
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


    const formTemplateItem = await this.prisma.form_template_items.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    const selectionPatternItems = await this.prisma.form_template_selection_pattern_items.findMany();


    const cityItems = await this.coreService.cityItems();

    return {
      success: true,
      authRequired: testTemplateItem.authRequired,
      questionnaireId: testTemplateItem.id,
      questionnaireTitle: testTemplateItem.title,
      preText: testTemplateItem.preText,
      afterText: testTemplateItem.afterText,
      mobileNumber: memberItem ? memberItem.mobileNumber : '',
      imageSliders: [
        { imageUrl: `/api/public-files/survey/sliders/1.jpg` },
        { imageUrl: `/api/public-files/survey/sliders/2.jpg` },
        { imageUrl: `/api/public-files/survey/sliders/3.jpg` },
        { imageUrl: `/api/public-files/survey/sliders/4.jpg` },
        { imageUrl: `/api/public-files/survey/sliders/5.jpg` },
        { imageUrl: `/api/public-files/survey/sliders/6.jpg` },
      ],
      backgroundMusic: '/api/public-files/survey/background-music/bg-music.mp3',
      levels: levels.map(f => {
        return {
          title: f.levelTitle,
          id: f.id,
          formItems: formTemplateItem.filter(x => x.parentId == f.formId).map(formItem => {
            let children = [];

            if (formItem.type == FormInputTypes.City) {
              children = cityItems.map(f => {
                return this.helper.getKeyValue(f.title, f.id);
              });
            } else {
              children = selectionPatternItems.filter(x => x.parentId == formItem.id);
            }


            let visibilityCondition = null;

            if (formItem.visibilityCondition) {
              visibilityCondition = selectionPatternItems.find(x => x.id == formItem.visibilityConditionValue);
              visibilityCondition = {
                key: formTemplateItem.find(x => x.id == visibilityCondition.parentId).key,
                value: visibilityCondition.value,
              };

            }


            return {
              size: `v-col-${formItem.size}`,
              label: formItem.label,
              type: formItem.type,
              key: formItem.key,
              minimum: formItem.minimum,
              maximum: formItem.maximum,
              isRequired: formItem.isRequired,
              visibilityCondition: visibilityCondition,
              children: children,
            };
          }),
        };
      }),
    };
  }
}
