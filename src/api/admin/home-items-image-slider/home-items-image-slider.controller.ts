import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post, Put,
    Req,
    UploadedFile, UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {BaseController} from '../../../base/base-controller';
import {FileInterceptor} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {extname, join} from 'path';
import * as fs from 'fs';
import {homedir} from 'os';
import e from 'express';
import {fileExistsSync} from "tsconfig-paths/lib/filesystem";
import {rimraf} from "rimraf";
import {ApiBearerAuth} from "@nestjs/swagger";
import {Roles} from "../../auth/roles.decorator";
import {JwtAuthGuard} from "../../auth/jwt-auth-guard";
import {RolesGuard} from "../../auth/roles-guard";

@Controller('home-items-image-slider')
export class HomeItemsImageSliderController extends BaseController {


    @Get('/list')
    @ApiBearerAuth()
    @Roles("company_intro.company_notification.create", "company_intro.company_notification.delete", "company_intro.company_notification.update_title")
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getList() {
        const items = await this.prisma.imageSlider.findMany({});
        const slidersDirectory = join(homedir(), 'petus', 'image-sliders');
        const filesInDirectory = fs.readdirSync(slidersDirectory);
        const finalItems = [];
        items.map(f => {
            if (filesInDirectory.find(x => x == f.fileId)) {
                finalItems.push({
                    ...f,
                    filePath: `/api/public-files/image-sliders/${f.fileId}`,
                });
            }
        });

        return finalItems;
    }


    @Post()
    @ApiBearerAuth()
    @Roles("company_intro.company_notification.create")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: join(homedir(), 'petus', 'image-sliders'),
                filename(req: e.Request, file: Express.Multer.File, callback: (error: (Error | null), filename: string) => void) {
                    callback(null, Date.now() + extname(file.originalname));
                },
            }),
        }),
    )
    async uploadNewFile(@Req() request, @UploadedFile() image: Express.Multer.File) {
        const title = request.body.title;
        const item = await this.prisma.imageSlider.create({
            data: {
                fileId: image.filename,
                title: title
            }
        })

        return {
            ...item,
            filePath: '/api/public-files/image-sliders/' + image.filename,
            fileName: image.filename,
        };
    }

    @Put('/:id')
    @ApiBearerAuth()
    @Roles("company_intro.company_notification.update_title")
    @UseGuards(JwtAuthGuard, RolesGuard)
    async update(
        @Param('id') id: string,
        @Body('title') title: string,
    ) {
        const item = await this.prisma.imageSlider.findFirst({
            where: {
                id: id,
            }
        });

        if (!item)
            throw new NotFoundException();

        return await this.prisma.imageSlider.update({
            where: {
                id: item.id,
            },
            data: {
                title: title,
            }
        })
    }


    @Delete('/:id')
    @ApiBearerAuth()
    @Roles("company_intro.company_notification.delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    async delete(@Param('id') id: string) {
        const item = await this.prisma.imageSlider.findFirst({
            where: {
                id
            }
        })
        if (!item) {
            throw new NotFoundException();
        }
        if (item.fileId) {
            const fileDirectory = join(homedir(), 'petus', 'image-sliders', item.fileId);
            if (fileExistsSync(fileDirectory)) {
                rimraf.sync(fileDirectory);
            }
        }

        await this.prisma.imageSlider.delete({
            where: {
                id: item.id,
            },
        });

    }

}
