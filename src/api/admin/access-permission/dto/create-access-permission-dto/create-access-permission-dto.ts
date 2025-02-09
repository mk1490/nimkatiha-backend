import {IsArray, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateAccessPermissionDto {
    @IsNotEmpty({message: 'عنوان نمی‌تواند خالی باشد.'})
    @ApiProperty()
    title: string;


    @IsArray({message: 'آیتم‌های درخواستی باید از نوع آرایه رشته‌ای باشند.'})
    @IsNotEmpty()
    @ApiProperty()
    items: any[];
}
