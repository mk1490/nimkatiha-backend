import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';
import { HelperService } from '../service/helper/helper.service';

export class BaseService {


  protected get prisma() {
    return AppModule.moduleRef.get(PrismaService);
  }


  get helper() {
    return AppModule.moduleRef.get(HelperService);
  }

}