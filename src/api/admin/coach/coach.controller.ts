import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateCoachDto } from './dto/create-update-coach-dto';

@Controller('coach')
export class CoachController extends BaseController {


  constructor() {
    super();
  }

  @Get('/list')
  async getList() {
    const items = await this.prisma.coachs.findMany();
    return items.map(f => {
      delete f.password;
      return f;
    });
  }


  @Post()
  async create(@Body() input: CreateUpdateCoachDto) {

    const transactions = [];

    transactions.push(this.prisma.coachs.create({
      data: {
        name: input.name,
        family: input.family,
        nationalCode: input.nationalCode,
        mobileNumber: input.mobileNumber,
        username: input.username,
        password: await this.helper.generateHashPassword(input.password),
      },
    }));

    await this.prisma.$transaction(transactions);
  }

  @Put()
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateCoachDto) {
    return await this.prisma.coachs.create({
      select: {
        password: false,
        id: true,
        name: true,
        mobileNumber: true,
        family: true,
        username: true,
        nationalCode: true,
      },
      data: {
        name: input.name,
        family: input.family,
        nationalCode: input.nationalCode,
        mobileNumber: input.mobileNumber,
        username: input.username,
        password: await this.helper.generateHashPassword(input.password),
      },
    });
  }


}
