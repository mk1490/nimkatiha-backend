import { Body, Controller, Get, NotAcceptableException, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import axios from 'axios';
import { to } from 'await-to-js';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { CurrentCoach } from '../../../base/decorators/current-coach-decorator';
import { TestStatuses } from '../../../base/enums/TestStatuses';

@Controller('course')
export class CourseController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList(@CurrentCoach() currentCoach) {
    return await this.prisma.$queryRawUnsafe(`
        select c.*
        from course c
                 inner join course_visibility_for cvf on cvf.courseId = c.id
                 inner join coach_joined_categories cjc on cjc.categoryId = cvf.coachCategoryId
        where cjc.coachId = '${currentCoach.id}'
        group by c.id
    `);
  }


  @Get(`/episode-details/:episodeId`)
  async getEpisodeDetail(
    @CurrentCoach() currentCoach,
    @Param('episodeId') episodeId: string) {
    const item = await this.prisma.course_episodes.findFirst({
      where: {
        id: episodeId,
      },
    });


    const ovserveItem = await this.prisma.course_observed_episode_items.findFirst({
      where: {
        episodeId: item.id,
        userId: currentCoach.id,
      },
    });


    if (item.prerequisites) {
      const prequiedItem = await this.prisma.course_observed_episode_items.findFirst({
        where: {
          episodeId: item.prerequisites,
          userId: currentCoach.id,
        },
      });

      const requiredItem = await this.prisma.course_episodes.findFirst({
        where: {
          id: item.prerequisites,
        },
      });
      if (!prequiedItem)
        throw new NotAcceptableException('برای دسترسی به این آیتم ابتدا باید آیتم ' + '«' + requiredItem.title + '»' + ' را تکمیل کرده باشید.');
    }


    if (item) {


    }


    return {};

  }


  @Get('/prepare-test/:questionId')
  async prepareTest(
    @Param('questionId') questionId,
    @CurrentCoach() currentCoach) {
    const questionBankItem = await this.prisma.question_bank.findFirst({
      where: {
        id: questionId,
      },
    });

    const items = await this.prisma.question_bank_questions.findMany({
      where: {
        parentId: questionBankItem.id,
      },
    });

    const answerItems = await this.prisma.test_question_answer_items.findMany();

    return {
      ...questionBankItem,
      items: items.map(f => {
        return {
          id: f.id,
          questionTitle: f.questionTitle,
          type: f.questionType,
          answers: answerItems.filter(x => x.parentTestQuestionId == f.id).map(answerItem => {
            return {
              id: answerItem.id,
              value: answerItem.value,
              label: answerItem.label,
            };
          }),
        };
      }),
    };
  }

  @Get('/:id')
  async getDetails(@Param('id') id: string) {
    const item = await this.prisma.course.findFirst({
      where: {
        id,
      },
    });

    const courseSpecifications = await this.prisma.course


    const courseItems = await this.prisma.course_items.findMany({
      where: {
        parentCourseId: item.id,
      },
      orderBy: {
        creationTime: 'asc',
      },
    });


    const courseChildren = await this.prisma.course_episodes.findMany({
      where: {
        parentCourseItemId: {
          in: courseItems.map(f => f.id),
        },
      },
      orderBy: {
        creationTime: 'asc',
      },
    });


    return {
      ...item,
      items: await Promise.all(courseItems.map(async f => {
        return {
          id: f.id,
          title: f.title,
          children: await Promise.all(courseChildren.filter(x => x.parentCourseItemId == f.id).map(async courseChildItem => {
            const type = courseChildItem.type;
            let payload: any = {
              id: courseChildItem.id,
              title: courseChildItem.title,
              type,
            };
            if (type == 1) {
              const [err, result] = await to(axios.get(courseChildItem.metaData));
              if (!err) {
                const sourceItem = result.data.source.find(x => x.type == 'application/x-mpegURL');
                payload.status = 1;
                payload.videoUrl = sourceItem.src;
              }
            }

            if (type == 3) {
              payload.url = `/api/public-files/course-episode-attachments/${courseChildItem.id}/${courseChildItem.metaData}`;
            } else if (type == 2) {
              payload.questionId = courseChildItem.metaData;
            }
            return payload;
          })),
        };
      })),
    };
  }

  @Post('/test-complete')
  async testComplete(
    @CurrentCoach() currentCoach,
    @Body('items') items,
    @Body('questionId') questionId,
  ) {
    const transactions = [];


    const id = this.helper.generateUuid();

    transactions.push(this.prisma.member_answered_tests.create({
      data: {
        id,
        userId: currentCoach.id,
        status: TestStatuses.Success,
        endTime: new Date(),
        publishedTestItemId: questionId,
      },
    }));
    transactions.push(this.prisma.answered_test_items.createMany({
      data: Object.keys(items).map(questionItem => {
        return {
          questionId: questionItem,
          answerContent: items[questionItem],
          parentAnswerItemId: id,
        };
      }),
    }));

    await this.prisma.$transaction(transactions);
  }


  @Post(`/observe-request/:episodeId`)
  async observeReuqest(@CurrentCoach() currentCoach,
                       @Param('episodeId') episodeId,
  ) {
    const item = await this.prisma.course_observed_episode_items.findFirst({
      where: {
        episodeId: episodeId,
        userId: currentCoach.id,
      },
    });
    if (!item) {
      await this.prisma.course_observed_episode_items.create({
        data: {
          episodeId: episodeId,
          userId: currentCoach.id,
        },
      });
    }
  }
}
