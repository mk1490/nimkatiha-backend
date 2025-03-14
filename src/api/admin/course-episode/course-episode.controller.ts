import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateCourseEpisodeDto } from './dto/create-update-course-episode-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { homedir } from 'os';
import e from 'express';
import { writeFileSync } from 'fs';
import { mkdirp } from 'mkdirp';

@Controller('course-episode')
export class CourseEpisodeController extends BaseController {

  constructor() {
    super();
  }

  @Get('initialize')
  async initialize() {
    const questionsBank = await this.prisma.question_bank.findMany();
    const prerequisites = await this.prisma.course_episodes.findMany();
    return {
      types: [
        this.helper.getKeyValue('ویدئو', 1),
        this.helper.getKeyValue('آزمون', 2),
        this.helper.getKeyValue('فایل پیوست', 3),
        this.helper.getKeyValue('تکلیف', 4),
      ],
      questionsBank: questionsBank.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
      prerequisites: prerequisites.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
    };
  }

  @Get('/:parentId')
  async getList(@Param('parentId') parentId) {
    return await this.prisma.course_episodes.findMany({
      where: {
        parentCourseItemId: parentId,
      },
    });
  }


  @Post('/upload-file/:parentId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(
    @Param('parentId') parentId,
    @UploadedFile() file: Express.Multer.File) {
    const dir = global.directories.courseEpisodeAttachments(parentId);

    mkdirp.sync(dir);

    const fileName = file.originalname;

    writeFileSync(dir + '/' + fileName, file.buffer);

    await this.prisma.course_episodes.update({
      where: {
        id: parentId,
      },
      data: {
        metaData: fileName,
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
        parentCourseItemId: input.parentId,
        prerequisites: input.prerequisites,
        metaData: input.metaData || '',
      },
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
        prerequisites: input.prerequisites,
        metaData: input.metaData || '',
      },
    }));


    await this.prisma.$transaction(transactions);
    return await this.prisma.course_episodes.findFirst({
      where: {
        id,
      },
    });
  }
}
