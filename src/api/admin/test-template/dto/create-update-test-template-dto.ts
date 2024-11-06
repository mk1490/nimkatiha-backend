import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateTestTemplateDto {
  @ApiProperty()
  title: string;


  @ApiProperty()
  slug: string;


  @ApiProperty()
  keys: string[];

}