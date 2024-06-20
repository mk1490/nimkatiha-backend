import { Controller, Get, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { MemberStatuses } from '../../../base/enums/memberStatuses';
import { CoreService } from '../../../service/core/core.service';
import { CurrentMember } from '../../../base/decorators/current-member.decorator';
import { readdirSync } from 'fs';

@Controller('member-request')
export class MemberRequestController extends BaseController {

  constructor(
    private readonly coreService: CoreService,
  ) {
    super();
  }


  @Get('list')
  async getList() {


    const items = await this.prisma.members.findMany({
      where: {
        status: MemberStatuses.WaitingForAccept,
      },
    });
    return items;

  }

  @Get(':id')
  async getDetails(
    @Param('id') id: string) {
    const item = await this.prisma.members.findFirst({
      where: {
        id: id,
      },
    });
    const productItems = await this.prisma.members_product_items.findMany({
      where: {
        parentMemberId: item.id,
      },
      select: {
        title: true,
        ownProduct: true,
      },
    });

    let uploadedDocuments = [];


    const directory = global.directories.uploadedDocuments(item.id);


    const filesInDirectory = readdirSync(directory);

    filesInDirectory.map(f => {
      uploadedDocuments.push({
        title: f.replaceAll('.jpg', ''),
        url: `/api/public-files/uploaded-documents/${item.id}/${f}`,
      });
    });


    return {
      initialize: this.coreService.initializeItems,
      model: {
        ...item,
        productItems: productItems,
        uploadedDocuments,
      },

    };
  }
}
