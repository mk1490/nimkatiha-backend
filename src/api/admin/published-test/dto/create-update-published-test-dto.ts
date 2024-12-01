import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdatePublishedTestDto {
  @ApiProperty()
  testId: string;

  @ApiProperty()
  randomNumbersCount: number;
}
