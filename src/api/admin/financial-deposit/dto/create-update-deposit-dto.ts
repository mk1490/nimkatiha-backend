import { ApiProperty } from '@nestjs/swagger';
import { DepositItemDto } from './deposit-item-dto';

export class CreateUpdateDepositDto {


  @ApiProperty()
  depositItems: DepositItemDto[];


  @ApiProperty()
  description: string;
}