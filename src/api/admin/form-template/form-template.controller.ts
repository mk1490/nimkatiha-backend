import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
}
