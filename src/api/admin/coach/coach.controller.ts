import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateCoachDto } from './dto/create-update-coach-dto';

@Controller('coach')
export class CoachController extends BaseController {


  constructor() {
    super();
  }


  @Get('/initialize')
  async initialize() {
    const coachCategories = await this.prisma.coach_categories.findMany();
    return {
      coachCategories: coachCategories.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
    };
  }

  @Get('/list')
  async getList() {
    return await this.prisma.$queryRawUnsafe(`
      select
        c.id,
        c.name,
        c.family,
        c.nationalCode,
        c.mobileNumber
        from coachs c
    `)
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
        password: input.password ? await this.helper.generateHashPassword(input.password) : null,
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
        password: input.password ? await this.helper.generateHashPassword(input.password) : null,
      },
    });
  }

  @Delete('/:id')
  async delete(@Param('id') id) {
    const transactions = [];
    transactions.push(this.prisma.coach_categories.deleteMany({
      where: {
        id: id,
      },
    }));
    transactions.push(this.prisma.coach_joined_categories.deleteMany({
      where: {
        categoryId: id,
      },
    }));
    await this.prisma.$transaction(transactions);
  }

}
