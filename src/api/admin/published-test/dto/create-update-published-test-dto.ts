import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdatePublishedTestDto {
  @ApiProperty()
  testId: string;
}
