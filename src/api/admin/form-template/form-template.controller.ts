import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateFormTemplateDto } from './dto/create-update-form-template-dto';
import { FormInputTypes } from '../../../base/enums/formInputTypes';

@Controller('form-template')
export class FormTemplateController extends BaseController {

  constructor() {
    super();
  }


  @Get('/list')
  async getList() {
    return await this.prisma.form_templates.findMany();
  }


  @Get('/items/:id')
  async getDetails(@Param('id') id) {
    return await this.prisma.for;
  }

  @Post()
  async create(@Body() input: CreateUpdateFormTemplateDto) {
    return await this.prisma.form_templates.create({
      data: {
        id: this.helper.generateUuid(),
        title: input.title,
      },
    });
  }


  @Delete('/:id')
  async delete(@Param('id') id) {
    const transactions = [];
    transactions.push(this.prisma.form_templates.deleteMany({
      where: {
        id: id,
      },
    }));

    transactions.push(this.prisma.form_template_items.deleteMany({
      where: {
        parentId: id,
      },
    }));

    await this.prisma.$transaction(transactions);
  }
}
