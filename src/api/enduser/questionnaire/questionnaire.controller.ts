import { Controller, Get, UnauthorizedException, UseGuards } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { JwtAuthGuard } from '../../auth/jwt-auth-guard';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';

@Controller('questionnaire')
export class QuestionnaireController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList(@CurrentMember() currentMember) {
    const testQuestions = await this.prisma.test_templates.findMany();
    const questionnaireMembers = await this.prisma.questionnaire_members.findMany({
      where: {
        memberId: currentMember.id,
      },
    });

    return testQuestions.map(f => {
      return {
        title: f.title,
        slug: f.slug,
        status: !!questionnaireMembers.find(x => x.questionnaireId == f.id),
      };
    });
  }

}
