import { ApiProperty } from '@nestjs/swagger';
import { FormInputTypes } from '../../../../base/enums/formInputTypes';

export class CreateUpdateFormTemplateItemDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  parentId: string;

  @ApiProperty()
  items: any[];


  @ApiProperty()
  type: FormInputTypes;


  @ApiProperty()
  minLength: number;


  @ApiProperty()
  maxLength: number;


  @ApiProperty()
  size: number;

  @ApiProperty()
  isRequired: boolean;


  @ApiProperty()
  visibilityCondition: string;

  @ApiProperty()
  visibilityConditionValue: string;
}
