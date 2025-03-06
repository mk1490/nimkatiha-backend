import { Controller, Get, NotAcceptableException, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import axios from 'axios';
import { to } from 'await-to-js';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { CurrentCoach } from '../../../base/decorators/current-coach-decorator';

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
      if (item.type == 1) {
        const [err, result] = await to(axios.get(item.metaData));
        if (!err) {
          const sourceItem = result.data.source.find(x => x.type == 'application/x-mpegURL');
          return {
            id: item.id,
            status: ovserveItem ? 1 : 0,
            videoUrl: sourceItem.src,
          };
        }
      }

    }


    return {};

  }


  @Get('/:id')
  async getDetails(@Param('id') id: string) {
    const item = await this.prisma.course.findFirst({
      where: {
        id,
      },
    });


    const courseItems = await this.prisma.course_episodes.findMany({
      where: {
        parentCourseId: item.id,
      },
    });
    return {
      ...item,
      items: courseItems.map(f => {
        return {
          id: f.id,
          title: f.title,
          type: f.type,
        };
      }),
    };
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
