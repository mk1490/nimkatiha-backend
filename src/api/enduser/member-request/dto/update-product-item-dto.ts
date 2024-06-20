import { ApiProperty } from '@nestjs/swagger';
import { SingleProductItemDto } from './single-product-item-dto';

export class UpdateProductItemDto {

  @ApiProperty()
  items: SingleProductItemDto[];

}