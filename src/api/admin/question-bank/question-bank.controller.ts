import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateQuestionBankDto } from './dto/create-update-question-bank-dto';
import { CreateUpdateQuestionItemDto } from './dto/create-update-question-item-dto';

@Controller('question-bank')
export class QuestionBankController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList() {
    return await this.prisma.question_bank.findMany();
  }

  @Get('/initialize')
  async initialize() {
    return {
      id: this.helper.generateUuid(),
      questionTypes: this.questionTypes,
    };
  }


  @Get('/:parentPublishedTestId')
  async getDetailsById(@Param('parentPublishedTestId') parentPublishedTestId) {

    const item = await this.prisma.question_bank.findFirst({
      where: {
        id: parentPublishedTestId,
      },
    });


    const questions = await this.prisma.question_bank_questions.findMany({
      where: {
        parentId: item.id,
      },
    });

    return {
      ...item,
      questions,
    };
  }


  @Post('/add-or-update-question-item/:id?')
  async addQuestionToBank(
    @Param('id') id,
    @Body() input: CreateUpdateQuestionItemDto,
  ) {

    let answers = [];
    let correctAnswer = null;
    for (let i = 0; i < 4; i++) {
      answers.push(this.helper.generateUuid());
      if (i == input.correctAnswer) {
        correctAnswer = answers[i];
      }
    }


    if (id) {
      await this.prisma.question_bank_questions.update({
        where: {
          id,
        },
        data: {
          parentId: input.parentQuestionBankId,
          questionScore: input.score,
          questionType: input.type,
          questionTitle: input.title,
          correctAnswerId: correctAnswer,
        },
      });
    } else {
      await this.prisma.question_bank_questions.create({
        data: {
          parentId: input.parentQuestionBankId,
          questionScore: input.score,
          questionType: input.type,
          questionTitle: input.title,
          correctAnswerId: correctAnswer,
        },
      });
    }

  }


  @Post()
  async createOrUpdateQuestionBank(@Body() input: CreateUpdateQuestionBankDto) {
    const item = await this.prisma.question_bank.findFirst({
        where: {
          id: input.id,
        },
      },
    );

    if (item) {
      return await this.prisma.question_bank.update({
        where: {
          id: item.id,
        },
        data: {
          title: input.title,
        },
      });
    } else {
      return await this.prisma.question_bank.create({
        data: {
          id: input.id,
          title: input.title,
        },
      });
    }
  }


  get questionTypes() {
    return [
      this.helper.getKeyValue('چهار گزینه ای', 1),
      this.helper.getKeyValue('تشریحی', 2),
    ];
  }

}
