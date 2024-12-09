import { Controller, Get, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('answered-tests')
export class AnsweredTestsController extends BaseController {

  constructor() {
    super();
  }

  @Get('/list')
  async getList() {
    return await this.prisma.$queryRawUnsafe(`
        select at.id,
               m.id     memberId,
               m.mobileNumber,
               pt.title testTitle,
               at.creationTime
        from member_answered_tests at
            inner join members m
        on m.id = at.userId inner join published_tests pt on pt.id = at.publishedTestItemId
    `);
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
