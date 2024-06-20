import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base-service';

@Injectable()
export class CoreService extends BaseService {


  async findCity(cityTitle) {
    if (cityTitle.length < 3)
      return [];
    return this.prisma.$queryRawUnsafe(`
            select providerValue                                  cityId,
                   providerData                                   cityTitle,
                   providerData_2                                 provinceId,
                   (select providerData
                    from baseData bdp
                    where bdp.providerKey = 'province'
                      and bdp.providerValue = bdc.providerData_2) provinceTitle
            from baseData bdc
            where providerKey = 'city'
              and providerData like N'%${cityTitle}%';
        `);
  }


  get educationLevels() {
    return [
      { title: 'بی‌سواد', value: 1 },
      { title: 'پنجم ابتدایی', value: 2 },
      { title: 'سیکل', value: 3 },
      { title: 'دیپلم', value: 4 },
      { title: 'فوق دیپلم', value: 5 },
      { title: 'لیسانس', value: 6 },
      { title: 'فوق لیسانس', value: 7 },
      { title: 'دکتری', value: 8 },
      { title: 'حوزوی', value: 9 },
    ];
  }


  get maritalStatus() {
    return [
      { title: 'مجرد', value: 1 },
      { title: 'متأهل', value: 2 },
      { title: 'متارکه', value: 3 },
      { title: 'فوت همسر', value: 4 },
    ];
  }


  get disabilityStatus() {
    return [
      { title: 'سالم', value: 1 },
      { title: 'دارای معلولیت', value: 2 },
    ];
  }


  get initializeItems() {
    return {
      disabilityStatus: this.disabilityStatus,
      maritalStatus: this.maritalStatus,
      educationLevels: this.educationLevels,
    };
  }

}
