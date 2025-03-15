import { Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../../base/base-controller';

@Controller('coach-test')
export class CoachTestController extends BaseController {

  constructor() {
    super();
  }


  @Get('/initialize')
  async initialize() {
    const courses = await this.prisma.course.findMany();
    return {
      courses: courses.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
    };
  }


  @Post('/list')
  async getReport() {
    return await this.prisma.$queryRawUnsafe(`
        select mat.id                        reportId,
               c.id                          coachId,
               concat(c.name, ' ', c.family) fullName,
               mat.publishedTestItemId       questionBankId,
               mat.creationTime
        from member_answered_tests mat
                 inner join coachs c on c.id = mat.userId
        order by mat.creationTime desc

    `);
  }


  @Get('/:id')
  async getDetails(@Param('id') id) {
    const item =  await this.prisma.member_answered_tests.findFirst({
      where:{
        id,
      }
    });

    return await this.prisma.$queryRawUnsafe(`
        select ati.answerContent,
               qb.questionTitle,
               qb.questionType,
               (case
                    when qb.questionType = 1 then (select tqai.label
                                                   from test_question_answer_items tqai
                                                   where tqai.value = ati.answerContent)
                    else ati.answerContent
                   end)
                   answerContent
        from answered_test_items ati
                 inner join question_bank_questions qb on ati.questionId = qb.id
        where parentAnswerItemId = '${item.id}'
    `)

  }

}
