import { ApiProperty } from '@nestjs/swagger';

export class TestDto {
  @ApiProperty()
  testId: string;

  @ApiProperty()
  items: object;

}
