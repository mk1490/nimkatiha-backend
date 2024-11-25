import { Body, Controller, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { CurrentUser } from '../../../base/decorators/current-user.decorator';
import { FormInputTypes } from '../../../base/enums/formInputTypes';

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

    const testTemplateLevel = await this.prisma.test_template_levels.findFirst({
      where: {
        id: levelId,
      },
    });

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


    const fieldItems = await this.prisma.form_template_items.findMany();


    const form_template_selection_pattern_items = await this.prisma.form_template_selection_pattern_items.findMany();

    const transaction = [];

    if (!item) {
      const id = this.helper.generateUuid();
      transaction.push(this.prisma.answer_sheets.create({
        data: {
          id,
          memberId: memberId,
          testTemplateId: testTemplateLevel.parentId,
          testTemplateLevelId: testTemplateLevel.id,
          levelTitle: testTemplateLevel.levelTitle,
          metaData: JSON.stringify(answerResponses),
        },
      }));

      transaction.push(this.prisma.answer_sheet_items.createMany({
        data: answerResponses.map(f => {
          let value = f.value;
          const field = fieldItems.find(x => x.key == f.key);

          if ([
            FormInputTypes.RadioButton,
            FormInputTypes.SingleSelectionBox,
            FormInputTypes.MultipleSelectionBox,
            FormInputTypes.Checkbox,
          ].includes(field.type)) {
            if (Array.isArray(value)) {
              let finalValue = '';
              value = value.map((f, i) => {
                finalValue += form_template_selection_pattern_items.find(x => x.value === f && x.parentId == field.id).text;
                if (i != (value.length - 1)) {
                  finalValue += ', ';
                }
                return f;
              });

              value = finalValue;
            }
          }
          return {
            fieldKey: f.key,
            fieldValue: value,
            fieldLabel: f.label,
            parentAnswerSheetId: id,
            fieldType: field.type,
          };
        }),
      }));
      await this.prisma.$transaction(transaction);
    }
  }
}
