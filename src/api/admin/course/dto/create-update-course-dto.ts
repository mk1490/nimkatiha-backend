import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateCourseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  joinedCategoryIds: string[];
}
