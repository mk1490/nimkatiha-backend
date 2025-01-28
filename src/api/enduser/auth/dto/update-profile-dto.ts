import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  family: string;


  @ApiProperty()
  city: string;

  @ApiProperty()
  nationalCode: string;

  @ApiProperty()
  schoolName: string;

  @ApiProperty()
  fatherName: string;

  @ApiProperty()
  educationLevel: string;

  @ApiProperty()
  zone: string;

  @ApiProperty()
  mobileNumber: string;
}
