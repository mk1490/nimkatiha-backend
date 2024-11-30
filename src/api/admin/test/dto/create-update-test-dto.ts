import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateTestDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;


}
