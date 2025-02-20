import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateCourseDto } from './dto/create-update-course-dto';

@Controller('course')
export class CourseController extends BaseController {


  constructor() {
    super();
  }


  @Get('/initialize')
  async initialize() {
    const coachCategories = await this.prisma.coach_categories.findMany();
    return {
      coachCategories: coachCategories.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
    };
  }


  @Get('/list')
  async getList() {
    return await this.prisma.course.findMany();
  }


  @Post()
  async create(@Body() input: CreateUpdateCourseDto) {
    const transactions = [];

    const id = this.helper.generateUuid();
    transactions.push(this.prisma.course.create({
      data: {
        id,
        title: input.title,
      },
    }));
    transactions.push(this.prisma.course_visibility_for.createMany({
      data: input.joinedCategoryIds.map(f => {
        return {
          courseId: id,
          coachCategoryId: f,
        };
      }),
    }));
    await this.prisma.$transaction(transactions);
  }

  @Put('/:id')
  async update(@Param('id') id) {

    return await this.prisma.course.update({
      where: {
        id,
      },
      data: {},
    });
  }

}
