import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('coach-category')
export class CoachCategoryController extends BaseController {

  constructor() {
    super();
  }

  @Get('/list')
  async getList() {
    return await this.prisma.coach_categories.findMany();
  }


  @Post('/add-update{/:id}')
  async createOrUpdate(
    @Param('id') id,
    @Body('title') title,
  ) {
    if (!id) {
      return await this.prisma.coach_categories.create({
        data: {
          title: title,
        },
      });
    } else {
      return await this.prisma.coach_categories.update({
        where: {
          id,
        },
        data: {
          title: title,
        },
      });
    }
  }


}
