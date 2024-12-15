import { ApiProperty } from '@nestjs/swagger';

export class QuestionItemsDto {
  @ApiProperty()
  testId: string;


  @ApiProperty()
  isRandom: boolean;


  @ApiProperty()
  randomCount: number;


}
