import { ApiProperty } from '@nestjs/swagger';
import { FormInputTypes } from '../../../../base/enums/formInputTypes';

export class CreateUpdateFormTemplateItemDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  parentId: string;


  @ApiProperty()
  type: FormInputTypes;


  @ApiProperty()
  size: number;

  @ApiProperty()
  isRequired: boolean;


}