import {ApiProperty} from '@nestjs/swagger';

export class CreateSingleDepositDto {
    @ApiProperty()
    customerId: string;


    @ApiProperty()
    projectId: string;

    @ApiProperty()
    amountValue: number;

}