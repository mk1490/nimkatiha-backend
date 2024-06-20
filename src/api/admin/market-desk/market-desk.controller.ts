import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateMarketDeskDto } from './dto/create-update-market-desk-dto';

@Controller('market-desk')
export class MarketDeskController extends BaseController {


  constructor() {
    super();
  }


  @Get('/list/:marketId')
  async getDesksListByMarketId(@Param('marketId') marketId) {
    return await this.prisma.market_desks.findMany({
      where: {
        parentMarketId: marketId,
      },
    });
  }


  @Post()
  async create(@Body() input: CreateUpdateMarketDeskDto) {
    return await this.prisma.market_desks.create({
      data: {
        parentMarketId: input.marketId,
        title: input.title,
        amount: Number(input.amount),
        number: input.number,
      },
    });
  }


  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateMarketDeskDto) {
    return await this.prisma.market_desks.update({
      where: {
        id: id,
      },
      data: {
        parentMarketId: input.marketId,
        title: input.title,
        amount: Number(input.amount),
        number: input.number,
      },
    });
  }


  @Post()
  async delete(@Param('id') id) {
    return await this.prisma.market_desks.delete({
      where: {
        id: id,
      },
    });
  }


}
