import { Body, Controller, Get, NotAcceptableException, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { TestDto } from './dto/test-dto';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import * as test from 'node:test';
import { TestStatuses } from '../../../base/enums/TestStatuses';

@Controller('test')
export class TestController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList(@CurrentMember() currentMember) {
    const items = await this.prisma.tests.findMany();
    const publishedTests = await this.prisma.published_tests.findMany();
    const answeredTests = await this.prisma.answered_tests.findMany({
      where: {
        userId: currentMember.id,
      },
    });


    return publishedTests.map(f => {

      const testItem = items.find(x => x.id == f.testTemplateId);
      let status = !!answeredTests.find(x => x.testId == testItem.id && x.status == TestStatuses.Success);
      return {
        id: testItem.id,
        title: testItem.title,
        slug: testItem.slug,
        status: status ? 1 : 0,
      };
    });
  }


  @Get('/initialize/:id')
  async initialize(
    @CurrentMember() currentMember,
    @Param('id') id) {
    const testItem = await this.prisma.tests.findFirst({
      where: {
        id: id,
      },
    });

    if (!testItem)
      throw new NotAcceptableException('لینک آژمون درخواستی معتبر نیست');


    const publishedTestItem = await this.prisma.published_tests.findFirst({
      where: {
        testTemplateId: testItem.id,
      },
    });


    const answerTestItem = await this.prisma.answered_tests.findFirst({
      where: {
        userId: currentMember.id,
        testId: testItem.id,
      },
    });


    let questions = await this.prisma.test_questions.findMany({
      where: {
        parentId: testItem.id,
      },
    });


    const transactions = [];


    const shuffledArray = [...questions].sort(() => 0.5 - Math.random());


    if (!answerTestItem) {
      let endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + testItem.time);


      const id = this.helper.generateUuid();

      transactions.push(this.prisma.answered_tests.create({
        data: {
          id,
          testId: testItem.id,
          status: TestStatuses.Incomplete,
          endTime: endTime,
          userId: currentMember.id,
        },
      }));


      questions = shuffledArray.slice(0, publishedTestItem.questionRandomNumbers);
      transactions.push(this.prisma.answered_test_items.createMany({
        data: questions.map(f => {
          return {
            questionId: f.id,
            answerContent: null,
            parentAnswerItemId: id,
          };
        }),
      }));


    } else {
      if (answerTestItem.endTime < new Date())
        throw new NotAcceptableException('زمان آزمون به پایان رسیده است!');
      if (answerTestItem.status === TestStatuses.Success)
        throw new NotAcceptableException('قبلا در این آزمون شرکت کرده‌اید.');


      const answeredTestItems = await this.prisma.answered_test_items.findMany({
        where: {
          parentAnswerItemId: answerTestItem.id,
        },
      });

      questions = await this.prisma.test_questions.findMany({
        where: {
          id: {
            in: answeredTestItems.map(f => f.questionId),
          },
        },
      });


    }

    await this.prisma.$transaction(transactions);


    const items = await this.prisma.test_question_answer_items.findMany();


    return {
      title: testItem.title,
      questions: questions.map(f => {
        return {
          id: f.id,
          title: f.questionTitle,
          type: f.questionType,
          items: items.filter(x => x.parentTestQuestionId == f.id).map(f => {
            return {
              label: f.label,
              value: f.value,
            };
          }),
        };
      }),
    };
  }


  @Post()
  async submit(
    @CurrentMember() currentMember,
    @Body() input: TestDto) {


    const item = await this.prisma.answered_tests.findFirst({
      where: {
        testId: input.testId,
        userId: currentMember.id,
        status: TestStatuses.Success,
      },
    });

    if (item) {
      throw new NotAcceptableException('قبلا در این آزمون شرکت کرده‌اید.');
    }


    const answerTestItem = await this.prisma.answered_tests.findFirst({
      where: {
        testId: input.testId,
        userId: currentMember.id,
      },
    });


    const questions = await this.prisma.test_questions.findMany();
    const testQuestionAnswerItems = await this.prisma.test_question_answer_items.findMany();


    const transactions = [];
    transactions.push(this.prisma.answered_tests.updateMany({
      where: {
        id: answerTestItem.id,
      },
      data: {
        status: TestStatuses.Success,
      },
    }));

    let stringifyAnswerItems = [];


    Object.keys(input.items).map(objectKey => {
      const answer = input.items[objectKey];

      const questionId = objectKey;


      transactions.push(this.prisma.answered_test_items.updateMany({
        where: {
          questionId: questionId,
          parentAnswerItemId: answerTestItem.id,
        },
        data: {
          answerContent: answer ? answer.toString() : null,
        },
      }));

      const questionItem = questions.find(x => x.id == questionId);
      const answerItem = testQuestionAnswerItems.find(x => x.value == answer);


      const isCorrect = answerItem ? answerItem.id == questionItem.correctAnswerId : false;

      stringifyAnswerItems.push({
        questionTitle: questionItem ? questionItem.questionTitle : '',
        answerContent: answerItem ? answerItem.label : null,
        isCorrect: isCorrect,
        score: isCorrect == true ? questionItem.questionScore : 0,
      });

    });


    transactions.push(this.prisma.answered_tests.update({
      where: {
        id: answerTestItem.id,
      },
      data: {
        stringifyData: JSON.stringify(stringifyAnswerItems),
      },
    }));


    await this.prisma.$transaction(transactions);
  }

}
