import {ApiProperty} from "@nestjs/swagger";

export class RegisterDto {

    @ApiProperty()
    projectId: string;


    @ApiProperty()
    name: string;

    @ApiProperty()
    family: string;

    @ApiProperty()
    fatherName: string;

    @ApiProperty()
    birthCertificateNumber: string;

    @ApiProperty()
    nationalCode: string;

    @ApiProperty()
    birthDate: string;

    @ApiProperty()
    birthPlace: string;

    @ApiProperty()
    job: string;

    @ApiProperty()
    mobileNumber: string;

    @ApiProperty()
    housingType: string;

    @ApiProperty()
    monthlyIncome: number;

    @ApiProperty()
    initialCashAmount: number;

    @ApiProperty()
    monthlyInstallmentsAmount: number;

    @ApiProperty()
    suggestedUsableArea: number;
}