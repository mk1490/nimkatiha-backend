import { Body, Controller, Get, NotAcceptableException, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { TestDto } from './dto/test-dto';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';

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
      return {
        id: testItem.id,
        title: testItem.title,
        slug: testItem.slug,
        status: (!!answeredTests.find(x => x.testId == testItem.id)) ? 1 : 0,
      };
    });
  }


  @Get('/initialize/:id')
  async initialize(@Param('id') id) {
    const testItem = await this.prisma.tests.findFirst({
      where: {
        id: id,
      },
    });

    if (!testItem)
      throw new NotAcceptableException('لینک آژمون درخواستی معتبر نیست');


    const questions = await this.prisma.test_questions.findMany({
      where: {
        parentId: testItem.id,
      },
    });


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
      },
    });

    if (item) {
      throw new NotAcceptableException('قبلا در این آزمون شرکت کرده‌اید.');
    }
    const id = this.helper.generateUuid();

    const transactions = [];
    transactions.push(this.prisma.answered_tests.create({
      data: {
        id,
        testId: input.testId,
        userId: currentMember.id,
      },
    }));


    let dataItems = [];
    Object.keys(input.items).map(objectKey => {
      dataItems.push({
        questionId: objectKey,
        answerContent: input.items[objectKey].toString(),
        parentAnswerItemId: id,
      });
    });

    transactions.push(this.prisma.answered_test_items.createMany({
      data: dataItems,
    }));

    await this.prisma.$transaction(transactions);
  }

}
