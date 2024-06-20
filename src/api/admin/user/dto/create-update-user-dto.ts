import {ApiPreconditionFailedResponse, ApiProperty} from '@nestjs/swagger';
import {Matches, MATCHES} from 'class-validator';

export class CreateUpdateUserDto {


    @ApiProperty()
    @Matches('')
    username: string;


    @ApiProperty()
    password: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    family: string;


    @ApiProperty()
    accessPermissionGroupId: string;

}