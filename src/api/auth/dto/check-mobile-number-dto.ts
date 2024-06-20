import {ApiProperty} from "@nestjs/swagger";
import {Matches} from "class-validator";

export class CheckMobileNumberDto {

    @ApiProperty()
    @Matches(/^09[0|1|2|3][0-9]{8}$/, {
        message: 'شماره همراه وارد شده معتبر نیست!',
        always: true,
    }, )
    mobileNumber: string;


}