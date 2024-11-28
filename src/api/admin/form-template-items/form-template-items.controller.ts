import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

    const patternItems = await this.prisma.form_template_selection_pattern_items.findMany();

    const addedForms = (await this.prisma.form_template_items.findMany({
      where: {
        OR: [
          { type: FormInputTypes.RadioButton },
          { type: FormInputTypes.SingleSelectionBox },
        ],
      },
    })).map(f => {
      return {
        ...this.helper.getKeyValue(f.label, f.id),
        child: patternItems.filter(x => x.parentId == f.id).map(childItem => {
          return {
            ...this.helper.getKeyValue(childItem.text, childItem.id),
            parentId: childItem.parentId,
          };
        }),
      };
    });

    return {
      formTypes,
      addedForms,
    };
  }


  @Get('/list/:parentId')
  async getList(@Param('parentId') parentId) {
    const items = await this.prisma.form_template_items.findMany({
      where: {
        parentId: parentId,
      },
      orderBy: {
        order: 'asc',
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
    const transactions = [];


    const id = this.helper.generateUuid();


    const lastOrderItem = await this.prisma.form_template_items.findFirst({
      where: {
        parentId: input.parentId,
      },
      orderBy: {
        order: 'desc',
      },
    });
    transactions.push(this.prisma.form_template_items.create({
      data: {
        id,
        parentId: input.parentId,
        label: input.label,
        type: input.type,
        size: input.size,
        minimum: Number(input.minLength),
        maximum: Number(input.maxLength),
        key: this.getKey(input.type),
        isRequired: input.isRequired,
        visibilityCondition: input.visibilityCondition,
        visibilityConditionValue: input.visibilityConditionValue,
        order: lastOrderItem ? lastOrderItem.order + 1 : 0,

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
            text: f.title,
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


  @Post('/add-item/:parentId')
  async addItem(
    @Param('parentId') parentId,
  ) {
    const item = await this.prisma.form_template_selection_pattern_items.create({
      data: {
        text: '',
        value: this.helper.generateRandomNumber(6),
        parentId,
      },
    });
    return {
      id: item.id,
    };
  }

  @Put('/update-item-text/:id')
  async updateItemTitle(
    @Param('id') parentId,
    @Body('text') text,
  ) {
    const item = await this.prisma.form_template_selection_pattern_items.update({
      where: {
        id: parentId,
      },
      data: {
        text: text,
      },
    });
    return {
      id: item.id,
    };
  }


  @Delete('/delete-item/:id')
  async deleteItem(
    @Param('id') itemId,
  ) {
    await this.prisma.form_template_selection_pattern_items.delete({
      where: {
        id: itemId,
      },
    });
  }


  @Put('/move/:parentId/:id/:isUp')
  async moveItem(
    @Param('parentId') parentId,
    @Param('id') id,
    @Param('isUp') isUp) {

    const items = await this.prisma.form_template_items.findMany({
      where: {
        parentId: parentId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    const transaction = [];
    if (isUp == '1') {
      transaction.push(this.prisma.form_template_items.update({
        where: { id },
        data: {
          order: items[items.findIndex(x => x.id == id)].order - 1,
        },
      }));
      transaction.push(this.prisma.form_template_items.updateMany({
        where: {
          id: items[items.findIndex(x => x.id == id) - 1].id,
        },
        data: {
          order: items[items.findIndex(x => x.id == id)].order,
        },
      }));
    } else {
      transaction.push(this.prisma.form_template_items.update({
        where: { id },
        data: {
          order: items[items.findIndex(x => x.id == id)].order + 1,
        },
      }));
      transaction.push(this.prisma.form_template_items.updateMany({
        where: {
          id: items[items.findIndex(x => x.id == id) + 1].id,
        },
        data: {
          order: items[items.findIndex(x => x.id == id)].order,
        },
      }));
    }
    await this.prisma.$transaction(transaction);

  }


  @Put('/:id')
  async update(
    @Param('id') id,
    @Body() input: CreateUpdateFormTemplateItemDto) {
    const transaction = [];
    transaction.push(this.prisma.form_template_items.updateMany({
      where: {
        id,
      },
      data: {
        label: input.label,
        type: input.type,
        size: input.size,
        minimum: Number(input.minLength),
        maximum: Number(input.maxLength),
        isRequired: input.isRequired,
        visibilityCondition: input.visibilityCondition,
        visibilityConditionValue: input.visibilityConditionValue,
      },
    }));
    await this.prisma.$transaction(transaction);

    return await this.prisma.form_template_items.findFirst({
      where: {
        id,
      },
    });
  }


  @Delete('/:id')
  async delete(@Param('id') id) {

    const formTemplateItem = await this.prisma.form_template_items.findFirst({
      where: {
        id,
      },
    });


    const transactions = [];

    transactions.push(this.prisma.form_template_items.deleteMany({
      where: {
        id: formTemplateItem.id,
      },
    }));

    await this.prisma.$transaction(transactions);
  }

  getKey(type) {
    const randomNumber = Math.random().toString().substr(2, 6);
    return `field_${randomNumber}_${type}`;
  }

}
