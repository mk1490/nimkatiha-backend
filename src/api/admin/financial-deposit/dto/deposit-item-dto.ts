import { ApiProperty } from '@nestjs/swagger';

export class DepositItemDto {
  @ApiProperty()
  depositTime: Date;

  @ApiProperty()
  amountValue: number;
}