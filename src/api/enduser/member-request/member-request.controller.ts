import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { UpdatePersonalInformationDto } from './dto/update-personal-information-dto';
import { CurrentUser } from '../../../base/decorators/current-user.decorator';
import { CurrentUserModel } from '../../../base/interfaces/current-user.interface';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as mkdirp from 'mkdirp';
import { writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { UpdateProductItemDto } from './dto/update-product-item-dto';
import { UpdateMarketSelectionDto } from './dto/update-market-selection-dto';
import { MemberStatuses } from '../../../base/enums/memberStatuses';
import { CoreService } from '../../../service/core/core.service';
import { UpdateParentInformationDto } from './dto/update-parent-information-dto';

@Controller('member-request')
export class MemberRequestController extends BaseController {


  constructor(
    private readonly coreService: CoreService,
  ) {
    super();
  }


  @Put('/personal-information')
  async updatePersonalInformation(
    @CurrentMember() currentMember,
    @Body() input: UpdatePersonalInformationDto) {


    await this.prisma.members.update({
      where: {
        id: currentMember.id,
      },
      data: {
        name: input.name,
        family: input.family,
        fatherName: input.fatherName,
        nationalCode: input.nationalCode,
        disabilityStatus: input.disabilityStatus,
        educationLevel: input.educationLevel,
        maritalStatus: input.maritalStatus,
        disabilityDescription: input.disabilityDescription,
        birthDate: input.birthDate,
        partnerJob: input.partnerJob,
        address: input.address,
        childrenCounts: Number(input.childrenCounts),
        diseaseBackground: Number(input.diseaseBackground),
        diseaseBackgroundDescription: input.diseaseBackgroundDescription,
        religion: input.religion,
        city: input.city,
      },
    });
  }

  @Put('/parent-information')
  async updateParentInformation(
    @CurrentMember() currentMember,
    @Body() input: UpdateParentInformationDto) {


    await this.prisma.members.update({
      where: {
        id: currentMember.id,
      },
      data: {
        fatherFamily: input.fatherFamily,
        fatherName: input.fatherName,
        fatherEducationLevel: input.fatherEducationLevel,
        fatherEducationLevelFifeSituation: input.fatherEducationLevelFifeSituation,
        motherFamily: input.motherFamily,
        motherName: input.motherName,
        motherEducationLevel: input.motherEducationLevel,
        motherEducationLevelFifeSituation: input.motherEducationLevelFifeSituation,
        singleChild: input.singleChild,
        familyMembers: Number(input.familyMembers),
      },
    });
  }

  @Put('/educational')
  async updateEducational(
    @CurrentMember() currentMember,
    @Body() input) {


    await this.prisma.members.update({
      where: {
        id: currentMember.id,
      },
      data: {
        educational: JSON.stringify(input),
      },
    });
  }


  @Put('/executive')
  async updateExecutive(
    @CurrentMember() currentMember,
    @Body() input) {


    await this.prisma.members.update({
      where: {
        id: currentMember.id,
      },
      data: {
        executiveHistory: JSON.stringify(input),
      },
    });
  }

  @Put('/educationalAndHistorical')
  async updateEducationalAndHistorical(
    @CurrentMember() currentMember,
    @Body() input) {


    await this.prisma.members.update({
      where: {
        id: currentMember.id,
      },
      data: {
        educationalAndHistorical: JSON.stringify(input),
      },
    });
  }


  @Put('/educational-courses')
  async updateEducationalCourses(
    @CurrentMember() currentMember,
    @Body() input: UpdateMarketSelectionDto) {


    await this.prisma.members.update({
      where: {
        id: currentMember.id,
      },
      data: {
        educationalCourses: JSON.stringify(input),
        status: MemberStatuses.WaitingForAccept
      },
    });
  }


  @Get('/initialize/:step')
  async initialize(
    @Param('step') currentStep,
    @CurrentMember() currentMember,
  ) {
    const item = await this.prisma.members.findFirst({
      where: {
        id: currentMember.id,
      },
    });

    switch (currentStep) {

      case 'verifyPhoneNumber': {
        return {
          isVerify: !!currentMember,
        };
      }

      case 'general-information': {


        return {
          model: {
            name: item.name,
            family: item.family,
            fatherName: item.fatherName,
            birthDate: item.birthDate,
            educationLevel: item.educationLevel,
            disabilityStatus: item.disabilityStatus,
            disabilityDescription: item.disabilityDescription,
            childrenCounts: item.childrenCounts,
            maritalStatus: item.maritalStatus,
            partnerJob: item.partnerJob,
            address: item.address,
            nationalCode: item.nationalCode,
            religion: item.religion,
            diseaseBackground: item.diseaseBackground,
            diseaseBackgroundDescription: item.diseaseBackgroundDescription,
            city: item.city,

          },
          initialize: {
            educationLevels: this.coreService.educationLevels,
            religionItems: this.coreService.religionItems,
            disabilityStatus: this.coreService.disabilityStatus,
            diseaseBackgroundItems: this.coreService.diseaseBackgroundItems,
            cityItems: await this.coreService.cityItems(),
          },

        };
      }


      case 'parent-information': {
        return {
          initialize: {
            educationLevels: this.coreService.educationLevels,
            lifeSituationItems: this.coreService.lifeSituationItems,
            singleChildItems: this.coreService.singleChildItems,
          },
          model: {
            singleChild: item.singleChild,
            familyMembers: item.familyMembers,
            father: {
              name: item.fatherName,
              family: item.fatherFamily,
              educationLevel: item.fatherEducationLevel,
              lifeSituation: item.fatherEducationLevelFifeSituation,
            },
            mother: {
              name: item.motherName,
              family: item.motherFamily,
              educationLevel: item.motherEducationLevel,
              lifeSituation: item.motherEducationLevelFifeSituation,
            },
          },
        };
      }
      case 'educational-status' : {
        if (item.educational) {
          return JSON.parse(item.educational);
        }
        return null;
      }
      case 'executive' : {
        if (item.executiveHistory) {
          return JSON.parse(item.executiveHistory);
        }
        return null;
      }
      case 'educational-historical' : {
        if (item.educationalAndHistorical) {
          return JSON.parse(item.educationalAndHistorical);
        }
        return null;
      }
      case 'educational-courses' : {
        if (item.educationalCourses) {
          return {
            initialize:{
              tarheVelayat: this.coreService.tarheVelayatItems,
              astaneQods: this.coreService.astaneQodsItems,
              oqaf: this.coreService.oqafItems,
            },
            model: JSON.parse(item.educationalCourses)
          };
        }
        return null;
      }
      default:
        break;
    }
  }


  @Put('/market-selection')
  async updateMarketSelection(
    @CurrentMember() currentMember,
    @Body() input: UpdateMarketSelectionDto) {
    const marketItem = await this.prisma.markets.findFirst({
      where: {
        id: input.marketId,
      },
    });


    await this.prisma.reversed_markets.deleteMany({
      where: {
        marketId: marketItem.id,
        isPurchased: false,
      },
    });

    await this.prisma.reversed_markets.createMany({
      data: input.deskIds.map(f => {
        return {
          marketId: marketItem.id,
          deskId: f,
          userId: currentMember.id,
          isPurchased: false,
        };
      }),
    });
  }


  @Post('/final-approval')
  async sendFinalApproval(@CurrentMember() currentMember) {
    await this.prisma.members.update({
      where: {
        id: currentMember.id,
      },
      data: {
        status: MemberStatuses.WaitingForAccept,
      },
    });
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @Post('/upload-file/:itemId')
  async uploadFile(
    @Param('itemId') itemId,
    @UploadedFile() file: Express.Multer.File,
    @CurrentMember() currentMember) {
    const item = await this.prisma.upload_document_template.findFirst({
      where: {
        id: itemId,
      },
    });
    const directory = global.directories.uploadedDocuments(currentMember.id);
    mkdirp.sync(directory);
    writeFileSync(directory + '/' + item.title + '.jpg', file.buffer);
    return {};
  }


  @Get('/market-desks/:marketId')
  async getMarketDesksByMarketId(@Param('marketId') marketId) {
    const items = await this.prisma.market_desks.findMany({
      where: {
        parentMarketId: marketId,
      },
    });
    return items.map(f => {
      return {
        value: f.id,
        title: f.title,
      };
    });
  }

}
