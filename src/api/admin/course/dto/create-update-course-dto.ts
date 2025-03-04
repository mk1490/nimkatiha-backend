import { ApiProperty } from '@nestjs/swagger';

export class CreateUpdateCourseDto{
  @ApiProperty()
  title: string;

  @ApiProperty()
  joinedCategoryIds: string[];
}
