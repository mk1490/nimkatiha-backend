import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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


  @Get('/:parentPublishedTestId')
  async getDetails(@Param('parentPublishedTestId') parentPublishedTestId) {

    const item = await this.prisma.course.findFirst({
      where: {
        id: parentPublishedTestId,
      },
    });
    const joinedItems = await this.prisma.course_visibility_for.findMany({
      where: {
        courseId: item.id,
      },
    });

    return {
      data: {
        ...item,
        joinedCategoryIds: joinedItems.map(f => f.coachCategoryId),
      },
      initialize: await this.initialize(),
    };
  }


  @Post()
  async create(@Body() input: CreateUpdateCourseDto) {
    const transactions = [];

    const id = this.helper.generateUuid();
    transactions.push(this.prisma.course.create({
      data: {
        id,
        title: input.title,
        content: input.content,
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
  async update(
    @Param('id') id: string,
    @Body() input: CreateUpdateCourseDto,
  ) {

    const transactions = [];

    transactions.push(this.prisma.course.update({
      where: {
        id,
      },
      data: {
        title: input.title,
        content: input.content,
      },
    }));

    transactions.push(this.prisma.course_visibility_for.deleteMany({
      where: {
        courseId: id,
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
    return await this.prisma.course.findFirst({
      where: {
        id,
      },
    });
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.prisma.course.delete({
      where: {
        id,
      },
    });
  }
}
