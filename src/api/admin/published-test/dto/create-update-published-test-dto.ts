import { ApiProperty } from '@nestjs/swagger';
import { QuestionItemsDto } from './question-items-dto';

export class CreateUpdatePublishedTestDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  endDescription: string;

  @ApiProperty()
  time: number;


  @ApiProperty()
  items: QuestionItemsDto[] = [];
}
