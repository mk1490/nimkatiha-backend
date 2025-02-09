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
  authenticationRequired: boolean;

  @ApiProperty()
  slug?: string;

  @ApiProperty()
  educationalConditions: string[];

  @ApiProperty()
  items: QuestionItemsDto[] = [];
}
