import {ApiProperty} from "@nestjs/swagger";

export class CalculateRateDto {

    @ApiProperty()
    projectId: string;

    @ApiProperty()
    customerId: string;

    @ApiProperty()
    amountValue: number;
}