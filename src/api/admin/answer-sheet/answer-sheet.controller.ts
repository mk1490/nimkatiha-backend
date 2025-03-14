import { Controller, Get, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import xlsx from 'json-as-xlsx';

@Controller('answer-sheet')
export class AnswerSheetController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList() {
    const result: any[] = await this.prisma.$queryRawUnsafe(`
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
--         group by tt.id
    `);


    const details = await this.getDetails(null, result[0].questionnaireId, result[0].memberId);
    console.log(details.tabs[0]);


    const _h = [
      { label: 'ردیف', value: 'row' },
      { label: 'عنوان کتاب', value: 'testTitle' },
      { label: 'شماره تلفن همراه', value: 'mobileNumber' },
      { label: 'نام', value: 'name' },
      { label: 'نام خانوادگی', value: 'family' },
      { label: 'کد ملّی', value: 'nationalCode' },
      { label: 'نام مدرسه', value: 'schoolName' },
      { label: 'پایه تحصیلی', value: 'educationLevel' },
      { label: 'شهرستان', value: 'city' },
      { label: 'ناحیه', value: 'zone' },
      // {label: 'زمان', value: 'creationTime'},
      { label: 'مجموع امتیاز', value: 'totalScore' },
    ];


    let _c = [...result].map((f, i) => {
      f.row = i + 1;
      return f;
    });

    const excelResult = xlsx([{
      sheet: 'Main',
      content: _c,
      columns: _h,
    }], {
      fileName: `multivitamin`,
      writeMode: 'write',
      RTL: true,
      writeOptions: {},
    });

    writeFileSync('./exce.xlxs', Buffer.from(excelResult));


    return result;
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


    const answer_sheet_items = await this.prisma.answer_sheet_items.findMany({
      where: {},
    });

    const formTemplateItems = await this.prisma.form_template_items.findMany();

    return {
      tabs: answerSheets.map(f => {
        const formResponseItems = answer_sheet_items.filter(x => x.parentAnswerSheetId == f.id);
        return {
          title: f.levelTitle,
          answers: formResponseItems.map(formResponseItem => {
            return {
              label: formTemplateItems.find(x => x.key == formResponseItem.fieldKey).label,
              value: formResponseItem.fieldValue,
            };
          }),
        };
      }),
    };

  }
}
