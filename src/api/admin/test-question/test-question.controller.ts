import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
      types: [
        this.helper.getKeyValue('چهار گزینه ای', 1),
        this.helper.getKeyValue('تشریحی', 2),
      ],
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
      },
    }));


    await this.prisma.$transaction(transactions);
    return {};
  }


}





