import { Controller, Get, Param, Query } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

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
    const items = await this.prisma.$queryRawUnsafe(`
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
        ${id? `where pt.id = '${id}'`: ''}
    `);
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
    const items: any[] = await this.prisma.$queryRawUnsafe(`
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
    `);


    return items.map(f => {
      const stringifyData = JSON.parse(f.stringifyData);
      let totalScore = 0;
      f.stringifyData = stringifyData && stringifyData.length > 0 ? stringifyData.map(f => {
        f.id = this.helper.generateUuid();
        totalScore += f.score;
        return f;
      }) : [];
      f.totalScore = totalScore;
      return f;
    });
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
