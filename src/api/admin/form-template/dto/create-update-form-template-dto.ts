import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateFormTemplateDto {
  @ApiProperty()
  title: string;
}