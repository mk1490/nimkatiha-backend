import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('test-question')
export class TestQuestionController extends BaseController {


  constructor() {
    super();
  }


  @Get('/initialize')
  async initialize() {
    return {
      // types: this.questionTypes,
    };
  }

  @Get('/:id')
  async getDetails(@Param('id') id) {
    const item = await this.prisma.test_questions.findFirst({
      where: { id },
    });

    if (item.questionType == 1) {
      item['items'] = await this.prisma.test_question_answer_items.findMany({
        where: {
          parentTestQuestionId: item.id,
        },
      });
    }

    return {
      data: item,
      initialize: await this.initialize(),
    };
  }




  @Delete('/:id')
  async delete(@Param('id') id) {
    const item = await this.prisma.test_questions.findFirst({
      where: {
        id,
      },
    });

    const transaction = [];

    transaction.push(this.prisma.test_questions.delete({
      where: {
        id,
      },
    }));

    transaction.push(this.prisma.test_question_answer_items.deleteMany({
      where: {
        parentTestQuestionId: item.id,
      },
    }));

    await this.prisma.$transaction(transaction);
  }


}





