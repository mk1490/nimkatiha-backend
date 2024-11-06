import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateTestTemplateDto } from './dto/create-update-test-template-dto';

@Controller('test-template')
export class TestTemplateController extends BaseController {

  constructor() {
    super();
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


    const disabledForm = await this.prisma.test_template_disabled_form.findMany({
      where: {
        parentId: item.id,
      },
    });

    return {
      ...item,
      disabledForm: disabledForm.map(f => {
        return f.key;
      }),
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
      },
    }));


    transaction.push(this.prisma.test_template_disabled_form.createMany({
      data: input.keys.map(f => {
        return {
          parentId: id,
          key: f,
        };
      }),
    }));

    await this.prisma.$transaction(transaction);
  }

}
