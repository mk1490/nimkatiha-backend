import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateCoachDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  family: string;

  @ApiProperty()
  categories: string[];

  @ApiProperty()
  nationalCode: string;

  @ApiProperty()
  mobileNumber: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}
