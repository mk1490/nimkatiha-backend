import { Controller, Get } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('answered-tests')
export class AnsweredTestsController extends BaseController {

  constructor() {
    super();
  }

  @Get('/list')
  async getList() {
    // await this.prisma.answered_tests.i
  }
}
