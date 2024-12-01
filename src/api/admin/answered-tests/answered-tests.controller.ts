import { Controller, Get } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('answered-tests')
export class AnsweredTestsController extends BaseController {

  constructor() {
    super();
  }

  @Get('/list')
  async getList() {
    return await this.prisma.$queryRawUnsafe(`
        select m.id,
               m.mobileNumber,
               t.title testTitle,
               at.creationTime
        from answered_tests at
         inner join members m
        on m.id = at.userId
            inner join tests t on t.id = at.testId
    `);
  }

}
