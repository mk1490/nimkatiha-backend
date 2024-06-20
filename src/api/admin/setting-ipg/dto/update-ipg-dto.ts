import {ApiProperty} from "@nestjs/swagger";

export class UpdateIpgDto {
    @ApiProperty()
    ipgProvider: any;

    @ApiProperty()
    merchantId: string;

    @ApiProperty()
    terminalId: string;


    @ApiProperty()
    terminalKey: string;


}