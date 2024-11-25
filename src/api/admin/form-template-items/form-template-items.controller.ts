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
      this.helper.getKeyValue('عدد', FormInputTypes.Number),
      this.helper.getKeyValue('شهرستان', FormInputTypes.City),
      this.helper.getKeyValue('تک انتخابی (رادیو باتن)', FormInputTypes.RadioButton),
      this.helper.getKeyValue('تک انتخابی (Selection Box)', FormInputTypes.SingleSelectionBox),
      this.helper.getKeyValue('چند انتخابی (Selection Box)', FormInputTypes.MultipleSelectionBox),
      this.helper.getKeyValue('چک باکس', FormInputTypes.Checkbox),
      this.helper.getKeyValue('تاریخ', FormInputTypes.DatePicker),
      // this.helper.getKeyValue('ساعت', FormInputTypes.TimePicker),
    ];
    return {
      formTypes,
    };
  }


  @Get('/list/:parentId')
  async getList(@Param('parentId') parentId) {
    const items = await this.prisma.form_template_items.findMany({
      where: {
        parentId: parentId,
      },
    });


    const fieldTypes = await this.initialize();
    return items.map(f => {
      f.type = fieldTypes.formTypes.find(x => x.value == f.type).text;
      return f;
    });
  }

  @Get('/:id')
  async getDetails(@Param('id') id) {

    let payload: any = {};


    const item = await this.prisma.form_template_items.findFirst({
      where: {
        id,
      },
    });

    if ([
      FormInputTypes.RadioButton,
      FormInputTypes.SingleSelectionBox,
      FormInputTypes.MultipleSelectionBox,
      FormInputTypes.Checkbox,
    ].includes(item.type)) {
      payload.items = await this.prisma.form_template_selection_pattern_items.findMany({
        where: {
          parentId: id,
        },
      });
    }
    payload = {
      ...payload,
      ...item,
    };
    return {
      data: payload,
      initialize: await this.initialize(),
    };

  }


  @Post()
  async create(@Body() input: CreateUpdateFormTemplateItemDto) {
    const randomNumber = Math.random().toString().substr(2, 6);
    const transactions = [];


    const id = this.helper.generateUuid();
    transactions.push(this.prisma.form_template_items.create({
      data: {
        id,
        parentId: input.parentId,
        label: input.label,
        type: input.type,
        size: input.size,
        key: `field_${randomNumber}_${input.type}`,
        isRequired: input.isRequired,
      },
    }));


    if ([
      FormInputTypes.RadioButton,
      FormInputTypes.SingleSelectionBox,
      FormInputTypes.MultipleSelectionBox,
      FormInputTypes.Checkbox,
    ]) {
      transactions.push(this.prisma.form_template_selection_pattern_items.createMany({
        data: input.items.map((f, i) => {
          return {
            text: f,
            value: i.toString(),
            parentId: id,
          };
        }),
      }));
    }

    await this.prisma.$transaction(transactions);

    return await this.prisma.form_template_items.findFirst({
      where: {
        id,
      },
    });
  }


  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateFormTemplateItemDto) {


    const transaction = [];
    transaction.push(this.prisma.form_template_selection_pattern_items.createMany({
      data: input.items.map((f, i) => {
        return {
          text: f,
          value: i.toString(),
          parentId: id,
        };
      }),
    }));
    transaction.push(this.prisma.form_template_items.updateMany({
      where: {
        id,
      },
      data: {
        label: input.label,
        type: input.type,
        size: input.size,
        isRequired: input.isRequired,
      },
    }));
    await this.prisma.$transaction(transaction);

    return await this.prisma.form_template_items.findFirst({
      where: {
        id,
      },
    });
  }


}
