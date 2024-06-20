import { ApiProperty } from '@nestjs/swagger';

export class UpdatePersonalInformationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  family: string;

  @ApiProperty()
  fatherName: string;

  @ApiProperty()
  educationLevel: number;

  @ApiProperty()
  childrenCounts: number;

  @ApiProperty()
  disabilityStatus: number;

  @ApiProperty()
  partnerJob: string;

  @ApiProperty()
  maritalStatus: number;

  @ApiProperty()
  disabilityDescription: string;

  @ApiProperty()
  nationalCode: string;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  job: string;

  @ApiProperty()
  address: string;

}