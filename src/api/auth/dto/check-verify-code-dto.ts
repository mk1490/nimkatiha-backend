import {ApiProperty} from "@nestjs/swagger";
import {Matches} from "class-validator";

export class CheckVerifyCodeDto {

    @ApiProperty()
    verifyCode: string;


}