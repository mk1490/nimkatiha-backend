import { Controller, Get } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('course')
export class CourseController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList() {
    const items = await this.prisma.course.findMany();
    return items.map(f => {
      return {
        title: f.title,
        id: f.id,
      };
    });
  }

}
