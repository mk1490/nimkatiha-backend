import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateCourseItemDto } from './dto/create-update-course-item-dto';

@Controller('course-items')
export class CourseItemsController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list/:parentId')
  async getList(@Param('parentId') parentId: string) {
    return await this.prisma.course_items.findMany({
      where: {
        parentCourseId: parentId,
      },
    });
  }

  @Post('/:id?')
  async createOrUpdate(
    @Param('id') id: string,
    @Body() input: CreateUpdateCourseItemDto) {
    if (id) {
      return await this.prisma.course_items.update({
        where: {
          id,
        },
        data: {
          title: input.title,
        },
      });
    } else {
      return await this.prisma.course_items.create({
        data: {
          title: input.title,
          parentCourseId: input.parentCourseId,
        },
      });
    }
  }

}
