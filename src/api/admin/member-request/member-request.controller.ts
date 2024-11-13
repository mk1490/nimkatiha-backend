import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { MemberStatuses } from '../../../base/enums/memberStatuses';
import { CoreService } from '../../../service/core/core.service';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { readdirSync } from 'fs';
import * as test from 'node:test';
import { CurrentUserModel } from '../../../base/interfaces/current-user.interface';
import { CurrentUser } from '../../../base/decorators/current-user.decorator';

@Controller('member-request')
export class MemberRequestController extends BaseController {

  constructor(
    private readonly coreService: CoreService,
  ) {
    super();
  }


  @Post('/list')
  async getList(
    @CurrentUser() currentUser: CurrentUserModel,
    @Body() input) {
    const items = await this.prisma.members.findMany({
      select: {
        id: true,
        name: true,
        family: true,
        fatherName: true,
        creationTime: true,
        questionnaireId: true,
      },
      where: {
        status: MemberStatuses.WaitingForAccept,
        questionnaireId: input.tests.length > 0 ? {
          in: input.tests,
        } : undefined,
      },
    });


    const user_available_questionnairies = await this.prisma.user_available_questionnairies.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    const testItems = await this.prisma.test_templates.findMany({
      where: {
        id: {
          in: user_available_questionnairies.map(f => f.questionnaireId),
        },
      },
    });

    return {
      initialize: {
        filter: {
          tests: testItems.map(f => {
            return {
              title: f.title,
              id: f.id,
            };
          }),
        },
      },
      items: items.map(f => {
        const testItem = testItems.find(x => x.id == f.questionnaireId);
        f['questionnaireTitle'] = testItem ? testItem.title : '';
        return f;
      }),
    };
  }


  @Get('/download-excel-list')
  async downloadExcelList(@Query('questionnaireId') questionnaireId) {


    const educationLevels = this.coreService.educationLevels;
    const items = await this.prisma.members.findMany({
      where: {
        questionnaireId: questionnaireId,
      },
    });


    const finalItems = items.map(f => {
      f.educational = JSON.parse(f.educational);
      f.educationalCourses = JSON.parse(f.educationalCourses);
      f.educationalAndHistorical = JSON.parse(f.educationalAndHistorical);
      f.executiveHistory = JSON.parse(f.executiveHistory);


      delete f.password;
      return f;
    });


    return {
      initialize: this.coreService.initializeItems,
      items: finalItems,
    };
  }


  @Get('/:id')
  async getDetails(
    @Param('id') id: string) {
    const item = await this.prisma.members.findFirst({
      where: {
        id: id,
      },
    });
    let uploadedDocuments = [];


    const directory = global.directories.uploadedDocuments(item.id);


    // const filesInDirectory = readdirSync(directory);

    // filesInDirectory.map(f => {
    //   uploadedDocuments.push({
    //     title: f.replaceAll('.jpg', ''),
    //     url: `/api/public-files/uploaded-documents/${item.id}/${f}`,
    //   });
    // });

    let educational = { ...JSON.parse(item.educational) };
    let executiveHistory = [...JSON.parse(item.executiveHistory)];

    executiveHistory = executiveHistory.map(f => {
      return {
        title: f.title,
        value: f.post + ', ' + f.postHistory,
      };
    });

    let educationalAndHistorical = [...JSON.parse(item.educationalAndHistorical)];
    let educationalCourses = { ...JSON.parse(item.educationalCourses) };

    Object.keys(educationalCourses).map(f => {
      let value = educationalCourses[f];

      if (value) {
        switch (f) {
          case 'tarheVelayat': {
            let item = this.coreService.tarheVelayatItems.find(x => x.value === value);
            if (item) {
              value = item.title;
            }
            break;
          }
          case 'astaneQods': {
            let title = '';
            value = value.map((f, i) => {
              title += this.coreService.astaneQodsItems.find(x => x.value === f).title + (i > 0 ? ', ' : '');
            });
            value = title;
            break;
          }
          case 'oqaf': {
            let title = '';
            value.map((f, i) => {
              title += this.coreService.oqafItems.find(x => x.value === f).title + (i >= 0 ? ', ' : '');
            });
            value = title;
            break;
          }
        }
      }
      educationalCourses[f] = value;
    });


    return {
      initialize: this.coreService.initializeItems,
      model: {
        ...item,
        educational,
        executiveHistory,
        educationalAndHistorical,
        educationalCourses,
        uploadedDocuments,
      },

    };
  }
}
