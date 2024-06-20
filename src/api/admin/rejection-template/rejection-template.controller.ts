import {Controller, Get} from '@nestjs/common';
import {BaseController} from "../../../base/base-controller";
import {ApiTags} from "@nestjs/swagger";

@ApiTags('rejection template')
@Controller('rejection-template')
export class RejectionTemplateController extends BaseController {


    constructor() {
        super();
    }

    @Get('/list')
    async getList() {
        return await this.prisma.rejectionTemplates.findMany()
    }
}
