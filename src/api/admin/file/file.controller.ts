import { Controller, Delete, Get, Param } from '@nestjs/common';
import { BaseController } from '../../../base/base-controller';

@Controller('file')
export class FileController extends BaseController {


  constructor() {
    super();
  }


  @Get('/list')
  async getList() {
    return await this.prisma.uploaded_files.findMany();
  }

  @Delete('/:id')
  async deleteFile(@Param('id') id) {
    const item = await this.prisma.uploaded_files.findFirst({
      where: {
        id,
      },
    });

  }

}
