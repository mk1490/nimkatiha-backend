import {ApiProperty} from "@nestjs/swagger";

export class UpdatePasswordDto {

    @ApiProperty()
    userId: string;

    @ApiProperty()
    newPassword: string;
}