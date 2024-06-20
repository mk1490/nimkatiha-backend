import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';
import { HelperService } from '../service/helper/helper.service';
import { Prisma } from '../../models';
import { AccessPermissionService } from '../service/access-permission/access-permission.service';

export class BaseController {


  protected get prisma() {
    return AppModule.moduleRef.get(PrismaService);
  }


  get accessPermissionService() {
    return AppModule.moduleRef.get(AccessPermissionService);
  }


  get helper() {
    return AppModule.moduleRef.get(HelperService);
  }


  mapToDatabaseObject<T>(dto: T, inputObject) {
    const objects = Object.keys(inputObject);
    let object = {};
    objects.map(objectKey => {
      object[objectKey] = inputObject[objectKey];
    });


    return {
      ...object,
    } as T;
  }
}