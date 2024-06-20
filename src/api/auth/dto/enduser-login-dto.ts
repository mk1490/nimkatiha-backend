import {MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class EnduserLoginDto {

    @MaxLength(12)
    @ApiProperty()
    mobile: string;


    @MaxLength(12)
    @ApiProperty()
    verify_code: string
}