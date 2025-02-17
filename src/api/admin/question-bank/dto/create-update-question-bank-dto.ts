import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateQuestionBankDto {

  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}