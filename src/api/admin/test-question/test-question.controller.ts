import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateTestQuestionDto } from './dto/create-update-test-question-dto';

@Controller('test-question')
export class TestQuestionController extends BaseController {


  constructor() {
    super();
  }


  @Get('/initialize')
  async initialize() {
    return {
      types: this.questionTypes,
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

  @Post()
  async create(@Body() input: CreateUpdateTestQuestionDto) {
    const transactions = [];

    const id = this.helper.generateUuid();


    let answers = [];
    let correctAnswer = null;
    for (let i = 0; i < 4; i++) {
      answers.push(this.helper.generateUuid());
      if (i == input.correctAnswer) {
        correctAnswer = answers[i];
      }
    }

    transactions.push(this.prisma.test_question_answer_items.createMany({
      data: input.items.map((f, i) => {
        return {
          label: f.title,
          value: answers[i],
          parentTestQuestionId: id,
        };
      }),
    }));


    transactions.push(this.prisma.test_questions.create({
      data: {
        id,
        questionTitle: input.title,
        questionType: input.type,
        parentId: input.parentId,
        correctAnswerId: correctAnswer,
        questionScore: Number(input.score),
      },
    }));


    await this.prisma.$transaction(transactions);
    return await this.prisma.test_questions.findFirst({
      where: {
        id,
      },
    });
  }


  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateTestQuestionDto) {
    const transactions = [];


    let answers = [];
    let correctAnswer = null;
    for (let i = 0; i < 4; i++) {
      answers.push(this.helper.generateUuid());
      if (i == input.correctAnswer) {
        correctAnswer = answers[i];
      }
    }


    transactions.push(this.prisma.test_question_answer_items.deleteMany({
      where: {
        parentTestQuestionId: id,
      },
    }));


    transactions.push(this.prisma.test_question_answer_items.createMany({
      data: input.items.map((f, i) => {
        return {
          label: f.title,
          value: answers[i],
          parentTestQuestionId: id,
        };
      }),
    }));


    transactions.push(this.prisma.test_questions.create({
      data: {
        id,
        questionTitle: input.title,
        questionType: input.type,
        parentId: input.parentId,
        correctAnswerId: correctAnswer,
        questionScore: Number(input.score),
      },
    }));


    await this.prisma.$transaction(transactions);
    return {};
  }

  get questionTypes() {
    return [
      this.helper.getKeyValue('چهار گزینه ای', 1),
      this.helper.getKeyValue('تشریحی', 2),
    ];
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





