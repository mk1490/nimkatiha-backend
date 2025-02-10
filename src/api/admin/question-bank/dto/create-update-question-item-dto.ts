import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateQuestionItemDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  type: number;

  @ApiProperty()
  items: any[];

  @ApiProperty()
  parentQuestionBankId: string;

  @ApiProperty()
  correctAnswer: number;

  @ApiProperty()
  score: number;
}