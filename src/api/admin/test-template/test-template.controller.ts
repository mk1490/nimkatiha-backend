import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateTestTemplateDto } from './dto/create-update-test-template-dto';

@Controller('test-template')
export class TestTemplateController extends BaseController {

  constructor() {
    super();
  }

  @Get('/initialize')
  async initialize() {


    const formTemplates = await this.prisma.form_templates.findMany();

    return {
      formTemplates: formTemplates.map(f => {
        return this.helper.getKeyValue(f.title, f.id);
      }),
    };
  }

  @Get('/list')
  async getList() {
    return await this.prisma.test_templates.findMany();
  }

  @Get('/:id')
  async getDetails(@Param('id') id) {
    const item = await this.prisma.test_templates.findFirst({
      where: {
        id,
      },
    });


    const testTemplateLevels = await this.prisma.test_template_levels.findMany({
      where: {
        parentId: item.id,
      },
    });

    return {
      data: {
        ...item,
        items: testTemplateLevels,
      },
      initialize: await this.initialize(),
    };
  }

  @Post()
  async create(@Body() input: CreateUpdateTestTemplateDto) {
    const transaction = [];
    const id = this.helper.generateUuid();


    transaction.push(this.prisma.test_templates.create({
      data: {
        id: id,
        title: input.title,
        slug: input.slug,
        authRequired: input.authRequired,
        preText: input.preText,
        afterText: input.afterText,
      },
    }));


    transaction.push(this.prisma.test_template_levels.createMany({
      data: input.items.map(f => {
        return {
          parentId: id,
          levelTitle: f.levelTitle,
          formId: f.formId,
        };
      }),
    }));

    await this.prisma.$transaction(transaction);


    return this.prisma.test_templates.findFirst({
      where: {
        id,
      },
    });
  }

  @Put('/change-status/:id')
  async changeStatus(
    @Param('id') id,
    @Body('status') status,
  ) {
    await this.prisma.test_templates.update({
      where: {
        id,
      },
      data: {
        visible: status,
      },
    });
  }

  @Put('/update-level-item-form/:id')
  async updateLevelItem(
    @Param('id') id,
    @Body('newId') newId,
  ) {
    const item = await this.prisma.test_template_levels.update({
      data: {
        formId: newId,
      },
      where: {
        id,
      },
    });
    return {
      id: item.id,
      levelTitle: item.levelTitle,
    };
  }


  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateTestTemplateDto) {
    const transaction = [];


    const item = await this.prisma.test_templates.findFirst({
      where: {
        id,
      },
    });


    transaction.push(this.prisma.test_templates.update({
      where: {
        id,
      },
      data: {
        title: input.title,
        slug: input.slug,
        authRequired: input.authRequired,
        preText: input.preText,
        afterText: input.afterText,
      },
    }));

    await this.prisma.$transaction(transaction);


    return this.prisma.test_templates.findFirst({
      where: {
        id: item.id,
      },
    });
  }


  @Post('/add-level-item/:parentId')
  async addLevelItem(@Param('parentId') parentId) {
    const items = await this.prisma.test_template_levels.findMany({
      where: {
        parentId: parentId,
      },
    });


    const item = await this.prisma.test_template_levels.create({
      data: {
        parentId: parentId,
        levelTitle: 'مرحله ' + (items.length + 1),
        formId: '',
      },
    });
    return {
      id: item.id,
      levelTitle: item.levelTitle,
    };
  }


  @Delete('/:id')
  async deleteTestTemplate(@Param('id') id) {

    const transactions = [];


    const item = await this.prisma.form_templates.findFirst({
      where: {
        id,
      },
    });

    transactions.push(this.prisma.test_templates.delete({
      where: {
        id,
      },
    }));


    await this.prisma.$transaction(transactions);
  }

  @Delete('/delete-level-item/:id')
  async deleteLevelItem(@Param('id') id) {
    await this.prisma.test_template_levels.deleteMany({
      where: {
        id,
      },
    });
  }


}
