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
    return await this.prisma.$queryRawUnsafe(`
        select pt.id, t.title, pt.isRandom
        from published_tests pt
                 inner join tests t on pt.testTemplateId = t.id
    `);
  }

  @Post()
  async create(@Body() input: CreateUpdatePublishedTestDto) {
    const item = await this.prisma.published_tests.create({
      data: {
        testTemplateId: input.testId,
        isRandom: input.isRandom,
      },
    });

    const testItem = await this.prisma.tests.findFirst({
      where: {
        id: item.testTemplateId,
      },
    });

    return {
      id: item.id,
      title: testItem.title,
      isRandom: item.isRandom,
    };
  }

  @Delete('/:id')
  async delete(@Param('id') id) {
    console.log(id);
    await this.prisma.published_tests.delete({
      where: {
        id,
      },
    });
  }

}
