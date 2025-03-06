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
        select c.id,
               c.name,
               c.family,
               c.nationalCode,
               c.mobileNumber
        from coachs c
    `);
  }


  @Get('/:id')
  async getDetails(@Param('id') id: string) {
    const item = await this.prisma.coachs.findFirst({
      where: {
        id: id,
      },
    });

    const categories = await this.prisma.coach_joined_categories.findMany({
      where: {
        coachId: item.id,
      },
    });
    return {
      initialize: await this.initialize(),
      data: {
        ...item,
        categories: categories.map(f => f.categoryId),
      },
    };
  }


  @Post()
  async create(@Body() input: CreateUpdateCoachDto) {

    const transactions = [];

    const id = this.helper.generateUuid();
    transactions.push(this.prisma.coachs.create({
      data: {
        id,
        name: input.name,
        family: input.family,
        nationalCode: input.nationalCode,
        mobileNumber: input.mobileNumber,
        username: input.username,
        password: input.password ? await this.helper.generateHashPassword(input.password) : null,
      },
    }));


    transactions.push(this.prisma.coach_joined_categories.createMany({
      data: input.categories.map(f => {
        return {
          coachId: id,
          categoryId: f,
        };
      }),
    }));

    await this.prisma.$transaction(transactions);
  }

  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateCoachDto) {
    const transactions = [];

    transactions.push(this.prisma.coachs.update({
      where: {
        id,
      },
      data: {
        name: input.name,
        family: input.family,
        nationalCode: input.nationalCode,
        mobileNumber: input.mobileNumber,
        username: input.username,
      },
    }));
    transactions.push(this.prisma.coach_joined_categories.deleteMany({
      where: {
        coachId: id,
      },
    }));

    transactions.push(this.prisma.coach_joined_categories.createMany({
      data: input.categories.map(f => {
        return {
          coachId: id,
          categoryId: f,
        };
      }),
    }));


    await this.prisma.$transaction(transactions);
    return await this.prisma.coachs.findFirst({
      where: {
        id,
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
