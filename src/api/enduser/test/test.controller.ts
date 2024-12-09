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
    const publishedTests = await this.prisma.published_tests.findMany({
      where: {
        isActive: true,
      },
    });
    const answeredTests = await this.prisma.answered_tests.findMany({
      where: {
        userId: currentMember.id,
      },
    });


    const publishedTestItems = await this.prisma.published_test_question_items.findMany();


    return publishedTests.map(f => {
      const publishedTestItem = publishedTestItems.find(x => x.parentPublishedTestId == f.id);
      const testItem = items.find(x => x.id == publishedTestItem.testTemplateId);
      let status = !!answeredTests.find(x => x.testId == testItem.id && x.status == TestStatuses.Success);
      return {
        id: f.id,
        title: f.title,
        status: status ? 1 : 0,
      };
    });
  }


  @Get('/initialize/:publishedTestId')
  async initialize(
    @CurrentMember() currentMember,
    @Param('publishedTestId') publishedTestId) {


    const publishedTestItem = await this.prisma.published_tests.findFirst({
      where: {
        id: publishedTestId,
      },
    });


    if (!publishedTestItem)
      throw new NotAcceptableException('لینک آژمون درخواستی معتبر نیست');


    const answerTestItem = await this.prisma.answered_tests.findFirst({
      where: {
        userId: currentMember.id,
        testId: publishedTestId.id,
      },
    });
    if (answerTestItem && answerTestItem.endTime < new Date())
      throw new NotAcceptableException('زمان آزمون به پایان رسیده است!');
    else if (answerTestItem && answerTestItem.status === TestStatuses.Success)
      throw new NotAcceptableException('قبلا در این آزمون شرکت کرده‌اید.');


    const transactions = [];


    const publishedTestQuestionItems = await this.prisma.published_test_question_items.findMany({
      where: {
        parentPublishedTestId: publishedTestItem.id,
      },
    });

    const testItems = await this.prisma.tests.findMany();


    let questions = [];

    await Promise.all(publishedTestQuestionItems.map(async (f) => {
      const testItem = testItems.find(x => x.id == f.testTemplateId);
      let tempQuestions = await this.prisma.test_questions.findMany({
        where: {
          parentId: testItem.id,
        },
      });

      if (f.isRandom)
        tempQuestions = [...tempQuestions].sort(() => 0.5 - Math.random()).slice(0, f.questionRandomNumbers);

      questions.push(...tempQuestions);


      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + publishedTestItem.time);

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


      transactions.push(this.prisma.answered_test_items.createMany({
        data: tempQuestions.map(questionItem => {
          return {
            questionId: questionItem.id,
            answerContent: null,
            parentAnswerItemId: id,
          };
        }),
      }));


    }));


    await this.prisma.$transaction(transactions);


    const answerItems = await this.prisma.test_question_answer_items.findMany();

    return {
      title: publishedTestItem.title,
      questions: questions.map(f => {
        return {
          id: f.id,
          title: f.questionTitle,
          type: f.questionType,
          items: answerItems.filter(x => x.parentTestQuestionId == f.id).map(f => {
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
