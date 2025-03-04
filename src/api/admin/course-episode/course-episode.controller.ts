import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateCourseEpisodeDto } from './dto/create-update-course-episode-dto';

@Controller('course-episode')
export class CourseEpisodeController extends BaseController {

  constructor() {
    super();
  }

  @Get('initialize')
  async initialize() {
    const testTemplates = await this.prisma.question_bank.findMany();
    return {
      types: [
        this.helper.getKeyValue('ویدئو', 1),
        this.helper.getKeyValue('آزمون', 2),
      ],
      testBanks: testTemplates.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
    };
  }

  @Get('/:parentId')
  async getList(@Param('parentId') parentId) {
    return await this.prisma.course_episodes.findMany({
      where: {
        parentCourseId: parentId,
      },
    });
  }


  @Post()
  async create(@Body() input: CreateUpdateCourseEpisodeDto) {
    const transactions = [];

    const id = this.helper.generateUuid();

    transactions.push(this.prisma.course_episodes.create({
      data: {
        id,
        title: input.title,
        type: input.type,
        parentCourseId: input.parentId,
        metaData: input.metaData,
      },
    }));

    transactions.push(this.prisma.course_episode_joined_categories.createMany({
      data: input.joinedCategoryIds.map(f => {
        return {
          parentCourseEpisodeId: id,
          parentCategoryId: f,
        };
      }),
    }));

    await this.prisma.$transaction(transactions);
    return await this.prisma.course_episodes.findFirst({
      where: {
        id,
      },
    });
  }

  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateCourseEpisodeDto) {
    const transactions = [];

    transactions.push(this.prisma.course_episodes.update({
      where: {
        id,
      },
      data: {
        title: input.title,
        type: input.type,
        metaData: input.metaData,
      },
    }));


    transactions.push(this.prisma.course_episode_joined_categories.deleteMany({
      where: {
        parentCourseEpisodeId: id,
      },
    }));

    transactions.push(this.prisma.course_episode_joined_categories.createMany({
      data: input.joinedCategoryIds.map(f => {
        return {
          parentCourseEpisodeId: id,
          parentCategoryId: f,
        };
      }),
    }));

    await this.prisma.$transaction(transactions);
    return await this.prisma.course_episodes.findFirst({
      where: {
        id,
      },
    });
  }


  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() input: CreateUpdateCourseEpisodeDto) {


    return await this.prisma.course_episodes.update({
      where:{
        id,
      },
      data: {
        title: input.title,
        type: input.type,
        parentCourseId: input.parentId,
        metaData: input.metaData,
      },
    });
  }


}
