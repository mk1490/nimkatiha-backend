import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateMarketDeskDto {


  @ApiProperty()
  marketId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  amount: string;


  @ApiProperty()
  number: number;

}
