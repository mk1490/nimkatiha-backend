import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdatePublishedTestDto } from './dto/create-update-published-test-dto';

@Controller('published-test')
export class PublishedTestController extends BaseController {

  constructor() {
    super();
  }

  @Get('/initialize')
  async initialize() {
    const items = await this.prisma.tests.findMany();
    return {
      tests: items.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
    };
  }

  @Get('/list')
  async getList(/*@CurrentMember() currentMember*/) {


    /*await this.prisma.answered_tests.findMany({
      where:{
        userId:
      }
    })*/

    return await this.prisma.published_tests.findMany();
  }

  @Post()
  async create(@Body() input: CreateUpdatePublishedTestDto) {
    return await this.prisma.published_tests.create({
      data: {
        testTemplateId: input.testId,
        isRandom: input.isRandom,
      },
    });
  }

  @Delete('/:id')
  async delete(@Param('id') id) {
    await this.prisma.published_tests.delete({
      where: {
        id,
      },
    });
  }

}
