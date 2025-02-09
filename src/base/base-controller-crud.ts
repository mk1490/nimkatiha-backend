import {Body, Delete, Get, NotFoundException, Param, Post, Put} from "@nestjs/common";
import {BaseController} from "./base-controller";
import {DefaultArgs} from "@prisma/client/runtime/library";
import {Input} from "@nestjs/cli/commands";

export class BaseControllerCrud<T, InputDto> extends BaseController {

    prismaDelegate;

    constructor() {
        super();
    }


    @Get('/list')
    async getList(): Promise<T[]> {
        return await this.prismaDelegate.findMany();
    }


    @Post()
    async insert(@Body() input: InputDto): Promise<T> {
        const item = await this.prismaDelegate.create({
            data: this.mapToDatabaseObject(input as InputDto, input)
        })
        return item;
    }


    @Put('/:id')
    async update(@Param('id') id, @Body() input: InputDto): Promise<T> {
        let updateDto = this.mapToDatabaseObject(input as InputDto, input);
        delete updateDto['id'];
        const item = await this.prismaDelegate['update']({
            where: {
                id: id,
            },
            data: updateDto,
        });

        // @ts-ignore
        return item;
    }


    @Delete('/:id')
    async delete(@Param('id') id: string) {
        const item = await this.prismaDelegate.findFirst({
            where: {
                id: id
            }
        })
        if (!item) {
            throw new NotFoundException()
        }
        await this.prismaDelegate.delete({
            where: {
                id: item.id
            }
        })
    }

    setDelegate(delegate: any) {
        this.prismaDelegate = delegate;
    }
}