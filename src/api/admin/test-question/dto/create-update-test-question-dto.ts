import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateTestQuestionDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  type: number;

  @ApiProperty()
  items: any[];

  @ApiProperty()
  parentId: string;

  @ApiProperty()
  correctAnswer: number;

  @ApiProperty()
  score: number;
}
