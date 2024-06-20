import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateUpdateMarketDto } from './dto/create-update-market.dto';
import { BaseController } from '../../../base/base-controller';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('market')
@Controller('market')
export class MarketController extends BaseController {


  @Post()
  async create(@Body() input: CreateUpdateMarketDto) {
    const id = this.helper.generateUuid();
    const market = this.prisma.markets.create({
      data: {
        id: id,
        title: input.title,
        amount: input.amount,
        activityEndDate: new Date(input.activityEndDate),
        activityStartDate: new Date(input.activityStartDate),
        location: input.location,
      },
    });

    const desks = this.prisma.market_desks.createMany({
      data: Array.from(Array(input.deskCount).keys()).map((f, i) => {
        const numberOfDesk = i + 1;
        return {
          parentMarketId: id,
          number: numberOfDesk,
          title: 'میز شماره' + ' ' + numberOfDesk,
          amount: input.amount,
        };
      }),
    });


    const transaction = await this.prisma.$transaction([market, desks]);
    return await this.prisma.markets.findFirst({
      where: {
        id: id,
      },
    });
  }

  @Get('/list')
  async findAll() {
    const items: any[] = await this.prisma.$queryRawUnsafe(`
        select m.*,
               (select count(*) from market_desks md where md.parentMarketId = m.id) desksCount
        from markets m
    `);
    console.log(items);
    return items.map(f => {
      f.desksCount = Number(f.desksCount);
      return f;
    });
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() input: CreateUpdateMarketDto) {
    return this.prisma.markets.update({
      where: {
        id: id,
      },
      data: {
        title: input.title,
        amount: input.amount,
        activityEndDate: input.activityEndDate,
        activityStartDate: input.activityStartDate,
        location: input.location,
      },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.markets.delete({
      where: {
        id: id,
      },
    });
  }


}
