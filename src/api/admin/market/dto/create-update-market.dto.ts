import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateMarketDto {

  @ApiProperty()
  title: string;

  @ApiProperty()
  activityStartDate: string;

  @ApiProperty()
  activityEndDate: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  deskCount: number;

  @ApiProperty()
  location: string;

}
