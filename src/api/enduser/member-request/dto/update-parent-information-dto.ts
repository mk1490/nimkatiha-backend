import { ApiProperty } from '@nestjs/swagger';

export class UpdateParentInformationDto {

  @ApiProperty()
  fatherName: string;

  @ApiProperty()
  fatherFamily: string;

  @ApiProperty()
  fatherEducationLevel: number;

  @ApiProperty()
  fatherEducationLevelFifeSituation: number;


  @ApiProperty()
  motherName: string;

  @ApiProperty()
  motherFamily: string;

  @ApiProperty()
  motherEducationLevel: number;

  @ApiProperty()
  motherEducationLevelFifeSituation: number;

  @ApiProperty()
  singleChild: number;

  @ApiProperty()
  familyMembers: number;
}