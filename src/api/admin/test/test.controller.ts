import { Body, Controller, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateTestDto } from './dto/create-update-test-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('test')
export class TestController extends BaseController {

  constructor() {
    super();
  }

  @Get('/list')
  async getList() {
    const testQuestions = await this.prisma.test_questions.findMany();

    const items = await this.prisma.tests.findMany();
    return items.map(f => {
      f['questionsCount'] = testQuestions.filter(x => x.parentId == f.id).length;
      return f;
    });
  }


  @Get('/:id')
  async getDetails(@Param('id') id) {
    const item = await this.prisma.tests.findFirst({
      where: {
        id,
      },
    });
    const questions = await this.prisma.test_questions.findMany({
      where: {
        parentId: item.id,
      },
    });
    return {
      ...item,
      questions,
    };
  }


  @Post()
  async create(@Body() input: CreateUpdateTestDto) {
    const item = await this.prisma.tests.create({
      data: {
        title: input.title,
        slug: input.slug,
      },
    });
    return {
      ...item,
      questionsCount: await this.prisma.test_questions.count({
        where: {
          parentId: item.id,
        },
      }),
    };
  }


  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  @Post('/insert-many/:parentTestId')
  async insertManyFromExcel(
    @Param('parentTestId') parentTestId,
    @UploadedFile() file: Express.Multer.File, @Req() { user }) {
    const excelToJson = require('convert-excel-to-json');
    const json = excelToJson({
      source: file.buffer,
    });

    function getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    }


    let totalUpdate = 0, totalInsert = 0, totalFailed = 0;

    const items = Object.entries(json)[0][1] as any[];
    for (let i: number = 1; i < items.length; i++) {
      const item = items[i];
      const questionText = item[getKeyByValue(items[0], 'متن سوال')] || null;
      const questionScore = Number(item[getKeyByValue(items[0], 'نمره')]) || 0;
      let correctAnswer = item[getKeyByValue(items[0], 'گزینه صحیح')] || null;
      const questionOne = {
        label: item[getKeyByValue(items[0], 'الف')] || null,
        id: this.helper.generateUuid(),
      };
      const questionTwo = {
        label: item[getKeyByValue(items[0], 'ب')] || null,
        id: this.helper.generateUuid(),
      };
      const questionThree = {
        label: item[getKeyByValue(items[0], 'ج')] || null,
        id: this.helper.generateUuid(),
      };
      const questionFour = {
        label: item[getKeyByValue(items[0], 'د')] || null,
        id: this.helper.generateUuid(),
      };

      let questionType = item[getKeyByValue(items[0], 'نوع سوال')] || null;

      if (questionType == 'چهار گزینه ای') {
        questionType = 1;
      }

      const transactions = [];
      try {

        const questionId = this.helper.generateUuid();

        transactions.push(this.prisma.test_question_answer_items.createMany({
          data: [
            {
              label: questionOne.label,
              value: questionOne.id,
              parentTestQuestionId: questionId,
            },
            {
              label: questionTwo.label,
              value: questionTwo.id,
              parentTestQuestionId: questionId,
            },
            {
              label: questionThree.label,
              value: questionThree.id,
              parentTestQuestionId: questionId,
            },
            {
              label: questionFour.label,
              value: questionFour.id,
              parentTestQuestionId: questionId,
            },
          ],
        }));

        let correctAnswerId: string = null;
        switch (correctAnswer) {
          case 'الف':
            correctAnswerId = questionOne.id;
            break;
          case 'ب':
            correctAnswerId = questionTwo.id;
            break;
          case 'ج':
            correctAnswerId = questionThree.id;
            break;
          case 'د':
            correctAnswerId = questionFour.id;
            break;
        }


        transactions.push(this.prisma.test_questions.create({
          data: {
            id: questionId,
            questionScore,
            questionTitle: questionText,
            questionType: questionType,
            parentId: parentTestId,
            correctAnswerId,
          },
        }));
        await this.prisma.$transaction(transactions);
        totalInsert++;
      } catch (e) {
        totalFailed++;
      }
    }

    const addedItems = await this.prisma.test_questions.findMany({
      where: {
        parentId: parentTestId,
      },
    });


    return {
      totalInsert,
      totalUpdate,
      totalFailed,
      items: addedItems,
    };
  }

  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateTestDto) {
    return {
      ...await this.prisma.tests.update({
        data: {
          title: input.title,
        },
        where: {
          id,
        },
      }),
      questionsCount: await this.prisma.test_questions.count({
        where: {
          parentId: id,
        },
      }),
    };
  }

}
