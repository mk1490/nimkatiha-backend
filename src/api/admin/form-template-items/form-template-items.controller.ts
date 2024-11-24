import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';
import { CreateUpdateFormTemplateItemDto } from './dto/create-update-form-template-item-dto';
import { FormInputTypes } from '../../../base/enums/formInputTypes';

@Controller('form-template-items')
export class FormTemplateItemsController extends BaseController {


  constructor() {
    super();
  }


  @Get('/initialize')
  async initialize() {
    const formTypes = [
      this.helper.getKeyValue('متن تک خطی', FormInputTypes.SingleTextInput),
      this.helper.getKeyValue('متن چند خطی', FormInputTypes.MultipleTextInput),
      this.helper.getKeyValue('استان', FormInputTypes.Province),
      this.helper.getKeyValue('شهرستان', FormInputTypes.City),
      this.helper.getKeyValue('تک انتخابی (رادیو باتن)', FormInputTypes.RadioButton),
      this.helper.getKeyValue('تک انتخابی (Selection Box)', FormInputTypes.SingleSelectionBox),
      this.helper.getKeyValue('چند انتخابی (Selection Box)', FormInputTypes.MultipleSelectionBox),
      this.helper.getKeyValue('چک باکس', FormInputTypes.SingleTextInput),
      this.helper.getKeyValue('تاریخ', FormInputTypes.DatePicker),
      this.helper.getKeyValue('ساعت', FormInputTypes.TimePicker),
    ];
    return {
      formTypes,
    };
  }


  @Get('/list/:parentId')
  async getList(@Param('parentId') parentId) {
    return await this.prisma.form_template_items.findMany({
      where: {
        parentId: parentId,
      },
    });
  }


  @Post()
  async create(@Body() input: CreateUpdateFormTemplateItemDto) {
    const randomNumber = Math.random().toString().substr(2, 6);
    return await this.prisma.form_template_items.create({
      data: {
        parentId: input.parentId,
        label: input.label,
        type: input.type,
        size: input.size,
        key: `field_${randomNumber}_${input.type}`,
        isRequired: input.isRequired,
      },
    });
  }


  @Put()
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateFormTemplateItemDto) {
    return await this.prisma.form_template_items.findMany({
      where: {
        parentId: input.parentId,
        label: input.label,
        type: input.type,
        size: input.size,
        isRequired: input.isRequired,
      },
    });
  }


}
