import { Body, Controller, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { CurrentUser } from '../../../base/decorators/current-user.decorator';

@Controller('form-answer')
export class FormAnswerController extends BaseController {

  constructor() {
    super();
  }


  @Post('/:levelId')
  async answerLevel(
    @CurrentMember() currentMember,
    @Param('levelId') levelId,
    @Body() input,
  ) {
    const memberId = currentMember.id;

    const testTemplateLevel =await this.prisma.test_template_levels.findFirst({
      where:{
        id: levelId
      }
    })

    const item = await this.prisma.answer_sheets.findFirst({
      where: {
        testTemplateLevelId: levelId,
        memberId: memberId,
        testTemplateId: testTemplateLevel.id,
      },
    });


    const form_template_items = await this.prisma.form_template_items.findMany();


    let answerResponses = [];
    Object.keys(input).map(f => {
      const fieldItem = form_template_items.find(x => x.key == f);
      answerResponses.push({
        label: fieldItem.label,
        key: fieldItem.key,
        value: input[fieldItem.key],
      });
    });

    const transaction = [];

    if (!item) {
      const id = this.helper.generateUuid();
      transaction.push(this.prisma.answer_sheets.create({
        data: {
          id,
          memberId: memberId,
          testTemplateId: testTemplateLevel.parentId,
          testTemplateLevelId: levelId,
          metaData: JSON.stringify(answerResponses),
        },
      }));

      transaction.push(this.prisma.answer_sheet_items.createMany({
        data: answerResponses.map(f => {
          return {
            fieldKey: f.key,
            fieldValue: f.value,
            parentAnswerSheetId: id,
          };
        }),
      }));
      await this.prisma.$transaction(transaction);
    }
  }
}
