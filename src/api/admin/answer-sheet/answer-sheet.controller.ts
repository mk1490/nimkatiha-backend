import { Controller, Get, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';

@Controller('answer-sheet')
export class AnswerSheetController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList() {
    return await this.prisma.$queryRawUnsafe(`
        select ash.id,

               m.id     memberId,
               ttl.levelTitle,
               tt.title questionnaireTitle,
               tt.id    questionnaireId,
               m.mobileNumber
        from answer_sheets ash
                 inner join members m on m.id = ash.memberId
                 inner join test_template_levels ttl on ttl.id = ash.testTemplateLevelId
                 inner join test_templates tt on ttl.parentId = tt.id
        group by tt.id
    `);
  }

  @Get('/:questionnaireId/:memberId')
  async getDetails(
    @CurrentMember() currentMember,
    @Param('questionnaireId') questionnaireId,
    @Param('memberId') memberId,
  ) {


    const answerSheets = await this.prisma.answer_sheets.findMany({
      where: {
        testTemplateId: questionnaireId,
        memberId: memberId,
      },
    });


    const levelItems = await this.prisma.test_template_levels.findMany({
      where: {
        parentId: questionnaireId,
      },
    });

    const answer_sheet_items = await this.prisma.answer_sheet_items.findMany({
      where: {},
    });

    const formTemplateItems = await this.prisma.form_template_items.findMany();

    return {
      tabs: levelItems.map(f => {
        return {
          title: f.levelTitle,
          answers: answerSheets.map(answerItem => {
            const formResponseItems = answer_sheet_items.filter(x => x.parentAnswerSheetId == answerItem.id);
            return formResponseItems.map(formResponseItem => {
              return {
                label: formTemplateItems.find(x => x.key == formResponseItem.fieldKey).label,
                value: formResponseItem.fieldValue,
              };
            });
          }),
          // answers: answerLevels.map(answerLevelItem => {
          //   return { levelTitle: answerLevelItem.levelTitle };
          // }),
        };
      }),
    };

  }
}
