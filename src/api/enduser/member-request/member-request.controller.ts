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
      },
    });
  }


  @Put('/product-items')
  async updateProductItems(
    @CurrentMember() currentMember,
    @Body() input: UpdateProductItemDto) {

    await this.prisma.members_product_items.deleteMany({
      where: {
        parentMemberId: currentMember.id,
      },
    });

    await this.prisma.members_product_items.createMany({
      data: input.items.map(f => {
        return {
          title: f.title,
          ownProduct: f.ownProduct,
          parentMemberId: currentMember.id,
        };
      }),
    });
  }

  @Get('/initialize/:step')
  async initialize(
    @Param('step') currentStep,
    @CurrentMember() currentMember,
  ) {
    switch (currentStep) {

      case 'verifyPhoneNumber': {
        return {
          isVerify: !!currentMember,
        };
      }

      case 'general-information': {
        const item = await this.prisma.members.findFirst({
          where: {
            id: currentMember.id,
          },
        });
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
          },
          initialize: this.coreService.initializeItems,
        };
      }
      case 'uploaded-document': {
        const items = await this.prisma.upload_document_template.findMany({});

        const finalItems = [];
        items.map(item => {
          const fileDir = join(global.directories.uploadedDocuments(currentMember.id), item.title + '.jpg');
          let payload = {
            id: item.id,
            title: item.title,
            isRequired: item.isRequired,
            maximumSizeInMb: item.maximumSizeInMb,
            image: existsSync(fileDir) ? `/api/public-files/uploaded-documents/${currentMember.id}/${item.title}.jpg` : null,
          };
          if (!item.showWhen) {
            finalItems.push(payload);
          } else {
            if (currentMember.disabilityStatus === 2 && item.showWhen === 'hasDisable') {
              finalItems.push(payload);
            }
          }
        });
        return finalItems;
      }
      case 'product-items': {
        return await this.prisma.members_product_items.findMany({ where: { parentMemberId: currentMember.id } });
      }
      case 'market': {
        const markets = await this.prisma.markets.findMany({
          where: {},
        });
        let finalMarkets = markets.map(f => {
          return {
            value: f.id,
            title: f.title,
          };
        });


        const desks = await this.prisma.reversed_markets.findMany({
          where: {
            userId: currentMember.id,
            isPurchased: false,
          },
        });
        let marketItem;
        if (desks.length > 0) {
          marketItem = await this.prisma.markets.findFirst({
            where: {
              id: desks[0].marketId,
            },
          });
        }


        return {
          items: finalMarkets,
          selectedMarketId: marketItem ? marketItem.id : null,
          selectedMarketTitle: marketItem ? marketItem.title : null,
          selectedDeskIds: desks.map((f) => {
            return {
              deskId: f.deskId,
            };
          }),
        };
      }
      case 'final-approve': {

        return {
          ...currentMember,
        };
      }
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
