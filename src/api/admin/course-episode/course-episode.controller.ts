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


    return await this.prisma.course_episodes.create({
      data: {
        title: input.title,
        type: input.type,
        parentCourseId: input.parentId,
        metaData: input.metaData,
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
