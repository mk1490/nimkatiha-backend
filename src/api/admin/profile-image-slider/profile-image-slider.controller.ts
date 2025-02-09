import {Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {BaseController} from "../../../base/base-controller";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import {FileInterceptor} from "@nestjs/platform-express";
import {memoryStorage} from "multer";
import {ApiBearerAuth} from "@nestjs/swagger";
import {Roles} from "../../auth/roles.decorator";
import {JwtAuthGuard} from "../../auth/jwt-auth-guard";
import {RolesGuard} from "../../auth/roles-guard";

@Controller('profile-image-slider')
export class ProfileImageSliderController extends BaseController {

    constructor() {
        super();
    }

    @Get('/list')
    @ApiBearerAuth()
    @Roles("company_intro.profile_sliders_management.create", "company_intro.profile_sliders_management.update_url", "company_intro.profile_sliders_management.delete")
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getList() {
        const items = await this.prisma.imageSlider.findMany({});
        const slidersDirectory = global.directories.profileImageSlider;
        mkdirp.sync(slidersDirectory);
        const filesInDirectory = fs.readdirSync(slidersDirectory);
        const finalItems = [];
        items.map(f => {
            if (filesInDirectory.find(x => x == f.fileId)) {
                finalItems.push({
                    ...f,
                    filePath: `/api/public-files/profile-image-sliders/${f.fileId}`,
                });
            }
        });

        return finalItems;
    }


    @Post()
    @ApiBearerAuth()
    @Roles("company_intro.profile_sliders_management.create")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
        }),
    )
    async insert(@Req() request, @UploadedFile() image: Express.Multer.File) {

        mkdirp.sync(global.directories.profileImageSlider);
        const fileName = new Date().getTime() + '.jpg';
        fs.writeFileSync(global.directories.profileImageSlider + '/' + fileName, image.buffer)

        const item = await this.prisma.profileImageSlider.create({
            data: {
                fileId: fileName,
                targetUrl: request.body.targetUrl
            }
        })
        return {
            ...item,
            filePath: '/api/public-files/public/profile-image-sliders/' + fileName,
            fileName: fileName,
        };
    }
}
