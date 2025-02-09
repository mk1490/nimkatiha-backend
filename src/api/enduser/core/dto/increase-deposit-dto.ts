import {ApiProperty} from "@nestjs/swagger";

export class IncreaseDepositDto {
    @ApiProperty()
    projectId: string;

    @ApiProperty()
    depositId: string;

    @ApiProperty()
    amount: number;
}