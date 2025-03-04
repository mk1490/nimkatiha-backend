import { Controller, Get, Param, Query } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import xlsx from 'json-as-xlsx';
import { writeFileSync } from 'fs';

@Controller('answered-tests')
export class AnsweredTestsController extends BaseController {

  constructor() {
    super();
  }

  @Get('/initialize')
  async initialize() {
    const publishedTests = await this.prisma.published_tests.findMany({
      select: {
        id: true,
        title: true,
        description: false,
      },
    });
    return {
      publishedTests,
    };
  }

  @Get('/list')
  async getList(@Query('id') id) {
    let items = [];


    try {
      items = await this.prisma.$queryRawUnsafe(`
          select at.id,
                 m.id                          memberId,
                 concat(m.name, ' ', m.family) fullName,
                 m.schoolName,
                 m.educationLevel,
                 c.title                       city,
                 m.zone,
                 m.mobileNumber,
                 pt.title                      testTitle,
                 at.creationTime
          from member_answered_tests at
         inner join members m
          on m.id = at.userId
              inner join published_tests pt on pt.id = at.publishedTestItemId
              left join cities c on c.cityId = m.city
              ${id ? `where pt.id = '${id}'` : ''}
      `);
    } catch (e) {

    }

    const tests = await this.prisma.published_tests.findMany();

    return {
      list: items,
      initialize: {
        tests: tests.map(f => {
          return this.helper.getKeyValue(f.title, f.id);
        }),
      },
    };
  }

  @Get('/download-excel/:testId')
  async downloadExcel(@Param('testId') testId) {
    const q = `
        select at.id,
               m.id     memberId,
               m.name,
               m.family,
               m.nationalCode,
               m.schoolName,
               m.educationLevel,
               c.title  city,
               m.zone,
               m.mobileNumber,
               pt.title testTitle,
               at.creationTime,
               at.stringifyData
        from member_answered_tests at
         inner join members m
        on m.id = at.userId
            inner join published_tests pt on pt.id = at.publishedTestItemId
            left join cities c on c.cityId = m.city
        where at.publishedTestItemId = '${testId}'
    `;
    const items: any[] = await this.prisma.$queryRawUnsafe(q);
    const final = [];
    let answered_test_items = await this.prisma.answered_test_items.findMany();
    const questionItems = await this.prisma.test_questions.findMany({});
    const answerItems = await this.prisma.test_question_answer_items.findMany();
    for (let i = 0; i < items.length; i++) {

      const f = items[i];
      let score = 0;

      answered_test_items = answered_test_items.filter(x => x.parentAnswerItemId == f.id);

      let stringifyData = [];
      await Promise.all(answered_test_items.map(async (answerTestItem) => {
        const questionItem = questionItems.find(x => x.id == answerTestItem.questionId);

        if (answerTestItem.answerContent == questionItem.correctAnswerId) {
          score += questionItem.questionScore;
        }

        let answerItem;
        if (answerTestItem.answerContent) {
          answerItem = answerItems.find(x =>
            x.id == answerTestItem.answerContent ||
            x.value == answerTestItem.answerContent,
          );
        }

        stringifyData.push({
          id: this.helper.generateUuid(),
          questionTitle: questionItem.questionTitle,
          answerContent: answerItem ? answerItem.label : null,
        });
        // f.stringifyData = stringifyData || [];
      }));


      if (f.stringifyData) {
        f.stringifyData = JSON.parse(f.stringifyData);
        f.stringifyData.map(dataItem => {
          score += dataItem.score;
        });
      }

      final.push({
        ...f,
        totalScore: score,
      });

    }


    const _h = [
      {label: 'ردیف', value: 'row'},
      {label: 'عنوان کتاب', value: 'testTitle'},
      {label: 'شماره تلفن همراه', value: 'mobileNumber'},
      {label: 'نام', value: 'name'},
      {label: 'نام خانوادگی', value: 'family'},
      {label: 'کد ملّی', value: 'nationalCode'},
      {label: 'نام مدرسه', value: 'schoolName'},
      {label: 'پایه تحصیلی', value: 'educationLevel'},
      {label: 'شهرستان', value: 'city'},
      {label: 'ناحیه', value: 'zone'},
      // {label: 'زمان', value: 'creationTime'},
      {label: 'مجموع امتیاز', value: 'totalScore'},
    ]

    const fileName = `Nimkatiha_survey_response_template_${this.helper.generateUuid()}`

    let settings = {
      fileName: fileName,
      writeMode: 'writeFile',
      RTL: true,
      writeOptions: {},
    };

    let hasDataIndex = -1;
    final.map((f, i) => {
      if (f.stringifyData && f.stringifyData.length > 0 && hasDataIndex == -1) {
        hasDataIndex = i;
      }
    })


    final.map(f => {
      if (f.stringifyData) {
        f.stringifyData.map((questionItem, questionIndex) => {
          _h.push({
            label: questionItem.questionTitle,
            value: questionItem.questionTitle
          })
        })
      }
    })


    let _c = [...final].map((f, i) => {
      f.row = i + 1;
      return f;
    })

    final.map((f, i) => {
      if (f.stringifyData) {
        f.stringifyData.map((questionItem, questionIndex) => {
          _c[i][questionItem.questionTitle] = questionItem.answerContent
        })
      }
    })

    //
    // const file = xlsx([{
    //   sheet: 'Main',
    //   content: _c,
    //   columns: _h,
    // }], settings);
    //
    // const directory = global.directories.excelBackup()
    // writeFileSync(directory + '/' + fileName + '.xlsx',file)
    //


    return final;
  }


  @Get('/:id')
  async getDetails(
    @Param('id') id) {
    const item = await this.prisma.member_answered_tests.findFirst({
      where: {
        id,
      },
    });


    return {
      ...JSON.parse(item.stringifyData),
    };

  }

}
