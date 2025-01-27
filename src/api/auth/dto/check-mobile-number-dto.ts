import {ApiProperty} from "@nestjs/swagger";
import {Matches} from "class-validator";

export class CheckMobileNumberDto {
    @ApiProperty()
    @Matches(/^(([0-9]*)|(([1-9]*)\\.([0-9]*)))$/, {
        message: 'شماره همراه وارد شده معتبر نیست!',
        always: true,
    }, )
    mobileNumber: string;


}