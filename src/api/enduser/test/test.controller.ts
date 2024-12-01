import { Controller, Get, NotAcceptableException, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('test')
export class TestController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList() {
    const items = await this.prisma.tests.findMany();

    const publishedTests = await this.prisma.published_tests.findMany();

    return publishedTests.map(f => {
      const testItem = items.find(x => x.id == f.testTemplateId);
      return {
        title: testItem.title,
        id: testItem.id,
        slug: testItem.slug,
      };
    });
  }


  @Get('/initialize/:slug')
  async initialize(@Param('slug') slug) {
    const testItem = await this.prisma.tests.findFirst({
      where: {
        slug: slug,
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

}
