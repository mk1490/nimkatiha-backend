import { ApiProperty } from '@nestjs/swagger';

export class SingleProductItemDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  ownProduct: boolean;


}