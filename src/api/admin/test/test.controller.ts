import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateTestDto } from './dto/create-update-test-dto';

@Controller('test')
export class TestController extends BaseController {

  constructor() {
    super();
  }

  @Get('/list')
  async getList() {
    return await this.prisma.tests.findMany();
  }


  @Get('/:id')
  async getDetails(@Param('id') id) {
    const item = await this.prisma.tests.findFirst({
      where: {
        id,
      },
    });
    const questions = await this.prisma.test_questions.findMany();
    return {
      ...item,
      questions,
    };
  }



  @Post()
  async create(@Body() input: CreateUpdateTestDto) {
    return await this.prisma.tests.create({
      data: {
        title: input.title,
        slug: input.slug
      },
    });
  }

}
