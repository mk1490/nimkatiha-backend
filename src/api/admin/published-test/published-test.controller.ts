import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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
    const items: any[] = await this.prisma.$queryRawUnsafe(`
        select pt.id,
               pt.title,
               pt.isActive,
               (select count(*) from answered_test_items ati where ati.parentAnswerItemId = pt.id) questionBankCount
        from published_tests pt
    `);
    return items.map(f => {
      f.questionBankCount = Number(f.questionBankCount);
      return f;
    });
  }

  @Post()
  async create(@Body() input: CreateUpdatePublishedTestDto) {
    const transactions = [];


    const id = this.helper.generateUuid();

    transactions.push(this.prisma.published_tests.create({
      data: {
        id,
        title: input.title,
        description: input.description,
        endDescription: input.endDescription,
        time: Number(input.time),
        isActive: true,
      },
    }));


    transactions.push(this.prisma.published_test_question_items.createMany({
      data: input.items.map(f => {
        return {
          parentPublishedTestId: id,
          testTemplateId: f.testId,
          isRandom: f.isRandom,
          questionRandomNumbers: Number(f.randomCount),
        };
      }),
    }));

    await this.prisma.$transaction(transactions);


    const item = await this.prisma.published_tests.findFirst({
      where: {
        id,
      },
    });

    return {
      id: item.id,
      title: item.title,
      count: await this.prisma.published_test_question_items.count({
        where: {
          parentPublishedTestId: id,
        },
      }),
    };
  }


  @Put('/change-status/:id')
  async changeStatus(
    @Param('id') id,
    @Body('status') status: boolean,
  ) {

    await this.prisma.published_tests.update({
      where: {
        id,
      },
      data: {
        isActive: Boolean(status),
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
