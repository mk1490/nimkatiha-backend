import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateTestTemplateDto {
  @ApiProperty()
  title: string;


  @ApiProperty()
  slug: string;


  @ApiProperty()
  items: any[];

  @ApiProperty()
  authRequired: boolean;

  @ApiProperty()
  preText: string;

  @ApiProperty()
  afterText: string;

}
